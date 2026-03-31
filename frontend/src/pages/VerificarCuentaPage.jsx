import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const VerificarCuentaPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [estado, setEstado] = useState({
    cargando: true,
    mensaje: 'Verificando tu cuenta, por favor esperá...',
    tipo: 'info'
  });

  // El useEffect se ejecuta solito apenas carga la página
  useEffect(() => {
    const verificar = async () => {
      if (!token) {
        setEstado({ cargando: false, mensaje: 'No se encontró el token de seguridad en la URL.', tipo: 'error' });
        return;
      }

      try {
        const response = await clienteAxios.post('/auth/verificar', { token });
        setEstado({ cargando: false, mensaje: response.data.mensaje, tipo: 'exito' });
        
        // Si sale bien, lo mandamos al login en 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        const msj = error.response?.data?.mensaje || 'Error al verificar la cuenta. El link puede estar vencido.';
        setEstado({ cargando: false, mensaje: msj, tipo: 'error' });
      }
    };

    verificar();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Verificación de Cuenta</h2>

        {estado.cargando ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">{estado.mensaje}</p>
          </div>
        ) : (
          <div className={`p-4 rounded-lg font-bold ${
            estado.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {estado.mensaje}
          </div>
        )}

        {!estado.cargando && (
          <div className="mt-8">
            <Link to="/login" className="w-full inline-block py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors">
              Ir al Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};