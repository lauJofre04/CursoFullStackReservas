import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PanelPage } from './pages/PanelPage';
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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
        <Route path="/recuperar-password" element={<CambiarPasswordPage />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacionPage />} />
        <Route path="/verificar-cuenta" element={<VerificarCuentaPage />} />
        <Route path="/perfil" element={<PerfilUsuarioPage />} />
        
        {/* RUTAS DE PAGO MERCADO PAGO */}
        <Route path="/pago/exito" element={<PagoExitoPage />} />
        <Route path="/pago/error" element={<PagoErrorPage />} />
        <Route path="/pago/pendiente" element={<PagoPendientePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;