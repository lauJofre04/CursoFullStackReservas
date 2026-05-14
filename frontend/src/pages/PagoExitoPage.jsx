import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

export const PagoExitoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isLoading: procesando } = useQuery({
    queryKey: ['pagoExito', searchParams.toString()],
    queryFn: async () => {
      const preferenceId = searchParams.get('preference_id');
      const paymentId = searchParams.get('payment_id');
      const merchantOrderId = searchParams.get('merchant_order_id');

      console.log('✅ Pago exitoso recibido');
      console.log('Preference ID:', preferenceId);
      console.log('Payment ID:', paymentId);
      console.log('Merchant Order ID:', merchantOrderId);

      // Aquí puedes hacer una llamada al backend para:
      // 1. Registrar que el pago fue exitoso
      // 2. Matricular al usuario en el curso
      // 3. Enviar email de confirmación

      return { success: true };
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (procesando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">Procesando tu pago...</h2>
          <p className="text-gray-600 dark:text-slate-400">Un momento por favor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none p-8 text-center border border-gray-100 dark:border-slate-700">
        {/* Icono de éxito */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">¡Pago Completado!</h1>
        
        <p className="text-gray-600 dark:text-slate-300 mb-8">
          Tu pago ha sido procesado exitosamente. Ya puedes acceder al curso.
        </p>

        <div className="bg-green-50 dark:bg-slate-950 border border-green-200 dark:border-slate-700 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-2">Próximos pasos:</h3>
          <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-green-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Pronto recibirás un email de confirmación</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-green-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Accede a "Mis Cursos" para comenzar</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-green-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Si tienes dudas, contacta a soporte</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/mis-cursos')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-3 transition-colors"
        >
          Ir a Mis Cursos
        </button>

        <button
          onClick={() => navigate('/home')}
          className="w-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 font-bold py-3 rounded-xl transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};
