import { InboxChat } from '../components/InboxChat';

export const InboxPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 py-8 transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Chat en tiempo real</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Envía y recibe mensajes al instante con profesores u otros alumnos. Las conversaciones se guardan en la base de datos y se sincronizan con WebSockets.
          </p>
          <InboxChat />
        </div>
      </div>
    </main>
  );
};
