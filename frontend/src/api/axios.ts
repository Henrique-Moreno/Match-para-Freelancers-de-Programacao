import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove o token inválido
      localStorage.removeItem("access_token");
      window.location.href = "/sign";
    }
    return Promise.reject(error);
  }
);