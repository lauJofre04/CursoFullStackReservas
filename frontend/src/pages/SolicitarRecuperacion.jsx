import { useState } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const SolicitarRecuperacionPage = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const response = await clienteAxios.post('/auth/solicitar-recuperacion', { email });
      setMensaje({ tipo: 'exito', texto: response.data.mensaje });
      setEmail('');
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Hubo un error al procesar la solicitud. Intentá más tarde.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresá tu correo y te enviaremos un link para crear una nueva.</p>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-lg font-bold text-center ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.texto}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="tu@correo.com"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 px-4 border border-transparent rounded-xl text-white font-bold transition-colors ${
              cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};