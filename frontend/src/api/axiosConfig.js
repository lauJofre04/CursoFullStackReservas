import axios from 'axios';

// 1. Creamos nuestra propia versión de Axios con la URL base de tu Spring Boot
const clienteAxios = axios.create({
    baseURL: 'http://localhost:8087/api'
});

// 2. El Interceptor (El "empleado de aduana")
clienteAxios.interceptors.request.use(
    (config) => {
        // Antes de que salga la petición, buscamos el token en la bóveda
        const token = localStorage.getItem('token');

        // Si hay un token, se lo pegamos en la cabecera con el formato "Bearer"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Dejamos que la petición siga su viaje
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default clienteAxios;