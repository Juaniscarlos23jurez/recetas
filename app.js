// app.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')  // Asegúrate de que la ruta sea la correcta
    .then((registration) => {
      console.log('Service Worker registrado correctamente', registration);
    })
    .catch((error) => {
      console.log('Error al registrar el Service Worker:', error);
    });
}
 