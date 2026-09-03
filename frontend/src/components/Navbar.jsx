import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BotonTema } from './BotonTema';
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
    <nav className="bg-white dark:bg-slate-900 shadow px-6 py-4 flex justify-between items-center z-40 relative text-slate-900 dark:text-slate-100">
      <div className="font-extrabold text-2xl text-blue-600 tracking-tight">
        <Link to="/">DevCursos</Link>
      </div>

      <div className="flex items-center gap-4">
        <BotonTema />

        {usuario ? (
          <>
            <div className="flex items-center gap-1">
              <Link
                to="/notificaciones"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-2 2h16l-2-2Zm-5 6h-2" />
                </svg>
              </Link>
              <Link
                to="/chat"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                aria-label="Mensajes"
                title="Mensajes"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 11.5a7.5 7.5 0 01-8 7.5 8.7 8.7 0 01-3.5-.7L4 20l1.4-3.5A7.3 7.3 0 014.5 12 7.5 7.5 0 0120 11.5Z" />
                </svg>
              </Link>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center focus:outline-none transition-transform hover:scale-105"
                aria-label="Abrir menú de usuario"
              >
                {usuario.fotoPerfilUrl ? (
                  <img src={usuario.fotoPerfilUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover border-2 border-blue-500" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 border-2 border-blue-500">
                    {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-slate-700 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 mb-1">
                    <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold">Sesión iniciada como</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate mt-0.5">{usuario.nombre}</p>
                  </div>
                  <Link to="/mis-cursos" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" onClick={() => setMenuAbierto(false)}>Mis Cursos</Link>
                  <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" onClick={() => setMenuAbierto(false)}>Mi Perfil</Link>
                  <Link to="/mi-calendario" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" onClick={() => setMenuAbierto(false)}>Mi Calendario</Link>
                  {usuario.rol?.toUpperCase().includes('ADMIN') && <Link to="/admin-panel" className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50" onClick={() => setMenuAbierto(false)}>Panel Admin</Link>}
                  {usuario.rol?.toUpperCase().includes('PROFESOR') && <Link to="/profesor-panel" className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50" onClick={() => setMenuAbierto(false)}>Panel Profesor</Link>}
                  <div className="border-t border-gray-100 dark:border-slate-700 mt-2 mb-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">Cerrar Sesión</button>
                </div>
              )}
              </div>
          </>
        ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 font-semibold transition-colors"
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
        </div>
      )}
      </div>
    </nav>
  );
};