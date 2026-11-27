package com.arnatunnel.app;

import org.amnezia.awg.hevtunnel.TProxyService;

/**
 * Pure Java JNI bridge to org.amnezia.awg.hevtunnel.TProxyService
 * so Kotlin 2.0.x compiles cleanly without Kotlin 2.2 metadata version mismatch.
 */
public final class TProxyBridge {

    private TProxyBridge() {
    }

    public static void start(String configPath, int tunFd) {
        TProxyService.TProxyStartService(configPath, tunFd);
    }

    public static void stop() {
        TProxyService.TProxyStopService();
    }

    public static long[] getStats() {
        return TProxyService.TProxyGetStats();
    }
}
