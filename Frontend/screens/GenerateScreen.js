// GenerateScreen.js - تصميم راقي ومتطور
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Modal,
  FlatList
} from 'react-native';
import { colors, shadows } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function GenerateScreen() {
  const [result, setResult] = useState('...');
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showRootsModal, setShowRootsModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [animationValue] = useState(new Animated.Value(0));
  const [resultScale] = useState(new Animated.Value(1));

  // بيانات الأمثلة
  const sampleRoots = [
    { id: '1', root: 'كتب', meaning: 'الكتابة', frequency: 'عالية' },
    { id: '2', root: 'درس', meaning: 'التعليم', frequency: 'عالية' },
    { id: '3', root: 'علم', meaning: 'المعرفة', frequency: 'متوسطة' },
    { id: '4', root: 'عمل', meaning: 'الفعل', frequency: 'عالية' },
    { id: '5', root: 'حكم', meaning: 'القضاء', frequency: 'متوسطة' },
    { id: '6', root: 'سفر', meaning: 'السفر', frequency: 'منخفضة' },
    { id: '7', root: 'شرح', meaning: 'التوضيح', frequency: 'متوسطة' },
    { id: '8', root: 'نظر', meaning: 'الرؤية', frequency: 'عالية' },
  ];

  const sampleSchemes = [
    { id: '1', name: 'فاعل', rule: 'C1 + ا + C2 + C3', examples: 'كاتب، دارس' },
    { id: '2', name: 'مفعول', rule: 'م + C1 + C2 + و + C3', examples: 'مكتوب، معلوم' },
    { id: '3', name: 'فعّال', rule: 'C1 + C2 + ا + C3', examples: 'كتّاب، علّام' },
    { id: '4', name: 'مفعل', rule: 'م + C1 + C2 + C3', examples: 'مكتب، مدرس' },
    { id: '5', name: 'استفعل', rule: 'ا + س + ت + C1 + C2 + C3', examples: 'استخدم، استعلم' },
    { id: '6', name: 'تفعيل', rule: 'ت + C1 + C2 + ي + C3', examples: 'تطوير، تنظيم' },
  ];

  const handleGenerate = () => {
    if (!selectedRoot || !selectedScheme) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // محاكاة توليد الكلمة
    setTimeout(() => {
      const generatedWordsMap = {
        'كتب': {
          'فاعل': 'كاتب',
          'مفعول': 'مكتوب',
          'فعّال': 'كتّاب',
          'مفعل': 'مكتب',
          'استفعل': 'استكتب',
          'تفعيل': 'كتابة',
        },
        'درس': {
          'فاعل': 'دارس',
          'مفعول': 'مدروس',
          'فعّال': 'درّاس',
          'مفعل': 'مدرس',
          'استفعل': 'استدرك',
          'تفعيل': 'تدريس',
        },
        'علم': {
          'فاعل': 'عالم',
          'مفعول': 'معلوم',
          'فعّال': 'علّام',
          'مفعل': 'معلَم',
          'استفعل': 'استعلم',
          'تفعيل': 'تعليم',
        },
      };

      const newWord = generatedWordsMap[selectedRoot.root]?.[selectedScheme.name] || 'مولد';

      setResult(newWord);
      setIsGenerating(false);

      // إضافة للقائمة
      const newEntry = {
        id: Date.now().toString(),
        word: newWord,
        root: selectedRoot.root,
        scheme: selectedScheme.name,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setGeneratedWords(prev => [newEntry, ...prev].slice(0, 10));

      // تأثيرات الرسوم المتحركة
      Animated.sequence([
        Animated.timing(resultScale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(resultScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  };

  const renderRootItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedRoot?.id === item.id && styles.selectedModalItem,
      ]}
      onPress={() => {
        setSelectedRoot(item);
        setShowRootsModal(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemRoot}>{item.root}</Text>
          <View style={[
            styles.frequencyBadge,
            { backgroundColor: getFrequencyColor(item.frequency) }
          ]}>
            <Text style={styles.frequencyText}>{item.frequency}</Text>
          </View>
        </View>
        <Text style={styles.itemMeaning}>{item.meaning}</Text>
      </View>
      <Ionicons 
        name="checkmark-circle" 
        size={24} 
        color={selectedRoot?.id === item.id ? colors.secondary : 'transparent'} 
      />
    </TouchableOpacity>
  );

  const renderSchemeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedScheme?.id === item.id && styles.selectedModalItem,
      ]}
      onPress={() => {
        setSelectedScheme(item);
        setShowSchemesModal(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemRoot}>{item.name}</Text>
          <Text style={styles.itemRule}>{item.rule}</Text>
        </View>
        <Text style={styles.itemExamples}>مثال: {item.examples}</Text>
      </View>
      <Ionicons 
        name="checkmark-circle" 
        size={24} 
        color={selectedScheme?.id === item.id ? colors.secondary : 'transparent'} 
      />
    </TouchableOpacity>
  );

  const getFrequencyColor = (frequency) => {
    switch(frequency) {
      case 'عالية': return 'rgba(34, 197, 94, 0.2)';
      case 'متوسطة': return 'rgba(245, 158, 11, 0.2)';
      case 'منخفضة': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  };

  const clearSelection = () => {
    setSelectedRoot(null);
    setSelectedScheme(null);
    setResult('...');
    setGeneratedWords([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* بطاقة التوليد الرئيسية */}
      <View style={[styles.mainCard, shadows.medium]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="sparkles" size={32} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.title}>مولد الكلمات العربية</Text>
            <Text style={styles.subtitle}>استخدم الجذور والأنماط لتوليد كلمات جديدة</Text>
          </View>
        </View>

        {/* اختيار الجذر */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cube-outline" size={18} /> اختر الجذر (من AVL Tree)
          </Text>
          <TouchableOpacity
            style={[styles.picker, shadows.soft]}
            onPress={() => {
              setShowRootsModal(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.pickerContent}>
              {selectedRoot ? (
                <>
                  <View style={styles.selectedItem}>
                    <Text style={styles.selectedRootText}>{selectedRoot.root}</Text>
                    <Text style={styles.selectedMeaning}>{selectedRoot.meaning}</Text>
                  </View>
                  <View style={[
                    styles.frequencyBadgeSmall,
                    { backgroundColor: getFrequencyColor(selectedRoot.frequency) }
                  ]}>
                    <Text style={styles.frequencyTextSmall}>{selectedRoot.frequency}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.pickerPlaceholderText}>اختر جذراً من القائمة</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* اختيار النمط */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="code-working" size={18} /> اختر النمط (من Hash Table)
          </Text>
          <TouchableOpacity
            style={[styles.picker, shadows.soft]}
            onPress={() => {
              setShowSchemesModal(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.pickerContent}>
              {selectedScheme ? (
                <View style={styles.selectedItem}>
                  <Text style={styles.selectedSchemeName}>{selectedScheme.name}</Text>
                  <Text style={styles.selectedSchemeRule}>{selectedScheme.rule}</Text>
                </View>
              ) : (
                <Text style={styles.pickerPlaceholderText}>اختر نمطاً من القائمة</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* زر التوليد */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            shadows.medium,
            (!selectedRoot || !selectedScheme || isGenerating) && styles.disabledButton,
          ]}
          onPress={handleGenerate}
          disabled={!selectedRoot || !selectedScheme || isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <View style={styles.generatingContainer}>
              <Ionicons name="sync" size={20} color="#fff" style={styles.spinningIcon} />
              <Text style={styles.generateButtonText}>جاري التوليد...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="flash" size={22} color="#fff" />
              <Text style={styles.generateButtonText}>توليد الكلمة</Text>
            </>
          )}
        </TouchableOpacity>

        {/* زر إعادة تعيين */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={clearSelection}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={colors.textSecondary} />
          <Text style={styles.resetButtonText}>إعادة تعيين</Text>
        </TouchableOpacity>
      </View>

      {/* عرض النتيجة */}
      <View style={[styles.resultContainer, shadows.medium]}>
        <Text style={styles.resultLabel}>الكلمة المولدة:</Text>
        <Animated.Text 
          style={[
            styles.resultText,
            { transform: [{ scale: resultScale }] }
          ]}
        >
          {result}
        </Animated.Text>
        {selectedRoot && selectedScheme && (
          <Text style={styles.resultFormula}>
            {selectedRoot.root} + {selectedScheme.name} = {result}
          </Text>
        )}
      </View>

      {/* سجل الكلمات المولدة */}
      {generatedWords.length > 0 && (
        <View style={[styles.historyCard, shadows.medium]}>
          <View style={styles.historyHeader}>
            <Ionicons name="time-outline" size={22} color={colors.secondary} />
            <Text style={styles.historyTitle}>سجل التوليد</Text>
            <TouchableOpacity onPress={() => setGeneratedWords([])}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={generatedWords}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyWord}>{item.word}</Text>
                  <Text style={styles.historyDetails}>
                    من {item.root} بـ {item.scheme}
                  </Text>
                </View>
                <Text style={styles.historyTime}>{item.timestamp}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* معلومات إرشادية */}
      <View style={[styles.infoCard, shadows.soft]}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={22} color={colors.secondary} />
          <Text style={styles.infoTitle}>كيف يعمل المولد؟</Text>
        </View>
        <Text style={styles.infoText}>
          1. يتم استرجاع الجذور من شجرة AVL المحسنة للبحث
        </Text>
        <Text style={styles.infoText}>
          2. يتم تطبيق الأنماط من جدول الهاش للتحويل
        </Text>
        <Text style={styles.infoText}>
          3. توليد الكلمة باستخدام الخوارزميات المورفولوجية
        </Text>
      </View>

      {/* نماذج الاختيار */}
      <Modal
        visible={showRootsModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.large]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر الجذر</Text>
              <TouchableOpacity onPress={() => setShowRootsModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sampleRoots}
              renderItem={renderRootItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSchemesModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.large]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر النمط</Text>
              <TouchableOpacity onPress={() => setShowSchemesModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sampleSchemes}
              renderItem={renderSchemeItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  
  // بطاقة التوليد الرئيسية
  mainCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // أقسام الاختيار
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  picker: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  selectedItem: {
    flex: 1,
  },
  selectedRootText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  selectedMeaning: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  selectedSchemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  selectedSchemeRule: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  frequencyBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  frequencyTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  // أزرار
  generateButton: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    opacity: 0.7,
  },
  generatingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  resetButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 12,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  
  // نتيجة التوليد
  resultContainer: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(79, 70, 229, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  resultFormula: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  
  // سجل التوليد
  historyCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  historyItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  historyItemContent: {
    flex: 1,
  },
  historyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  historyDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  
  // معلومات إرشادية
  infoCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 6,
    lineHeight: 22,
  },
  
  // نماذج الاختيار
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedModalItem: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemRoot: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  itemRule: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: 'monospace',
  },
  frequencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemMeaning: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  itemExamples: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

// إضافة shadows إضافية
const localShadows = {
  soft: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  large: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};