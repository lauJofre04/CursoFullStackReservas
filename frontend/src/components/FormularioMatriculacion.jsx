import { useState } from 'react';
import clienteAxios from '../api/axiosConfig';

export const FormularioMatriculacion = ({ cursos, cargandoCursos }) => {
  // Estados para matriculación manual
  const [emailAlumno, setEmailAlumno] = useState('');
  const [idCursoAsignar, setIdCursoAsignar] = useState('');
  const [alertaInscripcion, setAlertaInscripcion] = useState(null);
  const [procesandoAdmin, setProcesandoAdmin] = useState(false);

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
        cursoId: parseInt(idCursoAsignar),
        metodoAcceso: 'MANUAL_ADMIN'
      });
      
      setAlertaInscripcion({ tipo: 'exito', texto: response.data.mensaje || "¡Alumno matriculado correctamente!" });
      setEmailAlumno('');
      setIdCursoAsignar('');
    } catch (error) {
      const msj = error.response?.data?.mensaje || "Error al matricular al alumno";
      setAlertaInscripcion({ tipo: 'error', texto: msj });
    } finally {
      setProcesandoAdmin(false);
    }
  };

  return (
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
  );
};
