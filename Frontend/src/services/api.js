import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Wajib agar Cookie HttpOnly (refreshToken) otomatis terkirim
});

// ── Interceptor Request: Menyisipkan Access Token ───────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor Response: Auto Refresh Token saat HTTP 401 ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 (Unauthorized) dan bukan dari endpoint login/refresh sendiri
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth')
    ) {
      originalRequest._retry = true;

      try {
        // Panggil endpoint refresh token
        const res = await axios.put(
          'http://localhost:3000/api/auth',
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest); // Re-try request sebelumnya
        }
      } catch (refreshError) {
        // Refresh token tidak valid/expired -> Logout paksa
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;