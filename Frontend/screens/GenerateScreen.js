// GenerateScreen.js - نسخة مصححة لعرض الكلمة فقط ✅
import React, { useState, useEffect } from 'react';
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
  Alert
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
    { id: '7', name: 'تفعيل' },
    { id: '8', name: 'فعال' },
    { id: '9', name: 'فعيل' },
    { id: '10', name: 'فعولة' },
  ];

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔵 جاري تحميل البيانات...');
      
      // تحميل الجذور
      let rootsData = [];
      try {
        const rootsRes = await racineService.getAllRacines();
        console.log('🔵 rootsRes:', rootsRes);
        
        if (Array.isArray(rootsRes)) {
          rootsData = rootsRes;
        } else if (rootsRes && rootsRes.data) {
          rootsData = rootsRes.data;
        }
      } catch (error) {
        console.error('🔴 Error loading roots:', error);
      }
      
      setRoots(rootsData.map((r, i) => ({ 
        id: i.toString(), 
        root: r.racine || r 
      })));

      // تحميل الأوزان
      let schemesData = [];
      try {
        const schemesRes = await schemeService.getAllSchemes();
        console.log('🔵 schemesRes:', schemesRes);
        
        if (Array.isArray(schemesRes)) {
          schemesData = schemesRes;
        } else if (schemesRes && schemesRes.data) {
          schemesData = schemesRes.data;
        }
      } catch (error) {
        console.error('🔴 Error loading schemes:', error);
      }
      
      console.log('🔵 schemesData length:', schemesData.length);
      
      // تحويل الأوزان للشكل المطلوب
      const formattedSchemes = schemesData.map((s, index) => {
        let name = '';
        
        if (typeof s === 'string') {
          name = s;
        } else if (s && typeof s === 'object') {
          name = s.nom || s.name || s.pattern || s.scheme || '';
        }
        
        return {
          id: index.toString(),
          name: name,
        };
      }).filter(s => s.name);
      
      console.log('🔵 formattedSchemes:', formattedSchemes);
      
      // إذا كانت الأوزان فاضية، استعمل الافتراضية
      if (formattedSchemes.length === 0) {
        console.log('⚠️ استعمال الأوزان الافتراضية');
        setSchemes(defaultSchemes);
      } else {
        setSchemes(formattedSchemes);
      }
      
    } catch (error) {
      console.error('🔴 Error loading data:', error);
      // في حالة الخطأ، استعمل الأوزان الافتراضية
      setSchemes(defaultSchemes);
    } finally {
      setLoading(false);
    }
  };

  // توليد كلمة
  const handleGenerate = async () => {
    if (!selectedRoot || !selectedScheme) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('تنبيه', 'اختر الجذر والنمط أولاً');
      return;
    }

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('🔵 Generating:', selectedRoot.root, selectedScheme.name);
      
      const response = await morphologyService.generateWord(selectedRoot.root, selectedScheme.name);
      console.log('🔵 Generate response:', response);
      
      // ✅ استخراج الكلمة من البيانات - هذا هو المهم!
      let newWord = '...';
      
      if (response?.data?.motGenere) {
        // الشكل الحالي: { data: { motGenere: "استجما" } }
        newWord = response.data.motGenere;
      } else if (response?.motGenere) {
        // شكل آخر: { motGenere: "استجما" }
        newWord = response.motGenere;
      } else if (response?.data?.word) {
        newWord = response.data.word;
      } else if (response?.word) {
        newWord = response.word;
      } else if (typeof response === 'string') {
        newWord = response;
      } else {
        // إذا ما لقيتش الكلمة، اعرض JSON (للتشخيص)
        console.log('⚠️ Unknown response format:', response);
        newWord = JSON.stringify(response);
      }
      
      console.log('✅ Extracted word:', newWord);
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('🔴 Generate error:', error);
      Alert.alert('خطأ', 'فشل التوليد: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRootItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, selectedRoot?.id === item.id && styles.selectedModalItem]}
      onPress={() => {
        console.log('🔵 Root selected:', item);
        setSelectedRoot(item);
        setShowRootsModal(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <Text style={styles.itemText}>{item.root}</Text>
      {selectedRoot?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  const renderSchemeItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.modalItem, selectedScheme?.id === item.id && styles.selectedModalItem]}
        onPress={() => {
          console.log('🔵 Scheme selected:', item);
          setSelectedScheme(item);
          setShowSchemesModal(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={styles.itemText}>{item.name}</Text>
        {selectedScheme?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
        )}
      </TouchableOpacity>
    );
  };

  const clearSelection = () => {
    setSelectedRoot(null);
    setSelectedScheme(null);
    setResult('...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // دالة لعرض الأوزان المتوفرة
  const showAvailableSchemes = () => {
    const schemesList = schemes.map(s => s.name).join('، ');
    Alert.alert(
      'الأوزان المتوفرة',
      `عدد الأوزان: ${schemes.length}\n\n${schemesList}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* البطاقة الرئيسية */}
      <View style={styles.mainCard}>
        <Text style={styles.title}>مولد الكلمات</Text>
        <Text style={styles.subtitle}>اختر جذراً ونمطاً لتوليد كلمة جديدة</Text>

    

        {/* اختيار الجذر */}
        <View style={styles.section}>
          <Text style={styles.label}>الجذر</Text>
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
          <Text style={styles.label}>النمط</Text>
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
            <Text style={styles.generateButtonText}>توليد</Text>
          )}
        </TouchableOpacity>

        {/* إعادة تعيين */}
        {(selectedRoot || selectedScheme) && (
          <TouchableOpacity onPress={clearSelection} style={styles.resetButton}>
            <Text style={styles.resetText}>إعادة تعيين</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* النتيجة */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>النتيجة:</Text>
        <Animated.Text style={[styles.resultText, { transform: [{ scale: resultScale }] }]}>
          {result}
        </Animated.Text>
      </View>

      {/* السجل */}
      {generatedWords.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>آخر الكلمات</Text>
          {generatedWords.map(item => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyWord}>{item.word}</Text>
              <Text style={styles.historyDetails}>{item.root} + {item.scheme}</Text>
            </View>
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
  listButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  listButtonText: {
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
  resetButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  resetText: {
    color: '#64748b',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4f46e5',
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
///la genration te5dem jawha behya 
//juste lezem nziid el sound//