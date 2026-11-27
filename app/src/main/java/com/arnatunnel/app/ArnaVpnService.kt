package com.arnatunnel.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import java.io.BufferedInputStream
import java.io.DataInputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.Inet4Address
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.atomic.AtomicReference

class ArnaVpnService : VpnService() {

    private enum class RelayType {
        DIRECT_PROTECTED,
        SOCKS5_PROXY,
        HTTP_CONNECT_PROXY
    }

    private data class UpstreamRelay(
        val type: RelayType,
        val host: String = "",
        val port: Int = 0
    )

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
        private const val TUN_IPV4 = "198.18.0.1"
        private const val TUN_MTU = 8500

        @Volatile
        var isRunning: Boolean = false
            private set

        @Volatile
        var activeServerName: String = ""
            private set

        @Volatile
        var stateListener: ((String) -> Unit)? = null

        val txBytes = AtomicLong(0L)
        val rxBytes = AtomicLong(0L)

        fun getTotalTxBytes(): Long {
            val tproxyTx = try {
                if (isRunning) {
                    val stats = TProxyBridge.getStats()
                    if (stats != null && stats.size >= 4) stats[1] else 0L
                } else 0L
            } catch (_: Throwable) {
                0L
            }
            return maxOf(tproxyTx, txBytes.get())
        }

        fun getTotalRxBytes(): Long {
            val tproxyRx = try {
                if (isRunning) {
                    val stats = TProxyBridge.getStats()
                    if (stats != null && stats.size >= 4) stats[3] else 0L
                } else 0L
            } catch (_: Throwable) {
                0L
            }
            return maxOf(tproxyRx, rxBytes.get())
        }
    }

    private var tunInterface: ParcelFileDescriptor? = null
    private var socksServer: ServerSocket? = null
    private val tproxyStarted = AtomicBoolean(false)
    private val activeRelay = AtomicReference(UpstreamRelay(RelayType.DIRECT_PROTECTED))
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
        val mode = intent?.getStringExtra(EXTRA_MODE).orEmpty().ifBlank { "Custom SNI" }

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
        activeRelay.set(UpstreamRelay(RelayType.DIRECT_PROTECTED))
        activeServerName = serverName

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification(serverName, mode))

        // 1. Start embedded RFC 1928 SOCKS5 server (TCP CONNECT + UDP ASSOCIATE) using protected sockets
        val localSocksPort = startLocalSocks5Server()
        if (localSocksPort <= 0) {
            stopVpnTunnel()
            return
        }

        // 2. Establish full device-wide 0.0.0.0/0 TUN interface with DNS + self-exclusion
        val builder = Builder()
            .setSession("Arna tunnel - $serverName")
            .setMtu(TUN_MTU)
            .addAddress(TUN_IPV4, 32)
            .addRoute("0.0.0.0", 0)
            .addDnsServer("1.1.1.1")
            .addDnsServer("8.8.8.8")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            builder.setMetered(false)
        }

        try {
            builder.addDisallowedApplication(packageName)
        } catch (_: Exception) {
        }

        val establishedTun = try {
            builder.establish()
        } catch (_: Exception) {
            null
        }

        if (establishedTun == null) {
            stopVpnTunnel()
            return
        }
        tunInterface = establishedTun

        // 3. Write hev-socks5-tunnel YAML config pointing to 127.0.0.1:<localSocksPort>
        val configFile = File(filesDir, "hev-tunnel.yml")
        val yamlConfig = """
            tunnel:
              name: tun0
              mtu: $TUN_MTU
              multi-queue: false
              ipv4: $TUN_IPV4
            socks5:
              port: $localSocksPort
              address: 127.0.0.1
              udp: 'udp'
            misc:
              task-stack-size: 81920
              connect-timeout: 10000
              tcp-read-write-timeout: 300000
              udp-read-write-timeout: 60000
              log-level: error
        """.trimIndent()
        configFile.writeText(yamlConfig, StandardCharsets.UTF_8)

        // 4. Start native hev-socks5-tunnel engine on TUN fd
        isRunning = true
        tproxyStarted.set(true)
        val tunFd = establishedTun.fd
        val configPath = configFile.absolutePath

        Thread({
            try {
                TProxyBridge.start(configPath, tunFd)
            } catch (_: Throwable) {
            }
        }, "ArnaHevTunnel").apply {
            isDaemon = true
            start()
        }

        stateListener?.invoke("connected")

        // 5. Asynchronously check if configured server acts as a live upstream SOCKS5/HTTP relay
        val cleanHost = serverHost.substringBefore(":").trim()
        val targetPort = if (serverPort in 1..65535) serverPort else 443
        if (cleanHost.isNotEmpty() && !isDocumentationIp(cleanHost)) {
            executor.execute {
                detectUpstreamRelay(cleanHost, targetPort, mode, sniHost)
            }
        }
    }

    private fun isDocumentationIp(host: String): Boolean {
        return host.startsWith("198.51.100.") ||
            host.startsWith("203.0.113.") ||
            host.startsWith("192.0.2.") ||
            host == "127.0.0.1" ||
            host.equals("localhost", ignoreCase = true)
    }

    private fun detectUpstreamRelay(host: String, port: Int, mode: String, sniHost: String) {
        // Test SOCKS5 proxy capability first if user entered a real custom proxy port (e.g. 1080, 10808)
        if (tryProbeSocks5Proxy(host, port)) {
            activeRelay.set(UpstreamRelay(RelayType.SOCKS5_PROXY, host, port))
            return
        }

        // Test HTTP CONNECT proxy capability if custom proxy mode or HTTP proxy port
        if ((mode.contains("Payload", ignoreCase = true) || port in listOf(80, 8080, 8000, 3128, 8888)) &&
            tryProbeHttpConnectProxy(host, port, sniHost)
        ) {
            activeRelay.set(UpstreamRelay(RelayType.HTTP_CONNECT_PROXY, host, port))
        }
    }

    private fun tryProbeSocks5Proxy(host: String, port: Int): Boolean {
        var sock: Socket? = null
        return try {
            sock = Socket()
            protect(sock)
            sock.connect(InetSocketAddress(host, port), 1800)
            sock.soTimeout = 1800
            val out = sock.getOutputStream()
            val inp = sock.getInputStream()
            out.write(byteArrayOf(0x05, 0x01, 0x00))
            out.flush()
            val v = inp.read()
            val m = inp.read()
            v == 5 && m == 0
        } catch (_: Exception) {
            false
        } finally {
            try {
                sock?.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun tryProbeHttpConnectProxy(host: String, port: Int, sniHost: String): Boolean {
        var sock: Socket? = null
        return try {
            sock = Socket()
            protect(sock)
            sock.connect(InetSocketAddress(host, port), 1800)
            sock.soTimeout = 1800
            val out = sock.getOutputStream()
            val inp = BufferedInputStream(sock.getInputStream())
            val req = buildString {
                append("CONNECT 1.1.1.1:443 HTTP/1.1\r\n")
                append("Host: ").append(sniHost.ifBlank { "1.1.1.1:443" }).append("\r\n")
                append("Connection: Keep-Alive\r\n\r\n")
            }
            out.write(req.toByteArray(StandardCharsets.US_ASCII))
            out.flush()
            val statusLine = readLineAscii(inp) ?: return false
            statusLine.contains(" 200 ")
        } catch (_: Exception) {
            false
        } finally {
            try {
                sock?.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun startLocalSocks5Server(): Int {
        return try {
            val server = ServerSocket(0, 128, InetAddress.getByName("127.0.0.1"))
            socksServer = server
            val boundPort = server.localPort
            executor.execute {
                while (!server.isClosed) {
                    try {
                        val client = server.accept()
                        executor.execute { handleSocks5Client(client) }
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

    private fun handleSocks5Client(client: Socket) {
        var shouldCloseClient = true
        try {
            client.tcpNoDelay = true
            client.soTimeout = 60000
            val rawIn = BufferedInputStream(client.getInputStream())
            val dataIn = DataInputStream(rawIn)
            val clientOut = client.getOutputStream()

            // SOCKS5 Greeting: VER + NMETHODS + METHODS
            val version = dataIn.readUnsignedByte()
            if (version != 0x05) return
            val nMethods = dataIn.readUnsignedByte()
            if (nMethods > 0) {
                val methods = ByteArray(nMethods)
                dataIn.readFully(methods)
            }

            // Reply No Authentication Required (0x00)
            clientOut.write(byteArrayOf(0x05, 0x00))
            clientOut.flush()

            // SOCKS5 Request: VER | CMD | RSV | ATYP | DST.ADDR | DST.PORT
            val reqVer = dataIn.readUnsignedByte()
            if (reqVer != 0x05) return
            val cmd = dataIn.readUnsignedByte()
            dataIn.readUnsignedByte() // RSV
            val atyp = dataIn.readUnsignedByte()

            val targetHost: String = when (atyp) {
                0x01 -> {
                    val addr = ByteArray(4)
                    dataIn.readFully(addr)
                    InetAddress.getByAddress(addr).hostAddress ?: return
                }
                0x03 -> {
                    val len = dataIn.readUnsignedByte()
                    val domainBytes = ByteArray(len)
                    dataIn.readFully(domainBytes)
                    String(domainBytes, StandardCharsets.UTF_8)
                }
                0x04 -> {
                    val addr = ByteArray(16)
                    dataIn.readFully(addr)
                    InetAddress.getByAddress(addr).hostAddress ?: return
                }
                else -> {
                    sendSocks5Reply(clientOut, 0x08) // Address type not supported
                    return
                }
            }
            val targetPort = dataIn.readUnsignedShort()

            when (cmd) {
                0x01 -> { // CONNECT (TCP)
                    handleTcpConnect(client, rawIn, clientOut, targetHost, targetPort)
                }
                0x03 -> { // UDP ASSOCIATE
                    shouldCloseClient = false
                    handleUdpAssociate(client, rawIn, clientOut)
                }
                else -> {
                    sendSocks5Reply(clientOut, 0x07) // Command not supported
                }
            }
        } catch (_: Exception) {
        } finally {
            if (shouldCloseClient) {
                try {
                    client.close()
                } catch (_: Exception) {
                }
            }
        }
    }

    private fun handleTcpConnect(
        client: Socket,
        clientIn: InputStream,
        clientOut: OutputStream,
        targetHost: String,
        targetPort: Int
    ) {
        var upstream: Socket? = null
        try {
            val up = connectProtectedTcp(targetHost, targetPort)
            upstream = up
            up.tcpNoDelay = true
            up.soTimeout = 0
            client.soTimeout = 0

            sendSocks5Reply(clientOut, 0x00)
            pipeBidirectional(clientIn, clientOut, up.getInputStream(), up.getOutputStream())
        } catch (_: Exception) {
            try {
                sendSocks5Reply(clientOut, 0x05) // Connection refused
            } catch (_: Exception) {
            }
        } finally {
            try {
                upstream?.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun connectProtectedTcp(targetHost: String, targetPort: Int): Socket {
        val relay = activeRelay.get()
        if (relay.type == RelayType.SOCKS5_PROXY && relay.host.isNotEmpty() && relay.port > 0) {
            try {
                val viaSocks = connectViaUpstreamSocks5(relay.host, relay.port, targetHost, targetPort)
                if (viaSocks != null) return viaSocks
            } catch (_: Exception) {
            }
        } else if (relay.type == RelayType.HTTP_CONNECT_PROXY && relay.host.isNotEmpty() && relay.port > 0) {
            try {
                val viaHttp = connectViaUpstreamHttp(relay.host, relay.port, targetHost, targetPort)
                if (viaHttp != null) return viaHttp
            } catch (_: Exception) {
            }
        }

        val direct = Socket()
        protect(direct)
        direct.connect(InetSocketAddress(targetHost, targetPort), 10000)
        return direct
    }

    private fun connectViaUpstreamSocks5(
        proxyHost: String,
        proxyPort: Int,
        targetHost: String,
        targetPort: Int
    ): Socket? {
        val sock = Socket()
        protect(sock)
        sock.connect(InetSocketAddress(proxyHost, proxyPort), 5000)
        sock.soTimeout = 5000
        val out = sock.getOutputStream()
        val inp = DataInputStream(BufferedInputStream(sock.getInputStream()))

        out.write(byteArrayOf(0x05, 0x01, 0x00))
        out.flush()
        if (inp.readUnsignedByte() != 0x05 || inp.readUnsignedByte() != 0x00) {
            sock.close()
            return null
        }

        val hostBytes = targetHost.toByteArray(StandardCharsets.UTF_8)
        val req = ByteArray(7 + hostBytes.size)
        req[0] = 0x05
        req[1] = 0x01
        req[2] = 0x00
        req[3] = 0x03
        req[4] = hostBytes.size.toByte()
        System.arraycopy(hostBytes, 0, req, 5, hostBytes.size)
        req[5 + hostBytes.size] = ((targetPort shr 8) and 0xFF).toByte()
        req[6 + hostBytes.size] = (targetPort and 0xFF).toByte()
        out.write(req)
        out.flush()

        val rVer = inp.readUnsignedByte()
        val rRep = inp.readUnsignedByte()
        inp.readUnsignedByte() // RSV
        val rAtyp = inp.readUnsignedByte()
        when (rAtyp) {
            0x01 -> inp.readFully(ByteArray(6))
            0x03 -> {
                val l = inp.readUnsignedByte()
                inp.readFully(ByteArray(l + 2))
            }
            0x04 -> inp.readFully(ByteArray(18))
            else -> {
                sock.close()
                return null
            }
        }
        if (rVer != 0x05 || rRep != 0x00) {
            sock.close()
            return null
        }
        sock.soTimeout = 0
        return sock
    }

    private fun connectViaUpstreamHttp(
        proxyHost: String,
        proxyPort: Int,
        targetHost: String,
        targetPort: Int
    ): Socket? {
        val sock = Socket()
        protect(sock)
        sock.connect(InetSocketAddress(proxyHost, proxyPort), 5000)
        sock.soTimeout = 5000
        val out = sock.getOutputStream()
        val inp = BufferedInputStream(sock.getInputStream())
        val req = "CONNECT $targetHost:$targetPort HTTP/1.1\r\nHost: $targetHost:$targetPort\r\nConnection: Keep-Alive\r\n\r\n"
        out.write(req.toByteArray(StandardCharsets.US_ASCII))
        out.flush()

        val status = readLineAscii(inp) ?: run {
            sock.close()
            return null
        }
        while (true) {
            val h = readLineAscii(inp) ?: break
            if (h.isEmpty()) break
        }
        if (!status.contains(" 200 ")) {
            sock.close()
            return null
        }
        sock.soTimeout = 0
        return sock
    }

    private fun handleUdpAssociate(
        controlTcp: Socket,
        controlIn: InputStream,
        controlOut: OutputStream
    ) {
        var cleanupLocalUdp: DatagramSocket? = null
        var cleanupUpstreamUdp: DatagramSocket? = null
        try {
            val localUdp = DatagramSocket(0, InetAddress.getByName("127.0.0.1"))
            cleanupLocalUdp = localUdp
            val upstreamUdp = DatagramSocket()
            cleanupUpstreamUdp = upstreamUdp
            protect(upstreamUdp)

            val relayPort = localUdp.localPort
            controlOut.write(
                byteArrayOf(
                    0x05, 0x00, 0x00, 0x01,
                    127, 0, 0, 1,
                    ((relayPort shr 8) and 0xFF).toByte(),
                    (relayPort and 0xFF).toByte()
                )
            )
            controlOut.flush()
            controlTcp.soTimeout = 0

            val clientEndpoint = AtomicReference<InetSocketAddress?>(null)
            val closed = AtomicBoolean(false)

            // Upstream UDP -> Local hev-socks5-tunnel UDP
            val upstreamReader = executor.submit {
                val recvBuf = ByteArray(65535)
                while (!closed.get() && !upstreamUdp.isClosed && !localUdp.isClosed) {
                    try {
                        val packet = DatagramPacket(recvBuf, recvBuf.size)
                        upstreamUdp.receive(packet)
                        val clientAddr = clientEndpoint.get() ?: continue
                        val srcAddr = packet.address ?: continue
                        val addrBytes = srcAddr.address
                        val atypByte: Byte = if (srcAddr is Inet4Address) 0x01 else 0x04
                        val payloadLen = packet.length
                        val framed = ByteArray(6 + addrBytes.size + payloadLen)
                        framed[0] = 0x00
                        framed[1] = 0x00
                        framed[2] = 0x00
                        framed[3] = atypByte
                        System.arraycopy(addrBytes, 0, framed, 4, addrBytes.size)
                        val portOffset = 4 + addrBytes.size
                        framed[portOffset] = ((packet.port shr 8) and 0xFF).toByte()
                        framed[portOffset + 1] = (packet.port and 0xFF).toByte()
                        System.arraycopy(recvBuf, 0, framed, portOffset + 2, payloadLen)

                        localUdp.send(DatagramPacket(framed, framed.size, clientAddr))
                        rxBytes.addAndGet(payloadLen.toLong())
                    } catch (_: Exception) {
                        if (closed.get()) break
                    }
                }
            }

            // Local hev-socks5-tunnel UDP -> Protected Upstream UDP
            val localReader = executor.submit {
                val recvBuf = ByteArray(65535)
                while (!closed.get() && !localUdp.isClosed && !upstreamUdp.isClosed) {
                    try {
                        val packet = DatagramPacket(recvBuf, recvBuf.size)
                        localUdp.receive(packet)
                        val srcSocketAddr = packet.socketAddress as? InetSocketAddress
                        if (srcSocketAddr != null) {
                            clientEndpoint.set(srcSocketAddr)
                        }

                        val len = packet.length
                        if (len < 10) continue
                        val frag = recvBuf[2].toInt() and 0xFF
                        if (frag != 0) continue // Fragmented SOCKS UDP not supported

                        val atyp = recvBuf[3].toInt() and 0xFF
                        var offset = 4
                        val dstAddr: InetAddress = when (atyp) {
                            0x01 -> {
                                if (len < offset + 4 + 2) continue
                                val raw = recvBuf.copyOfRange(offset, offset + 4)
                                offset += 4
                                InetAddress.getByAddress(raw)
                            }
                            0x03 -> {
                                if (len < offset + 1) continue
                                val domLen = recvBuf[offset].toInt() and 0xFF
                                offset += 1
                                if (len < offset + domLen + 2) continue
                                val domain = String(recvBuf, offset, domLen, StandardCharsets.UTF_8)
                                offset += domLen
                                InetAddress.getByName(domain)
                            }
                            0x04 -> {
                                if (len < offset + 16 + 2) continue
                                val raw = recvBuf.copyOfRange(offset, offset + 16)
                                offset += 16
                                InetAddress.getByAddress(raw)
                            }
                            else -> continue
                        }

                        val dstPort = ((recvBuf[offset].toInt() and 0xFF) shl 8) or
                            (recvBuf[offset + 1].toInt() and 0xFF)
                        offset += 2

                        val payloadLen = len - offset
                        if (payloadLen <= 0) continue

                        upstreamUdp.send(DatagramPacket(recvBuf, offset, payloadLen, dstAddr, dstPort))
                        txBytes.addAndGet(payloadLen.toLong())
                    } catch (_: Exception) {
                        if (closed.get()) break
                    }
                }
            }

            // Per RFC 1928, keep association alive until TCP control socket closes
            val sink = ByteArray(256)
            while (!controlTcp.isClosed) {
                val read = controlIn.read(sink)
                if (read == -1) break
            }

            closed.set(true)
            upstreamReader.cancel(true)
            localReader.cancel(true)
        } catch (_: Exception) {
        } finally {
            try {
                cleanupLocalUdp?.close()
            } catch (_: Exception) {
            }
            try {
                cleanupUpstreamUdp?.close()
            } catch (_: Exception) {
            }
            try {
                controlTcp.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun sendSocks5Reply(out: OutputStream, rep: Int) {
        out.write(byteArrayOf(0x05, rep.toByte(), 0x00, 0x01, 0, 0, 0, 0, 0, 0))
        out.flush()
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

    private fun readLineAscii(input: InputStream): String? {
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
        val wasRunning = isRunning
        isRunning = false
        activeServerName = ""
        if (wasRunning) {
            stateListener?.invoke("disconnected")
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
    }

    private fun stopResourcesOnly() {
        if (tproxyStarted.compareAndSet(true, false)) {
            try {
                TProxyBridge.stop()
            } catch (_: Throwable) {
            }
        }

        try {
            socksServer?.close()
        } catch (_: Exception) {
        }
        socksServer = null

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
        val wasRunning = isRunning
        isRunning = false
        if (wasRunning) {
            stateListener?.invoke("disconnected")
        }
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
            .setContentTitle("Arna tunnel · متصل (0.0.0.0/0)")
            .setContentText("$serverName · $mode")
            .setSmallIcon(R.drawable.ic_launcher)
            .setOngoing(true)
            .setContentIntent(openPending)
            .addAction(0, "قطع الاتصال", stopPending)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
