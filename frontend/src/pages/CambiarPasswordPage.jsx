import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clienteAxios from '../api/axiosConfig';

export const CambiarPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Agarramos el ?token=... de la URL
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const cambiarPasswordMutation = useMutation({
    mutationFn: async (datos) => {
      const response = await clienteAxios.post('/auth/cambiar-password', datos);
      return response.data.mensaje;
    },
    onSuccess: (mensajeExito) => {
      toast.success(mensajeExito);
      // Magia: Lo mandamos al login a los 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      const msj = error.response?.data?.mensaje || 'Error al cambiar la contraseña. El link puede estar vencido.';
      toast.error(msj);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    cambiarPasswordMutation.mutate({ token, nuevaPassword });
  };

  // Si alguien entra a esta página sin token en la URL, le mostramos un error feo
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-red-600">Acceso denegado. Falta el token de seguridad.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 dark:border-slate-700 p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">Nueva Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">Escribí tu nueva contraseña para ingresar.</p>
        </div>



        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type={mostrarPassword ? "text" : "password"}
              required
              minLength="6"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors opacity-60 hover:opacity-100 py-1"
              title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L3.596 3.596M9.172 9.172L21 21" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={cambiarPasswordMutation.isPending || mensaje?.tipo === 'exito'}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold transition-colors ${
              cambiarPasswordMutation.isPending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {cambiarPasswordMutation.isPending ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Ir al Login</Link>
        </div>
      </div>
    </div>
  );
};