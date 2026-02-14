import axios from 'axios';

// ✅ استخدم localhost وليس 127.0.0.1
const API_BASE_URL = 'http://localhost:8080/api';

console.log('🌐 API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 ثانية
});

// ✅ اعتراض الطلبات
api.interceptors.request.use(
  (config) => {
    console.log('📤 [API] Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ اعتراض الردود
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;