import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext'; // Asegurate de que la ruta a tu AuthContext sea la correcta

export const PerfilUsuarioPage = () => {

  const {usuario} = useAuth(); // Asegurate de haber importado el hook useAuth desde tu contexto
  const usuarioId = usuario?.id;    // HARDCODEADO PARA PROBAR

  // --- ESTADOS PARA LA FOTO ---
  const [fotoPefil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [estadoFoto, setEstadoFoto] = useState({ cargando: false, mensaje: null, tipo: '' });

  // --- ESTADOS PARA LOS DATOS PERSONALES ---
  const [datosPerfil, setDatosPerfil] = useState({
    biografia: '',
    telefono: '',
    fechaNacimiento: ''
  });
  const [estadoDatos, setEstadoDatos] = useState({ cargando: false, mensaje: null, tipo: '' });

  const { data: perfilData } = useQuery({
    queryKey: ['perfilUsuario', usuarioId],
    queryFn: async () => {
      const response = await clienteAxios.get(`/usuarios/${usuarioId}/perfil`);
      return response.data;
    },
    enabled: !!usuarioId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!perfilData) return;
    setDatosPerfil({
      biografia: perfilData.biografia || '',
      telefono: perfilData.telefono || '',
      fechaNacimiento: perfilData.fechaNacimiento || ''
    });
    if (perfilData.fotoPerfilUrl) {
      setPreviewUrl(perfilData.fotoPerfilUrl);
    }
  }, [perfilData]);

  // --- HANDLERS DE LA FOTO (Los que ya tenías) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubirFoto = async () => {
    if (!fotoPefil) return;
    setEstadoFoto({ cargando: true, mensaje: 'Subiendo a la nube...', tipo: 'info' });

    const formData = new FormData();
    formData.append('file', fotoPefil);

    try {
      const response = await clienteAxios.post(`/usuarios/${usuarioId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEstadoFoto({ cargando: false, mensaje: response.data.mensaje, tipo: 'exito' });
    } catch (error) {
      setEstadoFoto({ cargando: false, mensaje: 'Error al subir la imagen', tipo: 'error' });
    }
  };

  // --- HANDLERS DE LOS DATOS PERSONALES ---
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
      const response = await clienteAxios.put(`/usuarios/${usuarioId}/perfil`, datosPerfil);
      setEstadoDatos({ cargando: false, mensaje: response.data.mensaje, tipo: 'exito' });
    } catch (error) {
      setEstadoDatos({ cargando: false, mensaje: 'Error al guardar los datos', tipo: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 bg-gray-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Mi Perfil</h1>

      {/* SECCIÓN 1: FOTO DE PERFIL */}
      <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-slate-100">Foto de Perfil</h2>
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
              className="block w-full text-sm text-gray-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-slate-800 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-slate-700 cursor-pointer"
            />
            <button
              onClick={handleSubirFoto}
              disabled={!fotoPefil || estadoFoto.cargando}
              className={`px-4 py-2 rounded-lg font-bold text-white transition-colors w-fit ${
                !fotoPefil || estadoFoto.cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
      <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-slate-100">Datos Personales</h2>
        
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
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Teléfono</label>
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
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha de Nacimiento</label>
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
  );
};