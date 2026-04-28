import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Apontando para o backend atual
});

// Interceptor para injetar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@OdontoCota:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
