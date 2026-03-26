import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axiosConfig'; // Importamos nuestro cliente Axios personalizado

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para guardar mensajes de error
  const navigate = useNavigate(); // Herramienta para cambiar de página

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos el error si el usuario vuelve a intentar

    try {
      // 1. Le tocamos la puerta al backend
      const response = await clienteAxios.post('/auth/login', {
        email,
        password
      });

      // 2. Si nos deja pasar, agarramos el token de la respuesta
      const token = response.data.token;
      
      // 3. Lo guardamos en el LocalStorage (la memoria del navegador)
      localStorage.setItem('token', token);

      // 4. Redirigimos al usuario al sistema (por ahora a un panel temporal)
      alert("¡Login exitoso! Ya tenés tu pase VIP.");
      navigate('/panel'); // Más adelante crearemos esta página

    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Iniciar Sesión
        </h2>

        {/* Si hay un error, lo mostramos en un cartelito rojo */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="lauti@admin.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};