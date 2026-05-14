import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

export const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const getBadgeLabel = (curso) => {
    return curso.categoria || curso.nivel || curso.tipo || curso.cursoNivel || 'General';
  };

  const getDifficultyLabel = (curso) => {
    return curso.dificultad || curso.nivel || curso.dificultadNivel || 'Principiante';
  };

  const getRating = (curso) => {
    return curso.valoracion ?? curso.rating ?? 4.8;
  };

  const getReviewCount = (curso) => {
    return curso.reviews ?? curso.valoraciones ?? 45;
  };

  const nivelesDisponibles = ['Principiante', 'Intermedio', 'Avanzado'];

  const { data: cursos = [], isLoading: cargando, error } = useQuery({
    queryKey: ['cursosDisponibles'],
    queryFn: async () => {
      const res = await clienteAxios.get('cursos');
      return res.data?.content || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const categoriasUnicas = Array.from(new Set(cursos.map(getBadgeLabel))).filter(Boolean).sort();
  const cursosFiltrados = cursos.filter((curso) => {
    const categoria = getBadgeLabel(curso);
    const dificultad = getDifficultyLabel(curso);
    return (
      (!selectedCategory || selectedCategory === categoria) &&
      (!selectedDifficulty || selectedDifficulty === dificultad)
    );
  });

  if (cargando) return <div className="text-center mt-20 text-xl font-bold text-gray-600 dark:text-slate-300">Cargando cursos... ⏳</div>;
  if (error) return <div className="text-center mt-20 text-xl font-bold text-red-600">Hubo un error al cargar la vidriera ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 text-center">
          Nuestros Cursos Disponibles
        </h1>

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Categoría:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Todas
            </button>
            {categoriasUnicas.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setSelectedCategory(categoria)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === categoria ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Dificultad:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-4 py-2 outline-none transition-colors"
            >
              <option value="">Todas</option>
              {nivelesDisponibles.map((nivel) => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(cursosFiltrados) && cursosFiltrados.length > 0 ? (
            cursosFiltrados.map((curso) => {
              const badgeLabel = getBadgeLabel(curso);
              const difficultyLabel = getDifficultyLabel(curso);
              const rating = getRating(curso);
              const reviewCount = getReviewCount(curso);
              const filledStars = Math.round(rating);

              return (
                <div key={curso.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <img
                    src={curso.imagen?.replace('http://', 'https://')}
                    alt={curso.titulo}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1">
                        {badgeLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-200 text-xs font-semibold px-3 py-1">
                        {difficultyLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 text-sm mb-3">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span key={index} className={index < filledStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>★</span>
                      ))}
                      <span className="text-slate-500 dark:text-slate-400">{rating.toFixed(1)}</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2 line-clamp-2">
                      {curso.titulo}
                    </h2>
                    <p className="text-gray-600 dark:text-slate-300 mb-4 line-clamp-3">
                      {curso.descripcion}
                    </p>

                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          ${curso.precio.toLocaleString('es-AR')}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ({reviewCount} reviews)
                        </span>
                      </div>

                      <Link
                        to={`/curso/${curso.id}`}
                        className="inline-flex justify-center rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10"
                      >
                        Ver más
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-slate-400 text-lg">
              No hay cursos que coincidan con este filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
