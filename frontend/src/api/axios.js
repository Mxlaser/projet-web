import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Gérer les erreurs 401 (Non autorisé) et 403 (Interdit)
      if (status === 401 || status === 403) {
        // Supprimer le token invalide
        localStorage.removeItem("token");
        
        // Rediriger vers login seulement si on n'y est pas déjà
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
