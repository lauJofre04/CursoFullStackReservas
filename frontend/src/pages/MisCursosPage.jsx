import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext'; // Para mostrar info personalizada del usuario


export const MisCursosPage = () => {
  const { usuario } = useAuth(); // Traemos el usuario del context
  const navigate = useNavigate();
  const [selectedCurso, setSelectedCurso] = useState(null);

  const { data: misCursos = [], isLoading: cargando, error } = useQuery({
    queryKey: ['misCursos', usuario?.rol, usuario?.id],
    queryFn: async () => {
      let url = '';
      if (usuario?.rol === 'PROFESOR') {
        url = '/cursos/mis-cursos-asignados';
      } else if (usuario?.rol === 'ADMIN') {
        url = '/cursos';
      } else {
        url = '/inscripciones/mis-cursos';
      }

      const response = await clienteAxios.get(url);
      return (Array.isArray(response.data) ? response.data : []).map((item) => ({
        cursoId: item.cursoId || item.id,
        titulo: item.titulo,
        imagen: item.imagen || item.imagenUrl || 'https://via.placeholder.com/400x200?text=Curso',
        estado: item.estado || (item.activo ? 'ACTIVA' : 'INACTIVA'),
        fechaInscripcion: item.fechaInscripcion || new Date().toISOString(),
      }));
    },
    enabled: !!usuario,
    staleTime: 1000 * 60 * 2,
  });

  if (cargando) return <div className="text-center mt-20 text-xl font-bold text-gray-600">Cargando tu aprendizaje... ⏳</div>;
  if (error) return <div className="text-center mt-20 text-xl font-bold text-red-600">Hubo un error al cargar tus cursos ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 dark:text-slate-100 px-4 py-8 sm:px-6 sm:py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">Mis Cursos</h1>
        <p className="text-gray-600 dark:text-slate-300 mb-10 text-lg">Acá están todos los cursos a los que estás inscripto.</p>

        {misCursos.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-slate-100 mb-4">Todavía no tenés cursos 😢</h2>
            <Link reloadDocument to="/home" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
              Explorar la vidriera
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {misCursos.map((curso) => (
              <div key={curso.cursoId} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
                
                {/* Etiqueta de Estado */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-sm z-10 ${
                  curso.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {curso.estado}
                </div>

                <img 
                  src={curso.imagen} 
                  alt={curso.titulo} 
                  className="w-full h-40 object-cover opacity-90"
                />
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {curso.titulo}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Inscripto el: {new Date(curso.fechaInscripcion).toLocaleDateString('es-AR')}
                  </p>
                  
                  <button 
                    onClick={() => navigate(`/aula/${curso.cursoId}`)}
                    disabled={curso.estado !== 'ACTIVA'}
                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                      curso.estado === 'ACTIVA' 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {curso.estado === 'ACTIVA' ? 'Ir al contenido 🚀' : 'Acceso Bloqueado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};