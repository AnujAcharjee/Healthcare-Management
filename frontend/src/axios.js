import axios from 'axios';

// Axios instance
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send cookies with requests
});

// Response interceptor for refreshing tokens
api.interceptors.response.use(
  (response) => response, // 200 res - send it as it is
  async (error) => {
    const originalRequest = error.config; // error.config -> contains all the details of the original Axios request (URL, method, headers, data, etc)

    // Check if the error status is 401 and this is not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // _retry - defined by us
      // at first try -> _retry = undefined -> set it to true
      // if refresh token is invalid -> _retry = true -> prevents retry again, to prevent infinite looping
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        await axios.post('/refresh-token', {}, { withCredentials: true });

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Reject all other errors
    return Promise.reject(error);
  }
);

export default api;
