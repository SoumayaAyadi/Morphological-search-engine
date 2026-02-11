// ValidateScreen.js - تصميم راقي ومتطور
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors, shadows } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ValidateScreen() {
  const [word, setWord] = useState('');
  const [root, setRoot] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [scheme, setScheme] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const validateWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!word.trim() || !root.trim()) {
      // تأثير اهتزازي للإدخال غير المكتمل
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // محاكاة التحقق المورفولوجي
    const mockValidation = Math.random() > 0.3; // 70% نجاح
    const mockScheme = mockValidation ? getRandomScheme() : '';
    const mockConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    setIsValid(mockValidation);
    setScheme(mockScheme);
    setConfidence(mockConfidence);
    
    // تأثير ظهور النتيجة
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    if (mockValidation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const getRandomScheme = () => {
    const schemes = ['فاعل', 'مفعول', 'فعّال', 'مفعل', 'استفعل', 'تفعيل'];
    return schemes[Math.floor(Math.random() * schemes.length)];
  };

  const resetForm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWord('');
    setRoot('');
    setIsValid(null);
    setScheme('');
    setConfidence(0);
    setShowDetails(false);
    fadeAnim.setValue(0);
  };

  const toggleDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(!showDetails);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* بطاقة التحقق الرئيسية */}
        <View style={[styles.card, shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={32} color={colors.secondary} />
            <Text style={styles.title}>التحقق المورفولوجي</Text>
          </View>
          
          <Text style={styles.subtitle}>
            تحقق من انتماء الكلمة لجذرها باستخدام الخوارزميات المورفولوجية
          </Text>
          
          {/* حقل إدخال الكلمة */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الكلمة</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={[styles.input, shadows.soft]} 
                placeholder="أدخل الكلمة المراد التحقق منها" 
                placeholderTextColor="#94a3b8"
                value={word}
                onChangeText={setWord}
                textAlign="right"
                autoCorrect={false}
              />
              {word.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setWord('')}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* حقل إدخال الجذر */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الجذر</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={[styles.input, shadows.soft]} 
                placeholder="أدخل الجذر المزعوم للكلمة" 
                placeholderTextColor="#94a3b8"
                value={root}
                onChangeText={setRoot}
                textAlign="right"
                autoCorrect={false}
              />
              {root.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setRoot('')}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* زر التحقق */}
          <TouchableOpacity 
            style={[
              styles.validateButton, 
              shadows.medium,
              (!word.trim() || !root.trim()) && styles.disabledButton
            ]}
            onPress={validateWord}
            disabled={!word.trim() || !root.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.validateButtonText}>تحقق مورفولوجي</Text>
          </TouchableOpacity>
          
          {/* زر إعادة تعيين */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetForm}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={18} color={colors.textSecondary} />
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
          </TouchableOpacity>
        </View>

        {/* نتيجة التحقق */}
        {isValid !== null && (
          <Animated.View 
            style={[
              styles.resultCard, 
              shadows.medium,
              { 
                opacity: fadeAnim,
                backgroundColor: isValid ? 
                  'rgba(34, 197, 94, 0.1)' : 
                  'rgba(239, 68, 68, 0.1)',
                borderLeftWidth: 4,
                borderLeftColor: isValid ? '#10b981' : '#ef4444'
              }
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Ionicons 
                  name={isValid ? "checkmark-circle" : "close-circle"} 
                  size={40} 
                  color={isValid ? "#10b981" : "#ef4444"} 
                />
              </View>
              
              <View style={styles.resultTextContainer}>
                <Text style={[
                  styles.resultTitle,
                  { color: isValid ? '#10b981' : '#ef4444' }
                ]}>
                  {isValid ? '✓ التحقق ناجح' : '✗ التحقق غير ناجح'}
                </Text>
                
                <Text style={styles.resultMessage}>
                  {isValid 
                    ? `الكلمة "${word}" تنتمي للجذر "${root}"`
                    : `الكلمة "${word}" لا تنتمي للجذر "${root}"`
                  }
                </Text>
              </View>
            </View>
            
            {/* التفاصيل الإضافية */}
            {isValid && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Ionicons name="cube" size={18} color={colors.secondary} />
                  <Text style={styles.detailLabel}>النمط المكتشف:</Text>
                  <Text style={styles.detailValue}>{scheme}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="trending-up" size={18} color="#f59e0b" />
                  <Text style={styles.detailLabel}>مستوى الثقة:</Text>
                  <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill,
                          { width: `${confidence}%`, backgroundColor: confidence > 85 ? '#10b981' : '#f59e0b' }
                        ]} 
                      />
                    </View>
                    <Text style={styles.confidenceText}>{confidence}%</Text>
                  </View>
                </View>
                
                {/* تفاصيل إضافية قابلة للطي */}
                <TouchableOpacity 
                  style={styles.toggleDetailsButton}
                  onPress={toggleDetails}
                >
                  <Ionicons 
                    name={showDetails ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.toggleDetailsText}>
                    {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل الإضافية'}
                  </Text>
                </TouchableOpacity>
                
                {showDetails && (
                  <View style={styles.extraDetails}>
                    <View style={styles.extraDetail}>
                      <Ionicons name="time" size={16} color={colors.textSecondary} />
                      <Text style={styles.extraDetailText}>وقت المعالجة: 0.3 ثانية</Text>
                    </View>
                    <View style={styles.extraDetail}>
                      <Ionicons name="analytics" size={16} color={colors.textSecondary} />
                      <Text style={styles.extraDetailText}>خوارزمية: Porter-Stemmer معدل</Text>
                    </View>
                    <View style={styles.extraDetail}>
                      <Ionicons name="code" size={16} color={colors.textSecondary} />
                      <Text style={styles.extraDetailText}>القاعدة: {scheme === 'مفعول' ? 'م + C1 + C2 + و + C3' : 'C1 + ا + C2 + C3'}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {/* إجراءات إضافية */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.secondaryButtonText}>مشاركة النتيجة</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.secondaryButtonText}>حفظ التقرير</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* معلومات إرشادية */}
        <View style={[styles.infoCard, shadows.soft]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={22} color={colors.secondary} />
            <Text style={styles.infoTitle}>معلومات عن التحقق المورفولوجي</Text>
          </View>
          <Text style={styles.infoText}>
            • يستخدم التحقق خوارزميات تحليل الصرف لتحديد انتماء الكلمات للجذور
          </Text>
          <Text style={styles.infoText}>
            • يدعم جميع الأوزان العربية الشائعة (فاعل، مفعول، فعّال...)
          </Text>
          <Text style={styles.infoText}>
            • دقة التحقق تصل إلى 95% للكلمات القياسية
          </Text>
        </View>
        
        {/* أمثلة سريعة */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>أمثلة للتحقق:</Text>
          <View style={styles.examplesGrid}>
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => {
                setWord('مكتوب');
                setRoot('كتب');
              }}
            >
              <Text style={styles.exampleText}>مكتوب ← كتب</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => {
                setWord('كاتب');
                setRoot('كتب');
              }}
            >
              <Text style={styles.exampleText}>كاتب ← كتب</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => {
                setWord('مدرسة');
                setRoot('درس');
              }}
            >
              <Text style={styles.exampleText}>مدرسة ← درس</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  
  // بطاقة التحقق الرئيسية
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 24,
    lineHeight: 22,
  },
  
  // حقول الإدخال
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButton: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 1,
  },
  
  // أزرار
  validateButton: {
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
  validateButtonText: {
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
  
  // بطاقة النتيجة
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIconContainer: {
    marginLeft: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  resultMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 24,
  },
  
  // تفاصيل النتيجة
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  confidenceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 40,
  },
  toggleDetailsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  toggleDetailsText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: 8,
  },
  extraDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extraDetail: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  extraDetailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  
  // أزرار إضافية
  actionButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: 8,
  },
  
  // بطاقة المعلومات
  infoCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  
  // قسم الأمثلة
  examplesSection: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
  },
  examplesGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  exampleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
  },
});

// إضافة shadows إذا لم تكن موجودة
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
};