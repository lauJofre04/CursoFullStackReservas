
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { AuthProvider } from './context/AuthContext.jsx';

Sentry.init({
  // Tenés que crear un segundo proyecto en Sentry pero para "React" y poner ese DSN acá
  dsn: import.meta.env.VITE_SENTRY_DSN,
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  
  // Rastrear el 100% de los errores
  tracesSampleRate: 1.0,
  
  // Replay te graba un "video" de los clics del usuario antes del error (es espectacular)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos toda la aplicación con el proveedor de Google */}
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
     </GoogleOAuthProvider>
  </React.StrictMode>
);
