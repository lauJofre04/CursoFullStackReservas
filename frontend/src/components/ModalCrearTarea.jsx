import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

export const ModalCrearTarea = ({ moduloId, isOpen, onClose, onTareaCreada }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaLimite: '', // Formato YYYY-MM-DDTHH:mm
  });
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const queryClient = useQueryClient();

  const crearTareaMutation = useMutation({
    mutationFn: async (data) => {
      const tareaRequestDTO = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        fechaLimite: data.fechaLimite,
        moduloId: moduloId
      };
      
      const formDataToSend = new FormData();
      formDataToSend.append('datos', new Blob([JSON.stringify(tareaRequestDTO)], { type: "application/json" }));
      
      if (data.archivo) {
        formDataToSend.append('archivo', data.archivo);
      }

      await clienteAxios.post('/tareas/crear', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setMensaje({ tipo: 'exito', texto: '¡Tarea creada exitosamente! 📅' });
      queryClient.invalidateQueries({ queryKey: ['tareas', moduloId] });
      
      setTimeout(() => {
        onTareaCreada();
        onClose();
        setFormData({ titulo: '', descripcion: '', fechaLimite: '' });
        setArchivo(null);
        setMensaje({ tipo: '', texto: '' });
      }, 1500);
    },
    onError: (error) => {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al crear la tarea.' });
    }
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    crearTareaMutation.mutate({ ...formData, archivo });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Tarea</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        {mensaje.texto && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la entrega</label>
            <input 
              type="text" 
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ej: Trabajo Práctico N° 1"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Consigna</label>
            <textarea 
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Detallá qué deben entregar los alumnos..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora Límite</label>
            <input 
              type="datetime-local" 
              name="fechaLimite"
              value={formData.fechaLimite}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo adjunto (Opcional)</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Podés subir un PDF o ZIP con material base para los alumnos.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={crearTareaMutation.isPending}
              className={`px-4 py-2 text-white font-bold rounded-md transition-colors ${crearTareaMutation.isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {crearTareaMutation.isPending ? 'Guardando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};