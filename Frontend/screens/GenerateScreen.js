import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Animated, Modal, FlatList, ActivityIndicator, Alert, Platform, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { morphologyService } from '../services/morphologyService';
import { racineService } from '../services/racineService';
import { schemeService } from '../services/schemeService';

const { width } = Dimensions.get('window');

export default function GenerateScreen() {
  const [result, setResult] = useState('...');
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showRootsModal, setShowRootsModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roots, setRoots] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [recentGenerations, setRecentGenerations] = useState([]);
  
  const resultScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, useNativeDriver: true })
    ]).start();
    startRotateAnimation();
  }, []);

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const playWord = (word) => {
    if (!word || word === '...') return;
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      Speech.stop();
      Speech.speak(word, {
        language: 'ar',
        pitch: 1.1,
        rate: 0.85,
        onStart: () => setIsPlaying(true),
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedRoot || !selectedScheme) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('تنبيه', 'الرجاء اختيار الجذر والوزن');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);
    
    try {
      const response = await morphologyService.generateWord(selectedRoot.root, selectedScheme.name);
      const newWord = response?.data?.motGenere || response?.motGenere || '...';
      
      // تأثير توليد رائع
      Animated.sequence([
        Animated.timing(resultScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1, friction: 4, useNativeDriver: true })
      ]).start();
      
      setResult(newWord);
      
      // إضافة إلى التوليدات الأخيرة
      setRecentGenerations(prev => {
        const newGen = {
          id: Date.now().toString(),
          word: newWord,
          root: selectedRoot.root,
          scheme: selectedScheme.name
        };
        return [newGen, ...prev.slice(0, 4)];
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // تشغيل الكلمة تلقائياً بعد التوليد
      setTimeout(() => playWord(newWord), 300);
      
    } catch (error) {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadData = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        racineService.getAllRacines(),
        schemeService.getAllSchemes()
      ]);
      
      // تنسيق الجذور مع ترتيب أبجدي
      const formattedRoots = (Array.isArray(rRes) ? rRes : rRes?.data || [])
        .map((r, i) => ({ 
          id: i.toString(), 
          root: r.racine || r,
          original: r
        }))
        .sort((a, b) => a.root.localeCompare(b.root, 'ar'));
      
      // تنسيق الأوزان
      const formattedSchemes = (Array.isArray(sRes) ? sRes : sRes?.data || [])
        .map((s, i) => ({ 
          id: i.toString(), 
          name: s.nom || s.name || s.scheme,
          description: s.description || 'وزن صرفي'
        }));
      
      setRoots(formattedRoots);
      setSchemes(formattedSchemes);
      
    } catch (e) { 
      console.log("Load error", e); 
    }
  };

  const renderSelector = (label, value, placeholder, icon, onPress) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.glassSelector} 
        onPress={onPress}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name={icon} size={22} color="#fff" />
        </LinearGradient>
        
        <Text style={value ? styles.selectedText : styles.placeholderText}>
          {value ? (label === "الجذر" ? value.root : value.name) : placeholder}
        </Text>
        
        <View style={styles.chevronCircle}>
          <Ionicons name="chevron-down" size={18} color="#667eea" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => {
        setResult(item.word);
        playWord(item.word);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={styles.recentItemContent}>
        <Text style={styles.recentWord}>{item.word}</Text>
        <View style={styles.recentMeta}>
          <View style={styles.recentTag}>
            <Ionicons name="git-branch" size={10} color="#667eea" />
            <Text style={styles.recentTagText}>{item.root}</Text>
          </View>
          <View style={styles.recentTag}>
            <Ionicons name="color-filter" size={10} color="#764ba2" />
            <Text style={styles.recentTagText}>{item.scheme}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="play-circle" size={24} color="#667eea" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* خلفية متحركة متطورة */}
      <Animated.View style={[styles.backgroundCircle, { transform: [{ rotate: rotateInterpolation }] }]} />
      <View style={styles.backgroundGradient} />
      
      {/* نقاط متحركة في الخلفية */}
      {[...Array(5)].map((_, i) => (
        <Animated.View 
          key={i}
          style={[
            styles.floatingDot,
            {
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              opacity: 0.1 + i * 0.05,
              transform: [
                { scale: 0.8 + i * 0.2 },
                { translateY: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30 * (i % 2 === 0 ? 1 : -1)]
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
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.brandTitle}>صرفي</Text>
            <Text style={styles.brandSubtitle}>مختبر القوالب اللغوية</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardPattern} />
          
          {renderSelector("الجذر", selectedRoot, "اختر جذر الكلمة", "leaf", () => { 
            Haptics.selectionAsync(); 
            setShowRootsModal(true); 
          })}
          
          {renderSelector("الوزن", selectedScheme, "اختر قالب الوزن", "color-filter", () => { 
            Haptics.selectionAsync(); 
            setShowSchemesModal(true); 
          })}

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={(!selectedRoot || !selectedScheme) ? ['#cbd5e1', '#94a3b8'] : ['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateBtn}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.generateBtnText}>توليد الكلمة</Text>
                  <View style={styles.generateIconContainer}>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {result !== '...' && (
          <Animated.View style={[styles.resultArea, { transform: [{ scale: resultScale }] }]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultGradient}
            >
              <View style={styles.resultSparkles}>
                {[...Array(3)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.sparkle,
                      {
                        left: 20 + i * 40,
                        opacity: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.8]
                        })
                      }
                    ]}
                  />
                ))}
              </View>
              
              <Text style={styles.resultHint}>النتيجة النهائية</Text>
              <Text style={styles.resultText}>{result}</Text>
              
              <TouchableOpacity 
                activeOpacity={0.9}
                style={[styles.playBtn, isPlaying && styles.playBtnActive]} 
                onPress={() => playWord(result)}
              >
                <LinearGradient
                  colors={isPlaying ? ['#10b981', '#059669'] : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playBtnGradient}
                >
                  <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={28} 
                    color="#fff" 
                  />
                  <Text style={styles.playBtnText}>
                    {isPlaying ? "جاري النطق..." : "استمع الآن"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {recentGenerations.length > 0 && (
          <Animated.View style={[styles.recentSection, { opacity: fadeAnim }]}>
            <View style={styles.recentHeader}>
              <Ionicons name="time" size={20} color="#667eea" />
              <Text style={styles.recentTitle}>آخر التوليدات</Text>
            </View>
            
            <FlatList
              data={recentGenerations}
              renderItem={renderRecentItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.recentList}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Modal متطور */}
      <Modal visible={showRootsModal || showSchemesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalSheet]}>
            <View style={styles.modalHandle} />
            
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeaderGradient}
            >
              <Text style={styles.modalTitle}>
                {showRootsModal ? "📚 الجذور المتوفرة" : "⚖️ الأوزان الصرفية"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {showRootsModal ? roots.length : schemes.length} عنصر
              </Text>
            </LinearGradient>
            
            <FlatList
              data={showRootsModal ? roots : schemes}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => {
                    if(showRootsModal) setSelectedRoot(item); 
                    else setSelectedScheme(item);
                    setShowRootsModal(false); 
                    setShowSchemesModal(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <View style={styles.modalItemIcon}>
                      <Ionicons 
                        name={showRootsModal ? "git-network" : "color-filter"} 
                        size={20} 
                        color="#667eea" 
                      />
                    </View>
                    <View>
                      <Text style={styles.modalItemText}>
                        {item.root || item.name}
                      </Text>
                      {item.description && (
                        <Text style={styles.modalItemDesc}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.modalItemBullet} />
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowRootsModal(false); 
                setShowSchemesModal(false);
              }}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f3ff' 
  },
  
  // خلفية متحركة
  backgroundCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(102, 126, 234, 0.03)',
    top: -width * 0.5,
    right: -width * 0.25,
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%)',
  },
  floatingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  
  scrollContent: { 
    padding: 20, 
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // Header متطور
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerGradient: {
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 40,
    backgroundColor: '#fff',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  brandTitle: { 
    fontSize: 40, 
    fontWeight: '900', 
    color: '#fff', 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  brandAccent: {
    color: '#ffd700',
    fontSize: 40,
  },
  brandSubtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.9)', 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 5,
  },
  
  // البطاقة الرئيسية
  mainCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: 30, 
    padding: 25, 
    shadowColor: '#667eea', 
    shadowOpacity: 0.15, 
    shadowRadius: 20, 
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.03)',
    borderRadius: 75,
    transform: [{ translateX: 50 }, { translateY: -50 }],
  },
  
  inputWrapper: { 
    marginBottom: 20,
    zIndex: 2,
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#4b5563', 
    marginBottom: 8, 
    marginRight: 8, 
    textAlign: 'right' 
  },
  glassSelector: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#e9eef3',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedText: { 
    flex: 1, 
    textAlign: 'right', 
    fontSize: 16, 
    color: '#1e293b', 
    fontWeight: '700', 
    marginHorizontal: 12 
  },
  placeholderText: { 
    flex: 1, 
    textAlign: 'right', 
    fontSize: 15, 
    color: '#a0aec0', 
    marginHorizontal: 12 
  },
  chevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  generateBtn: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    gap: 12, 
    marginTop: 10,
  },
  generateIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800' 
  },
  
  // منطقة النتيجة
  resultArea: { 
    marginTop: 30,
    borderRadius: 30, 
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  resultGradient: {
    padding: 30,
    alignItems: 'center',
  },
  resultSparkles: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    opacity: 0.3,
  },
  resultHint: { 
    color: 'rgba(255,255,255,0.8)', 
    fontWeight: 'bold', 
    fontSize: 13, 
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultText: { 
    fontSize: 60, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginVertical: 15, 
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  playBtn: { 
    borderRadius: 20, 
    overflow: 'hidden',
    marginTop: 10,
  },
  playBtnGradient: {
    flexDirection: 'row-reverse',
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    gap: 10,
  },
  playBtnActive: { 
    transform: [{ scale: 1.05 }],
  },
  playBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  
  // قسم آخر التوليدات
  recentSection: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  recentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  recentItemContent: {
    flex: 1,
    marginLeft: 10,
  },
  recentWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'right',
  },
  recentMeta: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  recentTag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  recentTagText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '600',
  },
  
  // Modal متطور
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSheet: { 
    backgroundColor: '#fff', 
    borderRadius: 30, 
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  modalHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#e2e8f0', 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginTop: 12,
  },
  modalHeaderGradient: {
    padding: 25,
    paddingTop: 20,
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalList: {
    padding: 20,
    gap: 10,
  },
  modalItem: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#f8fafc', 
    borderRadius: 18, 
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalItemContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  modalItemText: { 
    fontSize: 16, 
    color: '#1e293b', 
    fontWeight: '700',
    textAlign: 'right',
  },
  modalItemDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  modalItemBullet: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#667eea',
    marginLeft: 10,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});