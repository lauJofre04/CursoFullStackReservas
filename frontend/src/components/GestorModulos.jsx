import { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';
import axios from 'axios';
import { ModalCrearTarea } from './ModalCrearTarea'; // 👈 1. IMPORTANTE: Ajustá la ruta si es necesario

export const GestorModulos = ({ cursoId, cursoTitulo }) => {
  // Estados
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [entregasSeleccionadas, setEntregasSeleccionadas] = useState(null); // Para mostrar las entregas de un módulo específico
  
  // Estados para crear/editar módulo
  const [mostrandoFormularioModulo, setMostrandoFormularioModulo] = useState(false);
  const [nuevoModulo, setNuevoModulo] = useState({
    titulo: '',
    descripcion: '',
    orden: 1
  });

  // Estados para gestionar lecciones y TAREAS
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  
  // 👈 2. NUEVOS ESTADOS PARA EL MODAL DE TAREAS
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [moduloIdParaTarea, setModuloIdParaTarea] = useState(null);

  // Cargar módulos
  useEffect(() => {
    cargarModulos();
  }, [cursoId]);

  const cargarModulos = async () => {
    try {
      setCargando(true);
      const response = await clienteAxios.get(`/modulos/curso/${cursoId}`);
      setModulos(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error cargando módulos:', err);
      setError('Error al cargar los módulos');
      setModulos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearModulo = async (e) => {
    e.preventDefault();
    if (!nuevoModulo.titulo.trim()) {
      setError('El título del módulo es obligatorio');
      return;
    }
    try {
      const response = await clienteAxios.post(`/modulos/curso/${cursoId}`, nuevoModulo);
      setModulos([...modulos, response.data.modulo]);
      setNuevoModulo({ titulo: '', descripcion: '', orden: 1 });
      setMostrandoFormularioModulo(false);
      setError(null);
    } catch (err) {
      console.error('Error creando módulo:', err);
      setError('Error al crear el módulo');
    }
  };

  const handleEliminarModulo = async (moduloId) => {
    if (window.confirm('¿Estás seguro de eliminar este módulo?')) {
      try {
        await clienteAxios.delete(`/modulos/${moduloId}/curso/${cursoId}`);
        setModulos(modulos.filter(m => m.id !== moduloId));
        setError(null);
      } catch (err) {
        console.error('Error eliminando módulo:', err);
        setError('Error al eliminar el módulo');
      }
    }
  };

  // 👈 3. FUNCIÓN PARA ABRIR EL MODAL DE TAREA
  const handleAbrirModalTarea = (moduloId) => {
    setModuloIdParaTarea(moduloId);
    setModalTareaAbierto(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        📚 Gestor de Contenido: {cursoTitulo}
      </h2>
      <p className="text-gray-600 mb-6">Organiza el temario de tu curso en módulos y lecciones</p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!mostrandoFormularioModulo && (
        <button
          onClick={() => setMostrandoFormularioModulo(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          ➕ Agregar Nuevo Módulo
        </button>
      )}

      {mostrandoFormularioModulo && (
        <form onSubmit={handleCrearModulo} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Nuevo Módulo</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Título</label>
            <input
              type="text"
              placeholder="Ej: Introducción, Fundamentos, Proyecto Final"
              value={nuevoModulo.titulo}
              onChange={(e) => setNuevoModulo({...nuevoModulo, titulo: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Descripción (Opcional)</label>
            <textarea
              placeholder="Describe qué se aprenderá en este módulo"
              value={nuevoModulo.descripcion}
              onChange={(e) => setNuevoModulo({...nuevoModulo, descripcion: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Orden</label>
            <input
              type="number"
              min="1"
              value={nuevoModulo.orden}
              onChange={(e) => setNuevoModulo({...nuevoModulo, orden: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
              ✅ Guardar Módulo
            </button>
            <button type="button" onClick={() => setMostrandoFormularioModulo(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
              ❌ Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className="text-center text-gray-500">Cargando módulos...</p>
      ) : modulos.length > 0 ? (
        <div className="space-y-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="border-l-4 border-blue-500 pl-4 py-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Módulo {modulo.orden}: {modulo.titulo}</h3>
                  {modulo.descripcion && (
                    <p className="text-gray-600 text-sm mt-1">{modulo.descripcion}</p>
                  )}
                </div>
                <button onClick={() => handleEliminarModulo(modulo.id)} className="text-red-600 hover:text-red-800 font-bold">
                  🗑️
                </button>
              </div>

              {/* 👈 4. AGRUPAMOS LOS BOTONES DE ACCIÓN DE CADA MÓDULO */}
              <div className="flex gap-4 mb-2">
                <button
                  onClick={() => setModuloSeleccionado(modulo.id === moduloSeleccionado ? null : modulo.id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  {moduloSeleccionado === modulo.id ? '▼' : '▶'} Gestionar Lecciones
                </button>

                <button
                  onClick={() => {
                    setEntregasSeleccionadas(modulo.id === entregasSeleccionadas ? null : modulo.id);
                    setModuloSeleccionado(null); // Cerramos el otro si abrimos este
                  }}
                  className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                >
                  {entregasSeleccionadas === modulo.id ? '▼' : '▶'} Gestionar Entregas
                </button>
              </div>

              {moduloSeleccionado === modulo.id && (
                <GestorLecciones moduloId={modulo.id} moduloTitulo={modulo.titulo} />
              )}
              {entregasSeleccionadas === modulo.id && (
                <GestorEntregas moduloId={modulo.id} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          No hay módulos. ¡Crea uno para empezar!
        </p>
      )}

      {/* 👈 5. EL MODAL SE RENDERIZA ACÁ ABAJO */}
      <ModalCrearTarea 
        isOpen={modalTareaAbierto}
        onClose={() => {
          setModalTareaAbierto(false);
          setModuloIdParaTarea(null);
        }}
        moduloId={moduloIdParaTarea}
        onTareaCreada={() => {
          console.log('Tarea creada con éxito para el módulo:', moduloIdParaTarea);
          // Opcional: Podrías hacer un toast o recargar algo si mostrás las tareas acá mismo en el futuro
        }}
      />

    </div>
  );
};

const BuzonCorrecciones = ({ tarea, buzon, cargando, onCampoCambio, onGuardarCorreccion, onCerrar }) => {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h4 className="text-xl font-bold text-purple-800">📬 Buzón de Correcciones</h4>
          <p className="text-sm text-gray-500">Alumnos inscriptos al curso de la tarea <span className="font-semibold">{tarea.titulo}</span>.</p>
        </div>
        <button
          onClick={onCerrar}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold"
        >
          Cerrar buzón
        </button>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando buzón...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2">Alumno</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Archivo / Entrega</th>
                <th className="px-3 py-2">Nota</th>
                <th className="px-3 py-2">Feedback</th>
                <th className="px-3 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {buzon.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-gray-500 text-center">No hay alumnos inscritos en este curso.</td>
                </tr>
              ) : buzon.map((alumno) => (
                <tr key={alumno.alumnoId} className="border-t border-gray-200">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-800">{alumno.nombreAlumno}</p>
                    <p className="text-gray-500 text-xs">{alumno.emailAlumno}</p>
                  </td>
                  <td className="px-3 py-3">
                    {alumno.entregado ? (
                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">Entregado</span>
                    ) : (
                      <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold">Pendiente</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {alumno.entregado ? (
                      <a
                        href={alumno.archivoAlumnoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      <span className="text-gray-500 text-xs">Sin entrega</span>
                    )}
                  </td>
                  <td className="px-3 py-3 w-28">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={alumno.notaInput}
                      disabled={!alumno.entregado}
                      onChange={(e) => onCampoCambio(alumno.alumnoId, 'notaInput', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs" 
                    />
                  </td>
                  <td className="px-3 py-3 w-60">
                    <textarea
                      value={alumno.feedbackInput}
                      disabled={!alumno.entregado}
                      onChange={(e) => onCampoCambio(alumno.alumnoId, 'feedbackInput', e.target.value)}
                      rows="2"
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onGuardarCorreccion(alumno)}
                      disabled={!alumno.entregado}
                      className="px-3 py-1 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}    </div>
  );
};

// Componente para gestionar lecciones de un módulo
const GestorLecciones = ({ moduloId, moduloTitulo }) => {
  const [lecciones, setLecciones] = useState([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [leccionEditar, setLeccionEditar] = useState(null);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [nuevaLeccion, setNuevaLeccion] = useState({
    titulo: '',
    descripcion: '',
    duracionMinutos: 0,
    orden: 1
  });

  useEffect(() => {
    cargarLecciones();
  }, [moduloId]);

  const cargarLecciones = async () => {
    try {
      const response = await clienteAxios.get(`/lecciones/modulo/${moduloId}`);
      setLecciones(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error cargando lecciones:', err);
    }
  };

  const handleCrearLeccion = async (e) => {
    e.preventDefault();
    
    if (!nuevaLeccion.titulo.trim()) {
      alert('El título de la lección es obligatorio');
      return;
    }

    try {
      const response = await clienteAxios.post(`/lecciones/modulo/${moduloId}`, nuevaLeccion);
      setLecciones([...lecciones, response.data.leccion]);
      setNuevaLeccion({ titulo: '', descripcion: '', duracionMinutos: 0, orden: 1 });
      setMostrandoFormulario(false);
    } catch (err) {
      console.error('Error creando lección:', err);
      alert('Error al crear la lección');
    }
  };

  const handleEliminarLeccion = async (leccionId) => {
    if (window.confirm('¿Estás seguro de eliminar esta lección?')) {
      try {
        await clienteAxios.delete(`/lecciones/${leccionId}/modulo/${moduloId}`);
        setLecciones(lecciones.filter(l => l.id !== leccionId));
      } catch (err) {
        console.error('Error eliminando lección:', err);
        alert('Error al eliminar la lección');
      }
    }
  };

  return (
    <div className="mt-3 pl-4 py-3 bg-white rounded-lg border border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-2">📖 Lecciones en: {moduloTitulo}</h4>

      {!mostrandoFormulario && (
        <button
          onClick={() => setMostrandoFormulario(true)}
          className="mb-3 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          ➕ Nueva Lección
        </button>
      )}

      {mostrandoFormulario && (
        <form onSubmit={handleCrearLeccion} className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <input
            type="text"
            placeholder="Título de la lección"
            value={nuevaLeccion.titulo}
            onChange={(e) => setNuevaLeccion({...nuevaLeccion, titulo: e.target.value})}
            className="w-full px-3 py-1 mb-2 border rounded text-sm"
          />
          <textarea
            placeholder="Descripción"
            value={nuevaLeccion.descripcion}
            onChange={(e) => setNuevaLeccion({...nuevaLeccion, descripcion: e.target.value})}
            rows="2"
            className="w-full px-3 py-1 mb-2 border rounded text-sm"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Duración (min)"
              min="0"
              value={nuevaLeccion.duracionMinutos}
              onChange={(e) => setNuevaLeccion({...nuevaLeccion, duracionMinutos: parseInt(e.target.value)})}
              className="flex-1 px-3 py-1 border rounded text-sm"
            />
            <input
              type="number"
              placeholder="Orden"
              min="1"
              value={nuevaLeccion.orden}
              onChange={(e) => setNuevaLeccion({...nuevaLeccion, orden: parseInt(e.target.value)})}
              className="flex-1 px-3 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setMostrandoFormulario(false)}
              className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {lecciones.map((leccion) => (
          <div key={leccion.id} className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  Lección {leccion.orden}: {leccion.titulo}
                </p>
                {leccion.descripcion && (
                  <p className="text-gray-600 text-xs mt-1">{leccion.descripcion}</p>
                )}
                {leccion.duracionMinutos > 0 && (
                  <p className="text-gray-500 text-xs mt-1">⏱️ {leccion.duracionMinutos} minutos</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLeccionSeleccionada(leccion.id === leccionSeleccionada ? null : leccion.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                >
                  {leccionSeleccionada === leccion.id ? '▼' : '▶'} Recursos
                </button>
                <button
                  onClick={() => handleEliminarLeccion(leccion.id)}
                  className="text-red-600 hover:text-red-800 font-bold text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>

            {leccionSeleccionada === leccion.id && (
              <GestorRecursos leccionId={leccion.id} leccionTitulo={leccion.titulo} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para gestionar recursos de una lección (Actualizado con Cloudinary)
const GestorRecursos = ({ leccionId, leccionTitulo }) => {
  const [recursos, setRecursos] = useState([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  
  // Estados para el formulario
  const [nuevoRecurso, setNuevoRecurso] = useState({
    titulo: '',
    tipo: 'VIDEO',
    urlRecurso: '', // Se usa solo si es tipo LINK
    descripcion: '',
    orden: 1
  });

  // NUEVOS ESTADOS PARA CLOUDINARY
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    cargarRecursos();
  }, [leccionId]);

  const cargarRecursos = async () => {
    try {
      const response = await clienteAxios.get(`/recursos/leccion/${leccionId}`);
      setRecursos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error cargando recursos:', err);
    }
  };

  const handleCrearRecurso = async (e) => {
    e.preventDefault();

    if (!nuevoRecurso.titulo.trim()) {
      alert('El título del recurso es obligatorio');
      return;
    }

    try {
      setSubiendo(true);
      let urlFinal = nuevoRecurso.urlRecurso;

      // 🚀 LÓGICA SERVERLESS: Si no es un Link, subimos el archivo a Cloudinary
      if (nuevoRecurso.tipo !== 'LINK') {
        if (!archivo) {
          alert('Por favor seleccioná un archivo para subir');
          setSubiendo(false);
          return;
        }

        console.log("1. Pidiendo firma al backend...");
        const { data: firmaData } = await clienteAxios.get('/cloudinary/firma');

        console.log("2. Subiendo archivo a Cloudinary...");
        const formData = new FormData();
        formData.append('file', archivo);
        formData.append('api_key', firmaData.api_key);
        formData.append('timestamp', firmaData.timestamp);
        formData.append('signature', firmaData.signature);
        formData.append('folder', firmaData.folder);

        // Usamos la ruta "auto" para que Cloudinary acepte tanto Videos como PDFs
        const resCloudinary = await axios.post(
          `https://api.cloudinary.com/v1_1/${firmaData.cloud_name}/auto/upload`,
          formData,
          {
            onUploadProgress: (p) => {
              const porcentaje = Math.round((p.loaded * 100) / p.total);
              setProgreso(porcentaje);
            }
          }
        );

        // Obtenemos la URL segura de Cloudinary
        urlFinal = resCloudinary.data.secure_url;
        console.log("3. Archivo subido con éxito:", urlFinal);
      } else if (!urlFinal.trim()) {
        alert('La URL del enlace es obligatoria');
        setSubiendo(false);
        return;
      }

      // 4. Guardamos en NUESTRO backend
      const payload = { ...nuevoRecurso, urlRecurso: urlFinal };
      const response = await clienteAxios.post(`/recursos/leccion/${leccionId}`, payload);
      
      setRecursos([...recursos, response.data.recurso]);
      
      // Limpiamos los estados
      setNuevoRecurso({ titulo: '', tipo: 'VIDEO', urlRecurso: '', descripcion: '', orden: 1 });
      setArchivo(null);
      setMostrandoFormulario(false);
      setProgreso(0);

    } catch (err) {
      console.error('Error creando recurso:', err);
      alert('Error al crear el recurso');
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarRecurso = async (recursoId) => {
    if (window.confirm('¿Estás seguro de eliminar este recurso?')) {
      try {
        await clienteAxios.delete(`/recursos/${recursoId}/leccion/${leccionId}`);
        setRecursos(recursos.filter(r => r.id !== recursoId));
      } catch (err) {
        console.error('Error eliminando recurso:', err);
        alert('Error al eliminar el recurso');
      }
    }
  };

  return (
    <div className="mt-2 pl-4 py-2 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs font-semibold text-gray-700 mb-2">📄 Recursos de: {leccionTitulo}</p>

      {!mostrandoFormulario && (
        <button
          onClick={() => setMostrandoFormulario(true)}
          className="mb-2 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
        >
          ➕ Agregar Recurso
        </button>
      )}

      {mostrandoFormulario && (
        <form onSubmit={handleCrearRecurso} className="mb-2 p-3 bg-white rounded border border-purple-200 text-sm shadow-sm">
          <input
            type="text"
            placeholder="Título del recurso (Ej: Video Clase 1)"
            value={nuevoRecurso.titulo}
            onChange={(e) => setNuevoRecurso({...nuevoRecurso, titulo: e.target.value})}
            className="w-full px-2 py-2 mb-2 border rounded text-xs focus:outline-none focus:border-purple-500"
            disabled={subiendo}
          />

          <select
            value={nuevoRecurso.tipo}
            onChange={(e) => {
              setNuevoRecurso({...nuevoRecurso, tipo: e.target.value, urlRecurso: ''});
              setArchivo(null);
            }}
            className="w-full px-2 py-2 mb-2 border rounded text-xs bg-gray-50 focus:outline-none"
            disabled={subiendo}
          >
            <option value="VIDEO">🎥 Subir Video</option>
            <option value="PDF">📄 Subir PDF</option>
            <option value="DOCUMENTO">📋 Subir Archivo (Word/Excel)</option>
            <option value="LINK">🔗 Pegar Link Externo</option>
          </select>

          {/* RENDER CONDICIONAL: Archivo físico vs Link de texto */}
          {nuevoRecurso.tipo === 'LINK' ? (
            <input
              type="url"
              placeholder="https://ejemplo.com"
              value={nuevoRecurso.urlRecurso}
              onChange={(e) => setNuevoRecurso({...nuevoRecurso, urlRecurso: e.target.value})}
              className="w-full px-2 py-2 mb-2 border rounded text-xs focus:outline-none focus:border-purple-500"
              disabled={subiendo}
            />
          ) : (
            <div className="mb-2">
              <input
                type="file"
                accept={nuevoRecurso.tipo === 'VIDEO' ? 'video/*' : nuevoRecurso.tipo === 'PDF' ? '.pdf' : '*/*'}
                onChange={(e) => setArchivo(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                disabled={subiendo}
              />
            </div>
          )}

          <textarea
            placeholder="Descripción corta (opcional)"
            value={nuevoRecurso.descripcion}
            onChange={(e) => setNuevoRecurso({...nuevoRecurso, descripcion: e.target.value})}
            rows="2"
            className="w-full px-2 py-2 mb-2 border rounded text-xs focus:outline-none focus:border-purple-500"
            disabled={subiendo}
          />

          {/* BARRITA DE PROGRESO */}
          {subiendo && nuevoRecurso.tipo !== 'LINK' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progreso}%` }}
              ></div>
              <p className="text-[10px] text-gray-500 text-right mt-1">Subiendo... {progreso}%</p>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button 
              type="submit" 
              disabled={subiendo}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {subiendo ? 'Procesando...' : 'Guardar Recurso'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrandoFormulario(false);
                setArchivo(null);
              }}
              disabled={subiendo}
              className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs font-bold hover:bg-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* RENDERIZADO DE LA LISTA DE RECURSOS (Queda exactamente igual) */}
      <div className="space-y-1">
        {recursos.map((recurso) => (
          <div key={recurso.id} className="p-2 bg-white rounded text-xs flex justify-between items-center shadow-sm">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {recurso.tipo === 'VIDEO' && '🎥 '}
                {recurso.tipo === 'PDF' && '📄 '}
                {recurso.tipo === 'LINK' && '🔗 '}
                {recurso.tipo === 'DOCUMENTO' && '📋 '}
                {recurso.titulo}
              </p>
              <a 
                href={recurso.urlRecurso} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
              >
                Ver material →
              </a>
            </div>
            <button
              onClick={() => handleEliminarRecurso(recurso.id)}
              className="text-red-500 hover:text-red-700 font-bold ml-4 p-1"
              title="Eliminar recurso"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- NUEVO COMPONENTE: GESTOR DE ENTREGAS ---
const GestorEntregas = ({ moduloId, moduloTitulo }) => {
  const [tareas, setTareas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaBuzon, setTareaBuzon] = useState(null);
  const [buzon, setBuzon] = useState([]);
  const [cargandoBuzon, setCargandoBuzon] = useState(false);

  useEffect(() => {
    cargarTareas();
  }, [moduloId]);

  const cargarTareas = async () => {
    try {
      const response = await clienteAxios.get(`/tareas/modulo/${moduloId}`);
      setTareas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error cargando tareas:', err);
    }
  };

  const handleEliminarTarea = async (tareaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta entrega?')) {
      try {
        await clienteAxios.delete(`/tareas/${tareaId}`);
        setTareas(tareas.filter(t => t.id !== tareaId));
      } catch (err) {
        console.error('Error eliminando tarea:', err);
        alert('Error al eliminar la entrega');
      }
    }
  };

  const cargarBuzon = async (tareaId) => {
    try {
      setCargandoBuzon(true);
      const response = await clienteAxios.get(`/tareas/${tareaId}/buzon`);
      setBuzon(response.data.map(item => ({
        ...item,
        notaInput: item.nota ?? '',
        feedbackInput: item.feedbackDocente ?? ''
      })));
    } catch (err) {
      console.error('Error cargando buzón de correcciones:', err);
      setBuzon([]);
    } finally {
      setCargandoBuzon(false);
    }
  };

  const abrirBuzon = async (tarea) => {
    setTareaBuzon(tarea);
    await cargarBuzon(tarea.id);
  };

  const cerrarBuzon = () => {
    setTareaBuzon(null);
    setBuzon([]);
  };

  const actualizarCampoBuzon = (alumnoId, campo, valor) => {
    setBuzon((prev) => prev.map((item) => (
      item.alumnoId === alumnoId ? { ...item, [campo]: valor } : item
    )));
  };

  const guardarCorreccion = async (alumno) => {
    if (!alumno.entregaId) {
      return;
    }

    try {
      await clienteAxios.put(`/tareas/entregas/${alumno.entregaId}/corregir`, {
        nota: alumno.notaInput === '' ? null : Number(alumno.notaInput),
        feedbackDocente: alumno.feedbackInput
      });

      setBuzon((prev) => prev.map((item) => (
        item.alumnoId === alumno.alumnoId ? {
          ...item,
          nota: alumno.notaInput === '' ? null : Number(alumno.notaInput),
          feedbackDocente: alumno.feedbackInput
        } : item
      )));
      alert('Corrección guardada correctamente');
    } catch (err) {
      console.error('Error guardando corrección:', err);
      alert('Error al guardar la corrección');
    }
  };

  return (
    <div className="mt-3 pl-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
      <h4 className="font-semibold text-purple-800 mb-2">📝 Entregas en: {moduloTitulo}</h4>

      <button
        onClick={() => setModalAbierto(true)}
        className="mb-3 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 font-semibold"
      >
        ➕ Nueva Entrega
      </button>

      <div className="space-y-2">
        {tareas.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay entregas configuradas en este módulo.</p>
        ) : (
          tareas.map((tarea) => (
            <div key={tarea.id} className="p-2 bg-white rounded border border-purple-100 text-sm flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-gray-800">{tarea.titulo}</p>
                <p className="text-gray-500 text-xs">Vence: {new Date(tarea.fechaLimite).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirBuzon(tarea)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold"
                  title="Ver buzón de correcciones"
                >
                  📬 Buzón
                </button>
                <button
                  onClick={() => handleEliminarTarea(tarea.id)}
                  className="text-red-600 hover:text-red-800 font-bold p-1"
                  title="Eliminar entrega"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {tareaBuzon && (
        <BuzonCorrecciones
          tarea={tareaBuzon}
          buzon={buzon}
          cargando={cargandoBuzon}
          onCampoCambio={actualizarCampoBuzon}
          onGuardarCorreccion={guardarCorreccion}
          onCerrar={cerrarBuzon}
        />
      )}

      {/* Insertamos el Modal acá mismo para que sea auto-contenido */}
      <ModalCrearTarea 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        moduloId={moduloId}
        onTareaCreada={() => {
          cargarTareas(); // Recargamos la lista automáticamente
        }}
      />
    </div>
  );
};
