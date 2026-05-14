import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export const ProfesorPanelPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);

  const {
    data: cursos = [],
    isLoading: cargandoCursos,
  } = useQuery({
    queryKey: ['profesorCursos'],
    queryFn: async () => {
      const response = await clienteAxios.get('/profesor/cursos');
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Cargar alumnos de un curso específico
  const cargarAlumnos = async (cursoId) => {
    setCargandoAlumnos(true);
    try {
      const response = await clienteAxios.get(`/profesor/cursos/${cursoId}/alumnos`);
      setAlumnos(response.data);
      setCursoSeleccionado(cursos.find(c => c.id === cursoId));
      console.log('Alumnos cargados:', response.data);
    } catch (error) {
      console.error('Error al cargar los alumnos:', error);
      setAlumnos([]);
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm dark:border-slate-700 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Panel del Profesor</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">Bienvenido, {usuario?.nombre}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de Cursos */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-none dark:border dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Mis Cursos</h2>
            {cargandoCursos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando cursos...</p>
              </div>
            ) : cursos.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No tienes cursos asignados aún.</p>
            ) : (
              <div className="space-y-3">
                {cursos.map((curso) => (
                  <div
                    key={curso.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      cursoSeleccionado?.id === curso.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => cargarAlumnos(curso.id)}
                  >
                    <h3 className="font-medium text-gray-900">{curso.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{curso.descripcion}</p>
                    <p className="text-sm font-medium text-green-600 mt-2">${curso.precio}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de Alumnos */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-none dark:border dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {cursoSeleccionado ? `Alumnos de: ${cursoSeleccionado.titulo}` : 'Selecciona un curso'}
            </h2>
            {cargandoAlumnos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando alumnos...</p>
              </div>
            ) : !cursoSeleccionado ? (
              <p className="text-gray-600 text-center py-8">Selecciona un curso para ver sus alumnos.</p>
            ) : alumnos.length === 0 ? (
              <p className="text-gray-600 dark:text-slate-400 text-center py-8">Este curso no tiene alumnos inscritos aún.</p>
            ) : (
              <div className="space-y-3">
                {alumnos.map((inscripcion) => (
                  <div key={inscripcion.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-950">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-slate-100">{inscripcion.usuario.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{inscripcion.usuario.email}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                          Inscrito: {new Date(inscripcion.fechaInscripcion).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        inscripcion.estado === 'ACTIVA'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {inscripcion.estado}
                      </span>
                    </div>
                    {/* Aquí podrías agregar botones para calificar, enviar mensaje, etc. */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};