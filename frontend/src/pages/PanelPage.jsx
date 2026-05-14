import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FormularioCurso } from '../components/FormularioCurso';
import { TablaCursos } from '../components/TablaCursos';
import { FormularioMatriculacion } from '../components/FormularioMatriculacion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

export const PanelPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const formularioCursoRef = useRef();

  // Estados globales
  const [seccionActiva, setSeccionActiva] = useState('matricular');

  // Estados para perfil
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [estadoFoto, setEstadoFoto] = useState({ cargando: false, mensaje: null, tipo: '' });
  const [datosPerfil, setDatosPerfil] = useState({
    biografia: '',
    telefono: '',
    fechaNacimiento: ''
  });
  const [estadoDatos, setEstadoDatos] = useState({ cargando: false, mensaje: null, tipo: '' });

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState(null);
  const [periodoEstadisticas, setPeriodoEstadisticas] = useState('semana');
  const [exportandoCsv, setExportandoCsv] = useState(false);

  const periodosDisponibles = [
    { value: 'semana', label: 'Última semana' },
    { value: 'mes', label: 'Último mes' },
    { value: 'ultimos90dias', label: 'Últimos 3 meses' },
    { value: 'todos', label: 'Todo' },
  ];

  // Cargar cursos al montar el componente
  const {
    data: cursos = [],
    isLoading: cargandoCursos,
  } = useQuery({
    queryKey: ['panelCursos'],
    queryFn: async () => {
      const response = await clienteAxios.get('/cursos');
      const datos = Array.isArray(response.data) 
        ? response.data 
        : response.data?.content 
        ? response.data.content 
        : [];
      return datos;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: perfilUsuario } = useQuery({
    queryKey: ['perfilUsuario', usuario?.id],
    queryFn: async () => {
      if (!usuario?.id) return null;
      const response = await clienteAxios.get(`/usuarios/${usuario.id}/perfil`);
      return response.data;
    },
    enabled: !!usuario?.id,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!perfilUsuario) return;
    setDatosPerfil({
      biografia: perfilUsuario.biografia || '',
      telefono: perfilUsuario.telefono || '',
      fechaNacimiento: perfilUsuario.fechaNacimiento || ''
    });
    if (perfilUsuario.fotoPerfilUrl) {
      setPreviewUrl(perfilUsuario.fotoPerfilUrl);
    }
  }, [perfilUsuario]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditarCurso = (curso) => {
    if (formularioCursoRef.current) {
      formularioCursoRef.current.handleEditarCurso(curso);
    }
  };

  // Handlers para foto de perfil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubirFoto = async () => {
    if (!fotoPerfil) return;
    setEstadoFoto({ cargando: true, mensaje: 'Subiendo a la nube...', tipo: 'info' });

    const formData = new FormData();
    formData.append('file', fotoPerfil);

    try {
      const response = await clienteAxios.post(`/usuarios/${usuario.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEstadoFoto({ cargando: false, mensaje: response.data.mensaje, tipo: 'exito' });
    } catch (error) {
      setEstadoFoto({ cargando: false, mensaje: 'Error al subir la imagen', tipo: 'error' });
    }
  };

  // Handlers para datos personales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosPerfil({
      ...datosPerfil,
      [name]: value
    });
  };

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    setEstadoDatos({ cargando: true, mensaje: null, tipo: '' });

    try {
      const response = await clienteAxios.put(`/usuarios/${usuario.id}/perfil`, datosPerfil);
      setEstadoDatos({ cargando: false, mensaje: response.data.mensaje, tipo: 'exito' });
    } catch (error) {
      setEstadoDatos({ cargando: false, mensaje: 'Error al guardar los datos', tipo: 'error' });
    }
  };

  const cargarEstadisticas = async (periodo = periodoEstadisticas) => {
    setCargandoEstadisticas(true);
    setErrorEstadisticas(null);

    try {
      const endpoint = periodo && periodo !== 'todos'
        ? `/admin/estadisticas?periodo=${periodo}`
        : '/admin/estadisticas';
      const response = await clienteAxios.get(endpoint);
      setEstadisticas(response.data);
    } catch (error) {
      setErrorEstadisticas('No se pudieron cargar las estadísticas. Revisa tu sesión o intenta de nuevo.');
      setEstadisticas(null);
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  useEffect(() => {
    if (seccionActiva === 'estadisticas') {
      cargarEstadisticas();
    }
  }, [seccionActiva]);

  const handleCambioPeriodo = async (nuevaOpcion) => {
    setPeriodoEstadisticas(nuevaOpcion);
    await cargarEstadisticas(nuevaOpcion);
  };

  const handleExportarCSV = () => {
    if (!estadisticas) return;
    setExportandoCsv(true);

    const rows = [];
    rows.push(['Periodo', periodosDisponibles.find((p) => p.value === periodoEstadisticas)?.label || 'Todo']);
    rows.push(['Total usuarios', estadisticas.totalUsuarios ?? '']);
    rows.push(['Ingresos aprobados', estadisticas.ingresosTotales != null ? formatearMoneda(estadisticas.ingresosTotales) : '']);
    rows.push([]);
    rows.push(['Curso', 'Inscripciones', 'Porcentaje']);
    (estadisticas.cursosMasInscritos || []).forEach((curso) => {
      rows.push([curso.titulo, curso.inscripciones, `${curso.porcentaje ?? ''}%`]);
    });

    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `metricas_${periodoEstadisticas}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportandoCsv(false);
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  };

  const formatearTitulo = (titulo) => {
    return titulo.length > 20 ? `${titulo.slice(0, 20)}...` : titulo;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* SIDEBAR */}
      <div className="flex h-screen">
        <aside className="w-64 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Hola {usuario?.nombre || 'Admin'}</h2>
          </div>

          <nav className="flex-1 space-y-4">
            <button
              onClick={() => setSeccionActiva('matricular')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccionActiva === 'matricular'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              💼 Matricular Usuarios
            </button>

            <button
              onClick={() => setSeccionActiva('gestionar-cursos')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccionActiva === 'gestionar-cursos'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📚 Gestionar Cursos
            </button>

            <button
              onClick={() => setSeccionActiva('perfil')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccionActiva === 'perfil'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👤 Datos del Usuario
            </button>

            <button
              onClick={() => setSeccionActiva('compras')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccionActiva === 'compras'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              💳 Historial de Compras
            </button>

            <button
              onClick={() => setSeccionActiva('estadisticas')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccionActiva === 'estadisticas'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Métricas
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            Cerrar Sesión
          </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-auto p-8">
          <div className={`max-w-4xl mx-auto ${seccionActiva === 'estadisticas' ? 'max-w-6xl' : ''}`}>
            
            {/* Matricular Usuarios */}
            {seccionActiva === 'matricular' && (
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">💼 Matricular Usuarios</h1>
                <FormularioMatriculacion cursos={cursos} cargandoCursos={cargandoCursos} />
              </div>
            )}

            {/* Gestionar Cursos */}
            {seccionActiva === 'gestionar-cursos' && (
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">📚 Gestionar Cursos</h1>
                <FormularioCurso ref={formularioCursoRef} cursos={cursos} setCursos={setCursos} />
                <TablaCursos cursos={cursos} cargandoCursos={cargandoCursos} onEditar={handleEditarCurso} />
              </div>
            )}

            {/* Datos del Usuario */}
            {seccionActiva === 'perfil' && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-800">👤 Datos del Usuario</h1>

                {/* SECCIÓN 1: FOTO DE PERFIL */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Foto de Perfil</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 flex-shrink-0 shadow-sm">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <button
                        onClick={handleSubirFoto}
                        disabled={!fotoPerfil || estadoFoto.cargando}
                        className={`px-4 py-2 rounded-lg font-bold text-white transition-colors w-fit ${
                          !fotoPerfil || estadoFoto.cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {estadoFoto.cargando ? 'Subiendo...' : 'Guardar Foto'}
                      </button>
                      {estadoFoto.mensaje && (
                        <p className={`text-sm font-medium ${estadoFoto.tipo === 'exito' ? 'text-green-600' : 'text-red-600'}`}>
                          {estadoFoto.mensaje}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: DATOS PERSONALES */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Datos Personales</h2>
                  
                  <form onSubmit={handleGuardarDatos} className="space-y-6">
                    
                    <div>
                      <label htmlFor="biografia" className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                      <textarea
                        id="biografia"
                        name="biografia"
                        rows="3"
                        value={datosPerfil.biografia}
                        onChange={handleInputChange}
                        placeholder="Contanos un poco sobre vos..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          id="telefono"
                          name="telefono"
                          value={datosPerfil.telefono}
                          onChange={handleInputChange}
                          placeholder="+54 9 11 1234-5678"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          value={datosPerfil.fechaNacimiento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={estadoDatos.cargando}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                          estadoDatos.cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {estadoDatos.cargando ? 'Guardando...' : 'Guardar Datos Personales'}
                      </button>
                      
                      {estadoDatos.mensaje && (
                        <p className={`text-sm font-medium ${estadoDatos.tipo === 'exito' ? 'text-green-600' : 'text-red-600'}`}>
                          {estadoDatos.mensaje}
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Métricas Administrativas */}
            {seccionActiva === 'estadisticas' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h1 className="text-3xl font-bold text-gray-800">📊 Métricas Administrativas</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <select
                      value={periodoEstadisticas}
                      onChange={(e) => handleCambioPeriodo(e.target.value)}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {periodosDisponibles.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleExportarCSV}
                      disabled={!estadisticas || exportandoCsv}
                      className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportandoCsv ? 'Exportando...' : 'Exportar a CSV'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Usuarios registrados</h2>
                    <p className="text-4xl font-bold text-blue-600">
                      {estadisticas ? estadisticas.totalUsuarios : '--'}
                    </p>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Ingresos aprobados</h2>
                    <p className="text-4xl font-bold text-green-600">
                      {estadisticas ? formatearMoneda(estadisticas.ingresosTotales) : '--'}
                    </p>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Cursos con más inscripciones</h2>

                  {cargandoEstadisticas ? (
                    <p className="text-gray-600">Cargando métricas...</p>
                  ) : errorEstadisticas ? (
                    <p className="text-red-600">{errorEstadisticas}</p>
                  ) : estadisticas?.cursosMasInscritos?.length ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="h-[28rem] bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4">Participación por curso</h3>
                          <ResponsiveContainer width="100%" height={340}>
                            <PieChart>
                              <Pie
                                data={estadisticas.cursosMasInscritos}
                                dataKey="inscripciones"
                                nameKey="titulo"
                                cx="50%"
                                cy="45%"
                                outerRadius={90}
                                innerRadius={55}
                                paddingAngle={4}
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                minAngle={15}
                              >
                                {estadisticas.cursosMasInscritos.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={[ '#4f46e5', '#0f766e', '#d97706', '#be123c', '#0ea5e9', '#22c55e' ][index % 6]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} inscripciones`, 'Inscripciones']} />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="h-[28rem] bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4">Top cursos inscritos</h3>
                          <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={estadisticas.cursosMasInscritos} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="titulo"
                                tick={{ fontSize: 12 }}
                                interval={0}
                                angle={-35}
                                textAnchor="end"
                                height={80}
                                tickFormatter={formatearTitulo}
                              />
                              <YAxis />
                              <Tooltip formatter={(value) => [`${value} inscripciones`, 'Inscripciones']} />
                              <Bar dataKey="inscripciones" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Aún no hay datos disponibles para mostrar.</p>
                  )}
                </div>
              </div>
            )}

            {/* Historial de Compras */}
            {seccionActiva === 'compras' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">💳 Historial de Compras</h1>
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No hay compras registradas</p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};