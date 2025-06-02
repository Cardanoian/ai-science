import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppControllerProvider } from './contexts/AppControllerContext';

createRoot(document.getElementById('root')!).render(
  <AppControllerProvider>
    <App />
  </AppControllerProvider>
);
