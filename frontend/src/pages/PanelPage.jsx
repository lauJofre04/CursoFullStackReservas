import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const PanelPage = () => {
  const navigate = useNavigate();

  
  // Estados para el formulario del nuevo curso
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenCurso, setImagenCurso] = useState(null);
  const [previewImagenCurso, setPreviewImagenCurso] = useState(null);
  
  // Estados para darle feedback al usuario
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  // Estados para matriculación manual
  const [emailAlumno, setEmailAlumno] = useState('');
  const [idCursoAsignar, setIdCursoAsignar] = useState('');
  const [alertaInscripcion, setAlertaInscripcion] = useState(null);
  const [procesandoAdmin, setProcesandoAdmin] = useState(false);
  
  // Estados para cargar los cursos
  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  
  // Estados para edición de cursos
  const [cursoEnEdicion, setCursoEnEdicion] = useState(null);
  const [idCursoEditando, setIdCursoEditando] = useState(null);

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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

  // --- FUNCIÓN PARA MATRICULAR ---
  const handleInscripcionAdmin = async (e) => {
    e.preventDefault();
    
    if (!idCursoAsignar) {
      setAlertaInscripcion({ tipo: 'error', texto: 'Por favor selecciona un curso' });
      return;
    }
    
    setProcesandoAdmin(true);
    setAlertaInscripcion(null);

    try {
      const response = await clienteAxios.post('/inscripciones/admin/matricular', {
        emailUsuario: emailAlumno,
        cursoId: parseInt(idCursoAsignar), // Aseguramos que sea un número
        metodoAcceso: 'MANUAL_ADMIN'
      });
      
      setAlertaInscripcion({ tipo: 'exito', texto: response.data.mensaje || "¡Alumno matriculado correctamente!" });
      setEmailAlumno(''); // Limpiamos el form
      setIdCursoAsignar('');
    } catch (error) {
      const msj = error.response?.data?.mensaje || "Error al matricular al alumno";
      setAlertaInscripcion({ tipo: 'error', texto: msj });
    } finally {
      setProcesandoAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado del Panel */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Formulario de Alta/Edición de Curso */}
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
            <div className={`p-4 rounded-lg mb-6 text-sm font-semibold text-center ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
        {/* --- TARJETA DE INSCRIPCIÓN MANUAL (ADMIN) --- */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎓 Matricular Alumno (Manual)</h2>
          
          {alertaInscripcion && (
            <div className={`p-4 mb-6 rounded-lg font-bold text-center ${
              alertaInscripcion.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {alertaInscripcion.texto}
            </div>
          )}

          <form onSubmit={handleInscripcionAdmin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email del Alumno</label>
              <input 
                type="email" 
                required
                value={emailAlumno}
                onChange={(e) => setEmailAlumno(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label htmlFor="cursoSelect" className="block text-gray-700 font-medium mb-2">Curso</label>
              <select 
                id="cursoSelect"
                value={idCursoAsignar}
                onChange={(e) => setIdCursoAsignar(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
                disabled={cargandoCursos}
              >
                <option value="">
                  {cargandoCursos ? 'Cargando cursos...' : 'Selecciona un curso'}
                </option>
                {Array.isArray(cursos) && cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.titulo}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              disabled={procesandoAdmin}
              className={`w-full py-3 mt-4 rounded-lg font-bold text-white transition-colors ${
                procesandoAdmin ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {procesandoAdmin ? 'Procesando...' : 'Asignar Curso al Alumno'}
            </button>
          </form>
        </div>

        {/* --- SECCIÓN DE LISTADO DE CURSOS --- */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Gestionar Cursos</h2>
          
          {cargandoCursos ? (
            <p className="text-center text-gray-600">Cargando cursos...</p>
          ) : cursos && cursos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Título</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Descripción</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Precio</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((curso) => (
                    <tr key={curso.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-700 font-semibold">{curso.titulo}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{curso.descripcion}</td>
                      <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                        ${curso.precio.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleEditarCurso(curso)}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-colors"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No hay cursos disponibles aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};