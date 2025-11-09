// Service Worker Registration for PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered: ', registration);
        })
        .catch((registrationError) => {
          console.warn('⚠️ Service Worker registration failed: ', registrationError);
        });
    });
  }
}
