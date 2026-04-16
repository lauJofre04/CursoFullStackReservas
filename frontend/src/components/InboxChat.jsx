import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export const InboxChat = ({ compact = false, onTotalUnreadChange }) => {
  const { usuario } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [emailDestino, setEmailDestino] = useState('');
  const [nombreChat, setNombreChat] = useState('');
  const [mostrarNuevoChat, setMostrarNuevoChat] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const userSubscriptionRef = useRef(null);
  const seleccionRef = useRef(null);
  const mensajesEndRef = useRef(null);

  const autoScrollAlFinal = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    autoScrollAlFinal();
  }, [mensajes]);

  useEffect(() => {
    seleccionRef.current = seleccion;
  }, [seleccion]);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('https://cursofullstackreservas.onrender.com/api/ws-chat', undefined, { withCredentials: false }),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        cargarConversaciones();
        userSubscriptionRef.current = client.subscribe(
          `/topic/user.${usuario.id}`,
          (message) => {
            try {
              const payload = JSON.parse(message.body);
              setConversaciones((prev) => {
                const updated = prev.map((c) =>
                  c.id === payload.conversacionId
                    ? {
                        ...c,
                        ultimoMensaje: payload.ultimoMensaje,
                        mensajesNoLeidos: c.id === seleccionRef.current?.id ? 0 : payload.mensajesNoLeidos,
                        fechaActualizacion: payload.fechaEnvio,
                      }
                    : c,
                );
                actualizarTotalNoLeidos(updated);
                return updated;
              });
            } catch (e) {
              console.error('Error parseando notificación STOMP', e);
            }
          },
        );
      },
      onStompError: (frame) => {
        setError(frame?.body || 'Error de WebSocket');
      },
      onWebSocketError: (event) => {
        setError('Error de conexión WebSocket');
      },
      onDisconnect: () => {
        setConectado(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      subscriptionRef.current?.unsubscribe();
      userSubscriptionRef.current?.unsubscribe();
      clientRef.current?.deactivate();
    };
  }, [usuario]);

  useEffect(() => {
    if (!seleccion || !clientRef.current?.connected) {
      return;
    }

    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = clientRef.current.subscribe(
      `/topic/conversation.${seleccion.id}`,
      (message) => {
        try {
          const contenido = JSON.parse(message.body);
          setMensajes((prev) => [...prev, contenido]);
          setConversaciones((prev) =>
            prev.map((c) =>
              c.id === contenido.conversacionId
                ? { ...c, ultimoMensaje: contenido.contenido }
                : c,
            ),
          );
        } catch (e) {
          console.error('Error parseando mensaje STOMP', e);
        }
      },
    );

    autoScrollAlFinal();

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [seleccion]);

  const actualizarTotalNoLeidos = (conversacionesData) => {
    if (!onTotalUnreadChange) {
      return;
    }
    const totalUnread = conversacionesData.reduce(
      (sum, conversacion) => sum + (conversacion.mensajesNoLeidos || 0),
      0,
    );
    onTotalUnreadChange(totalUnread);
  };

  const cargarConversaciones = async () => {
    try {
      const response = await clienteAxios.get('/chat/conversaciones');
      const conversacionesData = response.data || [];
      setConversaciones(conversacionesData);
      actualizarTotalNoLeidos(conversacionesData);
    } catch (error) {
      console.error(error);
      setError('No se pudieron cargar las conversaciones');
    }
  };

  const cargarMensajes = async (conversacion) => {
    if (!conversacion) {
      return;
    }

    try {
      const response = await clienteAxios.get(`/chat/conversaciones/${conversacion.id}/mensajes`);
      setMensajes(response.data || []);
      setSeleccion(conversacion);
      await cargarConversaciones();
    } catch (error) {
      console.error(error);
      setError('No se pudieron cargar los mensajes');
    }
  };

  const enviarMensaje = async () => {
    if (!seleccion || !nuevoMensaje.trim() || !clientRef.current?.connected) {
      return;
    }

    const mensaje = {
      conversacionId: seleccion.id,
      contenido: nuevoMensaje.trim(),
      remitenteId: usuario.id,
      remitenteNombre: usuario.nombre,
    };

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(mensaje),
    });

    setNuevoMensaje('');
  };

  const handleEnviarMensaje = (event) => {
    event.preventDefault();
    enviarMensaje();
  };

  const crearConversacion = async (event) => {
    event.preventDefault();
    if (!emailDestino.trim()) {
      setError('Debes ingresar el email de al menos un participante.');
      return;
    }

    try {
      const response = await clienteAxios.post('/chat/conversaciones', {
        participantEmails: [emailDestino.trim()],
        nombre: nombreChat || 'Chat privado',
      });

      setConversaciones((prev) => {
        const updated = [response.data, ...prev];
        actualizarTotalNoLeidos(updated);
        return updated;
      });
      setEmailDestino('');
      setNombreChat('');
      setError(null);
    } catch (error) {
      console.error(error);
      setError('No se pudo crear la conversación. Revisa el email ingresado.');
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return compact ? (
    <div className="flex flex-col h-full gap-3 p-3">
      {/* Selector de conversación compacto */}
      <div className="flex gap-2 items-center justify-between flex-shrink-0">
        <select
          value={seleccion?.id || ''}
          onChange={(e) => {
            const conv = conversaciones.find((c) => c.id === Number(e.target.value));
            if (conv) cargarMensajes(conv);
          }}
          className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Selecciona un chat...</option>
          {conversaciones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => setMostrarNuevoChat((prev) => !prev)}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700 hover:bg-slate-100"
        >
          +
        </button>
      </div>

      {mostrarNuevoChat && (
        <form onSubmit={crearConversacion} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 flex-shrink-0">
          <input
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-2 text-xs font-semibold">
            Crear
          </button>
        </form>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-3 min-h-0 flex flex-col justify-end gap-2">
        {!seleccion ? (
          <p className="text-xs text-slate-500">Selecciona una conversación</p>
        ) : mensajes.length === 0 ? (
          <p className="text-xs text-slate-500">Sin mensajes</p>
        ) : (
          mensajes.map((mensaje) => {
            const esPropio = mensaje.remitenteId === usuario.id;
            return (
              <div key={mensaje.id || `${mensaje.remitenteId}-${mensaje.fechaEnvio}`} className={`text-xs max-w-[80%] rounded-xl p-2 ${esPropio ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-200 text-slate-900'}`}>
                <div className={`text-xs mb-1 ${esPropio ? 'text-white/70' : 'text-slate-600'}`}>
                  {mensaje.remitenteNombre} {formatearHora(mensaje.fechaEnvio)}
                </div>
                <p className="break-words">{mensaje.contenido}</p>
              </div>
            );
          })
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form className="flex gap-2 flex-shrink-0" onSubmit={handleEnviarMensaje}>
        <input
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Mensaje..."
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={!seleccion}
        />
        <button type="submit" disabled={!seleccion || !nuevoMensaje.trim()} className="rounded-xl bg-blue-600 text-white px-3 py-2 text-xs font-semibold disabled:bg-slate-300">
          ✓
        </button>
      </form>
    </div>
  ) : (
    <div className="grid grid-cols-[280px_1fr] gap-4 p-4 h-full">
      {/* Panel izquierdo: Conversaciones */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 overflow-y-auto flex flex-col">
        <div className="mb-5 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Chats</h2>
            <p className="text-sm text-slate-500">Tus conversaciones</p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarNuevoChat((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-slate-100"
            aria-label="Crear nueva conversación"
          >
            +
          </button>
        </div>

        {mostrarNuevoChat && (
          <div className="space-y-3 mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Nuevo chat</p>
              <button
                type="button"
                onClick={() => setMostrarNuevoChat(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={crearConversacion} className="space-y-3">
              <input
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                placeholder="Email del profesor o alumno"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                value={nombreChat}
                onChange={(e) => setNombreChat(e.target.value)}
                placeholder="Nombre de la conversación (opcional)"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-2 font-semibold hover:bg-blue-700 transition">
                Crear conversación
              </button>
            </form>
          </div>
        )}

        <ul className="space-y-2 flex-1">
          {conversaciones.map((conversacion) => (
            <li key={conversacion.id}>
              <button
                type="button"
                onClick={() => cargarMensajes(conversacion)}
                className={`w-full rounded-3xl p-4 text-left transition ${
                  seleccion?.id === conversacion.id ? 'border border-blue-500 bg-blue-50 shadow-sm' : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 truncate">{conversacion.nombre}</p>
                  <div className="flex items-center gap-2">
                    {conversacion.mensajesNoLeidos > 0 && (
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        {conversacion.mensajesNoLeidos}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{formatearHora(conversacion.fechaActualizacion)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{conversacion.ultimoMensaje || 'Sin mensajes aún'}</p>
              </button>
            </li>
          ))}
          {conversaciones.length === 0 && (
            <li>
              <p className="text-sm text-slate-500">Aún no tienes conversaciones. Empieza una escribiendo el email de un profesor o compañero.</p>
            </li>
          )}
        </ul>
      </div>

      {/* Panel derecho: Mensajes */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">{seleccion?.nombre || 'Selecciona una conversación'}</h2>
            <p className="text-sm text-slate-500">{seleccion ? `Participantes: ${seleccion.participanteNombres.join(', ')}` : 'Elige un chat para comenzar.'}</p>
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${conectado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {conectado ? 'Conectado' : 'Desconectado'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-3 px-1 min-h-0 flex flex-col justify-end gap-3">
          {mensajes.length === 0 && seleccion && <p className="text-sm text-slate-500">No hay mensajes aún en esta conversación. Envía el primero.</p>}
          {mensajes.map((mensaje) => {
            const esPropio = mensaje.remitenteId === usuario.id;
            return (
              <div
                key={mensaje.id || `${mensaje.remitenteId}-${mensaje.fechaEnvio}`}
                className={`max-w-[85%] rounded-3xl p-4 ${esPropio ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100 text-slate-900'}`}
              >
                <div className={`text-xs mb-2 ${esPropio ? 'text-white/80' : 'text-slate-500'}`}>
                  <span className="font-semibold">{mensaje.remitenteNombre}</span> · {formatearHora(mensaje.fechaEnvio)}
                </div>
                <p className="whitespace-pre-wrap break-words">{mensaje.contenido}</p>
              </div>
            );
          })}
          <div ref={mensajesEndRef} />
        </div>

        <div className="mt-auto flex-shrink-0">
          <form className="flex gap-2" onSubmit={handleEnviarMensaje}>
            <input
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribir mensaje..."
              className="flex-1 rounded-3xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!seleccion}
            />
            <button
              type="submit"
              disabled={!seleccion || !nuevoMensaje.trim()}
              className="rounded-3xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-300 flex-shrink-0"
            >
              Enviar
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};
