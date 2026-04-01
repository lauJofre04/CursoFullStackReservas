import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FormularioCurso } from '../components/FormularioCurso';
import { TablaCursos } from '../components/TablaCursos';
import { FormularioMatriculacion } from '../components/FormularioMatriculacion';

export const PanelPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const formularioCursoRef = useRef();

  // Estados globales
  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(false);
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

  // Cargar cursos al montar el componente
  useEffect(() => {
    const cargarCursos = async () => {
      setCargandoCursos(true);
      try {
        const response = await clienteAxios.get('/cursos');
        // Maneja diferentes estructuras de respuesta
        const datos = Array.isArray(response.data) 
          ? response.data 
          : response.data?.content 
          ? response.data.content 
          : [];
        setCursos(datos);
        console.log('Cursos cargados:', datos);
      } catch (error) {
        console.error('Error al cargar los cursos:', error);
        setCursos([]);
      } finally {
        setCargandoCursos(false);
      }
    };
    cargarCursos();

    // Cargar datos del perfil
    const cargarDatosDelUsuario = async () => {
      if (!usuario?.id) return;
      try {
        const response = await clienteAxios.get(`/usuarios/${usuario.id}/perfil`);
        const datos = response.data;
        setDatosPerfil({
          biografia: datos.biografia || '',
          telefono: datos.telefono || '',
          fechaNacimiento: datos.fechaNacimiento || ''
        });
        if (datos.fotoPerfilUrl) {
          setPreviewUrl(datos.fotoPerfilUrl);
        }
      } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
      }
    };
    cargarDatosDelUsuario();
  }, [usuario?.id]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="flex h-screen">
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
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
          <div className="max-w-4xl mx-auto">
            
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