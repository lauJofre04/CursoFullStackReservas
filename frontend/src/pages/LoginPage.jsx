import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clienteAxios from '../api/axiosConfig'; 
import { useAuth } from '../context/AuthContext'; 
import { GoogleLogin } from '@react-oauth/google';// 1. Importamos el contexto

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate(); 
  
  // 2. Extraemos la función login de nuestro estado global
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credenciales) => {
      const response = await clienteAxios.post('/auth/login', credenciales);
      return response.data.token;
    },
    onSuccess: (token) => {
      login(token);
      toast.success('¡Login exitoso! Ya tenés tu pase VIP.');
      navigate('/');
    },
    onError: (error) => {
      console.error(error);
      const errorMsg = error.response?.data?.mensaje || 'Credenciales incorrectas. Por favor, intenta de nuevo.';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-slate-100 mb-8">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="lauti@admin.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors opacity-60 hover:opacity-100 py-1"
                title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L3.596 3.596M9.172 9.172L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
              loginMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </p>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            console.log("Token de Google:", credentialResponse.credential);
            // Le mandamos el token al backend
            const res = await axios.post("https://cursofullstackreservas.onrender.com/api/auth/google", {
                token: credentialResponse.credential
            });
            // Guardamos TU JWT y lo mandamos al home
            localStorage.setItem('token', res.data.token);
            navigate('/mis-cursos');
          }}
          onError={() => {
            console.log('Error al iniciar sesión con Google');
          }}
        />
      </div>
    </div>
  );
};