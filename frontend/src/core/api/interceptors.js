export const attachAuthInterceptors = (apiClient) => {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('nbd_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url || '';

      // Auth endpoints (login/register) return 401 for wrong credentials —
      // this is expected. DO NOT redirect; let the component show the toast.
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

      if (status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('nbd_token');
        localStorage.removeItem('nbd_user');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    },
  );
};

