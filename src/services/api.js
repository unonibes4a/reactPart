import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:9090/api',
});

 
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

   
  if (token && !config.url.startsWith('/auth')) {

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
