import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PanelPage } from './pages/PanelPage';
import { ProtectedRoute } from './components/ProtectedRoute'; // Importamos al patovica

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* RUTA PROTEGIDA */}
        <Route 
          path="/panel" 
          element={
            <ProtectedRoute>
              <PanelPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;