import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, //
});

console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
