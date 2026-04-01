import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { GestorModulos } from '../components/GestorModulos';

export const AulaVirtualPage = () => {
  const { cursoId } = useParams();
  const { usuario } = useAuth();
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [recursoActual, setRecursoActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarAbierta, setSidebarAbierta] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [cursoId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar datos del curso
      const cursoResponse = await clienteAxios.get(`/cursos/${cursoId}`);
      setCurso(cursoResponse.data);

      // Cargar módulos con lecciones
      const modulosResponse = await clienteAxios.get(`/modulos/curso/${cursoId}`);
      const modulosData = Array.isArray(modulosResponse.data) ? modulosResponse.data : [];
      setModulos(modulosData);

      // Seleccionar primera lección automáticamente
      if (modulosData.length > 0 && modulosData[0].lecciones && modulosData[0].lecciones.length > 0) {
        const primeraLeccion = modulosData[0].lecciones[0];
        setLeccionSeleccionada(primeraLeccion.id);
        
        // Si hay recursos, seleccionar el primero
        if (primeraLeccion.recursos && primeraLeccion.recursos.length > 0) {
          setRecursoActual(primeraLeccion.recursos[0]);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar el contenido del curso');
    } finally {
      setCargando(false);
    }
  };

  const obtenerleccionPorId = (leccionId) => {
    for (let modulo of modulos) {
      const leccion = modulo.lecciones?.find(l => l.id === leccionId);
      if (leccion) return leccion;
    }
    return null;
  };

  const handleSeleccionarLeccion = async (leccionId) => {
    try {
      setLeccionSeleccionada(leccionId);

      // Cargar la lección con sus recursos
      const leccionResponse = await clienteAxios.get(`/lecciones/${leccionId}`);
      const leccion = leccionResponse.data;

      // Seleccionar primer recurso
      if (leccion.recursos && leccion.recursos.length > 0) {
        setRecursoActual(leccion.recursos[0]);
      } else {
        setRecursoActual(null);
      }
    } catch (err) {
      console.error('Error cargando lección:', err);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-800 font-semibold">Cargando aula virtual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // Si es admin y está en modo edición, mostrar el GestorModulos
  if (usuario?.rol === 'ADMIN' && modoEdicion) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">📖 Gestionar Contenido</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setModoEdicion(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                👁️ Ver como Estudiante
              </button>
            </div>
          </div>
          <GestorModulos cursoId={parseInt(cursoId)} cursoTitulo={curso?.titulo || 'Curso'} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* BARRA LATERAL - NAVEGACIÓN DE MÓDULOS */}
      <aside
        className={`${
          sidebarAbierta ? 'w-80' : 'w-0'
        } overflow-x-hidden bg-gray-900 text-white transition-all duration-300 shadow-xl flex flex-col`}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold truncate">📚 {curso?.titulo}</h2>
          <p className="text-sm text-gray-400 mt-1">{modulos.length} módulos</p>
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
            </div>
          ))}
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

      {/* ÁREA PRINCIPAL - CONTENIDO */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4">
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
          {usuario?.rol === 'ADMIN' && (
            <button
              onClick={() => setModoEdicion(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
            >
              ⚙️ Editar Contenido
            </button>
          )}
        </div>

        <div className="p-8">
          {leccionSeleccionada ? (
            <ContenidoLeccion leccionId={leccionSeleccionada} recursoActual={recursoActual} setRecursoActual={setRecursoActual} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">👈 Selecciona una lección del menú para empezar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Componente para mostrar el contenido de la lección
const ContenidoLeccion = ({ leccionId, recursoActual, setRecursoActual }) => {
  const [leccion, setLeccion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarLeccion();
  }, [leccionId]);

  const cargarLeccion = async () => {
    try {
      setCargando(true);
      const response = await clienteAxios.get(`/lecciones/${leccionId}`);
      setLeccion(response.data);

      if (response.data.recursos && response.data.recursos.length > 0 && !recursoActual) {
        setRecursoActual(response.data.recursos[0]);
      }
    } catch (err) {
      console.error('Error cargando lección:', err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="text-center text-gray-600">Cargando lección...</div>;
  }

  if (!leccion) {
    return <div className="text-center text-gray-600">Lección no encontrada</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* ENCABEZADO DE LA LECCIÓN */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📖 {leccion.titulo}</h1>
        {leccion.duracionMinutos > 0 && (
          <p className="text-gray-600 flex items-center gap-2">
            <span>⏱️ Duración estimada: {leccion.duracionMinutos} minutos</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ÁREA PRINCIPAL - REPRODUCTOR/CONTENIDO */}
        <div className="lg:col-span-2">
          {recursoActual ? (
            <VisualizadorRecurso recurso={recursoActual} />
          ) : (
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-600 text-lg">No hay recursos para esta lección</p>
            </div>
          )}

          {/* DESCRIPCIÓN DE LA LECCIÓN */}
          {leccion.descripcion && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Descripción</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{leccion.descripcion}</p>
            </div>
          )}
        </div>

        {/* SIDEBAR DERECHO - LISTA DE RECURSOS */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <h3 className="text-white font-bold text-lg">📚 Recursos ({leccion.recursos?.length || 0})</h3>
            </div>

            {leccion.recursos && leccion.recursos.length > 0 ? (
              <div className="divide-y max-h-96 overflow-y-auto">
                {leccion.recursos.map((recurso) => (
                  <button
                    key={recurso.id}
                    onClick={() => setRecursoActual(recurso)}
                    className={`w-full text-left p-4 transition-all hover:bg-gray-100 ${
                      recursoActual?.id === recurso.id
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">
                        {recurso.tipo === 'VIDEO' && '🎥'}
                        {recurso.tipo === 'PDF' && '📄'}
                        {recurso.tipo === 'LINK' && '🔗'}
                        {recurso.tipo === 'DOCUMENTO' && '📋'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{recurso.titulo}</p>
                        <p className="text-xs text-gray-600 mt-1">{recurso.tipo}</p>
                        {recurso.descripcion && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{recurso.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600">
                <p>No hay recursos disponibles</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

// Componente para visualizar el recurso (video, PDF, etc)
const VisualizadorRecurso = ({ recurso }) => {
  const [error, setError] = useState(null);

  const extraerVideoId = (url) => {
    // Si es YouTube URL
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (youtubeMatch) {
      return youtubeMatch[1];
    }
    // Si es Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (driveMatch) {
      return driveMatch[1];
    }
    return null;
  };

  if (recurso.tipo === 'VIDEO') {
    const videoId = extraerVideoId(recurso.urlRecurso);

    if (videoId && recurso.urlRecurso.includes('youtube')) {
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={recurso.titulo}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    } else {
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
          <video
            width="100%"
            height="100%"
            controls
            src={recurso.urlRecurso}
            className="w-full h-full"
          >
            Tu navegador no soporta video
          </video>
        </div>
      );
    }
  }

  if (recurso.tipo === 'PDF') {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-500 text-white p-4 flex items-center gap-3">
          <span className="text-3xl">📄</span>
          <div>
            <p className="font-bold">{recurso.titulo}</p>
            <p className="text-sm opacity-90">PDF Document</p>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-4">
            Abre el PDF en una nueva ventana para visualizarlo
          </p>
          <a
            href={recurso.urlRecurso}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            📥 Abrir PDF
          </a>
        </div>
      </div>
    );
  }

  if (recurso.tipo === 'LINK') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <span className="text-6xl block mb-4">🔗</span>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{recurso.titulo}</h3>
        {recurso.descripcion && (
          <p className="text-gray-600 mb-6 whitespace-pre-wrap">{recurso.descripcion}</p>
        )}
        <a
          href={recurso.urlRecurso}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          🌐 Ir al Link
        </a>
        <p className="text-sm text-gray-500 mt-4">{recurso.urlRecurso}</p>
      </div>
    );
  }

  if (recurso.tipo === 'DOCUMENTO') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <span className="text-6xl block mb-4">📋</span>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{recurso.titulo}</h3>
        {recurso.descripcion && (
          <p className="text-gray-600 mb-6">{recurso.descripcion}</p>
        )}
        <a
          href={recurso.urlRecurso}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          📖 Abrir Documento
        </a>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
      <p className="text-yellow-800 font-semibold">Tipo de recurso no soportado</p>
    </div>
  );
};
