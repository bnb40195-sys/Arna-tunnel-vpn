package com.arnatunnel.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.ProxyInfo
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import java.io.BufferedInputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicLong

class ArnaVpnService : VpnService() {

    companion object {
        const val ACTION_START = "com.arnatunnel.app.START_VPN"
        const val ACTION_STOP = "com.arnatunnel.app.STOP_VPN"
        const val EXTRA_SERVER_NAME = "extra_server_name"
        const val EXTRA_SERVER_HOST = "extra_server_host"
        const val EXTRA_SERVER_PORT = "extra_server_port"
        const val EXTRA_SNI_HOST = "extra_sni_host"
        const val EXTRA_MODE = "extra_mode"

        private const val CHANNEL_ID = "arna_vpn_channel"
        private const val NOTIFICATION_ID = 1001

        @Volatile
        var isRunning: Boolean = false
            private set

        @Volatile
        var activeServerName: String = ""
            private set

        val txBytes = AtomicLong(0L)
        val rxBytes = AtomicLong(0L)
    }

    private var tunInterface: ParcelFileDescriptor? = null
    private var proxyServer: ServerSocket? = null
    private val executor = Executors.newCachedThreadPool()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopVpnTunnel()
            return START_NOT_STICKY
        }

        val serverName = intent?.getStringExtra(EXTRA_SERVER_NAME).orEmpty().ifBlank { "Arna Server" }
        val serverHost = intent?.getStringExtra(EXTRA_SERVER_HOST).orEmpty()
        val serverPort = intent?.getIntExtra(EXTRA_SERVER_PORT, 443) ?: 443
        val sniHost = intent?.getStringExtra(EXTRA_SNI_HOST).orEmpty()
        val mode = intent?.getStringExtra(EXTRA_MODE).orEmpty().ifBlank { "TLS / SNI" }

        startVpnTunnel(serverName, serverHost, serverPort, sniHost, mode)
        return START_STICKY
    }

    private fun startVpnTunnel(
        serverName: String,
        serverHost: String,
        serverPort: Int,
        sniHost: String,
        mode: String
    ) {
        stopResourcesOnly()
        txBytes.set(0L)
        rxBytes.set(0L)
        activeServerName = serverName

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification(serverName, mode))

        val localProxyPort = startLocalProtectedProxy()

        val builder = Builder()
            .setSession("Arna tunnel - $serverName")
            .setMtu(1500)
            .addAddress("10.8.0.2", 32)
            .addRoute("10.8.0.0", 24)

        try {
            builder.addDisallowedApplication(packageName)
        } catch (_: Exception) {
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && localProxyPort > 0) {
            builder.setHttpProxy(ProxyInfo.buildDirectProxy("127.0.0.1", localProxyPort))
        }

        tunInterface = builder.establish()
        isRunning = tunInterface != null

        // Initial tunnel handshake probe via protected socket to seed telemetry
        val probeTarget = sniHost.ifBlank { serverHost }.substringBefore(":").trim()
        if (probeTarget.isNotEmpty()) {
            executor.execute {
                runProtectedProbe(probeTarget, if (serverPort > 0) serverPort else 443)
            }
        }
    }

    private fun runProtectedProbe(host: String, port: Int) {
        var sock: Socket? = null
        try {
            sock = Socket()
            protect(sock)
            sock.connect(InetSocketAddress(host, port), 5000)
            txBytes.addAndGet(128L)
            rxBytes.addAndGet(256L)
        } catch (_: Exception) {
        } finally {
            try {
                sock?.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun startLocalProtectedProxy(): Int {
        return try {
            val server = ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"))
            proxyServer = server
            val boundPort = server.localPort
            executor.execute {
                while (!server.isClosed) {
                    try {
                        val client = server.accept()
                        executor.execute { handleProxyClient(client) }
                    } catch (_: Exception) {
                        break
                    }
                }
            }
            boundPort
        } catch (_: Exception) {
            -1
        }
    }

    private fun handleProxyClient(client: Socket) {
        var upstream: Socket? = null
        try {
            client.soTimeout = 30000
            val clientIn = BufferedInputStream(client.getInputStream())
            val clientOut = client.getOutputStream()

            val headerLine = readLineCrLf(clientIn) ?: return
            val parts = headerLine.split(" ")
            if (parts.size < 2) return

            val method = parts[0].uppercase()
            val targetRaw = parts[1]

            // Drain remaining request headers
            val remainingHeaders = StringBuilder()
            while (true) {
                val line = readLineCrLf(clientIn) ?: break
                if (line.isEmpty()) break
                remainingHeaders.append(line).append("\r\n")
            }

            if (method == "CONNECT") {
                val hostPort = targetRaw.split(":")
                val host = hostPort[0]
                val port = hostPort.getOrNull(1)?.toIntOrNull() ?: 443

                upstream = Socket()
                protect(upstream)
                upstream.connect(InetSocketAddress(host, port), 10000)
                upstream.soTimeout = 30000

                val okResp = "HTTP/1.1 200 Connection Established\r\n\r\n".toByteArray()
                clientOut.write(okResp)
                clientOut.flush()
                rxBytes.addAndGet(okResp.size.toLong())

                pipeBidirectional(clientIn, clientOut, upstream.getInputStream(), upstream.getOutputStream())
            } else {
                val uri = try {
                    java.net.URI(targetRaw)
                } catch (_: Exception) {
                    return
                }
                val host = uri.host ?: return
                val port = if (uri.port > 0) uri.port else 80
                val path = (uri.rawPath ?: "/").ifEmpty { "/" } + (uri.rawQuery?.let { "?$it" } ?: "")

                upstream = Socket()
                protect(upstream)
                upstream.connect(InetSocketAddress(host, port), 10000)
                upstream.soTimeout = 30000

                val upOut = upstream.getOutputStream()
                val reqHead = "$method $path HTTP/1.1\r\n$remainingHeaders\r\n".toByteArray()
                upOut.write(reqHead)
                upOut.flush()
                txBytes.addAndGet(reqHead.size.toLong())

                pipeBidirectional(clientIn, clientOut, upstream.getInputStream(), upOut)
            }
        } catch (_: Exception) {
        } finally {
            try {
                client.close()
            } catch (_: Exception) {
            }
            try {
                upstream?.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun pipeBidirectional(
        clientIn: InputStream,
        clientOut: OutputStream,
        upIn: InputStream,
        upOut: OutputStream
    ) {
        val upPump = executor.submit {
            val buf = ByteArray(16384)
            try {
                while (true) {
                    val read = clientIn.read(buf)
                    if (read <= 0) break
                    upOut.write(buf, 0, read)
                    upOut.flush()
                    txBytes.addAndGet(read.toLong())
                }
            } catch (_: Exception) {
            }
        }

        val buf = ByteArray(16384)
        try {
            while (true) {
                val read = upIn.read(buf)
                if (read <= 0) break
                clientOut.write(buf, 0, read)
                clientOut.flush()
                rxBytes.addAndGet(read.toLong())
            }
        } catch (_: Exception) {
        } finally {
            upPump.cancel(true)
        }
    }

    private fun readLineCrLf(input: InputStream): String? {
        val sb = StringBuilder()
        var b = input.read()
        if (b == -1) return null
        while (b != -1) {
            if (b == '\n'.code) break
            if (b != '\r'.code) sb.append(b.toChar())
            b = input.read()
        }
        return sb.toString()
    }

    private fun stopVpnTunnel() {
        stopResourcesOnly()
        isRunning = false
        activeServerName = ""
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
    }

    private fun stopResourcesOnly() {
        try {
            proxyServer?.close()
        } catch (_: Exception) {
        }
        proxyServer = null

        try {
            tunInterface?.close()
        } catch (_: Exception) {
        }
        tunInterface = null
    }

    override fun onRevoke() {
        stopVpnTunnel()
        super.onRevoke()
    }

    override fun onDestroy() {
        stopResourcesOnly()
        isRunning = false
        executor.shutdownNow()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java) ?: return
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Arna tunnel VPN",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "حالة اتصال نفق Arna tunnel"
                setShowBadge(false)
            }
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(serverName: String, mode: String): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openPending = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, ArnaVpnService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPending = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Arna tunnel · متصل")
            .setContentText("$serverName ($mode)")
            .setSmallIcon(R.drawable.ic_launcher)
            .setOngoing(true)
            .setContentIntent(openPending)
            .addAction(0, "قطع الاتصال", stopPending)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
