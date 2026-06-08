import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Fetch the Zerodha login redirection URL
   * @returns {Promise<Object>} { loginUrl }
   */
  async login() {
    const res = await api.get('/auth/login');
    return res.data;
  },

  /**
   * Send the request_token to generate a Zerodha session
   * @param {string} requestToken - The request token retrieved from Zerodha redirect
   * @returns {Promise<Object>} The generated session details
   */
  async callback(requestToken) {
    const res = await api.post('/auth/callback', { requestToken });
    return res.data;
  },

  /**
   * Get the current session state/details
   * @returns {Promise<Object>} { connected, userName, userId, loginTime, mode }
   */
  async status() {
    const res = await api.get('/auth/status');
    return res.data;
  },

  /**
   * Clear the active session (Logout)
   * @returns {Promise<Object>} { success, message }
   */
  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};
