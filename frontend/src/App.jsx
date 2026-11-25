import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { ChatLauncher } from './components/ChatLauncher';

// Cada página se descarga recién cuando se visita (code splitting)
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const PanelPage = lazy(() => import('./pages/PanelPage').then((m) => ({ default: m.PanelPage })));
const ProfesorPanelPage = lazy(() => import('./pages/ProfesorPanelPage').then((m) => ({ default: m.ProfesorPanelPage })));
const CursoDetallePage = lazy(() => import('./pages/CursoDetalle').then((m) => ({ default: m.CursoDetallePage })));
const MisCursosPage = lazy(() => import('./pages/MisCursosPage').then((m) => ({ default: m.MisCursosPage })));
const AulaVirtualPage = lazy(() => import('./pages/AulaVirtualPage').then((m) => ({ default: m.AulaVirtualPage })));
const NotificacionesPage = lazy(() => import('./pages/NotificacionesPage').then((m) => ({ default: m.NotificacionesPage })));
const SolicitarRecuperacionPage = lazy(() => import('./pages/SolicitarRecuperacion').then((m) => ({ default: m.SolicitarRecuperacionPage })));
const CambiarPasswordPage = lazy(() => import('./pages/CambiarPasswordPage').then((m) => ({ default: m.CambiarPasswordPage })));
const VerificarCuentaPage = lazy(() => import('./pages/VerificarCuentaPage').then((m) => ({ default: m.VerificarCuentaPage })));
const PerfilUsuarioPage = lazy(() => import('./pages/PerfilUsuario').then((m) => ({ default: m.PerfilUsuarioPage })));
const PagoExitoPage = lazy(() => import('./pages/PagoExitoPage').then((m) => ({ default: m.PagoExitoPage })));
const PagoErrorPage = lazy(() => import('./pages/PagoErrorPage').then((m) => ({ default: m.PagoErrorPage })));
const PagoPendientePage = lazy(() => import('./pages/PagoPendientePage').then((m) => ({ default: m.PagoPendientePage })));
const CrearEvaluacion = lazy(() => import('./components/CrearEvaluacion').then((m) => ({ default: m.CrearEvaluacion })));
const RendirEvaluacion = lazy(() => import('./components/RendirEvaluacion').then((m) => ({ default: m.RendirEvaluacion })));
const CalendarioPage = lazy(() => import('./components/CalendarioPages').then((m) => ({ default: m.CalendarioPage })));
const InboxPage = lazy(() => import('./pages/InboxPage').then((m) => ({ default: m.InboxPage })));

// Al navegar sin recargar: vuelve arriba y reproduce un fundido de entrada en cada ruta nueva
function TransicionRuta({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div key={pathname} className="anim-aparecer">
      <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-10"><div className="skeleton h-64" /></div>}>
        {children}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-300">
        <TransicionRuta>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
        <Route path="/curso/:id" element={<CursoDetallePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        

        {/* RUTA PROTEGIDA */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute>
              <PanelPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profesor-panel" 
          element={
            <ProtectedRoute>
              <ProfesorPanelPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-cursos" 
          element={
            <ProtectedRoute>
              <MisCursosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notificaciones" 
          element={
            <ProtectedRoute>
              <NotificacionesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aula/:cursoId" 
          element={
            <ProtectedRoute>
              <AulaVirtualPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />
        <Route path="/recuperar-password" element={<CambiarPasswordPage />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacionPage />} />
        <Route path="/verificar-cuenta" element={<VerificarCuentaPage />} />
        <Route path="/perfil" element={<PerfilUsuarioPage />} />
        <Route path="/crear-evaluacion" element={<CrearEvaluacion />} />
        <Route path='/evaluacion/:evaluacionId' element={<RendirEvaluacion />} />
        
        {/* RUTAS DE PAGO MERCADO PAGO */}
        <Route path="/pago/exito" element={<PagoExitoPage />} />
        <Route path="/pago/error" element={<PagoErrorPage />} />
        <Route path="/pago/pendiente" element={<PagoPendientePage />} />
        <Route path="/mi-calendario" element={<CalendarioPage />} />
        </Routes>
        </TransicionRuta>
      </div>
      <ChatLauncher />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </BrowserRouter>
  );
}

export default App;