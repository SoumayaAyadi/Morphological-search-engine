// ValidateScreen.js - نسخة فاخرة مع تصميم متطور ✅
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator, Animated, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { morphologyService } from '../services/morphologyService';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#ffffff',
  secondary: '#4f46e5',
  secondaryLight: '#818cf8',
  secondaryDark: '#3730a3',
  accent: '#f59e0b',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  success: '#10b981',
  successLight: '#d1fae5',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export default function ValidateScreen() {
  const [word, setWord] = useState('');
  const [root, setRoot] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [scheme, setScheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('validate'); // 'validate' or 'analyze'
  
  // أنيميشن
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    startPulseAnimation();
    startRotateAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const validateWord = async () => {
    if (!word.trim() || !root.trim()) {
      setError('الرجاء إدخال الكلمة والجذر');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await morphologyService.validateWord(root.trim(), word.trim());
      console.log('✅ Validate response:', response);
      
      let validValue = false;
      let schemeValue = '';
      
      if (response && response.success) {
        if (response.data) {
          validValue = response.data.valid === true;
          schemeValue = response.data.scheme || '';
        }
      } else if (response && response.data) {
        validValue = response.data.valid === true;
        schemeValue = response.data.scheme || '';
      } else if (response && response.valid !== undefined) {
        validValue = response.valid === true;
        schemeValue = response.scheme || '';
      }
      
      // أنيميشن النتيجة
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
      
      setIsValid(validValue);
      setScheme(schemeValue);
      
      if (validValue) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
    } catch (err) {
      console.error('Validation error:', err);
      setError('فشل الاتصال بالخادم');
      setIsValid(null);
      setScheme('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWord = async () => {
    if (!word.trim()) {
      setError('الرجاء إدخال كلمة للتحليل');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await morphologyService.analyzeWord(word.trim());
      console.log('✅ Analyze response:', response);
      
      let found = false;
      let rootValue = '';
      let schemeValue = '';
      
      if (response && response.data) {
        if (response.data.found) {
          found = true;
          rootValue = response.data.racine || '';
          schemeValue = response.data.scheme || '';
        }
      } else if (response && response.found) {
        found = true;
        rootValue = response.racine || '';
        schemeValue = response.scheme || '';
      }
      
      if (found) {
        setRoot(rootValue);
        setScheme(schemeValue);
        setIsValid(true);
        
        // أنيميشن
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError('لم يتم العثور على تحليل لهذه الكلمة');
        setIsValid(false);
        setScheme('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('فشل الاتصال بالخادم');
      setIsValid(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setWord('');
    setRoot('');
    setIsValid(null);
    setScheme('');
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    Haptics.selectionAsync();
    resetForm();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* خلفية متحركة فاخرة */}
      <Animated.View 
        style={[
          styles.backgroundCircle1,
          { transform: [{ rotate: rotateInterpolation }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.backgroundCircle2,
          { transform: [{ rotate: rotateInterpolation }] }
        ]} 
      />
      
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.1)', 'transparent']}
        style={styles.backgroundGradient}
      />
      
      {/* نقاط متحركة */}
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.floatingDot,
            {
              top: `${10 + i * 15}%`,
              left: `${5 + i * 18}%`,
              opacity: 0.1,
              transform: [
                { scale: pulseAnim },
                { translateY: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20 * (i % 2 === 0 ? 1 : -1)]
                })}
              ]
            }
          ]}
        />
      ))}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* الهيدر الفاخر */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#4f46e5', '#818cf8', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerIconContainer}>
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>المدقق الصرفي</Text>
            <Text style={styles.subtitle}>تحقق من صحة الكلمات بدقة عالية</Text>
          </LinearGradient>
        </Animated.View>

        {/* تبويبات التنقل */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'validate' && styles.activeTab]}
            onPress={() => handleTabPress('validate')}
          >
            <LinearGradient
              colors={activeTab === 'validate' ? ['#4f46e5', '#818cf8'] : ['#f1f5f9', '#f1f5f9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabGradient}
            >
              <Ionicons 
                name="checkmark-done-circle" 
                size={20} 
                color={activeTab === 'validate' ? '#fff' : '#64748b'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'validate' && styles.activeTabText
              ]}>تحقق</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analyze' && styles.activeTab]}
            onPress={() => handleTabPress('analyze')}
          >
            <LinearGradient
              colors={activeTab === 'analyze' ? ['#4f46e5', '#818cf8'] : ['#f1f5f9', '#f1f5f9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabGradient}
            >
              <Ionicons 
                name="search-circle" 
                size={20} 
                color={activeTab === 'analyze' ? '#fff' : '#64748b'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'analyze' && styles.activeTabText
              ]}>تحليل</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* بطاقة الإدخال الفاخرة */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: scaleAnim }] }]}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cardGradient}
          >
            {/* زخرفة البطاقة */}
            <View style={styles.cardPattern} />
            
            {/* حقل الكلمة */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                <Ionicons name="text" size={14} color="#4f46e5" /> الكلمة
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="اكتب الكلمة هنا..."
                  placeholderTextColor="#94a3b8"
                  value={word}
                  onChangeText={setWord}
                  textAlign="right"
                />
                {word.length > 0 && (
                  <TouchableOpacity onPress={() => setWord('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
                <View style={styles.inputIcon}>
                  <Ionicons name="create" size={20} color="#4f46e5" />
                </View>
              </View>
            </View>

            {/* حقل الجذر - يظهر فقط في وضع التحقق */}
            {activeTab === 'validate' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  <Ionicons name="git-branch" size={14} color="#4f46e5" /> الجذر
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل الجذر الثلاثي..."
                    placeholderTextColor="#94a3b8"
                    value={root}
                    onChangeText={setRoot}
                    textAlign="right"
                    maxLength={3}
                  />
                  {root.length > 0 && (
                    <TouchableOpacity onPress={() => setRoot('')} style={styles.clearButton}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.inputIcon}>
                    <Ionicons name="leaf" size={20} color="#4f46e5" />
                  </View>
                </View>
              </View>
            )}

            {/* رسالة الخطأ */}
            {error ? (
              <Animated.View style={[styles.errorBox, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* زر الإجراء الرئيسي */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={activeTab === 'validate' ? validateWord : analyzeWord}
              disabled={loading || (activeTab === 'validate' ? (!word.trim() || !root.trim()) : !word.trim())}
            >
              <LinearGradient
                colors={['#4f46e5', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>
                      {activeTab === 'validate' ? 'تحقق من الصحة' : 'تحليل الكلمة'}
                    </Text>
                    <View style={styles.actionButtonIcon}>
                      <Ionicons 
                        name={activeTab === 'validate' ? "checkmark-done" : "search"} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* زر إعادة التعيين */}
            {(word || root) && (
              <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
                <Ionicons name="refresh" size={16} color="#64748b" />
                <Text style={styles.resetText}>إعادة تعيين</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

        {/* النتيجة الفاخرة */}
        {isValid !== null && (
          <Animated.View style={[styles.resultContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={isValid ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultGradient}
            >
              {/* تأثير الشرر */}
              <View style={styles.sparklesContainer}>
                {[...Array(5)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.sparkle,
                      {
                        left: 20 + i * 30,
                        opacity: pulseAnim,
                        transform: [{ scale: pulseAnim }]
                      }
                    ]}
                  />
                ))}
              </View>

              <View style={styles.resultIconContainer}>
                <Ionicons 
                  name={isValid ? "checkmark-circle" : "close-circle"} 
                  size={60} 
                  color="#fff" 
                />
              </View>
              
              <Text style={styles.resultTitle}>
                {isValid ? 'كلمة صحيحة ✓' : 'كلمة غير صحيحة ✗'}
              </Text>
              
              <Text style={styles.resultText}>
                {isValid 
                  ? `"${word}" ← "${root}"` 
                  : `"${word}" لا تنتمي لجذر "${root}"`}
              </Text>

              {isValid && scheme && (
                <View style={styles.schemeContainer}>
                  <View style={styles.schemeBadge}>
                    <Ionicons name="color-filter" size={16} color="#10b981" />
                    <Text style={styles.schemeBadgeText}>{scheme}</Text>
                  </View>
                </View>
              )}

              {/* معلومات إضافية */}
              {isValid && (
                <View style={styles.additionalInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.infoText}>تحقق فوري</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="shield" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.infoText}>دقة 100%</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        )}

        {/* نصائح سريعة */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.tipText}>الجذر يجب أن يكون 3 أحرف</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.tipText}>يمكنك تحليل أي كلمة عربية</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  
  // خلفية متحركة
  backgroundCircle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(79, 70, 229, 0.03)',
    top: -width * 0.4,
    right: -width * 0.2,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(129, 140, 248, 0.03)',
    bottom: -width * 0.6,
    left: -width * 0.3,
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4f46e5',
  },
  
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  
  // هيدر فاخر
  header: {
    marginBottom: 25,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  headerGradient: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // تبويبات
  tabContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  tab: {
    flex: 1,
    borderRadius: 45,
    overflow: 'hidden',
  },
  tabGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // بطاقة الإدخال
  card: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardGradient: {
    padding: 25,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(79, 70, 229, 0.03)',
    borderRadius: 60,
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },
  
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    paddingRight: 45,
    paddingLeft: 45,
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'right',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 15,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtonIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  resetButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 5,
  },
  resetText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // النتيجة
  resultContainer: {
    marginTop: 25,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  resultGradient: {
    padding: 30,
    alignItems: 'center',
    position: 'relative',
  },
  sparklesContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: '#ffd700',
    borderRadius: 7.5,
    opacity: 0.3,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.9,
  },
  schemeContainer: {
    marginTop: 10,
  },
  schemeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  schemeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  additionalInfo: {
    flexDirection: 'row-reverse',
    marginTop: 20,
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  
  // نصائح
  tipsContainer: {
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
});