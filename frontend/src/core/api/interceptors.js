export const attachAuthInterceptors = (apiClient) => {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('nbd_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('nbd_token');
        localStorage.removeItem('nbd_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
};
