import { useNavigate } from 'react-router-dom';

export const PanelPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Para cerrar sesión, simplemente rompemos el pase VIP y lo mandamos afuera
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Panel de Administración</h1>
        <p className="text-gray-600 mb-8">
          ¡Bienvenido! Si estás viendo esto, es porque tu token JWT funcionó perfectamente y lograste pasar la ruta protegida.
        </p>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};