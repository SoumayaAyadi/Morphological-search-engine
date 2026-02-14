// services/morphologyService.js - نسخة مصححة ✅
import api from './api';

export const morphologyService = {
  // التحقق من صحة الكلمة
  validateWord: (racine, mot) => 
    api.post('/morphology/validate', { racine, mot }),
  
  // تحليل الكلمة (عكسية)
  analyzeWord: (mot) => 
    api.post('/morphology/analyze', { mot }),
  
  // توليد كلمة من جذر + وزن
  generateWord: async (racine, scheme) => {
    try {
      console.log('📤 Generating word:', { racine, scheme });
      
      // ✅ تأكد من شكل البيانات المرسلة
      const response = await api.post('/morphology/generate', { 
        racine: racine,
        scheme: scheme 
      });
      
      console.log('📥 Generate response:', response);
      
      // ✅ API يرجع response.data مباشرة من interceptor
      // ولكن نتأكد من الشكل
      
      // إذا كان response هو الكلمة مباشرة
      if (typeof response === 'string') {
        return { word: response };
      }
      
      // إذا كان response فيه data
      if (response && response.data) {
        return response;
      }
      
      // إذا كان response فيه word
      if (response && response.word) {
        return response;
      }
      
      // إذا كان response فيه result
      if (response && response.result) {
        return { word: response.result };
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ generateWord error:', error.response || error);
      throw error;
    }
  },
};