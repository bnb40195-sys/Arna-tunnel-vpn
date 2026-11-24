import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_CONFIG_DOMAINS = [
  'vpnjantit.com',
  'sshocean.com',
  'sshkit.com',
  'sshs8.com',
  'cybertunnel.org',
  'fastssh.com',
  'mytunneling.com',
  'globalssh.net',
  'jagoanssh.com',
  'lionssh.com',
  'opentunnel.net',
  'akunssh.net',
  'finessh.com',
  'cyberssh.com',
  'createssh.com',
  'howdy.id',
  'sshmax.net',
  'vpnsplit.com',
  'bestv2ray.com',
  'sshstores.net',
  'freevpn.us',
];

interface CachedPage {
  html: string;
  finalUrl: string;
  timestamp: number;
}

const pageCache = new Map<string, CachedPage>();
const CACHE_TTL_MS = 60 * 1000;
const MAX_CACHE_ITEMS = 40;

function isPrivateOrLocalIp(ip: string): boolean {
  const clean = ip.replace(/^::ffff:/i, '');
  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (net.isIPv6(clean)) {
    const lower = clean.toLowerCase();
    if (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc') ||
      lower.startsWith('fd')
    ) {
      return true;
    }
    return false;
  }
  return true;
}

function isUnsafeHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  if (
    !lower ||
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.localhost')
  ) {
    return true;
  }
  if (net.isIP(lower)) {
    return isPrivateOrLocalIp(lower);
  }
  return false;
}

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^www\./, '');
  if (isUnsafeHostname(lower)) return false;
  return ALLOWED_CONFIG_DOMAINS.some(
    (domain) => lower === domain || lower.endsWith('.' + domain)
  );
}

async function resolvePublicHost(hostname: string): Promise<{ ipv4: string[]; ipv6: string[]; cnames: string[] }> {
  const cleanHost = hostname.trim().replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];
  if (!cleanHost || isUnsafeHostname(cleanHost)) {
    throw new Error('Blocked or invalid hostname');
  }

  if (net.isIPv4(cleanHost)) {
    if (isPrivateOrLocalIp(cleanHost)) throw new Error('Private IP blocked');
    return { ipv4: [cleanHost], ipv6: [], cnames: [] };
  }
  if (net.isIPv6(cleanHost)) {
    if (isPrivateOrLocalIp(cleanHost)) throw new Error('Private IP blocked');
    return { ipv4: [], ipv6: [cleanHost], cnames: [] };
  }

  const [v4Res, v6Res, cnameRes] = await Promise.allSettled([
    dns.promises.resolve4(cleanHost),
    dns.promises.resolve6(cleanHost),
    dns.promises.resolveCname(cleanHost),
  ]);

  const ipv4 = v4Res.status === 'fulfilled' ? v4Res.value : [];
  const ipv6 = v6Res.status === 'fulfilled' ? v6Res.value : [];
  const cnames = cnameRes.status === 'fulfilled' ? cnameRes.value : [];

  if (ipv4.length === 0 && ipv6.length === 0) {
    const fallback = await dns.promises.lookup(cleanHost, { all: true });
    for (const entry of fallback) {
      if (isPrivateOrLocalIp(entry.address)) throw new Error('Resolved to private/internal IP');
      if (entry.family === 4) ipv4.push(entry.address);
      else ipv6.push(entry.address);
    }
  } else {
    for (const ip of [...ipv4, ...ipv6]) {
      if (isPrivateOrLocalIp(ip)) throw new Error('Resolved to private/internal IP');
    }
  }

  if (ipv4.length === 0 && ipv6.length === 0) {
    throw new Error('DNS resolution returned no addresses');
  }

  return { ipv4, ipv6, cnames };
}

function probeTlsHandshake(
  targetIp: string,
  servername: string,
  port: number
): Promise<{
  connected: boolean;
  latencyMs: number;
  protocol: string | null;
  cipherName: string | null;
  alpnProtocol: string | null;
  subjectCn: string | null;
  issuer: string | null;
  validTo: string | null;
  sanDomains: string[];
  error?: string;
}> {
  return new Promise((resolve) => {
    const start = Date.now();
    let settled = false;
    const finish = (res: any) => {
      if (settled) return;
      settled = true;
      resolve(res);
    };

    const socket = tls.connect(
      {
        host: targetIp,
        port,
        servername: net.isIP(servername) ? undefined : servername,
        ALPNProtocols: ['h2', 'http/1.1'],
        rejectUnauthorized: false,
        timeout: 6500,
      },
      () => {
        const latencyMs = Date.now() - start;
        const protocol = socket.getProtocol() || null;
        const cipher = socket.getCipher();
        const cert = socket.getPeerCertificate(false);
        const sanRaw = cert?.subjectaltname || '';
        const sanDomains = sanRaw
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.toUpperCase().startsWith('DNS:'))
          .map((s: string) => s.slice(4).trim())
          .filter(Boolean);

        socket.end();
        finish({
          connected: true,
          latencyMs,
          protocol,
          cipherName: cipher?.name || null,
          alpnProtocol: socket.alpnProtocol || null,
          subjectCn: cert?.subject?.CN || null,
          issuer: cert?.issuer?.O || cert?.issuer?.CN || null,
          validTo: cert?.valid_to || null,
          sanDomains: Array.from(new Set(sanDomains)).slice(0, 30),
        });
      }
    );

    socket.setTimeout(6500, () => {
      socket.destroy();
      finish({
        connected: false,
        latencyMs: Date.now() - start,
        protocol: null,
        cipherName: null,
        alpnProtocol: null,
        subjectCn: null,
        issuer: null,
        validTo: null,
        sanDomains: [],
        error: 'TLS timeout (6.5s)',
      });
    });

    socket.on('error', (err) => {
      finish({
        connected: false,
        latencyMs: Date.now() - start,
        protocol: null,
        cipherName: null,
        alpnProtocol: null,
        subjectCn: null,
        issuer: null,
        validTo: null,
        sanDomains: [],
        error: err.message,
      });
    });
  });
}

function optimizeForWeakInternet(html: string): string {
  // Remove heavy ad/analytics scripts and ad containers for fast loading on weak connections
  let cleaned = html
    .replace(/<script[^>]+(?:googlesyndication|doubleclick|googletagmanager|google-analytics|adsterra|popads|propellerads|mgid|taboola|facebook\.net|yandex\.ru\/metrika)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<ins[^>]+class=["'][^"']*adsbygoogle[^"']*["'][^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '')
    .replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, '')
    .replace(/<link[^>]+rel=["'](?:preload|prefetch|dns-prefetch)["'][^>]*>/gi, '');

  // Add lazy loading to images to save bandwidth
  cleaned = cleaned.replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy" decoding="async"');
  return cleaned;
}

function sanitizeOfflineSnapshot(html: string, finalUrl: string): { title: string; cleanHtml: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : finalUrl;

  // Strip scripts and event handlers so cached snapshot renders safely offline inside sandboxed viewer
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '');

  const baseTag = `<base href="${finalUrl.replace(/"/g, '&quot;')}" />`;
  if (/<head[^>]*>/i.test(cleanHtml)) {
    cleanHtml = cleanHtml.replace(/<head[^>]*>/i, (m) => `${m}\n${baseTag}`);
  } else {
    cleanHtml = `${baseTag}\n${cleanHtml}`;
  }

  return { title, cleanHtml };
}

function buildInjectedHead(finalUrl: string, lite: boolean, vpnActive: boolean): string {
  const safeBase = finalUrl.replace(/"/g, '&quot;');
  const liteCss = lite
    ? `<style id="arna-lite-style">
        img { max-width: 100% !important; height: auto !important; }
        .adsbygoogle, [id*="ad-"], [class*="ad-banner"], [class*="popup"] { display: none !important; }
        body { -webkit-text-size-adjust: 100%; }
      </style>`
    : '';

  return `
    <base href="${safeBase}" target="_self" />
    ${liteCss}
    <script>
      (function() {
        var currentUrl = ${JSON.stringify(finalUrl)};
        var liteMode = ${JSON.stringify(lite)};
        var vpnMode = ${JSON.stringify(vpnActive)};
        try {
          window.parent.postMessage({ type: 'ARNA_WEBVIEW_URL', url: currentUrl }, '*');
        } catch (e) {}

        function proxyHref(rawHref) {
          try {
            var resolved = new URL(rawHref, currentUrl).toString();
            if (resolved.indexOf('http://') === 0 || resolved.indexOf('https://') === 0) {
              return '/api/web-proxy?url=' + encodeURIComponent(resolved) + '&lite=' + (liteMode ? '1' : '0') + '&vpn=' + (vpnMode ? '1' : '0');
            }
          } catch (e) {}
          return null;
        }

        document.addEventListener('click', function(ev) {
          var el = ev.target;
          while (el && el.tagName !== 'A') {
            el = el.parentElement;
          }
          if (!el || !el.getAttribute) return;
          var href = el.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
          el.removeAttribute('target');
          var proxied = proxyHref(href);
          if (proxied) {
            ev.preventDefault();
            window.location.href = proxied;
          }
        }, true);

        document.addEventListener('submit', function(ev) {
          var form = ev.target;
          if (!form || !form.tagName || form.tagName !== 'FORM') return;
          form.removeAttribute('target');
          var method = (form.getAttribute('method') || 'GET').toUpperCase();
          if (method === 'GET') {
            var action = form.getAttribute('action') || currentUrl;
            try {
              var u = new URL(action, currentUrl);
              var fd = new FormData(form);
              fd.forEach(function(val, key) {
                u.searchParams.set(key, String(val));
              });
              var proxied = '/api/web-proxy?url=' + encodeURIComponent(u.toString()) + '&lite=' + (liteMode ? '1' : '0') + '&vpn=' + (vpnMode ? '1' : '0');
              ev.preventDefault();
              window.location.href = proxied;
            } catch (e) {}
          }
        }, true);
      })();
    </script>
  `;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Real Host / SNI / DNS / TLS / CDN Diagnostics
  app.get('/api/check-host', async (req, res) => {
    const rawHost = typeof req.query.host === 'string' ? req.query.host.trim() : '';
    const requestedPort = Number(req.query.port) || 443;
    const method = typeof req.query.method === 'string' ? req.query.method.toUpperCase() : 'GET';
    const allowedMethods = ['GET', 'HEAD', 'OPTIONS'];
    const fetchMethod = allowedMethods.includes(method) ? method : 'HEAD';

    if (!rawHost) {
      res.status(400).json({ ok: false, error: 'Missing host parameter' });
      return;
    }

    const cleanHost = rawHost.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];

    try {
      const dnsStart = Date.now();
      const resolved = await resolvePublicHost(cleanHost);
      const dnsMs = Date.now() - dnsStart;
      const targetIp = resolved.ipv4[0] || resolved.ipv6[0];

      const tlsResult = await probeTlsHandshake(targetIp, cleanHost, requestedPort);

      let httpStatus: number | null = null;
      let httpStatusText: string | null = null;
      let httpHeaders: Record<string, string> = {};
      let cdnProvider = 'Direct / Unknown Edge';
      let httpMs: number | null = null;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        const hStart = Date.now();
        const scheme = requestedPort === 80 || requestedPort === 8080 ? 'http' : 'https';
        const resp = await fetch(`${scheme}://${cleanHost}`, {
          method: fetchMethod,
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': 'ArnaTunnel-Diagnostics/2.0',
          },
        });
        clearTimeout(timer);
        httpMs = Date.now() - hStart;
        httpStatus = resp.status;
        httpStatusText = resp.statusText;

        const interestingKeys = ['server', 'cf-ray', 'cf-cache-status', 'via', 'x-cache', 'content-type', 'alt-svc', 'x-served-by'];
        interestingKeys.forEach((k) => {
          const v = resp.headers.get(k);
          if (v) httpHeaders[k] = v;
        });

        const srv = (resp.headers.get('server') || '').toLowerCase();
        if (resp.headers.get('cf-ray') || srv.includes('cloudflare')) cdnProvider = 'Cloudflare Edge';
        else if (resp.headers.get('x-served-by') || srv.includes('fastly') || srv.includes('varnish')) cdnProvider = 'Fastly / Varnish CDN';
        else if (srv.includes('akamaighost') || resp.headers.get('x-akamai-transformed')) cdnProvider = 'Akamai CDN';
        else if (resp.headers.get('x-amz-cf-id') || srv.includes('cloudfront')) cdnProvider = 'AWS CloudFront';
        else if (srv.includes('gws') || srv.includes('sffe') || srv.includes('esf')) cdnProvider = 'Google Global Edge';
        else if (srv) cdnProvider = resp.headers.get('server') || 'Direct Origin';
      } catch {
        // HTTP probe may fail even when TLS succeeds (e.g. non-HTTP host or timeout)
      }

      res.json({
        ok: true,
        host: cleanHost,
        port: requestedPort,
        dnsMs,
        ipv4: resolved.ipv4,
        ipv6: resolved.ipv6,
        cnames: resolved.cnames,
        tls: tlsResult,
        http: {
          status: httpStatus,
          statusText: httpStatusText,
          latencyMs: httpMs,
          headers: httpHeaders,
          cdnProvider,
          websocketCapable:
            cdnProvider.includes('Cloudflare') ||
            cdnProvider.includes('Fastly') ||
            cdnProvider.includes('Google') ||
            httpStatus === 101 ||
            httpStatus === 200 ||
            httpStatus === 301 ||
            httpStatus === 302,
        },
        sanDomains: tlsResult.sanDomains,
      });
    } catch (err) {
      res.status(200).json({
        ok: false,
        host: cleanHost,
        error: err instanceof Error ? err.message : 'Host check failed',
      });
    }
  });

  // Real Offline Web Stash endpoint: fetches real public pages for browser CacheStorage
  app.get('/api/offline-stash', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).json({ ok: false, error: 'Missing url parameter' });
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
      res.status(400).json({ ok: false, error: 'Invalid URL' });
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.status(400).json({ ok: false, error: 'Unsupported protocol' });
      return;
    }

    try {
      await resolvePublicHost(parsed.hostname);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const upstream = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'ArnaTunnel-OfflineVault/2.0 (Mobile)',
          Accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        },
      });
      clearTimeout(timeout);

      const finalUrl = upstream.url || parsed.toString();
      const finalHost = new URL(finalUrl).hostname;
      if (isUnsafeHostname(finalHost)) {
        res.status(403).json({ ok: false, error: 'Redirected host not allowed' });
        return;
      }

      const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';
      const rawText = await upstream.text();
      const bounded = rawText.length > 2_500_000 ? rawText.slice(0, 2_500_000) : rawText;

      let title = finalUrl;
      let cleanHtml = bounded;

      if (contentType.includes('html')) {
        const sanitized = sanitizeOfflineSnapshot(bounded, finalUrl);
        title = sanitized.title;
        cleanHtml = sanitized.cleanHtml;
      } else {
        cleanHtml = `<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8"><style>body{background:#070b14;color:#e2e8f0;font-family:monospace;padding:16px;white-space:pre-wrap;word-break:break-word;font-size:13px;}</style></head><body>${bounded.replace(/</g, '&lt;')}</body></html>`;
      }

      const sizeBytes = Buffer.byteLength(cleanHtml, 'utf8');
      res.json({
        ok: true,
        url: finalUrl,
        title,
        contentType: 'text/html; charset=utf-8',
        html: cleanHtml,
        sizeBytes,
      });
    } catch (err) {
      res.status(200).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to fetch offline page',
      });
    }
  });

  // Real Speed Test endpoints
  app.get('/api/speed-ping', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ t: Date.now() });
  });

  app.get('/api/speed-payload', (req, res) => {
    const requestedBytes = Math.min(4 * 1024 * 1024, Math.max(65536, Number(req.query.bytes) || 1024 * 1024));
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Length', String(requestedBytes));
    const buf = Buffer.alloc(requestedBytes, 0x61);
    res.send(buf);
  });

  app.post('/api/speed-upload', express.raw({ type: '*/*', limit: '5mb' }), (req, res) => {
    const receivedBytes = Buffer.isBuffer(req.body) ? req.body.length : 0;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, receivedBytes });
  });

  app.get('/api/web-proxy', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const lite = req.query.lite !== '0';
    const vpnActive = req.query.vpn === '1';

    if (!rawUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      res.status(400).send('Invalid URL');
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      res.status(400).send('Unsupported protocol');
      return;
    }

    if (!isAllowedHost(parsedUrl.hostname)) {
      res.status(403).send('Host not permitted inside config sites viewer');
      return;
    }

    const cacheKey = `${parsedUrl.toString()}::lite=${lite ? 1 : 0}`;
    const cached = pageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Arna-Cache', 'HIT');
      res.send(cached.html);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 11000);

      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      };

      if (vpnActive) {
        headers['X-Arna-Tunnel'] = 'active';
      }

      const upstream = await fetch(parsedUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeout);

      const finalUrl = upstream.url || parsedUrl.toString();
      const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status);
        res.setHeader('Content-Type', contentType);
        res.send(buf);
        return;
      }

      let html = await upstream.text();
      html = html.replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');

      if (lite) {
        html = optimizeForWeakInternet(html);
      }

      const injection = buildInjectedHead(finalUrl, lite, vpnActive);
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (match) => `${match}\n${injection}`);
      } else {
        html = `${injection}\n${html}`;
      }

      if (pageCache.size >= MAX_CACHE_ITEMS) {
        const oldestKey = pageCache.keys().next().value;
        if (oldestKey) pageCache.delete(oldestKey);
      }
      pageCache.set(cacheKey, { html, finalUrl, timestamp: Date.now() });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Arna-Cache', 'MISS');
      res.send(html);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { margin:0; padding:24px; background:#070b14; color:#e2e8f0; font-family:system-ui,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; text-align:center; }
            .card { max-width:420px; background:#0f172a; border:1px solid #1e293b; border-radius:20px; padding:24px; }
            h2 { margin:0 0 10px; color:#34d399; font-size:18px; }
            p { margin:0 0 14px; color:#94a3b8; font-size:13px; line-height:1.6; }
            .url { font-family:monospace; font-size:12px; color:#38bdf8; word-break:break-all; background:#020617; padding:8px 12px; border-radius:10px; border:1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>تعذر الوصول السريع للموقع</h2>
            <p>قد يكون الاتصال بطيئاً أو الموقع يفرض حماية مؤقتة (${message.replace(/</g, '&lt;')}). جرب تشغيل <b>بروكسي التطبيق</b> من الشريط العلوي أو التبديل إلى <b>الوضع المباشر</b>.</p>
            <div class="url">${parsedUrl.toString().replace(/</g, '&lt;')}</div>
          </div>
        </body>
        </html>
      `);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });

    // Replace Vite WebSocket transport with a no-op connected transport so neither WebSocket error nor SendBeforeConnectError occurs
    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (!result || !result.code) {
          next();
          return;
        }
        const patched = result.code
          .replace(
            /const transport = normalizeModuleRunnerTransport\(\(\(\) => \{[\s\S]*?\}\)\(\)\);/,
            'const transport = normalizeModuleRunnerTransport({ connect() {}, disconnect() {}, send() {} });'
          )
          .replace(
            'setupForwardConsoleHandler(transport, forwardConsole);',
            '/* forwardConsole disabled */'
          );
        res.status(200);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.send(patched);
      } catch {
        next();
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Arna tunnel server running on http://0.0.0.0:${port}`);
  });
}

startServer();

