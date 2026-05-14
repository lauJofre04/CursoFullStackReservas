import { useState, useRef } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export const ModalEntrega = ({ tarea, isOpen, onClose }) => {
  const { usuario } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [comentario, setComentario] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [dragging, setDragging] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const inputFileRef = useRef(null);

  const queryClient = useQueryClient();

  const entregarTareaMutation = useMutation({
    mutationFn: async ({ archivo, comentario, usuarioId, tareaId }) => {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('comentario', comentario);
      formData.append('alumnoId', usuarioId ?? 1);

      await clienteAxios.post(`/tareas/${tareaId}/entregar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const porcentaje = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgresoSubida(porcentaje);
        },
      });
    },
    onSuccess: () => {
      setProgresoSubida(100);
      setMensaje({ tipo: 'exito', texto: '¡Trabajo entregado correctamente! 🎉' });
      queryClient.invalidateQueries({ queryKey: ['entregas', tarea?.id] });
      
      setTimeout(() => {
        onClose();
        setArchivo(null);
        setComentario('');
        setMensaje({ tipo: '', texto: '' });
        setProgresoSubida(0);
      }, 2000);
    },
    onError: (error) => {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al subir el archivo.' });
    }
  });

  // Si el modal está cerrado o no hay tarea, no renderizamos nada
  if (!isOpen || !tarea) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validarYSetearArchivo(file);
    }
  };

  const validarYSetearArchivo = (file) => {
    const archivosPermitidos = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!archivosPermitidos.includes(file.type)) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Solo se permiten archivos PDF, ZIP o Word.' 
      });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'El archivo no puede superar 50MB.' 
      });
      return;
    }
    
    setArchivo(file);
    setMensaje({ tipo: '', texto: '' });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validarYSetearArchivo(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor, seleccioná un archivo para subir.' });
      return;
    }

    setProgresoSubida(0);
    setMensaje({ tipo: '', texto: '' });
    entregarTareaMutation.mutate({ archivo, comentario, usuarioId: usuario?.id, tareaId: tarea.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Entregar Tarea</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-xl">
            &times;
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-slate-400 font-semibold uppercase">{tarea.cursoTitulo}</p>
          <p className="text-lg text-gray-800 dark:text-slate-100 font-medium">{tarea.title}</p>
        </div>

        {/* Mensajes de feedback */}
        {mensaje.texto && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${mensaje.tipo === 'exito' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Zona Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputFileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105'
                : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-400'
            }`}
          >
            <input
              ref={inputFileRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.zip,.doc,.docx"
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">
                {archivo ? '✅' : '📁'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                  {archivo ? archivo.name : 'Arrastrá tu archivo PDF/ZIP acá'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {archivo ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB` : 'o hacé clic para buscar'}
                </p>
              </div>
            </div>
          </div>

          {/* Cambiar archivo si ya seleccionó uno */}
          {archivo && (
            <button
              type="button"
              onClick={() => {
                setArchivo(null);
                setMensaje({ tipo: '', texto: '' });
              }}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Cambiar archivo
            </button>
          )}

          {entregarTareaMutation.isPending && (
            <div className="mt-3">
              <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${progresoSubida}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                Subiendo archivo... {progresoSubida}%
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Comentario para el profesor (Opcional)
            </label>
            <textarea 
              rows="3"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribí algo si lo necesitás..."
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={entregarTareaMutation.isPending || !archivo}
            className={`w-full py-3 px-4 text-white font-bold rounded-lg transition-colors ${
              entregarTareaMutation.isPending || !archivo
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {entregarTareaMutation.isPending ? 'Subiendo archivo...' : 'Enviar Entrega'}
          </button>
        </form>

      </div>
    </div>
  );
};