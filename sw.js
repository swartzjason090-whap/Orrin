/* Orrin service worker: makes the whole app open and run offline */
const VERSION = "orrin-v2", RUNTIME_CACHE = "orrin-runtime";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];
const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const RUNTIME = [/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js/, /fonts\.(googleapis|gstatic)\.com/, /\/web-llm\.js$/];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    await (await caches.open(VERSION)).addAll(SHELL);
    try { const rc = await caches.open(RUNTIME_CACHE); if (!(await rc.match(THREE_URL))) await rc.add(THREE_URL); } catch { /* saved later on first use */ }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("orrin-") && k !== VERSION && k !== RUNTIME_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // App pages: network first (so updates arrive), cached copy when offline
  if (req.mode === "navigate" || (url.origin === location.origin && SHELL.some(s => s !== "./" && url.pathname.endsWith(s.slice(1))))) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; })
      .catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match("./index.html")));
    return;
  }
  // 3D library, fonts, offline-AI library: cache first
  if (RUNTIME.some(rx => rx.test(req.url))) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)); } return r; })));
  }
  // AI services and speech go straight to the network. The offline AI model files are stored by the model library itself.
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./")));
});
