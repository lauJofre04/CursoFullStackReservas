import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';
import toast from 'react-hot-toast';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { InboxChat } from './InboxChat';

export const ChatLauncher = () => {
  const { usuario } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef(null);
  const userSubscriptionRef = useRef(null);
  const notificacionesSubscriptionRef = useRef(null);
  const alertasSubscriptionRef = useRef(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  const {
    data: conversacionesData = [],
    refetch: refetchConversaciones,
  } = useQuery({
    queryKey: ['conversaciones', usuario?.id],
    queryFn: async () => {
      const response = await clienteAxios.get('/chat/conversaciones');
      return response.data || [];
    },
    enabled: !!usuario?.id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: notificacionesPersistidas = [],
    refetch: refetchNotificaciones,
  } = useQuery({
    queryKey: ['notificaciones', usuario?.id],
    queryFn: async () => {
      const response = await clienteAxios.get('/notificaciones');
      return response.data || [];
    },
    enabled: !!usuario?.id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const agregarNotificacion = (payload, tipo = 'info') => {
    const mensaje = payload?.mensaje || 'Tienes una nueva notificación';
    const fecha = payload?.fecha ? new Date(payload.fecha) : new Date();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setNotificaciones((prev) => [
      { id, mensaje, fecha, tipo },
      ...prev,
    ].slice(0, 20));
    setNotificacionesNoLeidas((prev) => prev + 1);

    toast(mensaje, {
      icon: tipo === 'alert' ? '📢' : '🔔',
    });
  };

  useEffect(() => {
    if (!notificacionesPersistidas) {
      return;
    }

    setNotificaciones(
      notificacionesPersistidas.map((item) => ({
        id: item.id,
        mensaje: item.mensaje,
        fecha: item.fecha ? new Date(item.fecha) : new Date(),
        leida: item.leida,
        tipo: 'personal',
      })),
    );

    setNotificacionesNoLeidas(notificacionesPersistidas.filter((item) => !item.leida).length);
  }, [notificacionesPersistidas]);

  const abrirNotificaciones = async () => {
    setNotificacionesAbiertas(true);
    setNotificacionesNoLeidas(0);

    try {
      await clienteAxios.put('/notificaciones/leer-todas');
      setNotificaciones((prev) => prev.map((item) => ({ ...item, leida: true })));
      await refetchNotificaciones();
    } catch (error) {
      console.error('Error marcando notificaciones como leídas:', error);
    }
  };

  useEffect(() => {
    setUnreadCount(
      conversacionesData.reduce((sum, conversacion) => sum + (conversacion.mensajesNoLeidos || 0), 0),
    );
  }, [conversacionesData]);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'https://cursofullstackreservas.onrender.com'}/api/ws-chat`, undefined, { withCredentials: false }),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: async () => {
        refetchConversaciones();

        userSubscriptionRef.current = client.subscribe(
          `/topic/user.${usuario.id}`,
          async () => {
            try {
              await refetchConversaciones();
            } catch (error) {
              console.error('Error actualizando contador:', error);
            }
          },
        );

        notificacionesSubscriptionRef.current = client.subscribe(
          '/user/queue/notificaciones',
          async (message) => {
            try {
              const payload = JSON.parse(message.body);
              agregarNotificacion(payload, 'personal');
              await refetchNotificaciones();
            } catch (error) {
              console.error('Error parseando notificación:', error);
            }
          },
        );

        alertasSubscriptionRef.current = client.subscribe(
          '/topic/alertas',
          (message) => {
            try {
              const payload = JSON.parse(message.body);
              agregarNotificacion(payload, 'alert');
            } catch (error) {
              console.error('Error parseando alerta global:', error);
            }
          },
        );
      },
      onStompError: () => {},
      onWebSocketError: () => {},
      onDisconnect: () => {},
    });

    clientRef.current = client;
    client.activate();

    return () => {
      userSubscriptionRef.current?.unsubscribe();
      notificacionesSubscriptionRef.current?.unsubscribe();
      alertasSubscriptionRef.current?.unsubscribe();
      clientRef.current?.deactivate();
    };
  }, [usuario]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <button
        type="button"
        onClick={abrirNotificaciones}
        className="pointer-events-auto absolute bottom-4 right-20 flex h-14 w-14 items-center justify-center rounded-full border border-white bg-amber-500 text-slate-900 shadow-2xl shadow-amber-500/30 transition hover:bg-amber-400"
        aria-label="Abrir notificaciones"
      >
        <span className="text-2xl">🔔</span>
        {notificacionesNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white shadow-md">
            {notificacionesNoLeidas}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setAbierto((value) => !value)}
        className="pointer-events-auto absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow-2xl shadow-blue-900/30 transition hover:bg-blue-700"
        aria-label="Abrir chat"
      >
        <span className="text-2xl">💬</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {notificacionesAbiertas && (
        <div className="pointer-events-auto absolute bottom-20 right-20 w-[95vw] max-w-[420px] max-h-[76vh] rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Notificaciones</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Últimos eventos en tiempo real</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificacionesAbiertas(false)}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Cerrar notificaciones"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[66vh] overflow-y-auto p-4">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No hay notificaciones nuevas.</p>
            ) : (
              <ul className="space-y-3">
                {notificaciones.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg">{item.tipo === 'alert' ? '📢' : '🔔'}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.fecha.toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">{item.mensaje}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {abierto && (
        <div className="pointer-events-auto absolute bottom-20 right-4 w-[95vw] max-w-[420px] max-h-[76vh] rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Chat</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mensajes en tiempo real</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>
          <div className="h-full overflow-hidden">
            <InboxChat compact />
          </div>
        </div>
      )}
    </div>
  );
};
