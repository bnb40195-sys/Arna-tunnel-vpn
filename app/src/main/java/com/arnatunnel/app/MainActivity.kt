package com.arnatunnel.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    private var pendingServerHost: String = ""
    private var pendingServerPort: Int = 443
    private var pendingSniHost: String = ""
    private var pendingMode: String = ""
    private var pendingServerName: String = "Arna Server"

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            launchNativeVpnService()
        } else {
            notifyWebVpnState("denied")
        }
    }

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {
        // Proceed with VPN preparation regardless of notification grant
        prepareAndStartVpn()
    }

    inner class ArnaVpnBridge {
        @JavascriptInterface
        fun isAvailable(): Boolean = true

        @JavascriptInterface
        fun isConnected(): Boolean = ArnaVpnService.isRunning

        @JavascriptInterface
        fun getStatsJson(): String {
            return JSONObject().apply {
                put("connected", ArnaVpnService.isRunning)
                put("txBytes", ArnaVpnService.getTotalTxBytes())
                put("rxBytes", ArnaVpnService.getTotalRxBytes())
                put("serverName", ArnaVpnService.activeServerName)
            }.toString()
        }

        @JavascriptInterface
        fun connect(
            serverHost: String,
            serverPort: Int,
            sniHost: String,
            mode: String,
            serverName: String
        ) {
            pendingServerHost = serverHost
            pendingServerPort = if (serverPort > 0) serverPort else 443
            pendingSniHost = sniHost
            pendingMode = mode
            pendingServerName = serverName.ifBlank { "Arna Server" }

            runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                    ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                } else {
                    prepareAndStartVpn()
                }
            }
        }

        @JavascriptInterface
        fun disconnect() {
            runOnUiThread {
                if (ArnaVpnService.isRunning) {
                    val stopIntent = Intent(this@MainActivity, ArnaVpnService::class.java).apply {
                        action = ArnaVpnService.ACTION_STOP
                    }
                    startService(stopIntent)
                }
                notifyWebVpnState("disconnected")
            }
        }
    }

    private fun prepareAndStartVpn() {
        val prepareIntent = VpnService.prepare(this)
        if (prepareIntent != null) {
            vpnPermissionLauncher.launch(prepareIntent)
        } else {
            launchNativeVpnService()
        }
    }

    private fun launchNativeVpnService() {
        val startIntent = Intent(this, ArnaVpnService::class.java).apply {
            action = ArnaVpnService.ACTION_START
            putExtra(ArnaVpnService.EXTRA_SERVER_HOST, pendingServerHost)
            putExtra(ArnaVpnService.EXTRA_SERVER_PORT, pendingServerPort)
            putExtra(ArnaVpnService.EXTRA_SNI_HOST, pendingSniHost)
            putExtra(ArnaVpnService.EXTRA_MODE, pendingMode)
            putExtra(ArnaVpnService.EXTRA_SERVER_NAME, pendingServerName)
        }
        ContextCompat.startForegroundService(this, startIntent)
    }

    private fun notifyWebVpnState(state: String) {
        val tx = ArnaVpnService.getTotalTxBytes()
        val rx = ArnaVpnService.getTotalRxBytes()
        if (::webView.isInitialized) {
            webView.post {
                webView.evaluateJavascript(
                    "window.onArnaNativeVpnStateChanged && window.onArnaNativeVpnStateChanged('$state', $tx, $rx);",
                    null
                )
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            useWideViewPort = true
            loadWithOverviewMode = true
        }

        webView.addJavascriptInterface(ArnaVpnBridge(), "ArnaAndroidVpn")
        ArnaVpnService.stateListener = { state ->
            notifyWebVpnState(state)
        }
        webView.webChromeClient = WebChromeClient()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                val url = request.url
                val direct = assetLoader.shouldInterceptRequest(url)
                if (direct != null) return direct

                if (url.host == "appassets.androidplatform.net") {
                    val path = url.path ?: return null
                    if (!path.startsWith("/assets/www/")) {
                        val normalized = path.removePrefix("/")
                        val fallbackUri = Uri.parse("https://appassets.androidplatform.net/assets/www/$normalized")
                        return assetLoader.shouldInterceptRequest(fallbackUri)
                    }
                }
                return null
            }
        }

        val hasBundledAssets = try {
            assets.list("www")?.contains("index.html") == true
        } catch (_: Exception) {
            false
        }

        if (hasBundledAssets) {
            webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
        } else {
            webView.loadUrl("http://10.0.2.2:3000/")
        }

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (webView.canGoBack()) {
                        webView.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        )
    }

    override fun onResume() {
        super.onResume()
        ArnaVpnService.stateListener = { state ->
            notifyWebVpnState(state)
        }
        if (::webView.isInitialized) {
            val state = if (ArnaVpnService.isRunning) "connected" else "disconnected"
            notifyWebVpnState(state)
        }
    }

    override fun onDestroy() {
        ArnaVpnService.stateListener = null
        super.onDestroy()
    }
}
