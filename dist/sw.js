// Sprout Planner service worker — app-shell offline cache.
// Bumped CACHE version invalidates old caches on activate.
const CACHE = "sprout-v2";
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sprout-logo.png",
  "/sprout-success.png",
  "/sprout-progress.png",
  "/sprout-empty.png",
  "/sprout-fail.png",
  "/sprout-neutral.png",
  "/sprout-streak.png",
  "/sprout-streak-1.png",
  "/sprout-streak-3.png",
  "/sprout-streak-7.png",
  "/sprout-streak-15.png",
  "/sprout-streak-21.png",
  "/favicon-64.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  // Navigations: network-first, fall back to cached app shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() =>
          caches.match("/").then((r) => r || caches.match("/index.html")),
        ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
