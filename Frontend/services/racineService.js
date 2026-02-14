// services/racineService.js
import api from './api';

export const racineService = {
  // GET /api/racines
  getAllRacines: async () => {
    try {
      const response = await api.get('/racines');
      return response;
    } catch (error) {
      console.error('❌ getAllRacines error:', error);
      throw error;
    }
  },

  // GET /api/racines/{racine}
  getRacine: async (racine) => {
    try {
      const response = await api.get(`/racines/${encodeURIComponent(racine)}`);
      return response;
    } catch (error) {
      console.error('❌ getRacine error:', error);
      throw error;
    }
  },

  // POST /api/racines
  addRacine: async (racine) => {
    try {
      console.log('📤 Adding racine:', racine);
      const response = await api.post('/racines', { racine });
      console.log('📥 Add response:', response);
      return response;
    } catch (error) {
      console.error('❌ addRacine error:', error.response || error);
      throw error;
    }
  },

  // PUT /api/racines/{racine}
  updateRacine: async (oldRacine, newRacine) => {
    try {
      console.log('📤 Updating racine:', oldRacine, '→', newRacine);
      
      const response = await api.put(
        `/racines/${encodeURIComponent(oldRacine)}`, 
        { racine: newRacine }
      );
      
      console.log('📥 Update response:', response);
      return response;
    } catch (error) {
      console.error('❌ updateRacine error:', error.response || error);
      throw error;
    }
  },

  // 🗑️ DELETE /api/racines/{racine} - نسخة مضبوطة 100%
deleteRacine: async (racine) => {
    try {
        console.log('🔵 deleteRacine - القيمة الأصلية:', racine);
        console.log('🔵 deleteRacine - نوع القيمة:', typeof racine);
        
        // ✅ استعمل encodeURIComponent باش تحول الحروف العربية
        const encodedRacine = encodeURIComponent(racine);
        console.log('🔵 deleteRacine - بعد الترميز:', encodedRacine);
        
        const url = `/racines/${encodedRacine}`;
        console.log('🔵 deleteRacine - المسار الكامل:', url);
        
        // ✅ استعمل api.delete() (موش apiDelete)
        const response = await api.delete(url);
        console.log('🟢 deleteRacine - الرد:', response);
        
        return response;
    } catch (error) {
        console.error('🔴 deleteRacine - خطأ:', error);
        throw error;
    }
},

  // GET /api/racines/{racine}/derives
  getRacineDerives: async (racine) => {
    try {
      const response = await api.get(`/racines/${encodeURIComponent(racine)}/derives`);
      return response;
    } catch (error) {
      console.error('❌ getRacineDerives error:', error);
      throw error;
    }
  },

  // GET /api/racines/stats/count
  getRacineCount: async () => {
    try {
      const response = await api.get('/racines/stats/count');
      return response;
    } catch (error) {
      console.error('❌ getRacineCount error:', error);
      throw error;
    }
  }
};