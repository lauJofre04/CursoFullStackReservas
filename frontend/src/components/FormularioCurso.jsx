import { useState, useEffect, forwardRef } from 'react';
import clienteAxios from '../api/axiosConfig';

export const FormularioCurso = forwardRef(({ cursos, setCursos }, ref) => {
  // Estados para el formulario del nuevo curso
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenCurso, setImagenCurso] = useState(null);
  const [previewImagenCurso, setPreviewImagenCurso] = useState(null);
  
  // Estados para darle feedback al usuario
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  
  // Estados para edición de cursos
  const [cursoEnEdicion, setCursoEnEdicion] = useState(null);
  const [idCursoEditando, setIdCursoEditando] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Detectamos si estamos en modo edición o creación
      if (idCursoEditando) {
        // MODO EDICIÓN: Solo actualizamos con los campos que cambiaron
        const datosActualizados = {};
        
        if (titulo !== cursoEnEdicion.titulo) datosActualizados.titulo = titulo;
        if (descripcion !== cursoEnEdicion.descripcion) datosActualizados.descripcion = descripcion;
        if (precio !== cursoEnEdicion.precio.toString()) datosActualizados.precio = parseFloat(precio);
        // La imagen solo se actualiza si el usuario selecciona una nueva
        if (imagenCurso) datosActualizados.imagen = imagenCurso;

        // Si hay cambios, hacemos el PUT
        if (Object.keys(datosActualizados).length > 0 || imagenCurso) {
          let response;
          
          if (imagenCurso) {
            // Si hay imagen nueva, usamos FormData
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('precio', parseFloat(precio));
            formData.append('file', imagenCurso);

            response = await clienteAxios.put(`/cursos/${idCursoEditando}/imagen`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            // Sin imagen nueva, enviamos JSON
            response = await clienteAxios.put(`/cursos/${idCursoEditando}`, {
              titulo,
              descripcion,
              precio: parseFloat(precio),
              imagen: cursoEnEdicion.imagen
            });
          }

          // Actualizar el listado de cursos
          setCursos(cursos.map(c => c.id === idCursoEditando ? response.data : c));
          setMensaje({ texto: '¡Curso actualizado correctamente!', tipo: 'exito' });
        } else {
          setMensaje({ texto: 'No hay cambios para guardar', tipo: 'info' });
        }

        // Limpiar modo edición
        setCursoEnEdicion(null);
        setIdCursoEditando(null);
      } else {
        // MODO CREACIÓN: Crear nuevo curso
        if (!imagenCurso) {
          setMensaje({ texto: 'Por favor selecciona una imagen para el curso', tipo: 'error' });
          setCargando(false);
          return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('precio', parseFloat(precio));
        formData.append('file', imagenCurso);

        const response = await clienteAxios.post('/cursos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Agregar el nuevo curso al listado
        setCursos([...cursos, response.data]);
        setMensaje({ texto: '¡Curso creado con éxito! Ya está visible en la vidriera.', tipo: 'exito' });
      }
      
      // Limpiamos el formulario
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagenCurso(null);
      setPreviewImagenCurso(null);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Hubo un error al guardar el curso. Revisa la consola.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const handleEditarCurso = (curso) => {
    // Llenamos el formulario con los datos del curso
    setTitulo(curso.titulo);
    setDescripcion(curso.descripcion);
    setPrecio(curso.precio.toString());
    setPreviewImagenCurso(curso.imagen);
    setImagenCurso(null); // No hay archivo seleccionado aún
    
    // Guardamos el curso original y el ID para la edición
    setCursoEnEdicion(curso);
    setIdCursoEditando(curso.id);
    
    // Hacemos scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    // Limpiamos el formulario y el estado de edición
    setTitulo('');
    setDescripcion('');
    setPrecio('');
    setImagenCurso(null);
    setPreviewImagenCurso(null);
    setCursoEnEdicion(null);
    setIdCursoEditando(null);
    setMensaje({ texto: '', tipo: '' });
  };

  // Exponer métodos al componente padre mediante ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        handleEditarCurso
      };
    }
  }, [cursos, ref]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {idCursoEditando ? '✏️ Editar Curso' : '📝 Crear Nuevo Curso'}
        </h2>
        {idCursoEditando && (
          <button
            type="button"
            onClick={handleCancelarEdicion}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      {/* Cartel de feedback (Éxito o Error) */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-semibold text-center ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Título del Curso</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Curso de Spring Boot Avanzado"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio (ARS)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: 35000"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Imagen del Curso */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Curso</label>
            <div className="flex gap-4">
              {/* Preview de la imagen */}
              {previewImagenCurso && (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img 
                    src={previewImagenCurso} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-lg border-2 border-blue-500"
                  />
                </div>
              )}
              {/* Input file */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImagenCurso(file);
                    setPreviewImagenCurso(URL.createObjectURL(file));
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required={!previewImagenCurso && !idCursoEditando}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Detallada</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Escribe el temario y los objetivos del curso..."
              required
            ></textarea>
          </div>

        </div>

        <button
          type="submit"
          disabled={cargando}
          className={`w-full text-white font-bold py-4 rounded-xl transition-colors shadow-md text-lg ${cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {cargando ? 'Guardando...' : idCursoEditando ? '💾 Actualizar Curso' : '📤 Publicar Curso'}
        </button>
      </form>
    </div>
  );
});
