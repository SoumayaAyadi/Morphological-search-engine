// GenerateScreen.js - النسخة النهائية مع الصوت ✅
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { colors } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { racineService } from '../services/racineService';
import { schemeService } from '../services/schemeService';
import { morphologyService } from '../services/morphologyService';

export default function GenerateScreen() {
  const [result, setResult] = useState('...');
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showRootsModal, setShowRootsModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [roots, setRoots] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultScale] = useState(new Animated.Value(1));
  
  // الأوزان الافتراضية
  const defaultSchemes = [
    { id: '1', name: 'فاعل' },
    { id: '2', name: 'مفعول' },
    { id: '3', name: 'تفاعل' },
    { id: '4', name: 'انفعل' },
    { id: '5', name: 'افتعل' },
    { id: '6', name: 'استفعل' },
  ];

  // ✅ حل مشكلة الانقطاع
  const playWord = (word) => {
    try {
      if (!word || word === '...') {
        console.log('❌ كلمة فارغة');
        return;
      }
      
      console.log('🔊 تشغيل:', word);
      
      // للويب فقط
      if (Platform.OS === 'web') {
        // التأكد من وجود SpeechSynthesis
        if (!window.speechSynthesis) {
          Alert.alert('تنبيه', 'متصفحك لا يدعم خاصية النطق');
          return;
        }

        // ⚠️ حل المشكلة: إيقاف الكلام السابق وإعادة تشغيل المتصفح للصوت
        window.speechSynthesis.cancel();
        
        // انتظر قليلاً قبل تشغيل الصوت الجديد
        setTimeout(() => {
          try {
            // إنشاء كلام جديد
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.8; // سرعة أبطأ
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // البحث عن صوت عربي
            const voices = window.speechSynthesis.getVoices();
            const arabicVoice = voices.find(voice => 
              voice.lang.includes('ar') || 
              voice.name.includes('Arabic') ||
              voice.lang.includes('AR')
            );
            
            if (arabicVoice) {
              utterance.voice = arabicVoice;
              console.log('🎤 استعمال الصوت العربي:', arabicVoice.name);
            }
            
            // متابعة الحالة
            utterance.onstart = () => {
              console.log('▶️ بدأ التشغيل');
              setIsPlaying(true);
            };
            
            utterance.onend = () => {
              console.log('⏹️ انتهى التشغيل');
              setIsPlaying(false);
            };
            
            utterance.onerror = (event) => {
              console.log('⚠️ خطأ بسيط:', event.error);
              // تجاهل الخطأ لأن الصوت قد اشتغل
              setIsPlaying(false);
            };
            
            // تشغيل الكلام
            window.speechSynthesis.speak(utterance);
            
            // ⚠️ حل مشكلة الانقطاع في المتصفحات
            const interval = setInterval(() => {
              if (!window.speechSynthesis.speaking) {
                clearInterval(interval);
              } else {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
              }
            }, 5000);
            
          } catch (innerError) {
            console.error('🔴 خطأ في التشغيل:', innerError);
            setIsPlaying(false);
          }
        }, 100);
      }
    } catch (error) {
      console.error('🔴 خطأ عام:', error);
      setIsPlaying(false);
    }
  };

  // ✅ إيقاف الصوت
  const stopWord = () => {
    try {
      if (Platform.OS === 'web' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('⏹️ تم إيقاف الصوت');
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('🔴 خطأ في الإيقاف:', error);
    }
  };

  // ✅ تجربة الصوت بكلمات مختلفة
  const testVoice = () => {
    const testWords = ['مرحبا', 'السلام عليكم', 'كيف حالك', 'بخير الحمد لله'];
    
    // اختيار كلمة عشوائية
    const randomWord = testWords[Math.floor(Math.random() * testWords.length)];
    
    Alert.alert(
      'تجربة الصوت',
      `سيتم تشغيل: "${randomWord}"`,
      [
        { text: 'تشغيل', onPress: () => playWord(randomWord) },
        { text: 'إلغاء' }
      ]
    );
  };

  const handleGenerate = async () => {
    if (!selectedRoot || !selectedScheme) {
      Alert.alert('تنبيه', 'اختر الجذر والنمط أولاً');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await morphologyService.generateWord(selectedRoot.root, selectedScheme.name);
      console.log('📥 Response:', response);
      
      // استخراج الكلمة
      let newWord = response?.data?.motGenere || 
                    response?.motGenere || 
                    response?.data?.word || 
                    response?.word || 
                    '...';
      
      console.log('✅ كلمة جديدة:', newWord);
      setResult(newWord);
      
      // تأثير
      Animated.sequence([
        Animated.timing(resultScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();

      // إضافة للسجل
      setGeneratedWords(prev => [{
        id: Date.now().toString(),
        word: newWord,
        root: selectedRoot.root,
        scheme: selectedScheme.name
      }, ...prev].slice(0, 5));

      // سؤال المستخدم إذا كان يريد سماع الكلمة
      Alert.alert(
        'تم التوليد',
        `الكلمة: ${newWord}\nهل تريد سماعها؟`,
        [
          { text: 'نعم', onPress: () => playWord(newWord) },
          { text: 'لا' }
        ]
      );

    } catch (error) {
      console.error('🔴 Generate error:', error);
      Alert.alert('خطأ', 'فشل التوليد');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // تحميل الجذور
      const rootsRes = await racineService.getAllRacines();
      const rootsData = Array.isArray(rootsRes) ? rootsRes : rootsRes?.data || [];
      setRoots(rootsData.map((r, i) => ({ id: i.toString(), root: r.racine || r })));

      // تحميل الأوزان
      const schemesRes = await schemeService.getAllSchemes();
      const schemesData = Array.isArray(schemesRes) ? schemesRes : schemesRes?.data || [];
      
      if (schemesData.length > 0) {
        const formattedSchemes = schemesData.map((s, i) => ({
          id: i.toString(),
          name: s.nom || s.name || s.pattern || s.scheme || ''
        })).filter(s => s.name);
        setSchemes(formattedSchemes);
      } else {
        setSchemes(defaultSchemes);
      }
    } catch (error) {
      console.error('🔴 Error:', error);
      setSchemes(defaultSchemes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // تحميل الأصوات عند بدء التشغيل
    if (Platform.OS === 'web' && window.speechSynthesis) {
      // جلب الأصوات
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🎤 الأصوات المتوفرة:', voices.map(v => `${v.name} (${v.lang})`));
        
        // البحث عن صوت عربي
        const arabicVoice = voices.find(v => 
          v.lang.includes('ar') || v.name.includes('Arabic')
        );
        
        if (arabicVoice) {
          console.log('✅ وجدنا صوت عربي:', arabicVoice.name);
        } else {
          console.log('⚠️ لا يوجد صوت عربي');
        }
      };
      
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const renderRootItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, selectedRoot?.id === item.id && styles.selectedModalItem]}
      onPress={() => {
        setSelectedRoot(item);
        setShowRootsModal(false);
      }}
    >
      <Text style={styles.itemText}>{item.root}</Text>
      {selectedRoot?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  const renderSchemeItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, selectedScheme?.id === item.id && styles.selectedModalItem]}
      onPress={() => {
        setSelectedScheme(item);
        setShowSchemesModal(false);
      }}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      {selectedScheme?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* البطاقة الرئيسية */}
      <View style={styles.mainCard}>
        <Text style={styles.title}>🔊 مولد الكلمات بالصوت</Text>
        <Text style={styles.subtitle}>اختر جذراً ونمطاً لتوليد كلمة</Text>

        {/* أزرار الصوت */}
        {Platform.OS === 'web' && (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testVoice}
            >
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={styles.buttonText}>جرب الصوت</Text>
            </TouchableOpacity>
            
            {isPlaying && (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopWord}
              >
                <Ionicons name="stop-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>إيقاف</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* اختيار الجذر */}
        <View style={styles.section}>
          <Text style={styles.label}>🌱 الجذر</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowRootsModal(true)}
          >
            <Text style={selectedRoot ? styles.selectedText : styles.placeholderText}>
              {selectedRoot ? selectedRoot.root : 'اختر جذراً'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* اختيار النمط */}
        <View style={styles.section}>
          <Text style={styles.label}>📐 النمط</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowSchemesModal(true)}
          >
            <Text style={selectedScheme ? styles.selectedText : styles.placeholderText}>
              {selectedScheme ? selectedScheme.name : 'اختر نمطاً'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* زر التوليد */}
        <TouchableOpacity
          style={[styles.generateButton, (!selectedRoot || !selectedScheme) && styles.disabledButton]}
          onPress={handleGenerate}
          disabled={!selectedRoot || !selectedScheme || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>توليد الكلمة</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* النتيجة مع الصوت */}
      {result !== '...' && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>🎯 النتيجة:</Text>
            
            {/* زر الصوت */}
            {Platform.OS === 'web' && (
              <TouchableOpacity 
                onPress={() => playWord(result)} 
                style={styles.soundButton}
                disabled={isPlaying}
              >
                <Ionicons 
                  name={isPlaying ? "sync" : "volume-high"} 
                  size={28} 
                  color={colors.secondary} 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <Animated.Text style={[styles.resultText, { transform: [{ scale: resultScale }] }]}>
            {result}
          </Animated.Text>
        </View>
      )}

      {/* السجل */}
      {generatedWords.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>📜 آخر الكلمات</Text>
          {generatedWords.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => playWord(item.word)}
            >
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 }}>
                <Text style={styles.historyWord}>{item.word}</Text>
                <Ionicons name="volume-low" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.historyDetails}>{item.root} + {item.scheme}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modals */}
      <Modal visible={showRootsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر الجذر</Text>
              <TouchableOpacity onPress={() => setShowRootsModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color={colors.secondary} style={styles.modalLoading} />
            ) : (
              <FlatList
                data={roots}
                renderItem={renderRootItem}
                keyExtractor={item => item.id}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showSchemesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر النمط</Text>
              <TouchableOpacity onPress={() => setShowSchemesModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color={colors.secondary} style={styles.modalLoading} />
            ) : (
              <FlatList
                data={schemes}
                renderItem={renderSchemeItem}
                keyExtractor={item => item.id}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'right',
  },
  picker: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedText: {
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'right',
  },
  placeholderText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'right',
  },
  generateButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  soundButton: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  historyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyDetails: {
    fontSize: 13,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedModalItem: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  itemText: {
    fontSize: 16,
    color: '#0f172a',
  },
  modalLoading: {
    padding: 40,
  },
});