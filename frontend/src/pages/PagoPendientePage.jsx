import { useNavigate } from 'react-router-dom';

export const PagoPendientePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de pendiente */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100">
            <svg className="h-10 w-10 text-yellow-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
        
        <p className="text-gray-600 mb-8">
          Tu pago está siendo procesado. Esto puede tomar algunos minutos.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">¿Qué está sucediendo?</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Tu pago aún está siendo procesado por Mercado Pago</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Pronto recibirás un email con el resultado</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-600 mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Puedes cerrar esta ventana con seguridad</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/mis-cursos')}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl mb-3 transition-colors"
        >
          Ir a Mis Cursos
        </button>

        <button
          onClick={() => navigate('/home')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors"
        >
          Volver a Inicio
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            El pago se confirmará en las próximas 24 horas
          </p>
        </div>
      </div>
    </div>
  );
};
