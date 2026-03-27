import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const PanelPage = () => {
  const navigate = useNavigate();

  // Estados para el formulario del nuevo curso
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState('');
  
  // Estados para darle feedback al usuario
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);



  const [emailAlumno, setEmailAlumno] = useState('');
  const [idCursoAsignar, setIdCursoAsignar] = useState('');
  const [alertaInscripcion, setAlertaInscripcion] = useState(null);
  const [procesandoAdmin, setProcesandoAdmin] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Le pegamos a tu backend para crear el curso
      await clienteAxios.post('/cursos', {
        titulo,
        descripcion,
        precio: parseFloat(precio), // Aseguramos que el precio viaje como número
        imagen
      });

      setMensaje({ texto: '¡Curso creado con éxito! Ya está visible en la vidriera.', tipo: 'exito' });
      
      // Limpiamos el formulario para cargar otro
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagen('');
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Hubo un error al crear el curso. Revisa la consola.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };
  // --- FUNCIÓN PARA MATRICULAR ---
  const handleInscripcionAdmin = async (e) => {
    e.preventDefault();
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

        {/* Formulario de Alta de Curso */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Crear Nuevo Curso</h2>

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

              {/* URL de Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Imagen</label>
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
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
              {cargando ? 'Guardando curso en la base de datos...' : 'Publicar Curso'}
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
              <label className="block text-gray-700 font-medium mb-2">ID del Curso</label>
              <input 
                type="number" 
                required
                min="1"
                value={idCursoAsignar}
                onChange={(e) => setIdCursoAsignar(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ej: 1"
              />
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
      </div>
    </div>
  );
};