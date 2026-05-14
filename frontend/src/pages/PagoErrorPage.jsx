import { useNavigate } from 'react-router-dom';

export const PagoErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none p-8 text-center border border-gray-100 dark:border-slate-700">
        {/* Icono de error */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Pago Cancelado</h1>
        
        <p className="text-gray-600 dark:text-slate-300 mb-8">
          Tu pago no se completó. Por favor, intenta nuevamente o contacta a soporte si el problema persiste.
        </p>

        <div className="bg-red-50 dark:bg-slate-950 border border-red-200 dark:border-slate-700 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-2">¿Qué pasó?</h3>
          <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>El pago fue rechazado o cancelado</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Tu tarjeta o método de pago no fue válido</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Fondos insuficientes en tu cuenta</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mb-3 transition-colors"
        >
          Intentar de Nuevo
        </button>

        <button
          onClick={() => navigate('/home')}
          className="w-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 font-bold py-3 rounded-xl transition-colors"
        >
          Volver a Inicio
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            ¿Necesitas ayuda? <a href="mailto:soporte@reservas.com" className="text-blue-600 dark:text-blue-300 hover:underline font-semibold">Contacta a soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
};
