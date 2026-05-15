import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PanelPage } from './pages/PanelPage';
import { ProfesorPanelPage } from './pages/ProfesorPanelPage';
import { HomePage } from './pages/HomePage';
import { Navbar } from './components/Navbar';
import { CursoDetallePage } from './pages/CursoDetalle';
import { MisCursosPage } from './pages/MisCursosPage';
import { AulaVirtualPage } from './pages/AulaVirtualPage';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { SolicitarRecuperacionPage } from './pages/SolicitarRecuperacion';
import { CambiarPasswordPage } from './pages/CambiarPasswordPage';
import { VerificarCuentaPage } from './pages/VerificarCuentaPage';
import { PerfilUsuarioPage } from './pages/PerfilUsuario';
import { PagoExitoPage } from './pages/PagoExitoPage';
import { PagoErrorPage } from './pages/PagoErrorPage';
import { PagoPendientePage } from './pages/PagoPendientePage';
import { CrearEvaluacion } from './components/CrearEvaluacion';
import { RendirEvaluacion } from './components/RendirEvaluacion';
import { CalendarioPage } from './components/CalendarioPages';
import { InboxPage } from './pages/InboxPage';
import { ChatLauncher } from './components/ChatLauncher';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
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
      </div>
      <ChatLauncher />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </BrowserRouter>
  );
}

export default App;