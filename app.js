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
async function requestNotificationPermission() {
  const permission = Notification.permission;

  if (permission === 'granted') {
      console.log('Permiso ya concedido');
      return true;
  } else if (permission === 'denied') {
      console.error('Permiso de notificaciones previamente denegado');
      return false;
  } else {
      try {
          const result = await Notification.requestPermission();
          if (result === 'granted') {
              console.log('Permiso concedido');
              return true;
          } else {
              console.error('Permiso de notificaciones denegado');
              return false;
          }
      } catch (error) {
          console.error('Error al solicitar permiso de notificaciones:', error);
          return false;
      }
  }
}

// Llamar a la función para solicitar permiso
const notifyButton = document.getElementById('notifyButton');
notifyButton.addEventListener('click', async () => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
      navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('¡Permiso concedido!', {
              body: 'Ahora puedes recibir notificaciones.',
              icon: 'icono.png'
          });
      });
  }
});
