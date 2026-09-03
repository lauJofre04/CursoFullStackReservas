import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export const NotificacionesPage = () => {
  const { usuario } = useAuth();
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);

  const {
    data: notificaciones = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const response = await clienteAxios.get('/notificaciones');
      return response.data || [];
    },
    enabled: !!usuario?.id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const handleMarcarTodasComoLeidas = async () => {
    setLoadingMarkAll(true);
    try {
      await clienteAxios.put('/notificaciones/leer-todas');
      await refetch();
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    } finally {
      setLoadingMarkAll(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historial persistente</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Notificaciones</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link reloadDocument
            to="/home"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            Volver al inicio
          </Link>
          <button
            type="button"
            onClick={handleMarcarTodasComoLeidas}
            disabled={loadingMarkAll || notificaciones.length === 0}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMarkAll ? 'Marcar...' : 'Marcar todas como leídas'}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando notificaciones...</p>
        ) : notificaciones.length === 0 ? (
          <div className="space-y-3 text-slate-600 dark:text-slate-300">
            <p className="text-lg font-medium">No hay notificaciones en tu historial.</p>
            <p className="text-sm">Las notificaciones se guardan aquí automáticamente cuando llegan por STOMP.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notificaciones.map((item) => (
              <li key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.mensaje}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(item.fecha).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.leida ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'}`}>
                    {item.leida ? 'Leída' : 'No leída'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
