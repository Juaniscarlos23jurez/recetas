self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("static-v1").then((cache) => {
        return cache.addAll([
          "./",
          "./index.html",
          "./style.css",
          "./app.js",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).catch(() =>
            caches.match("./index.html") // Carga offline predeterminada
          )
        );
      })
    );
  });
  