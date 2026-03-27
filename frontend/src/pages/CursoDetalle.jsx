import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const CursoDetallePage = () => {
  // Atrapamos el ID que viene en la URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  // estos dos estados para manejar el botón y el cartelito
  const [inscribiendo, setInscribiendo] = useState(false);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    const obtenerDetalleCurso = async () => {
      try {
        // Le pegamos al endpoint GET /api/cursos/{id} que armaste hoy en el backend
        const response = await clienteAxios.get(`/cursos/${id}`);
        setCurso(response.data);
        setCargando(false);
      } catch (err) {
        console.error("Error al traer el detalle del curso:", err);
        setError(true);
        setCargando(false);
      }
    };

    obtenerDetalleCurso();
  }, [id]); // El useEffect se vuelve a ejecutar si cambia el ID


  const handleInscripcion = async () => {
    setInscribiendo(true);
    setAlerta(null);
    
    try {
      const response = await clienteAxios.post(`/inscripciones/matricular/${id}`);
      
      // Si salió bien, mostramos mensaje verde
      setAlerta({ tipo: 'exito', texto: response.data.mensaje });
      
      // Magia de UX: Lo mandamos a "Mis Cursos" después de 2 segundos
      setTimeout(() => {
        navigate('/mis-cursos');
      }, 2000);

    } catch (error) {
      // Gracias al GlobalExceptionHandler del backend, el error llega limpio acá
      const mensajeError = error.response?.data?.mensaje || "Ocurrió un error al inscribirse";
      setAlerta({ tipo: 'error', texto: mensajeError });
    } finally {
      setInscribiendo(false);
    }
  };
  if (cargando) return <div className="text-center mt-20 text-xl font-bold text-gray-600">Cargando detalles... ⏳</div>;
  if (error || !curso) return <div className="text-center mt-20 text-xl font-bold text-red-600">No pudimos encontrar este curso ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Mitad Izquierda: Imagen */}
        <div className="md:w-1/2">
          <img 
            src={curso.imagen} 
            alt={curso.titulo} 
            className="w-full h-full object-cover min-h-[300px]"
          />
        </div>

        {/* Mitad Derecha: Información */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <div className="uppercase tracking-wide text-sm text-blue-600 font-bold mb-1">
              Desarrollo Profesional
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              {curso.titulo}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 whitespace-pre-line">
              {curso.descripcion}
            </p>
          </div>

          {/* Sección de Precio y Botones */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-500 font-medium">Inversión única</span>
              <span className="text-4xl font-black text-gray-900">
                ${curso.precio.toLocaleString('es-AR')}
              </span>
            </div>
            
            <div className="flex flex-col space-y-3">
              {/* CARTEL DE ALERTA DINÁMICO */}
              {alerta && (
                <div className={`p-4 mb-6 rounded-lg font-bold text-center transition-all ${
                  alerta.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {alerta.texto}
                </div>
              )}

              {/* BOTÓN DE INSCRIPCIÓN */}
              <button 
                onClick={handleInscripcion}
                disabled={inscribiendo}
                className={`w-full py-4 text-xl font-bold rounded-xl transition-colors text-white ${
                  inscribiendo ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {inscribiendo ? 'Procesando inscripción... ⏳' : '¡Inscribirme Ahora! 🚀'}
              </button>

              <Link to="/home" className="w-full text-center text-gray-500 font-semibold py-3 hover:bg-gray-50 rounded-xl transition-colors">
                Volver a la vidriera
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};