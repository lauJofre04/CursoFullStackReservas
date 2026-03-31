import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const CambiarPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Agarramos el ?token=... de la URL
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const response = await clienteAxios.post('/auth/cambiar-password', { 
        token, 
        nuevaPassword 
      });
      
      setMensaje({ tipo: 'exito', texto: response.data.mensaje });
      
      // Magia: Lo mandamos al login a los 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      const msj = error.response?.data?.mensaje || 'Error al cambiar la contraseña. El link puede estar vencido.';
      setMensaje({ tipo: 'error', texto: msj });
    } finally {
      setCargando(false);
    }
  };

  // Si alguien entra a esta página sin token en la URL, le mostramos un error feo
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600">Acceso denegado. Falta el token de seguridad.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Nueva Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">Escribí tu nueva contraseña para ingresar.</p>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-lg font-bold text-center ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.texto}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="password"
              required
              minLength="6"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
            />
          </div>

          <button
            type="submit"
            disabled={cargando || mensaje?.tipo === 'exito'}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold transition-colors ${
              cargando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Ir al Login</Link>
        </div>
      </div>
    </div>
  );
};