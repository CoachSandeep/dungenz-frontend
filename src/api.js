import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // to send the refresh token cookie
});

let isRefreshing = false;

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await api.get('/refresh'); // calls your backend /refresh
          localStorage.setItem('token', data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        } catch (refreshError) {
          console.error('🔁 Token refresh failed:', refreshError);
        }
        isRefreshing = false;
      }

      originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      return api(originalRequest); // retry original request
    }

    return Promise.reject(error);
  }
);

export default api;
