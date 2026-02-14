import axios from 'axios';
import { Platform } from 'react-native';

// ✅ تحديد الرابط حسب البيئة
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    // للويب - localhost يشتغل في المتصفح
    return 'http://localhost:8080/api';
  } else {
    // للموبايل - استخدم IP الكمبيوتر (192.168.1.205)
    return 'http://192.168.1.205:8080/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log('📱 Platform:', Platform.OS);
console.log('🌐 API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// ✅ اعتراض الطلبات للتصحيح
api.interceptors.request.use(
  (config) => {
    console.log('📤 [API] Request:', {
      platform: Platform.OS,
      fullURL: config.baseURL + config.url,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ اعتراض الردود
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response Success:', response.status);
    return response.data;
  },
  (error) => {
    console.error('❌ Response Error:', error.message);
    if (!error.response) {
      console.error('❌ Network Error: تأكد أن الباك اند شغال على:', API_BASE_URL);
      console.error('❌ وأن الكمبيوتر والموبايل على نفس شبكة WiFi');
    }
    return Promise.reject(error);
  }
);

export default api;