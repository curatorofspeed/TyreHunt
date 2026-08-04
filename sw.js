/* ============================================================
   TYRE HUNT · service worker
   Draws push notifications and keeps the app openable offline.

   Payload contract — both edge functions send exactly this:
     { "title": "...", "body": "...", "url": "/" }
   ============================================================ */

const VERSION = "th-1";
const SHELL = "th-shell-" + VERSION;

// Public half of the VAPID pair. Safe here — it ships to every browser
// anyway. Needed so the worker can re-subscribe on its own if the browser
// rotates the subscription.
const VAPID_PUBLIC =
  "BO9t_5KCL6cdM2Xk9hCQvQ16pfJ5_N88QTnyC3iP5Wkb1Amgai32ARJ5pJTlOzqHC5VjIuWc6SSU3Ky30LCZ0t4";

function urlB64ToUint8(base64) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/* ---------- lifecycle ---------- */

self.addEventListener("install", () => {
  // Take over immediately rather than waiting for every tab to close —
  // otherwise a hunter who just installed wouldn't get notifications
  // until they fully quit the app.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== SHELL).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* ---------- offline fallback ----------
   NETWORK FIRST, deliberately. A cache-first worker would serve a stale
   index.html after every deploy, which is the classic PWA trap — you'd
   ship a fix and nobody would see it. This only reaches for the cache
   when the network genuinely fails, so hunting somewhere with no signal
   still opens the app.
   Delete this listener if you'd rather have no caching at all; push
   works without it. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;

  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const cache = await caches.open(SHELL);
      cache.put("/", fresh.clone());
      return fresh;
    } catch (_) {
      const cached = await caches.match("/", { cacheName: SHELL });
      return cached || Response.error();
    }
  })());
});

/* ---------- notifications ---------- */

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }

  const title = d.title || "TYRE HUNT";
  const body = d.body || "";
  const url = typeof d.url === "string" && d.url.startsWith("/") ? d.url : "/";

  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url },
    // Collapses repeats: a second like replaces the first rather than
    // stacking six notifications on the lock screen.
    tag: "tyrehunt",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/";

  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // Focus an open tab instead of spawning a second copy of the app.
    for (const c of all) {
      if (new URL(c.url).origin === self.location.origin) {
        await c.focus();
        if ("navigate" in c) { try { await c.navigate(target); } catch (_) {} }
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});

/* Browsers occasionally rotate a push subscription. Without this the old
   endpoint goes dead and the hunter silently stops receiving anything.
   Re-subscribing keeps it valid; the app upserts the new endpoint into
   push_subs the next time it's opened. */
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil(self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8(VAPID_PUBLIC),
  }).catch(() => {}));
});TYRE HUNT — write sw.js into your APP repo folder

Run ONE LINE AT A TIME.
(Use whatever folder your app's index.html lives in — the example below
 assumes ~/Desktop/tyrehunt. Change it if yours is elsewhere.)

cd ~/Desktop/tyrehunt

echo 'LyogVFlSRSBIVU5UIHNlcnZpY2Ugd29ya2VyCiAqCiAqIERFTElCRVJBVEVMWSBQVVNILU9OTFkuIFRoZXJlIGlzIG5vIGZldGNoIGhhbmRsZXIgYW5kIG5vIGNhY2hpbmcgaGVyZS4KICogVGhlIGFwcCBzaGlwcyBhcyBhIHNpbmdsZSBmaWxlIHRoYXQgY2hhbmdlcyBzZXZlcmFsIHRpbWVzIGEgZGF5LCBhbmQgYQogKiBjYWNoaW5nIHNlcnZpY2Ugd29ya2VyIGlzIHRoZSBjbGFzc2ljIHdheSB0byBzZXJ2ZSBhIHN0YWxlIGJ1aWxkIHRvCiAqIHVzZXJzIHdobyB0aGVuIHJlcG9ydCBidWdzIHlvdSBhbHJlYWR5IGZpeGVkLiBJZiBvZmZsaW5lIGNhY2hpbmcgaXMKICogZXZlciB3YW50ZWQsIGl0IHNob3VsZCBiZSBhZGRlZCBrbm93aW5nbHksIHdpdGggYSB2ZXJzaW9uZWQgY2FjaGUgYW5kCiAqIGEgc2tpcFdhaXRpbmcgc3Rvcnkg4oCUIG5vdCBhcyBhIHNpZGUgZWZmZWN0IG9mIGFkZGluZyBub3RpZmljYXRpb25zLgogKi8KCnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigiaW5zdGFsbCIsIChlKSA9PiB7CiAgc2VsZi5za2lwV2FpdGluZygpOwp9KTsKCnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigiYWN0aXZhdGUiLCAoZSkgPT4gewogIGUud2FpdFVudGlsKHNlbGYuY2xpZW50cy5jbGFpbSgpKTsKfSk7CgpzZWxmLmFkZEV2ZW50TGlzdGVuZXIoInB1c2giLCAoZXZlbnQpID0+IHsKICBsZXQgZGF0YSA9IHt9OwogIHRyeSB7IGRhdGEgPSBldmVudC5kYXRhID8gZXZlbnQuZGF0YS5qc29uKCkgOiB7fTsgfSBjYXRjaCAoZSkgeyBkYXRhID0ge307IH0KCiAgY29uc3QgdGl0bGUgPSBkYXRhLnRpdGxlIHx8ICJUWVJFIEhVTlQiOwogIGNvbnN0IG9wdGlvbnMgPSB7CiAgICBib2R5OiBkYXRhLmJvZHkgfHwgIiIsCiAgICBpY29uOiAiaWNvbi0xOTIucG5nIiwKICAgIGJhZGdlOiAiaWNvbi0xOTIucG5nIiwKICAgIHRhZzogZGF0YS50YWcgfHwgInR5cmVodW50IiwKICAgIHJlbm90aWZ5OiBmYWxzZSwKICAgIGRhdGE6IHsgdXJsOiBkYXRhLnVybCB8fCAiLyIgfSwKICAgIHZpYnJhdGU6IFsxMl0sCiAgfTsKICBldmVudC53YWl0VW50aWwoc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbih0aXRsZSwgb3B0aW9ucykpOwp9KTsKCnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigibm90aWZpY2F0aW9uY2xpY2siLCAoZXZlbnQpID0+IHsKICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTsKICBjb25zdCB0YXJnZXQgPSAoZXZlbnQubm90aWZpY2F0aW9uLmRhdGEgJiYgZXZlbnQubm90aWZpY2F0aW9uLmRhdGEudXJsKSB8fCAiLyI7CiAgZXZlbnQud2FpdFVudGlsKAogICAgc2VsZi5jbGllbnRzLm1hdGNoQWxsKHsgdHlwZTogIndpbmRvdyIsIGluY2x1ZGVVbmNvbnRyb2xsZWQ6IHRydWUgfSkudGhlbigobGlzdCkgPT4gewogICAgICAvLyBmb2N1cyBhbiBvcGVuIHRhYiBpZiB0aGVyZSBpcyBvbmUsIHJhdGhlciB0aGFuIG9wZW5pbmcgYSBkdXBsaWNhdGUKICAgICAgZm9yIChjb25zdCBjbGllbnQgb2YgbGlzdCkgewogICAgICAgIGlmICgiZm9jdXMiIGluIGNsaWVudCkgewogICAgICAgICAgY2xpZW50Lm5hdmlnYXRlKHRhcmdldCkuY2F0Y2goKCkgPT4ge30pOwogICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpOwogICAgICAgIH0KICAgICAgfQogICAgICBpZiAoc2VsZi5jbGllbnRzLm9wZW5XaW5kb3cpIHJldHVybiBzZWxmLmNsaWVudHMub3BlbldpbmRvdyh0YXJnZXQpOwogICAgfSkKICApOwp9KTsK' | base64 --decode > sw.js

wc -c sw.js

The last line should print about 1713.
Then commit/upload sw.js to the app repo alongside index.html.
