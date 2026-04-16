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

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

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

    const obtenerPublicKey = async () => {
      try {
        const response = await clienteAxios.get('/pagos/public-key');
        setPublicKey(response.data.publicKey);
      } catch (err) {
        console.error("Error al obtener clave pública:", err);
      }
    };

    obtenerDetalleCurso();
    obtenerPublicKey();
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

  // 🚀 Función para abrir Checkout Pro de Mercado Pago
  const handleComprarCurso = async () => {
    setProcesandoPago(true);
    setErrorPago(null);

    try {
      if (!publicKey) {
        throw new Error("Clave pública de Mercado Pago no disponible");
      }

      console.log("📝 Iniciando proceso de pago para curso:", curso.id);
      
      // 1. Crear preferencia en el backend
      const response = await clienteAxios.post('/pagos/crear-preferencia', {
        cursoId: curso.id
      });

      console.log("✅ Preferencia creada:", response.data);

      // 2. Extraer la ID de la preferencia
      const preferenceId = response.data.id;

      if (!preferenceId) {
        throw new Error("No se recibió ID de preferencia");
      }

      // 3. Inicializar Mercado Pago y abrir Checkout Pro
      const mp = new window.MercadoPago(publicKey, {
        locale: 'es-AR'
      });

      mp.checkout({
        preference: {
          id: preferenceId
        },
        autoOpen: true  // Abre automáticamente el checkout
      });

    } catch (error) {
      console.error("❌ Error al iniciar el pago:", error);
      setErrorPago(error.response?.data?.message || error.message || "Hubo un problema al conectar con Mercado Pago. Intenta nuevamente.");
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Mitad Izquierda: Imagen */}
        <div className="md:w-1/2">
          <img 
            src={curso.imagen?.replace('http://', 'https://')} 
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
          <div className="mt-8 border-t pt-6 flex flex-col items-center">
            <p className="text-3xl font-bold text-gray-800 mb-4">
              ${curso?.precio?.toLocaleString('es-AR')} ARS
            </p>

            {/* Mostrar mensaje de error si falla el pago */}
            {errorPago && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                {errorPago}
              </div>
            )}

            {/* Mostrar alerta de inscripción */}
            {alerta && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
                alerta.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {alerta.texto}
              </div>
            )}

            {/* 🔘 El Botón de Compra */}
            <button
              onClick={handleComprarCurso}
              disabled={procesandoPago}
              className={`w-full md:w-1/2 text-white font-bold py-4 rounded-xl transition-all shadow-md text-lg flex justify-center items-center ${
                procesandoPago 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
              }`}
            >
              {procesandoPago ? (
                <>
                  {/* Un pequeño spinner girando */}
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando seguro...
                </>
              ) : (
                '💳 Inscribirme Ahora'
              )}
            </button>
            
            <p className="mt-3 text-xs text-gray-500">
              Pago 100% seguro procesado por Mercado Pago.
            </p>

            <Link to="/home" className="mt-6 text-center text-gray-500 font-semibold py-3 hover:bg-gray-50 rounded-xl transition-colors w-full">
              Volver a la vidriera
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
