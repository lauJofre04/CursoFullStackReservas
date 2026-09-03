import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

export const VerificarCuentaPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { isLoading: cargando, data: respuesta } = useQuery({
    queryKey: ['verificarCuenta', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No se encontró el token de seguridad en la URL.');
      }
      const response = await clienteAxios.post('/auth/verificar', { token });
      return { message: response.data.mensaje, success: true };
    },
    enabled: !!token,
    retry: 1,
    staleTime: Infinity,
  });

  // Si se verificó exitosamente, redirigir después de 3 segundos
  if (respuesta?.success && !cargando) {
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  }

  const estado = {
    cargando,
    mensaje: respuesta?.message || 'Verificando tu cuenta, por favor esperá...',
    tipo: respuesta?.success ? 'exito' : 'error'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 dark:text-slate-100 py-12 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-slate-700 text-center">
        
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-6">Verificación de Cuenta</h2>

        {estado.cargando ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">{estado.mensaje}</p>
          </div>
        ) : (
          <div className={`p-4 rounded-lg font-bold ${
            estado.tipo === 'exito'
              ? 'bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-300'
          }`}>
            {estado.mensaje}
          </div>
        )}

        {!estado.cargando && (
          <div className="mt-8">
            <Link reloadDocument to="/login" className="w-full inline-block py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors">
              Ir al Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};