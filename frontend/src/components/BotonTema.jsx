import { useState, useEffect } from 'react';

export const BotonTema = () => {
  const [tema, setTema] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
      return window.localStorage.getItem('theme');
    }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
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

  return (
    <button
      type="button"
      onClick={toggleTema}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-yellow-300 transition-colors duration-200 hover:scale-105 shadow-sm"
      title="Alternar tema"
    >
      {tema === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
