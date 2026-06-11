const CACHE_NAME = "campus-event-planner-shell-v2"

const APP_SHELL = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME)
            await cache.addAll(APP_SHELL)

            // Activate immediately
            await self.skipWaiting()
        })(),
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            // Remove old caches
            const cacheNames = await caches.keys()

            await Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                }),
            )

            // Take control immediately
            await self.clients.claim()
        })(),
    )
})

self.addEventListener("fetch", (event) => {
    // Only cache GET requests
    if (event.request.method !== "GET") {
        return
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME)

            try {
                // Try network first
                const networkResponse = await fetch(event.request)

                // Cache successful responses
                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone())
                }

                return networkResponse
            } catch (error) {
                // Offline fallback
                const cachedResponse = await cache.match(event.request)

                if (cachedResponse) {
                    return cachedResponse
                }

                // Optional fallback response
                return new Response("Offline resource not available", {
                    status: 503,
                    statusText: "Service Unavailable",
                })
            }
        })(),
    )
})