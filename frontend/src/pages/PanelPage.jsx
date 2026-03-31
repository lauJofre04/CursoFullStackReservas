import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig';
import { FormularioCurso } from '../components/FormularioCurso';
import { TablaCursos } from '../components/TablaCursos';
import { FormularioMatriculacion } from '../components/FormularioMatriculacion';

export const PanelPage = () => {
  const navigate = useNavigate();
  const formularioCursoRef = useRef();

  // Estados globales
  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(false);

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

  const handleEditarCurso = (curso) => {
    if (formularioCursoRef.current) {
      formularioCursoRef.current.handleEditarCurso(curso);
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

        {/* Usar el componente FormularioCurso */}
        <FormularioCurso ref={formularioCursoRef} cursos={cursos} setCursos={setCursos} />

        {/* Usar el componente FormularioMatriculacion */}
        <FormularioMatriculacion cursos={cursos} cargandoCursos={cargandoCursos} />

        {/* Usar el componente TablaCursos */}
        <TablaCursos cursos={cursos} cargandoCursos={cargandoCursos} onEditar={handleEditarCurso} />
      </div>
    </div>
  );
};