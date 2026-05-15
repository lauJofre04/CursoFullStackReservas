import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../api/axiosConfig';

const PAGE_SIZE = 6;

export const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [cursos, setCursos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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

  const { isLoading: cargando, error, isFetching } = useQuery({
    queryKey: ['cursosDisponibles', page],
    queryFn: async () => {
      const res = await clienteAxios.get(`cursos?page=${page}&size=${PAGE_SIZE}`);
      return res.data;
    },
    keepPreviousData: true,
    onSuccess: (data) => {
      const nuevos = data?.content || [];
      setCursos((prevCursos) => (page === 0 ? nuevos : [...prevCursos, ...nuevos]));
      setHasMore(!data.last);
    },
  });

  useEffect(() => {
    if (!selectedCategory && !selectedDifficulty) return;
    setPage(0);
  }, [selectedCategory, selectedDifficulty]);

  const categoriasUnicas = Array.from(new Set(cursos.map(getBadgeLabel))).filter(Boolean).sort();
  const cursosFiltrados = cursos.filter((curso) => {
    const categoria = getBadgeLabel(curso);
    const dificultad = getDifficultyLabel(curso);
    return (
      (!selectedCategory || selectedCategory === categoria) &&
      (!selectedDifficulty || selectedDifficulty === dificultad)
    );
  });

  if (cargando && cursos.length === 0) return <div className="text-center mt-20 text-xl font-bold text-gray-600 dark:text-slate-300">Cargando cursos... ⏳</div>;
  if (error) return <div className="text-center mt-20 text-xl font-bold text-red-600">Hubo un error al cargar la vidriera ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:px-6 sm:py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 text-center">
          Nuestros Cursos Disponibles
        </h1>

        <div className="mb-8 space-y-4">
          <div className="overflow-x-auto py-1">
            <div className="inline-flex flex-wrap items-center gap-3 min-w-full">
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
                        className="w-full sm:w-auto inline-flex justify-center rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10"
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

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={isFetching}
              className="w-full max-w-xs mx-auto inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Cargando más...' : 'Cargar más cursos'}
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
