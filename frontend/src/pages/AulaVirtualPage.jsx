import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { GestorModulos } from '../components/GestorModulos';
import { CrearEvaluacion } from '../components/CrearEvaluacion';
import { ForoLeccion } from '../components/ForoLeccion';
import { LeccionSkeleton } from '../components/LeccionSkeleton';
import { ModalCrearTarea } from '../components/ModalCrearTarea';
import { ModalEntrega } from '../components/ModalEntrega';
import { ProgressCircle } from '../components/ProgressCircle';

export const AulaVirtualPage = () => {
  const { cursoId } = useParams();
  const { usuario } = useAuth();
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [recursoActual, setRecursoActual] = useState(null);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vistaAdmin, setVistaAdmin] = useState('modulos');
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [seleccionadosCertificados, setSeleccionadosCertificados] = useState([]);
  const [mensajeCertificados, setMensajeCertificados] = useState('');
  const [enviandoCertificados, setEnviandoCertificados] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const puedeEditar = usuario?.rol === 'ADMIN' || usuario?.rol === 'PROFESOR';

  const cursoQuery = useQuery({
    queryKey: ['curso', cursoId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/cursos/${cursoId}`);
      return response.data;
    },
    enabled: !!cursoId,
    staleTime: 1000 * 60 * 2,
  });

  const modulosQuery = useQuery({
    queryKey: ['modulos', cursoId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/modulos/curso/${cursoId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!cursoId,
    staleTime: 1000 * 60 * 2,
  });

  const evaluacionesQuery = useQuery({
    queryKey: ['evaluaciones', cursoId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/evaluaciones/curso/${cursoId}`);
      return response.data;
    },
    enabled: !!cursoId,
    staleTime: 1000 * 60 * 2,
  });

  const progresoQuery = useQuery({
    queryKey: ['progresoCurso', cursoId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/progreso/curso/${cursoId}`);
      return response.data;
    },
    enabled: !!cursoId,
    staleTime: 1000 * 60 * 1,
    retry: false,
  });

  const certificadosQuery = useQuery({
    queryKey: ['certificadosCandidatos', cursoId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/admin/cursos/${cursoId}/certificados/candidatos`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: vistaAdmin === 'certificados' && !!cursoId,
    staleTime: 1000 * 60 * 1,
    retry: false,
  });

  const curso = cursoQuery.data;
  const modulos = modulosQuery.data || [];
  const evaluaciones = evaluacionesQuery.data || [];
  const error = cursoQuery.error || modulosQuery.error || evaluacionesQuery.error || progresoQuery.error;

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarAbierta(true);
    }
  }, []);

  useEffect(() => {
    if (!leccionSeleccionada && modulos.length > 0) {
      const primeraLeccion = modulos[0]?.lecciones?.[0];
      if (primeraLeccion) {
        setLeccionSeleccionada(primeraLeccion.id);
        setRecursoActual(primeraLeccion.recursos?.[0] || null);
      }
    }
  }, [modulos, leccionSeleccionada]);

  const handleSeleccionarLeccion = (leccionId) => {
    setTareaSeleccionada(null); // Deseleccionamos cualquier tarea previamente seleccionada
    setLeccionSeleccionada(leccionId);
    if (window.innerWidth < 768) setSidebarAbierta(false);
  };

  const handleSeleccionarTarea = (tarea) => {
    setLeccionSeleccionada(null); // Ocultamos la lección
    setTareaSeleccionada(tarea);  // Mostramos la tarea
    if (window.innerWidth < 768) setSidebarAbierta(false);
  };

  const toggleSeleccionado = (usuarioId) => {
    setSeleccionadosCertificados((prev) =>
      prev.includes(usuarioId)
        ? prev.filter((id) => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const enviarCertificados = async () => {
    if (seleccionadosCertificados.length === 0) {
      setMensajeCertificados('Selecciona al menos un alumno antes de enviar certificados.');
      return;
    }

    try {
      setEnviandoCertificados(true);
      setMensajeCertificados('');
      await clienteAxios.post(`/admin/cursos/${cursoId}/certificados/enviar`, {
        usuarioIds: seleccionadosCertificados,
      });
      setMensajeCertificados('Certificados enviados correctamente.');
      queryClient.invalidateQueries(['certificadosCandidatos', cursoId]);
      setSeleccionadosCertificados([]);
    } catch (error) {
      console.error('Error enviando certificados:', error);
      setMensajeCertificados('Error al enviar los certificados. Intenta nuevamente.');
    } finally {
      setEnviandoCertificados(false);
    }
  };

  if (cursoQuery.isLoading || modulosQuery.isLoading || evaluacionesQuery.isLoading || progresoQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-800 dark:text-slate-100 font-semibold">Cargando aula virtual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 dark:border-slate-700 p-8 rounded-lg shadow-lg">
          <p className="text-red-600 dark:text-red-300 font-semibold text-lg">{error?.message || String(error) || 'Error al cargar el contenido del curso'}</p>
        </div>
      </div>
    );
  }

  // Si es admin y está en modo edición, mostrar el Panel de Gestión
  if (puedeEditar && modoEdicion) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 dark:text-slate-100 p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Cabecera Admin */}
          {/* Cabecera Admin */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">⚙️ Gestionar Contenido</h1>
            
            {/* 👈 NUEVO: Agrupamos los botones */}
            <div className="flex gap-3">
              
              <button
                onClick={() => {
                  setModoEdicion(false);
                  setVistaAdmin('modulos'); // Reseteamos la vista al salir
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                👁️ Ver como Estudiante
              </button>
            </div>
          </div>

          {/* 🗂️ PESTAÑAS (TABS) */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setVistaAdmin('modulos')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                vistaAdmin === 'modulos' 
                  ? 'bg-gray-800 text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚 Módulos y Lecciones
            </button>
            <button
              onClick={() => setVistaAdmin('evaluaciones')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                vistaAdmin === 'evaluaciones' 
                  ? 'bg-green-600 text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 Crear Evaluaciones
            </button>
            <button
              onClick={() => setVistaAdmin('certificados')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                vistaAdmin === 'certificados' 
                  ? 'bg-indigo-600 text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏅 Certificados
            </button>
          </div>

          {/* RENDERIZADO CONDICIONAL DE LA PESTAÑA */}
          {vistaAdmin === 'modulos' ? (
            <GestorModulos cursoId={parseInt(cursoId)} cursoTitulo={curso?.titulo || 'Curso'} />
          ) : vistaAdmin === 'evaluaciones' ? (
            <CrearEvaluacion cursoIdPreseleccionado={parseInt(cursoId)} />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Alumnos con opción de certificado</h2>
                <p className="text-sm text-gray-600">Selecciona a los alumnos con evaluaciones aprobadas y envíales su certificado en PDF.</p>

                {mensajeCertificados && (
                  <div className="rounded-xl p-3 text-sm font-medium text-white bg-blue-600">
                    {mensajeCertificados}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Enviar</th>
                        <th className="px-4 py-3">Alumno</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Aprobado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificadosQuery.isLoading || certificadosQuery.isFetching ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500">Cargando candidatos...</td>
                        </tr>
                      ) : (certificadosQuery.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No hay alumnos registrados para este curso.</td>
                        </tr>
                      ) : (
                        (certificadosQuery.data || []).map((alumno) => (
                          <tr key={alumno.usuarioId} className="border-b border-gray-200">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={seleccionadosCertificados.includes(alumno.usuarioId)}
                                onChange={() => toggleSeleccionado(alumno.usuarioId)}
                                disabled={!alumno.aprobado}
                              />
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-800">{alumno.nombre}</td>
                            <td className="px-4 py-4 text-gray-500">{alumno.email}</td>
                            <td className="px-4 py-4 text-sm font-semibold">
                              <span className={alumno.aprobado ? 'text-green-600' : 'text-red-600'}>
                                {alumno.aprobado ? 'Sí' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={enviarCertificados}
                    disabled={enviandoCertificados || seleccionadosCertificados.length === 0}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {enviandoCertificados ? 'Enviando certificados...' : 'Enviar certificados seleccionados'}
                  </button>
                  <span className="text-sm text-gray-500">Solo se pueden enviar certificados a alumnos que estén aprobados.</span>
                </div>
              </div>
            </div>
          )}
         

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-100">
      {/* BARRA LATERAL - NAVEGACIÓN DE MÓDULOS */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 bg-gray-900 text-white shadow-xl flex flex-col shrink-0 overflow-hidden md:relative md:translate-x-0 ${
          sidebarAbierta ? 'translate-x-0 w-80' : '-translate-x-full w-72 md:w-80'
        }`}
      >
        <div className="flex items-center justify-between gap-4 p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold truncate">📚 {curso?.titulo}</h2>
            <p className="text-sm text-gray-400 mt-1">{modulos.length} módulos</p>
          </div>
          <button
            onClick={() => setSidebarAbierta(false)}
            className="md:hidden rounded-full bg-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/20 transition"
          >
            Cerrar
          </button>
        </div>

        {/* Barra de Progreso Circular */}
        <div className="px-4 pt-4">
          <ProgressCircle porcentaje={progresoQuery.data?.porcentaje ?? 35} tamaño={120} />
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="mb-2">
              {/* Encabezado del Módulo */}
              <div className="px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 cursor-pointer transition">
                📌 Módulo {modulo.orden}
              </div>

              {/* Lecciones del Módulo */}
              <div className="space-y-1">
                {modulo.lecciones?.map((leccion) => (
                  <button
                    key={leccion.id}
                    onClick={() => handleSeleccionarLeccion(leccion.id)}
                    className={`w-full text-left px-6 py-2 text-sm transition-all ${
                      leccionSeleccionada === leccion.id
                        ? 'bg-blue-600 text-white font-semibold border-l-4 border-blue-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">📖</span>
                    <span className="truncate">{leccion.titulo}</span>
                    {leccion.duracionMinutos > 0 && (
                      <span className="text-xs ml-2 opacity-70">({leccion.duracionMinutos}m)</span>
                    )}
                  </button>
                ))}
              </div>
              {/* 👈 NUEVO: Entregas del Módulo */}
              {modulo.tareas && modulo.tareas.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-gray-700 pt-2 pb-2">
                  <div className="px-4 py-1 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Entregas Prácticas
                  </div>
                  {modulo.tareas.map((tarea) => (
                    <button
                      key={tarea.id}
                      onClick={() => handleSeleccionarTarea(tarea)}
                      className={`w-full text-left px-6 py-2 text-sm transition-all ${
                        tareaSeleccionada?.id === tarea.id
                          ? 'bg-purple-600 text-white font-semibold border-l-4 border-purple-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="mr-2">📝</span>
                      <span className="truncate">{tarea.titulo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* MÓDULO ESPECIAL DE EXÁMENES */}
          {evaluaciones.length > 0 && (
            <div className="mb-2 mt-4 border-t border-gray-700 pt-4">
              <div className="px-4 py-2 text-sm font-bold text-green-400 tracking-wide uppercase">
                📝 Evaluaciones
              </div>
              <div className="space-y-1">
                {evaluaciones.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => navigate(`/evaluacion/${ev.id}`)}
                    className="w-full text-left px-6 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center border-l-4 border-transparent hover:border-green-400"
                  >
                    <span className="mr-3 text-lg">🏆</span>
                    <span className="truncate font-semibold">{ev.titulo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Pie de la Barra */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarAbierta(false)}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition text-sm font-semibold"
          >
            ← Ocultar
          </button>
        </div>
      </aside>

      {sidebarAbierta && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarAbierta(false)}
        />
      )}

      {/* ÁREA PRINCIPAL - CONTENIDO */}
      <main className="flex-1 overflow-y-auto bg-white min-h-screen">
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            {!sidebarAbierta && (
              <button
                onClick={() => setSidebarAbierta(true)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold transition"
              >
                ☰ Mostrar Índice
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🎓 {curso?.titulo}</h1>
              <p className="text-gray-600 text-sm">Aula Virtual</p>
            </div>
          </div>

          {/* Botón de edición para admins */}
          {puedeEditar && (
            <button
              onClick={() => setModoEdicion(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition shadow-sm"
            >
              ⚙️ Editar Contenido
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {leccionSeleccionada ? (
            <ContenidoLeccion leccionId={leccionSeleccionada} recursoActual={recursoActual} setRecursoActual={setRecursoActual} />
          ) : tareaSeleccionada ? (
            <ContenidoTarea tarea={tareaSeleccionada} cursoTitulo={curso?.titulo} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg font-medium">👈 Selecciona una lección o entrega del menú para empezar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Componente para mostrar el contenido de la lección
const ContenidoLeccion = ({ leccionId, recursoActual, setRecursoActual }) => {
  const queryClient = useQueryClient();
  const [tabActivo, setTabActivo] = useState('foro');
  const [nuevaNota, setNuevaNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [errorNota, setErrorNota] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [seekTime, setSeekTime] = useState(null);

  const {
    data: leccion,
    isLoading: cargando,
    error: leccionError,
  } = useQuery({
    queryKey: ['leccion', leccionId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/lecciones/${leccionId}`);
      return response.data;
    },
    enabled: !!leccionId,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: apuntes = [],
    isLoading: cargandoApuntes,
  } = useQuery({
    queryKey: ['apuntes', leccionId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/apuntes/leccion/${leccionId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!leccionId,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (leccion?.recursos?.length > 0) {
      setRecursoActual(leccion.recursos[0]);
    } else {
      setRecursoActual(null);
    }
  }, [leccion, setRecursoActual]);

  const handleGuardarApunte = async () => {
    if (!nuevaNota.trim()) {
      setErrorNota('Escribí tu apunte antes de guardarlo.');
      return;
    }

    setErrorNota(null);
    setGuardandoNota(true);

    try {
      await clienteAxios.post(`/apuntes/leccion/${leccionId}`, {
        contenido: nuevaNota.trim(),
        tiempoReferenciaSegundos: Math.floor(videoTime || 0),
      });
      setNuevaNota('');
      await queryClient.invalidateQueries(['apuntes', leccionId]);
      setTabActivo('apuntes');
    } catch (err) {
      console.error('Error guardando apunte:', err);
      setErrorNota('No se pudo guardar tu apunte. Intentá de nuevo.');
    } finally {
      setGuardandoNota(false);
    }
  };

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  };

  if (cargando) {
    return <LeccionSkeleton />;
  }

  if (!leccion) {
    return <div className="text-center text-gray-600 mt-10">Lección no encontrada</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6">
      {/* ENCABEZADO DE LA LECCIÓN */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">📖 {leccion.titulo}</h1>
        {leccion.duracionMinutos > 0 && (
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <span>⏱️ Duración estimada: {leccion.duracionMinutos} min</span>
          </p>
        )}
      </div>

      {/* SELECTOR DE RECURSOS HORIZONTAL (Solo se muestra si hay más de 1 recurso) */}
      {leccion.recursos && leccion.recursos.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-gray-500 uppercase flex items-center mr-2">Recursos:</span>
          {leccion.recursos.map((recurso) => (
            <button
              key={recurso.id}
              onClick={() => setRecursoActual(recurso)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                recursoActual?.id === recurso.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>
                {recurso.tipo === 'VIDEO' && '🎥'}
                {recurso.tipo === 'PDF' && '📄'}
                {recurso.tipo === 'LINK' && '🔗'}
                {recurso.tipo === 'DOCUMENTO' && '📋'}
              </span>
              {recurso.titulo}
            </button>
          ))}
        </div>
      )}

      {/* ÁREA DEL RECURSO (Ocupa todo el ancho disponible) */}
      <div className="mb-8">
        {recursoActual ? (
          // 👇 ACÁ LE PASAMOS EL leccionId
          <VisualizadorRecurso
            recurso={recursoActual}
            leccionId={leccionId}
            seekTime={seekTime}
            onTimeChange={setVideoTime}
          />
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center">
            <p className="text-gray-500 font-medium">Esta lección aún no tiene recursos adjuntos.</p>
          </div>
        )}
      </div>

      {/* DESCRIPCIÓN DE LA LECCIÓN */}
      {leccion.descripcion && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">📝 Notas de la lección</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{leccion.descripcion}</p>
        </div>
      )}

      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTabActivo('foro')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tabActivo === 'foro' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              💬 Foro
            </button>
            <button
              type="button"
              onClick={() => setTabActivo('apuntes')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tabActivo === 'apuntes' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📝 Mis Apuntes
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {tabActivo === 'apuntes' ? `Tiempo actual del video: ${formatearTiempo(Math.floor(videoTime || 0))}` : 'Preguntá al profesor o compañeros sobre esta lección.'}
          </div>
        </div>

        <div className="p-6">
          {tabActivo === 'foro' ? (
            <ForoLeccion leccionId={leccionId} />
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Escribí tu apunte privado</label>
                <textarea
                  rows="4"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  placeholder="Anotá lo más importante y vuelve al minuto exacto luego"
                  className="w-full rounded-3xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleGuardarApunte}
                    disabled={guardandoNota}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition ${guardandoNota ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
                  >
                    {guardandoNota ? 'Guardando apunte...' : `Guardar apunte ${videoTime ? `@ ${formatearTiempo(Math.floor(videoTime))}` : ''}`}
                  </button>
                  <span className="text-xs text-gray-500">Estos apuntes son privados y solo los ves vos.</span>
                </div>
                {errorNota && <p className="text-sm text-red-600">{errorNota}</p>}
              </div>

              <div className="space-y-4">
                {apuntes.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No hay apuntes guardados aún. Guardá tu primera nota para volver al minuto clave.
                  </div>
                ) : (
                  apuntes.map((apunte) => (
                    <button
                      key={apunte.id}
                      type="button"
                      onClick={() => setSeekTime(apunte.tiempoReferenciaSegundos ?? 0)}
                      className="w-full rounded-3xl border border-gray-200 p-5 text-left transition hover:border-slate-900 hover:shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-800">{apunte.tiempoReferenciaSegundos != null ? `Ir a ${formatearTiempo(apunte.tiempoReferenciaSegundos)}` : 'Apunte guardado'}</span>
                        <span className="text-xs text-gray-500">{new Date(apunte.fechaCreacion).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">{apunte.contenido}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    
  );
};

// 👇 Agregamos leccionId a los props
const VisualizadorRecurso = ({ recurso, leccionId }) => { 
  const extraerVideoId = (url) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (youtubeMatch) return youtubeMatch[1];
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (driveMatch) return driveMatch[1];
    return null;
  };

  // --- VISTA VIDEO (Grande y central) ---
  if (recurso.tipo === 'VIDEO') {
    const videoId = extraerVideoId(recurso.urlRecurso);
    
    if (videoId && recurso.urlRecurso.includes('youtube')) {
      // Si es YouTube, lo dejamos como estaba (iframe)
      return (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black border border-gray-200">
          <iframe
            width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`}
            title={recurso.titulo} frameBorder="0" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      );
    } else {
      // 🚀 ACÁ ENTRA LA MAGIA SERVERLESS:
      // Si no es YouTube (es nuestro video en Cloudinary), usamos nuestro Reproductor Inteligente
      return (
        <ReproductorLeccion 
          leccionId={leccionId} 
          urlVideo={recurso.urlRecurso} 
        />
      );
    }
  }

  // --- VISTA LINK, PDF o DOCUMENTO (Queda exactamente igual) ---
  const esLink = recurso.tipo === 'LINK';
  const esPdf = recurso.tipo === 'PDF';
  
  const iconConfig = {
    'LINK': { emoji: '🔗', color: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
    'PDF': { emoji: '📄', color: 'bg-red-100 text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    'DOCUMENTO': { emoji: '📋', color: 'bg-green-100 text-green-600', btn: 'bg-green-600 hover:bg-green-700' }
  };
  
  const config = iconConfig[recurso.tipo] || iconConfig['LINK'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
      
      {/* Icono y Textos alineados a la izquierda */}
      <div className="flex items-center gap-5 flex-1 w-full overflow-hidden">
        <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${config.color}`}>
          {config.emoji}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{recurso.tipo}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 truncate">{recurso.titulo}</h3>
          
          {recurso.descripcion && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{recurso.descripcion}</p>
          )}
          
          {esLink && (
            <p className="text-gray-400 text-xs mt-2 truncate w-full max-w-md">
              {recurso.urlRecurso}
            </p>
          )}
        </div>
      </div>

      {/* Botón a la derecha */}
      <a
        href={recurso.urlRecurso}
        target="_blank"
        rel="noopener noreferrer"
        className={`shrink-0 w-full sm:w-auto px-6 py-2.5 text-white rounded-xl transition-all font-bold shadow-sm flex items-center justify-center gap-2 ${config.btn}`}
      >
        {esPdf ? 'Abrir PDF' : esLink ? 'Visitar Enlace' : 'Abrir Documento'}
        <span className="text-lg leading-none">↗</span>
      </a>
    </div>
  );
};
// --- NUEVO COMPONENTE DE TAREA (Con validación de estado) ---
const ContenidoTarea = ({ tarea, cursoTitulo }) => {
  const { usuario } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  // Formateamos la fecha límite
  const fechaLimiteDate = new Date(tarea.fechaLimite);
  const fechaLimiteStr = fechaLimiteDate.toLocaleString('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // Comprobamos si el plazo ya venció
  const plazoVencido = new Date() > fechaLimiteDate;

  const {
    data: miEntrega,
    isLoading: cargandoEntrega,
    refetch: refetchMiEntrega,
  } = useQuery({
    queryKey: ['miEntrega', tarea.id, usuario?.id],
    queryFn: async () => {
      try {
        const alumnoId = usuario?.id || 1;
        const response = await clienteAxios.get(`/tareas/${tarea.id}/mi-entrega?alumnoId=${alumnoId}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!tarea.id && !!usuario?.id,
    retry: false,
  });

  const handleCerrarModal = () => {
    setModalAbierto(false);
    refetchMiEntrega();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
        
        {/* Encabezado morado */}
        <div className="bg-purple-600 px-8 py-6 text-white">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-bold uppercase tracking-wider mb-2">
            <span>📝 Entrega Práctica</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{tarea.titulo}</h1>
          <p className="text-purple-100 flex items-center gap-2 font-medium">
            <span>⏰ Vence el:</span> {fechaLimiteStr}
          </p>
        </div>

        {/* Cuerpo de la tarea */}
        <div className="p-8">
          <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Consignas</h3>
            {tarea.descripcion}
          </div>

          {tarea.archivoConsignaUrl && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📎</div>
                <div>
                  <p className="font-bold text-gray-800">Material adjunto del profesor</p>
                  <p className="text-xs text-gray-500">Descargá este archivo para resolver la entrega</p>
                </div>
              </div>
              <a 
                href={tarea.archivoConsignaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors text-sm"
              >
                Descargar ↓
              </a>
            </div>
          )}

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Estado de tu entrega</h3>
            {cargandoEntrega ? (
              <p className="text-center text-gray-500">Verificando estado...</p>
            ) : (
              <div className="flex flex-col items-center">
                {miEntrega && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
                    <p className="text-green-700 font-bold text-lg mb-1">✅ ¡Trabajo entregado!</p>
                    <p className="text-green-600 text-sm mb-4">
                      Entregado el: {new Date(miEntrega.fechaEntrega).toLocaleString('es-AR', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                    <a 
                      href={miEntrega.archivoAlumnoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold underline text-sm"
                    >
                      📄 Ver archivo entregado actual
                    </a>
                  </div>
                )}

                {(miEntrega?.nota != null || miEntrega?.feedbackDocente) && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 text-left">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-slate-500 mb-1">Corrección del profesor</p>
                        {miEntrega?.nota != null && (
                          <p className="text-3xl font-bold text-green-700">{miEntrega.nota.toFixed(1)}</p>
                        )}
                      </div>
                      {miEntrega?.feedbackDocente && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 bg-slate-100 px-3 py-2 rounded-full">
                          Feedback disponible
                        </span>
                      )}
                    </div>
                    {miEntrega?.feedbackDocente && (
                      <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                        {miEntrega.feedbackDocente}
                      </div>
                    )}
                  </div>
                )}

                {plazoVencido ? (
                  <div className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-2">
                    <span>⏳</span> El plazo para esta entrega ha finalizado
                  </div>
                ) : (
                  <button 
                    onClick={() => setModalAbierto(true)}
                    className={`${miEntrega ? 'bg-gray-800 hover:bg-gray-900' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 text-lg`}
                  >
                    {miEntrega ? '🔄 Modificar mi entrega' : '📤 Subir mi entrega'}
                  </button>
                )}

                {miEntrega && !plazoVencido && (
                  <p className="text-xs text-gray-400 mt-3 text-center max-w-md">
                    Podés modificar tu entrega subiendo un nuevo archivo. Esto reemplazará tu trabajo anterior.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalEntrega 
        isOpen={modalAbierto} 
        onClose={handleCerrarModal} 
        tarea={{ ...tarea, cursoTitulo }}
      />
    </div>
  );
};