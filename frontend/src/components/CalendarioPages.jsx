import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import clienteAxios from '../api/axiosConfig';
import { ModalEntrega } from './ModalEntrega';


// 1. Configuramos el idioma y el formato de las fechas al español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // La semana arranca el Lunes
  getDay,
  locales,
});

// 2. Traducimos los botones del calendario
const mensajesEspanol = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay entregas para estas fechas.',
};

export const CalendarioPage = () => {
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const { data: eventos = [], isLoading: cargando, error } = useQuery({
    queryKey: ['calendarioTareas'],
    queryFn: async () => {
      const response = await clienteAxios.get('/tareas/calendario');
      return Array.isArray(response.data) ? response.data : [];
    },
    select: (tareas) => tareas.map((tarea) => ({
      id: tarea.id,
      title: tarea.title,
      start: new Date(tarea.start),
      end: new Date(tarea.end),
      cursoTitulo: tarea.cursoTitulo,
    })),
    staleTime: 1000 * 60 * 2,
  });
  const handleSeleccionarEvento = (evento) => {
    setTareaSeleccionada(evento);
    setModalAbierto(true);
  };

  if (cargando) {
    return <div className="text-center mt-20 text-xl font-bold text-gray-600">Cargando calendario... ⏳</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">📅 Mi Calendario de Entregas</h1>
          <p className="text-gray-500 mt-2">Acá vas a ver todas las fechas límite de tus cursos.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-semibold">
            {error}
          </div>
        )}

        {/* Contenedor del Calendario */}
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            culture="es"
            messages={mensajesEspanol}
            
            // 4. ESTA ES LA MAGIA: El evento onSelectEvent
            onSelectEvent={handleSeleccionarEvento} 
            
            eventPropGetter={(event) => ({
              className: 'bg-blue-600 border-none rounded-md shadow-sm opacity-90 hover:opacity-100 transition-opacity cursor-pointer', // sumé cursor-pointer
              style: {
                fontWeight: 'bold',
                padding: '4px 8px'
              }
            })}
          />
        </div>

        {/* 5. Colocamos el Modal al final de tu componente */}
        <ModalEntrega 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          tarea={tareaSeleccionada} 
        />
        </div>

      </div>
  );
  
};