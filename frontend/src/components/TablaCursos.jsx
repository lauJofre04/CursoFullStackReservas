export const TablaCursos = ({ cursos, cargandoCursos, onEditar }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Gestionar Cursos</h2>
      
      {cargandoCursos ? (
        <p className="text-center text-gray-600">Cargando cursos...</p>
      ) : cursos && cursos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-bold text-gray-700">Título</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Descripción</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Precio</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-700 font-semibold">{curso.titulo}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{curso.descripcion}</td>
                  <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                    ${curso.precio.toLocaleString('es-AR')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onEditar(curso)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">No hay cursos disponibles aún.</p>
      )}
    </div>
  );
};
