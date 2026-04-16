import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Asegurate de que la ruta a tu AuthContext sea la correcta
import { useAuth } from '../context/AuthContext'; 

export const Navbar = () => {
  // 🔥 Magia real: sacamos los datos y la función de cierre directamente de tu contexto global
  const { usuario, logout } = useAuth();
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const handleLogout = () => {
    logout(); // Limpia el localStorage y el estado global
    setMenuAbierto(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center z-40 relative">
      <div className="font-extrabold text-2xl text-blue-600 tracking-tight">
        <Link to="/">DevCursos</Link>
      </div>

      {/* Condicional: Si hay usuario logueado mostramos el perfil, si no, los botones */}
      {usuario ? (
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center focus:outline-none transition-transform hover:scale-105"
          >
            {usuario.fotoPerfilUrl ? (
              <img 
                src={usuario.fotoPerfilUrl} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-500">
                {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 mb-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Sesión iniciada como</p>
                <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{usuario.nombre}</p>
              </div>
              
              <Link to="/mis-cursos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={() => setMenuAbierto(false)}>
                Mis Cursos
              </Link>
              <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={() => setMenuAbierto(false)}>
                Mi Perfil
              </Link>
              <Link to="/mi-calendario" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={() => setMenuAbierto(false)}>
                Mi Calendario
              </Link>
              <Link to="/chat" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={() => setMenuAbierto(false)}>
                Chat
              </Link>

              {usuario.rol?.toUpperCase().includes('ADMIN') && (
                <Link to="/admin-panel" className="block px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 mt-1" onClick={() => setMenuAbierto(false)}>
                  Panel Admin
                </Link>
              )}

              {usuario.rol?.toUpperCase().includes('PROFESOR') && (
                <Link to="/profesor-panel" className="block px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 mt-1" onClick={() => setMenuAbierto(false)}>
                  Panel Profesor
                </Link>
              )}

              <div className="border-t border-gray-100 mt-2 mb-1"></div>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Bloque para cuando el usuario NO está logueado (visitante) */
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            to="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl transition-colors shadow-sm"
          >
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
};