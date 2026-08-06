//Componente de service workers basico para poder agregar la app al home screen y obtener las capacidades offline, push notifications, background, etc

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

self.addEventListener("fetch", () => {});
