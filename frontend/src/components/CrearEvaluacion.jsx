import { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';

export const CrearEvaluacion = ({ cursoIdPreseleccionado }) => {
  // Estado para los cursos disponibles (para el <select>)
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // El super-estado que guarda toda la estructura del examen
  const [evaluacion, setEvaluacion] = useState({
    titulo: '',
    descripcion: '',
    cursoId: '',
    preguntas: [
      {
        texto: '',
        opciones: [
          { texto: '', esCorrecta: true },
          { texto: '', esCorrecta: false }
        ]
      }
    ]
  });

  // Cargar los cursos al montar el componente
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await clienteAxios.get('/cursos');
        setCursos(res.data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    };
    fetchCursos();
  }, []);

  // --- MÉTODOS PARA MANEJAR EL ESTADO ANIDADO ---

  const agregarPregunta = () => {
    setEvaluacion({
      ...evaluacion,
      preguntas: [
        ...evaluacion.preguntas,
        { texto: '', opciones: [{ texto: '', esCorrecta: true }, { texto: '', esCorrecta: false }] }
      ]
    });
  };

  const eliminarPregunta = (pregIndex) => {
    const nuevasPreguntas = evaluacion.preguntas.filter((_, i) => i !== pregIndex);
    setEvaluacion({ ...evaluacion, preguntas: nuevasPreguntas });
  };

  const agregarOpcion = (pregIndex) => {
    const nuevasPreguntas = [...evaluacion.preguntas];
    nuevasPreguntas[pregIndex].opciones.push({ texto: '', esCorrecta: false });
    setEvaluacion({ ...evaluacion, preguntas: nuevasPreguntas });
  };

  const eliminarOpcion = (pregIndex, opcIndex) => {
    const nuevasPreguntas = [...evaluacion.preguntas];
    nuevasPreguntas[pregIndex].opciones = nuevasPreguntas[pregIndex].opciones.filter((_, i) => i !== opcIndex);
    setEvaluacion({ ...evaluacion, preguntas: nuevasPreguntas });
  };

  const marcarComoCorrecta = (pregIndex, opcIndex) => {
    const nuevasPreguntas = [...evaluacion.preguntas];
    // Ponemos todas en false
    nuevasPreguntas[pregIndex].opciones.forEach(opc => opc.esCorrecta = false);
    // Marcamos solo la elegida como true
    nuevasPreguntas[pregIndex].opciones[opcIndex].esCorrecta = true;
    setEvaluacion({ ...evaluacion, preguntas: nuevasPreguntas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const idDelCurso = cursoIdPreseleccionado || evaluacion.cursoId;
      
      if (!idDelCurso) return alert("Selecciona un curso");
      
      // Armamos el paquete de datos con el ID correcto asegurado
      const datosAEnviar = {
        ...evaluacion,
        cursoId: idDelCurso
      };

      await clienteAxios.post('/evaluaciones/crear', datosAEnviar);
      alert("¡Evaluación creada con éxito!");
      
      // Resetear formulario
      setEvaluacion({
        titulo: '', descripcion: '', cursoId: '',
        preguntas: [{ texto: '', opciones: [{ texto: '', esCorrecta: true }, { texto: '', esCorrecta: false }] }]
      });
    } catch (error) {
      console.error(error);
      alert("Error al crear la evaluación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8 mb-12">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
        🛠️ Crear Nueva Evaluación
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- DATOS GENERALES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border">
          {!cursoIdPreseleccionado && (
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-2">Curso al que pertenece</label>
              <select 
                value={evaluacion.cursoId}
                onChange={(e) => setEvaluacion({...evaluacion, cursoId: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required={!cursoIdPreseleccionado}
              >
                <option value="">-- Seleccionar Curso --</option>
                {/* Blindamos el map para que no explote si cursos no es un array */}
                {(Array.isArray(cursos) ? cursos : []).map(c => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-2">Título de la Evaluación</label>
            <input 
              type="text" required
              value={evaluacion.titulo}
              onChange={(e) => setEvaluacion({...evaluacion, titulo: e.target.value})}
              placeholder="Ej: Examen Final de React"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Descripción breve</label>
            <input 
              type="text"
              value={evaluacion.descripcion}
              onChange={(e) => setEvaluacion({...evaluacion, descripcion: e.target.value})}
              placeholder="Ej: Tenés 30 minutos para completarlo."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* --- PREGUNTAS DINÁMICAS --- */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center justify-between">
            Preguntas del Examen
            <button 
              type="button" 
              onClick={agregarPregunta}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Añadir Pregunta
            </button>
          </h3>

          {evaluacion.preguntas.map((pregunta, pregIndex) => (
            <div key={pregIndex} className="p-5 border-2 border-blue-100 bg-white rounded-xl shadow-sm relative">
              
              <button 
                type="button" onClick={() => eliminarPregunta(pregIndex)}
                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-full"
                title="Eliminar pregunta"
              >
                🗑️
              </button>

              <label className="block font-bold text-gray-700 mb-2">Pregunta {pregIndex + 1}</label>
              <input 
                type="text" required
                value={pregunta.texto}
                onChange={(e) => {
                  const nuevas = [...evaluacion.preguntas];
                  nuevas[pregIndex].texto = e.target.value;
                  setEvaluacion({...evaluacion, preguntas: nuevas});
                }}
                placeholder="¿Qué es un Hook en React?"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 bg-gray-50"
              />

              {/* --- OPCIONES DE ESTA PREGUNTA --- */}
              <div className="ml-6 space-y-3 border-l-2 border-blue-200 pl-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Opciones</p>
                
                {pregunta.opciones.map((opcion, opcIndex) => (
                  <div key={opcIndex} className="flex items-center space-x-3">
                    
                    {/* Radio button para elegir la correcta */}
                    <input 
                      type="radio" 
                      name={`correcta-${pregIndex}`} 
                      checked={opcion.esCorrecta}
                      onChange={() => marcarComoCorrecta(pregIndex, opcIndex)}
                      className="w-5 h-5 text-green-500 focus:ring-green-500 cursor-pointer"
                      title="Marcar como respuesta correcta"
                    />

                    <input 
                      type="text" required
                      value={opcion.texto}
                      onChange={(e) => {
                        const nuevas = [...evaluacion.preguntas];
                        nuevas[pregIndex].opciones[opcIndex].texto = e.target.value;
                        setEvaluacion({...evaluacion, preguntas: nuevas});
                      }}
                      placeholder={`Opción ${opcIndex + 1}`}
                      className={`flex-1 p-2 border rounded-md focus:ring-2 ${opcion.esCorrecta ? 'border-green-400 bg-green-50 focus:ring-green-500' : 'focus:ring-blue-500'}`}
                    />

                    <button 
                      type="button" onClick={() => eliminarOpcion(pregIndex, opcIndex)}
                      className="text-gray-400 hover:text-red-500 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button 
                  type="button" onClick={() => agregarOpcion(pregIndex)}
                  className="mt-2 text-sm text-blue-600 font-semibold hover:underline flex items-center"
                >
                  + Agregar opción
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-all disabled:bg-gray-400"
        >
          {cargando ? 'Guardando...' : '💾 Guardar Evaluación Completa'}
        </button>
      </form>
    </div>
  );
};