import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap { success: true, data: ... } envelope from TransformInterceptor
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
