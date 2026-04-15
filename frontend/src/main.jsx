import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos toda la aplicación con el proveedor de Google */}
    <GoogleAuthProvider clientId={clientId}>
      <App />
    </GoogleAuthProvider>
  </React.StrictMode>
);
