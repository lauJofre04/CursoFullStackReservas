import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const RendirEvaluacion = () => {
  const { evaluacionId } = useParams(); // Asumimos que la ruta será algo como /evaluacion/:evaluacionId
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [respuestas, setRespuestas] = useState({}); // Guardará { preguntaId: opcionId }
  const [resultado, setResultado] = useState(null); // Guardará la nota que devuelva el backend
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchEvaluacion = async () => {
      try {
        // Pedimos el examen "limpio" al backend
        const res = await clienteAxios.get(`/evaluaciones/${evaluacionId}`);
        setEvaluacion(res.data);
      } catch (error) {
        console.error("Error al cargar la evaluación", error);
        alert("No se pudo cargar el examen.");
      } finally {
        setCargando(false);
      }
    };
    fetchEvaluacion();
  }, [evaluacionId]);

  // Manejador para cuando el alumno elige una opción
  const handleSeleccion = (preguntaId, opcionId) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: opcionId
    });
  };

  // Enviar el examen al backend para que lo corrija
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación: obligamos a que responda todas las preguntas
    if (Object.keys(respuestas).length < evaluacion.preguntas.length) {
      return alert("⚠️ Por favor, responde todas las preguntas antes de entregar el examen.");
    }

    setEnviando(true);
    try {
      const submitData = {
        evaluacionId: parseInt(evaluacionId),
        respuestas: respuestas
      };

      const res = await clienteAxios.post('/evaluaciones/enviar', submitData);
      
      // El backend nos devuelve { puntaje, aprobado, mensaje }
      setResultado(res.data);
    } catch (error) {
      console.error("Error al enviar el examen", error);
      alert("Hubo un problema al corregir el examen.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="text-center mt-20 text-xl text-gray-600 font-bold">Cargando examen... ⏳</div>;
  if (!evaluacion) return <div className="text-center mt-20 text-xl text-red-600 font-bold">Examen no encontrado.</div>;

  // --- VISTA DE RESULTADOS (Si ya lo envió y se corrigió) ---
  if (resultado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-8 border-blue-600">
          <div className="text-6xl mb-4">
            {resultado.aprobado ? '🎉' : '📚'}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            {resultado.aprobado ? '¡Examen Aprobado!' : 'No alcanzaste el mínimo'}
          </h2>
          <p className={`text-xl font-bold mb-6 ${resultado.aprobado ? 'text-green-600' : 'text-red-500'}`}>
            Tu calificación: {resultado.puntaje} / 100
          </p>
          <p className="text-gray-600 mb-8">{resultado.mensaje}</p>
          
          <button 
            onClick={() => navigate(-1)} // Vuelve a la pantalla anterior (Aula Virtual)
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md"
          >
            Volver al Aula Virtual
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA DEL EXAMEN (Para responder) ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Cabecera */}
        <div className="bg-white rounded-t-2xl shadow-sm p-8 border-b-4 border-blue-600 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{evaluacion.titulo}</h1>
          <p className="text-gray-600">{evaluacion.descripcion}</p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            Preguntas: {evaluacion.preguntas.length}
          </div>
        </div>

        {/* Formulario de preguntas */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {evaluacion.preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-2">
                <span className="text-blue-600">{index + 1}.</span> 
                {pregunta.texto}
              </h3>
              
              <div className="space-y-3 ml-6">
                {pregunta.opciones.map((opcion) => (
                  <label 
                    key={opcion.id} 
                    className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${
                      respuestas[pregunta.id] === opcion.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      value={opcion.id}
                      checked={respuestas[pregunta.id] === opcion.id}
                      onChange={() => handleSeleccion(pregunta.id, opcion.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{opcion.texto}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 mt-8">
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-400"
            >
              {enviando ? 'Corrigiendo...' : 'Entregar Examen'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};