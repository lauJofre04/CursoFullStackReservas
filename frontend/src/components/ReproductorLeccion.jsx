import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

export const ReproductorLeccion = ({ leccionId, urlVideo, seekTime, onTimeChange }) => {
  const videoRef = useRef(null);
  const ultimoPingRef = useRef(0); // Guarda el último segundo que enviamos al backend

  const [completado, setCompletado] = useState(false);

  const { data: progresoData, isLoading: cargando, error: progresoError } = useQuery({
    queryKey: ['progresoLeccion', leccionId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/progreso/leccion/${leccionId}`);
      return response.data;
    },
    enabled: !!leccionId,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (!progresoData || !videoRef.current) return;

    const { segundos, completado: yaCompletado } = progresoData;
    if (segundos > 0) {
      videoRef.current.currentTime = segundos;
    }
    setCompletado(yaCompletado);
  }, [progresoData]);

  useEffect(() => {
    if (progresoError) {
      console.error('Error al cargar progreso inicial:', progresoError);
    }
  }, [progresoError]);

  useEffect(() => {
    if (seekTime != null && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  // 2. Esta función se ejecuta MUCHAS veces por segundo mientras el video corre
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const tiempoActual = Math.floor(videoRef.current.currentTime);
    onTimeChange?.(tiempoActual);

    // Throttling: Solo mandamos el ping si pasaron 5 segundos desde el último
    if (tiempoActual - ultimoPingRef.current >= 5) {
      ultimoPingRef.current = tiempoActual;
      guardarProgreso(tiempoActual, false);
    }
  };

  // 3. Cuando el video llega al final
  const handleVideoTerminado = () => {
    setCompletado(true);
    guardarProgreso(Math.floor(videoRef.current.currentTime), true);
    // Acá podrías disparar confeti o un modal 🎊
  };

  // 4. El "Ping" silencioso al backend
  const guardarProgreso = async (segundos, esCompletado) => {
    try {
      // Usamos POST pero de fondo, sin bloquear la UI del usuario
      await clienteAxios.post(`/progreso/leccion/${leccionId}`, {
        segundos: segundos,
        completado: esCompletado
      });
    } catch (error) {
      console.error("Error guardando el progreso silencioso", error);
    }
  };

  if (cargando) {
    return (
      <div className="animate-pulse bg-gray-800 w-full aspect-video rounded-lg flex items-center justify-center shadow-lg">
        <p className="text-gray-400 font-semibold">Cargando progreso...</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black border border-gray-800">
      
      {/* Etiqueta de completado (Opcional, para feedback visual) */}
      {completado && (
        <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm border border-green-400">
          ✅ Lección Completada
        </div>
      )}

      <video
        ref={videoRef}
        src={urlVideo}
        controls
        controlsList="nodownload" // Le saca el botón de descargar al reproductor nativo
        className="w-full aspect-video object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoTerminado}
      >
        Tu navegador no soporta reproducción de video.
      </video>
    </div>
  );
};