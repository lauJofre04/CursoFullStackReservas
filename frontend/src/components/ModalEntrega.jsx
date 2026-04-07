import { useState } from 'react';
import clienteAxios from '../api/axiosConfig';

export const ModalEntrega = ({ tarea, isOpen, onClose }) => {
  const [archivo, setArchivo] = useState(null);
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Si el modal está cerrado o no hay tarea, no renderizamos nada
  if (!isOpen || !tarea) return null;

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor, seleccioná un archivo para subir.' });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    // Cuando enviamos archivos, NO usamos un objeto normal, usamos FormData
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('comentario', comentario);
    
    // 🚨 MOCK: Acá deberías sacar el ID del alumno real de tu AuthContext/Zustand/Redux
    formData.append('alumnoId', 1); 

    try {
      await clienteAxios.post(`/tareas/${tarea.id}/entregar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMensaje({ tipo: 'exito', texto: '¡Trabajo entregado correctamente! 🎉' });
      
      // Cerramos el modal después de 2 segundos de éxito
      setTimeout(() => {
        onClose();
        setArchivo(null);
        setComentario('');
        setMensaje({ tipo: '', texto: '' });
      }, 2000);

    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al subir el archivo.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Entregar Tarea</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-xl">
            &times;
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 font-semibold uppercase">{tarea.cursoTitulo}</p>
          <p className="text-lg text-gray-800 font-medium">{tarea.title}</p>
        </div>

        {/* Mensajes de feedback */}
        {mensaje.texto && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu Trabajo (PDF, ZIP, Word)</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario para el profesor (Opcional)</label>
            <textarea 
              rows="3"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribí algo si lo necesitás..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className={`w-full py-2 px-4 text-white font-bold rounded-md transition-colors ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {cargando ? 'Subiendo archivo...' : 'Enviar Entrega'}
          </button>
        </form>

      </div>
    </div>
  );
};