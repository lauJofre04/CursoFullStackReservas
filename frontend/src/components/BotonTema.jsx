import { useState, useEffect } from 'react';

export const BotonTema = () => {
  const [tema, setTema] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
      return window.localStorage.getItem('theme');
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', tema);
  }, [tema]);

  const toggleTema = () => {
    setTema((actual) => (actual === 'light' ? 'dark' : 'light'));
  };

  const esClaro = tema === 'light';

  return (
    <button
      type="button"
      onClick={toggleTema}
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-700 shadow-sm transition hover:scale-105 active:scale-95 dark:bg-slate-700 dark:text-yellow-300"
      title="Alternar tema"
      aria-label={esClaro ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {/* key fuerza a remontar el ícono y reproducir la animación de giro en cada cambio */}
      <svg key={tema} viewBox="0 0 24 24" className="anim-giro h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {esClaro ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
};
