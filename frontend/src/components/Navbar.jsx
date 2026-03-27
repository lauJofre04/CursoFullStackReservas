import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  // Chequeamos si hay un token guardado para saber si el usuario está logueado
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Nombre de la App */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/home" className="text-2xl font-black text-blue-600 tracking-tight">
              Dev<span className="text-gray-800">Cursos</span>
            </Link>
          </div>

          {/* Botones de Navegación */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/home" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
            >
              Cursos
            </Link>

            {/* Renderizado Condicional: Si está logueado mostramos el Panel, si no, Login/Registro */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/mis-cursos" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Mis Cursos
                </Link>
                <Link 
                  to="/panel" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Mi Panel
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Ingresar
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};