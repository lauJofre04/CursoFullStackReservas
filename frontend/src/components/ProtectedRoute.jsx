import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  // Buscamos el token en la memoria del navegador
  const token = localStorage.getItem('token');

  // Si no hay token, lo mandamos al login de un plumazo
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizamos la página que el usuario quería ver
  return children;
};