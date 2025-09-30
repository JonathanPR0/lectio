// Escuta o evento de instalação
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  // Você pode adicionar lógica para pré-cache aqui, se necessário
  event.waitUntil(
    caches.open("lectio-cache-v1").then((cache) => {
      return cache.addAll([
        "/", // Página inicial
        "/index.html", // Página inicial (se necessário)
        "/site.webmanifest", // Manifesto do PWA
        "/android-chrome-192x192.png", // Ícones
        "/android-chrome-512x512.png", // Ícones
      ]);
    }),
  );
});

// Escuta o evento de ativação
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "lectio-cache-v1") {
            console.log("Limpando cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Escuta o evento de fetch (requisições)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache, se disponível, ou faz a requisição na rede
      return response || fetch(event.request);
    }),
  );
});
