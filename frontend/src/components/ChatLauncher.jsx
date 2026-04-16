import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { InboxChat } from './InboxChat';

export const ChatLauncher = () => {
  const { usuario } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef(null);
  const userSubscriptionRef = useRef(null);
  

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('https://cursofullstackreservas.onrender.com/ws-chat', undefined, { withCredentials: false }),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: async () => {
        try {
          const response = await clienteAxios.get('/chat/conversaciones');
          const conversacionesData = response.data || [];
          const totalUnread = conversacionesData.reduce(
            (sum, conversacion) => sum + (conversacion.mensajesNoLeidos || 0),
            0,
          );
          setUnreadCount(totalUnread);
        } catch (error) {
          console.error('Error cargando conversaciones para contador:', error);
        }

        userSubscriptionRef.current = client.subscribe(
          `/topic/user.${usuario.id}`,
          async (message) => {
            try {
              const response = await clienteAxios.get('/chat/conversaciones');
              const conversacionesData = response.data || [];
              const totalUnread = conversacionesData.reduce(
                (sum, conversacion) => sum + (conversacion.mensajesNoLeidos || 0),
                0,
              );
              setUnreadCount(totalUnread);
            } catch (error) {
              console.error('Error actualizando contador:', error);
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
      clientRef.current?.deactivate();
    };
  }, [usuario]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
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

      {abierto && (
        <div className="pointer-events-auto absolute bottom-20 right-4 w-[95vw] max-w-[420px] max-h-[76vh] rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900">Chat</p>
              <p className="text-xs text-slate-500">Mensajes en tiempo real</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
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
