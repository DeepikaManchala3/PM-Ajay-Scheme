import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 10.0.2.2 is the alias for localhost on Android Emulator
// For physical device, use your machine's LAN IP (e.g. 192.168.1.X)
// TODO: Make this configurable via env or manual change for physical device testing
const BASE_URL = 'http://10.0.2.2:5001/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
       console.error("Error fetching token", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
