// services/schemeService.js - نسخة محسنة ✅
import api from './api';

export const schemeService = {
  // جلب كل الأوزان
  getAllSchemes: async () => {
    try {
      console.log('📤 Fetching all schemes...');
      const response = await api.get('/schemes');
      console.log('📥 getAllSchemes response:', response);
      
      // التأكد من أن response عبارة عن مصفوفة
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ getAllSchemes error:', error);
      throw error;
    }
  },
  
  // جلب وزن معين
  getScheme: async (nom) => {
    try {
      console.log('📤 Fetching scheme:', nom);
      const response = await api.get(`/schemes/${encodeURIComponent(nom)}`);
      return response;
    } catch (error) {
      console.error('❌ getScheme error:', error);
      throw error;
    }
  },
  
  // جلب الأوزان حسب النوع
  getSchemesByType: async (type) => {
    try {
      console.log('📤 Fetching schemes by type:', type);
      const response = await api.get(`/schemes/types/${type}`);
      return response;
    } catch (error) {
      console.error('❌ getSchemesByType error:', error);
      throw error;
    }
  },
  
  // إضافة وزن جديد
  addScheme: async (schemeData) => {
    try {
      console.log('📤 Adding scheme:', schemeData);
      
      // التأكد من صحة البيانات
      if (!schemeData.nom || !schemeData.nom.trim()) {
        throw new Error('اسم النمط مطلوب');
      }
      
      const response = await api.post('/schemes', {
        nom: schemeData.nom.trim(),
        type: schemeData.type || 'CUSTOM',
        description: schemeData.description || ''
      });
      
      console.log('📥 Add scheme response:', response);
      return response;
    } catch (error) {
      console.error('❌ addScheme error:', error.response || error);
      throw error;
    }
  },
  
  // تعديل وزن
  modifyScheme: async (oldNom, newPattern) => {
    try {
      console.log('📤 Modifying scheme:', oldNom, '→', newPattern);
      
      if (!oldNom || !newPattern) {
        throw new Error('الاسم القديم والجديد مطلوبان');
      }
      
      const response = await api.put(`/schemes/${encodeURIComponent(oldNom)}`, { 
        newPattern: newPattern.trim() 
      });
      
      console.log('📥 Modify scheme response:', response);
      return response;
    } catch (error) {
      console.error('❌ modifyScheme error:', error.response || error);
      throw error;
    }
  },
  
  // حذف وزن
  deleteScheme: async (nom) => {
    try {
      console.log('🗑️ Deleting scheme:', nom);
      
      if (!nom || !nom.trim()) {
        throw new Error('اسم النمط مطلوب للحذف');
      }
      
      const response = await api.delete(`/schemes/${encodeURIComponent(nom)}`);
      console.log('📥 Delete scheme response:', response);
      return response;
    } catch (error) {
      console.error('❌ deleteScheme error:', error.response || error);
      throw error;
    }
  },
  
  // الأوزان الأكثر استخداماً
  getPopularSchemes: async (limit = 10) => {
    try {
      console.log('📤 Fetching popular schemes, limit:', limit);
      const response = await api.get('/schemes/stats/popular', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('❌ getPopularSchemes error:', error);
      throw error;
    }
  },
  
  // البحث عن الأوزان
  searchSchemes: async (query) => {
    try {
      console.log('📤 Searching schemes:', query);
      
      if (!query || !query.trim()) {
        return [];
      }
      
      const response = await api.get('/schemes/search', {
        params: { q: query.trim() }
      });
      
      return response;
    } catch (error) {
      console.error('❌ searchSchemes error:', error);
      throw error;
    }
  },
  
  // إحصائيات الأوزان
  getSchemeStats: async () => {
    try {
      console.log('📤 Fetching scheme stats...');
      const response = await api.get('/schemes/stats');
      return response;
    } catch (error) {
      console.error('❌ getSchemeStats error:', error);
      throw error;
    }
  },
  
  // التحقق من وجود وزن
  checkSchemeExists: async (nom) => {
    try {
      console.log('🔍 Checking if scheme exists:', nom);
      const response = await api.get(`/schemes/${encodeURIComponent(nom)}/exists`);
      return response;
    } catch (error) {
      console.error('❌ checkSchemeExists error:', error);
      throw error;
    }
  }
};