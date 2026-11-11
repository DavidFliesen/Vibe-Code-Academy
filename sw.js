/* Vibe Code Academy - service worker. ES5 syntax.
   Bump VERSION on every release so phones pick up the new files. */
var VERSION = "vca-v1.1.0";
var PY_CACHE = "vca-pyodide-0.29.5";
var PY_PATH = "/npm/pyodide@"; // Python engine files on the jsDelivr CDN

var SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/app.js",
  "js/promptlab.js",
  "js/python.js",
  "js/py-worker.js",
  "py/ai_sim.py",
  "data/lessons.js",
  "data/updates.js",
  "assets/icons/icon-96.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/maskable-512.png",
  "assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // cache: "reload" skips the browser's HTTP cache so a new version never stores stale files
      return cache.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION && k !== PY_CACHE) { return caches["delete"](k); }
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") { return; }
  var url = req.url;

  // Python engine from the CDN: cache-first, kept across app versions.
  if (url.indexOf(self.location.origin) !== 0 && url.indexOf(PY_PATH) > 0) {
    event.respondWith(
      caches.open(PY_CACHE).then(function (cache) {
        return cache.match(req).then(function (hit) {
          if (hit) { return hit; }
          return fetch(req).then(function (res) {
            if (res && (res.ok || res.type === "opaque")) { cache.put(req, res.clone()); }
            return res;
          });
        });
      })
    );
    return;
  }

  // Same-origin app files: cache-first, fall back to network, then to the app shell.
  if (url.indexOf(self.location.origin) === 0) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) { return hit; }
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(VERSION).then(function (cache) { cache.put(req, copy); });
          }
          return res;
        })["catch"](function () {
          if (req.mode === "navigate") { return caches.match("index.html"); }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
    );
  }
});
