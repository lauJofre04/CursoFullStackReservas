import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PanelPage } from './pages/PanelPage';
import { HomePage } from './pages/HomePage';
import { Navbar } from './components/Navbar';
import { CursoDetallePage } from './pages/CursoDetalle';
import { MisCursosPage } from './pages/MisCursosPage';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { SolicitarRecuperacionPage } from './pages/SolicitarRecuperacion';
import { CambiarPasswordPage } from './pages/CambiarPasswordPage';
import { VerificarCuentaPage } from './pages/VerificarCuentaPage';
import { PerfilUsuarioPage } from './pages/PerfilUsuario';

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
        <Route path="/recuperar-password" element={<CambiarPasswordPage />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacionPage />} />
        <Route path="/verificar-cuenta" element={<VerificarCuentaPage />} />
        <Route path="/perfil" element={<PerfilUsuarioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;