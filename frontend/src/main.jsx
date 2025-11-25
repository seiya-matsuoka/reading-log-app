import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import App from './App.jsx';
import { MeProvider } from './providers/meContext.jsx';
import { ToastProvider } from './providers/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <MeProvider>
          <App />
        </MeProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
