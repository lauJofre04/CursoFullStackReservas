import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Creamos el contexto
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // Para que la app espere a leer el token antes de cargar

  // Este useEffect se ejecuta cada vez que el usuario recarga la página (F5)
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Armamos el usuario con los datos que vienen en el token.
        // OJO: Si tu backend no manda el id y el rol en el token, vamos a tener que ajustarlo después.
        setUsuario({
          id: decoded.id || 1, // Fallback a 1 por si tu backend aún no manda el ID
          nombre: decoded.nombre || decoded.sub, // sub suele ser el email en Spring Boot
          rol: decoded.rol || 'USER', // Fallback a USER
          fotoPerfilUrl: null 
        });
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        localStorage.removeItem('token');
      }
    }
    setCargando(false);
  }, []);

  // Función para llamar cuando el usuario hace LOGIN con éxito
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    
    setUsuario({
      id: decoded.id || 1,
      nombre: decoded.nombre || decoded.sub,
      rol: decoded.rol || 'USER',
      fotoPerfilUrl: null
    });
  };

  // Función para llamar cuando el usuario hace LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  // Todo lo que pongamos en "value" va a estar disponible en cualquier componente
  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

// Un Hook personalizado para no tener que importar useContext y AuthContext en cada archivo
export const useAuth = () => useContext(AuthContext);