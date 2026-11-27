-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class org.amnezia.awg.hevtunnel.TProxyService { *; }
