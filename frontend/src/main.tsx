import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorker';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

// Register service worker for PWA
registerServiceWorker();

