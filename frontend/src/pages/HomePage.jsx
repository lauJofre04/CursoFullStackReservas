import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';

export const HomePage = () => {
  // Estados para guardar los cursos y saber si está cargando
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // El useEffect se ejecuta una sola vez cuando el componente se monta en pantalla
  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        const response = await clienteAxios.get('/cursos');
        // ¡Atención acá! Como pusimos paginación, los cursos están adentro de ".content"
        setCursos(response.data.content);
        setCargando(false);
      } catch (err) {
        console.error("Error al traer los cursos:", err);
        setError(true);
        setCargando(false);
      }
    };

    obtenerCursos();
  }, []);

  if (cargando) return <div className="text-center mt-20 text-xl font-bold text-gray-600">Cargando cursos... ⏳</div>;
  if (error) return <div className="text-center mt-20 text-xl font-bold text-red-600">Hubo un error al cargar la vidriera ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Nuestros Cursos Disponibles
        </h1>

        {/* Grilla responsiva de Tailwind: 1 columna en celu, 2 en tablet, 3 en PC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Mapeamos el array de cursos para crear una tarjeta por cada uno */}
          {cursos.map((curso) => (
            <div key={curso.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              
              {/* Imagen del curso */}
              <img 
                src={curso.imagen} 
                alt={curso.titulo} 
                className="w-full h-48 object-cover"
              />
              
              {/* Contenido de la tarjeta */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {curso.titulo}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {curso.descripcion}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-black text-blue-600">
                    ${curso.precio.toLocaleString('es-AR')}
                  </span>
                  <Link to={`/curso/${curso.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Ver más
                </Link>
                </div>
              </div>

            </div>
          ))}

          {/* Mensaje por si la base de datos está vacía */}
          {cursos.length === 0 && (
            <div className="col-span-full text-center text-gray-500 text-lg">
              No hay cursos disponibles en este momento.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};