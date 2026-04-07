import { InboxChat } from '../components/InboxChat';

export const InboxPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Chat en tiempo real</h1>
          <p className="text-sm text-slate-500 mb-6">
            Envía y recibe mensajes al instante con profesores u otros alumnos. Las conversaciones se guardan en la base de datos y se sincronizan con WebSockets.
          </p>
          <InboxChat />
        </div>
      </div>
    </main>
  );
};
