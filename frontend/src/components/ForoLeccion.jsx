import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import clienteAxios from '../api/axiosConfig';

export const ForoLeccion = ({ leccionId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const stompClientRef = useRef(null);
  const chatEndRef = useRef(null); // Para hacer auto-scroll hacia abajo

  const {
    data: historial = [],
    isLoading: cargandoHistorial,
    error: historialError,
  } = useQuery({
    queryKey: ['foro', leccionId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/foro/leccion/${leccionId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!leccionId,
    staleTime: 1000 * 60 * 5,
  });

  // 1. Conectar WebSocket al montar el componente
  useEffect(() => {
    conectarWebSocket();

    // Cleanup: Desconectar al salir de la lección
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [leccionId]);

  useEffect(() => {
    setComentarios(historial);
  }, [historial]);

  useEffect(() => {
    if (historialError) {
      console.error('Error cargando historial del foro:', historialError);
    }
  }, [historialError]);

  // 2. Auto-scroll cada vez que hay un mensaje nuevo
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comentarios]);

  const conectarWebSocket = () => {
    // Obtenemos el token del localStorage para autenticar el WebSocket
    const token = localStorage.getItem('token'); 

    const client = new Client({
      // Usamos SockJS como fallback y puente
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BACKEND_URL}/api/ws-chat`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConectado(true);
      
      // NOS SUSCRIBIMOS AL CANAL DE ESTA LECCIÓN EXACTA
      client.subscribe(`/topic/foro.leccion.${leccionId}`, (message) => {
        const comentarioRecibido = JSON.parse(message.body);
        // Agregamos el nuevo mensaje al array existente
        setComentarios((prev) => [...prev, comentarioRecibido]);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conectado) return;

    // ENVIAMOS EL MENSAJE AL BACKEND
    stompClientRef.current.publish({
      destination: `/app/foro.leccion.${leccionId}`,
      body: nuevoMensaje
    });

    setNuevoMensaje(''); // Limpiamos el input
  };

  // Formatear la fecha para que se vea linda (Ej: "14:30")
  const formatearHora = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mt-8 flex flex-col h-[500px] transition-colors duration-300">
      {/* HEADER DEL FORO */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 rounded-t-xl flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          💬 Foro de Dudas
        </h3>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className={`w-2.5 h-2.5 rounded-full ${conectado ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
          <span className={conectado ? 'text-green-600' : 'text-red-500'}>
            {conectado ? 'En vivo' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* ÁREA DE MENSAJES (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-slate-950/80 space-y-4">
        {comentarios.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            No hay preguntas aún. ¡Sé el primero en romper el hielo!
          </div>
        ) : (
          comentarios.map((comentario) => {
            const esProfesor = comentario.autorRol === 'PROFESOR' || comentario.autorRol === 'ADMIN';
            
            return (
              <div key={comentario.id} className={`flex flex-col ${esProfesor ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className={`text-xs font-bold ${esProfesor ? 'text-purple-600' : 'text-gray-600'}`}>
                    {comentario.autorNombre}
                  </span>
                  {esProfesor && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Profesor
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatearHora(comentario.fechaCreacion)}</span>
                </div>
                
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${
                  esProfesor 
                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-800 dark:border-slate-700 border border-gray-200 text-gray-900 dark:text-slate-100 rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{comentario.contenido}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} /> {/* Ancla invisible para el auto-scroll */}
      </div>

      {/* INPUT PARA ENVIAR MENSAJES */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 rounded-b-xl shrink-0">
        <form onSubmit={enviarMensaje} className="flex gap-3">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder={conectado ? "Escribe tu duda aquí..." : "Conectando al servidor..."}
            disabled={!conectado}
            className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!conectado || !nuevoMensaje.trim()}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Enviar <span>📤</span>
          </button>
        </form>
      </div>
    </div>
  );
};