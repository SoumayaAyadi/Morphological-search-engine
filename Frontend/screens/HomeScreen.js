// HomeScreen.js - نسخة فاخرة مع صوت وتصميم متطور ✅
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { racineService } from '../services/racineService';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#ffffff',
  secondary: '#4f46e5',
  secondaryLight: '#818cf8',
  secondaryDark: '#3730a3',
  accent: '#ec4899',
  lightPurple: '#8b5cf6',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

export default function HomeScreen() {
  // ========== STATES ==========
  const [searchQuery, setSearchQuery] = useState('');
  const [roots, setRoots] = useState([]);
  const [filteredRoots, setFilteredRoots] = useState([]);
  const [stats, setStats] = useState({
    totalRoots: 0,
    totalDerives: 0,
    categories: 0,
    lastUpdate: 'جاري التحميل...',
    topRoot: '-',
    topCategory: 'مشتقات'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRoots, setExpandedRoots] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(null); // لتتبع الكلمة التي يتم نطقها
  
  // State للتحديث
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State للحذف
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // State للـ SweetAlert
  const [sweetAlert, setSweetAlert] = useState({
    visible: false,
    rootToDelete: null,
    message: '',
    type: 'warning'
  });
  
  // أنيميشن
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAllRootsWithDerives();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      )
    ]).start();
    
    Animated.spring(searchBarAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // 🎵 دالة تشغيل الصوت
  const playWord = (word, id = null) => {
    if (!word || word === '...') return;
    
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      // إيقاف أي صوت قيد التشغيل
      Speech.stop();
      
      // تشغيل الصوت الجديد
      Speech.speak(word, {
        language: 'ar',
        pitch: 1.1,
        rate: 0.85,
        onStart: () => setIsPlaying(id),
        onDone: () => setIsPlaying(null),
        onError: () => setIsPlaying(null),
      });
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // دالة الترتيب الأبجدي
  const sortArabicAlphabetically = (rootsList) => {
    return [...rootsList].sort((a, b) => {
      return a.racine.localeCompare(b.racine, 'ar');
    });
  };

  // 📥 تحميل الجذور
  const loadAllRootsWithDerives = async () => {
    try {
      setLoading(true);
      
      const response = await racineService.getAllRacines();
      const rootsData = response.data || response || [];
      
      const formattedRoots = rootsData.map((root, index) => {
        const derives = (root.derives || []).map((derive, idx) => ({
          id: `${root.racine}-derive-${idx}`,
          word: derive.mot,
          scheme: derive.scheme,
          date: new Date(derive.createdAt || Date.now()).toLocaleDateString('ar-SA'),
          category: getCategoryFromScheme(derive.scheme)
        }));

        return {
          id: root.id || index.toString(),
          racine: root.racine,
          derives: derives,
          totalDerives: derives.length,
          createdAt: new Date(root.createdAt || Date.now()).toLocaleDateString('ar-SA'),
          hasDerives: derives.length > 0
        };
      });

      const sortedRoots = sortArabicAlphabetically(formattedRoots);
      
      setRoots(sortedRoots);
      setFilteredRoots(sortedRoots);
      
      const totalDerives = formattedRoots.reduce((sum, root) => sum + root.totalDerives, 0);
      
      let topRoot = '-';
      let maxDerives = 0;
      formattedRoots.forEach(root => {
        if (root.totalDerives > maxDerives) {
          maxDerives = root.totalDerives;
          topRoot = root.racine;
        }
      });

      const allCategories = new Set();
      formattedRoots.forEach(root => {
        root.derives.forEach(derive => {
          allCategories.add(derive.category);
        });
      });

      const newStats = {
        totalRoots: formattedRoots.length,
        totalDerives: totalDerives,
        categories: allCategories.size,
        lastUpdate: new Date().toLocaleTimeString('ar-SA'),
        topRoot: topRoot,
        topCategory: getTopCategory(formattedRoots)
      };
      
      setStats(newStats);

    } catch (error) {
      console.error('🔴 خطأ في تحميل الجذور:', error);
      Alert.alert('خطأ', 'فشل تحميل الجذور من الخادم');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromScheme = (scheme) => {
    if (!scheme) return 'مشتق';
    if (scheme.includes('فاعل')) return 'اسم فاعل';
    if (scheme.includes('مفعول')) return 'اسم مفعول';
    if (scheme.includes('مفعل')) return 'اسم مكان/زمان';
    if (scheme.includes('فعّال')) return 'صيغة مبالغة';
    if (scheme.includes('استفعل')) return 'استفعال';
    if (scheme.includes('تفاعل')) return 'تفاعل';
    if (scheme.includes('تفعيل')) return 'تفعيل';
    return 'مشتق';
  };

  const getTopCategory = (roots) => {
    const categoryCount = {};
    roots.forEach(root => {
      root.derives.forEach(derive => {
        const cat = derive.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });
    
    let topCat = 'مشتق';
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });
    return topCat;
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoots(roots);
    } else {
      const filtered = roots.filter(root => 
        root.racine.includes(searchQuery) ||
        root.derives.some(derive => 
          derive.word.includes(searchQuery) ||
          derive.scheme.includes(searchQuery)
        )
      );
      setFilteredRoots(filtered);
    }
  }, [searchQuery, roots]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadAllRootsWithDerives();
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleExpandRoot = (rootId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedRoots(prev => ({
      ...prev,
      [rootId]: !prev[rootId]
    }));
  };

  const filterByCategory = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    
    if (category === 'all') {
      setFilteredRoots(roots);
    } else {
      const filtered = roots.filter(root => 
        root.derives.some(derive => derive.category === category)
      );
      setFilteredRoots(filtered);
    }
  };

  const getAllCategories = () => {
    const categories = new Set(['all']);
    roots.forEach(root => {
      root.derives.forEach(derive => {
        categories.add(derive.category);
      });
    });
    return Array.from(categories);
  };

  const getCategoryColor = (category) => {
    const colorsMap = {
      'اسم فاعل': '#3b82f6',
      'اسم مفعول': '#8b5cf6',
      'اسم مكان/زمان': '#10b981',
      'صيغة مبالغة': '#f59e0b',
      'استفعال': '#ef4444',
      'تفاعل': '#ec4899',
      'تفعيل': '#06b6d4',
      'مشتق': '#64748b'
    };
    return colorsMap[category] || '#64748b';
  };

  // ✏️ فتح نافذة التحديث
  const openUpdateModal = (root) => {
    setSelectedRoot(root);
    setUpdateValue(root.racine);
    setUpdateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ✏️ تحديث جذر
  const handleUpdateRoot = async () => {
    if (!selectedRoot) return;
    
    if (updateValue.length !== 3) {
      Alert.alert('تنبيه', 'الجذر يجب أن يكون 3 أحرف');
      return;
    }

    try {
      setUpdateLoading(true);
      
      const response = await racineService.updateRacine(selectedRoot.racine, updateValue);
      
      Alert.alert('نجاح', `تم تحديث الجذر إلى "${updateValue}"`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setUpdateModalVisible(false);
      await loadAllRootsWithDerives();
      
    } catch (error) {
      console.error('🔴 خطأ في التحديث:', error);
      Alert.alert('خطأ', 'فشل تحديث الجذر');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 🗑️ دالة الحذف
  const handleDeleteRoot = (root) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSweetAlert({
      visible: true,
      rootToDelete: root,
      message: `🗑️ هل أنت متأكد من حذف الجذر "${root}"؟`,
      type: 'warning',
      autoClose: false
    });
  };

  // ✅ تنفيذ الحذف
  const confirmDelete = async () => {
    const root = sweetAlert.rootToDelete;
    
    try {
      setSweetAlert(prev => ({ ...prev, visible: false }));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      setDeleteLoading(root);
      
      const response = await racineService.deleteRacine(root);
      
      if (response && response.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadAllRootsWithDerives();
        
        showSweetAlert(`✅ تم حذف الجذر "${root}" بنجاح`, 'success');
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showSweetAlert(response?.message || '❌ فشل حذف الجذر', 'error');
      }
    } catch (error) {
      console.error('🔴 خطأ في الحذف:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showSweetAlert('❌ حدث خطأ أثناء الحذف', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const showSweetAlert = (message, type, autoClose = true) => {
    setSweetAlert({
      visible: true,
      rootToDelete: null,
      message,
      type,
      autoClose
    });
    
    if (autoClose) {
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
    }
  };

  const Counter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (value === 0) {
        setCount(0);
        return;
      }
      
      let start = 0;
      const end = value;
      const incrementTime = Math.max(1, Math.floor(duration / end));
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      
      return () => clearInterval(timer);
    }, [value, duration]);
    
    return <Text style={styles.statValue}>{count}</Text>;
  };

  // ✅ SweetAlert Modal
  const SweetAlertModal = () => (
    <Modal
      visible={sweetAlert.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (sweetAlert.type !== 'warning') {
          setSweetAlert(prev => ({ ...prev, visible: false }));
        }
      }}
    >
      <View style={styles.sweetAlertOverlay}>
        <Animated.View style={[
          styles.sweetAlertContent,
          sweetAlert.type === 'warning' && styles.sweetAlertWarning,
          sweetAlert.type === 'success' && styles.sweetAlertSuccess,
          sweetAlert.type === 'error' && styles.sweetAlertError,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={styles.sweetAlertIcon}>
            <Ionicons 
              name={
                sweetAlert.type === 'warning' ? 'warning' :
                sweetAlert.type === 'success' ? 'checkmark-circle' :
                'close-circle'
              } 
              size={60} 
              color={
                sweetAlert.type === 'warning' ? colors.warning :
                sweetAlert.type === 'success' ? colors.success :
                colors.danger
              } 
            />
          </View>
          
          <Text style={styles.sweetAlertMessage}>{sweetAlert.message}</Text>
          
          {sweetAlert.type === 'warning' && (
            <View style={styles.sweetAlertButtons}>
              <TouchableOpacity
                style={[styles.sweetAlertButton, styles.sweetAlertCancelButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSweetAlert(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.sweetAlertCancelText}>❌ إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sweetAlertButton, styles.sweetAlertConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.sweetAlertConfirmText}>🗑️ نعم، احذف</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  // 📋 بطاقة الجذر
  const RootCard = ({ root }) => {
    const isExpanded = expandedRoots[root.id];
    
    return (
      <Animated.View style={[
        styles.rootCard,
        {
          opacity: fadeAnim,
          transform: [
            { 
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }
          ]
        }
      ]}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.rootGradient}
        >
          <TouchableOpacity 
            style={styles.rootHeader}
            onPress={() => toggleExpandRoot(root.id)}
            activeOpacity={0.7}
          >
            <View style={styles.rootInfo}>
              <View style={styles.rootIconContainer}>
                <LinearGradient
                  colors={['#4f46e5', '#818cf8']}
                  style={styles.rootIconGradient}
                >
                  <Ionicons name="git-network" size={22} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.rootTextContainer}>
                <Text style={styles.rootText}>{root.racine}</Text>
                <View style={styles.rootMeta}>
                  <View style={styles.badge}>
                    <Ionicons name="cube" size={10} color={colors.secondary} />
                    <Text style={styles.badgeText}>{root.totalDerives} مشتقات</Text>
                  </View>
                  <Text style={styles.rootDate}>{root.createdAt}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.rootActions}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => openUpdateModal(root)}
              >
                <Ionicons name="pencil" size={16} color={colors.info} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteRoot(root.racine)}
                disabled={deleteLoading === root.racine}
              >
                {deleteLoading === root.racine ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                )}
              </TouchableOpacity>
              
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.derivesContainer}>
              {root.derives.length === 0 ? (
                <View style={styles.noDerives}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.noDerivesText}>لا توجد مشتقات لهذا الجذر</Text>
                </View>
              ) : (
                root.derives.map((derive, index) => (
                  <View key={derive.id} style={styles.deriveItem}>
                    <View style={styles.deriveHeader}>
                      <View style={styles.deriveTitleContainer}>
                        <Text style={styles.deriveWord}>{derive.word}</Text>
                        <TouchableOpacity 
                          style={styles.playSmallButton}
                          onPress={() => playWord(derive.word, derive.id)}
                        >
                          <Ionicons 
                            name={isPlaying === derive.id ? "pause-circle" : "play-circle"} 
                            size={20} 
                            color={colors.secondary} 
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.deriveBadge, { backgroundColor: getCategoryColor(derive.category) }]}>
                        <Text style={styles.deriveBadgeText}>{derive.category}</Text>
                      </View>
                    </View>
                    <View style={styles.deriveFooter}>
                      <View style={styles.deriveMeta}>
                        <Ionicons name="pricetag" size={10} color={colors.secondary} />
                        <Text style={styles.deriveScheme}>{derive.scheme}</Text>
                      </View>
                      <Text style={styles.deriveDate}>{derive.date}</Text>
                    </View>
                    {index < root.derives.length - 1 && <View style={styles.divider} />}
                  </View>
                ))
              )}
            </View>
          )}
          
          {/* خط تقدم المشتقات */}
          <View style={styles.usageProgress}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(root.totalDerives * 10, 100)}%` }
              ]} 
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const categories = getAllCategories();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* خلفية متحركة */}
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
        colors={['rgba(79, 70, 229, 0.05)', 'transparent']}
        style={styles.backgroundGradient}
      />

    
      {/* شريط البحث المتطور */}
      <Animated.View style={[
        styles.searchContainer,
        {
          opacity: searchBarAnim,
          transform: [
            { 
              translateY: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }
          ]
        }
      ]}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.searchGradient}
        >
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 ابحث عن جذر أو كلمة..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <>
            {/* بطاقة الإحصائيات */}
            <Animated.View style={[styles.statsCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.statsGradient}
              >
                <View style={styles.statsHeader}>
                  <View style={styles.headerRight}>
                    <View style={styles.statsIcon}>
                      <Ionicons name="stats-chart" size={22} color={colors.secondary} />
                    </View>
                    <Text style={styles.statsTitle}>الإحصائيات</Text>
                  </View>
                  <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={16} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statsGrid}>
                  <View style={[styles.statItem, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="git-network" size={20} color={colors.secondary} />
                    </View>
                    <Counter value={stats.totalRoots} />
                    <Text style={styles.statLabel}>الجذور</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="create" size={20} color={colors.accent} />
                    </View>
                    <Counter value={stats.totalDerives} />
                    <Text style={styles.statLabel}>مشتقات</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="layers" size={20} color={colors.lightPurple} />
                    </View>
                    <Counter value={stats.categories} />
                    <Text style={styles.statLabel}>فئات</Text>
                  </View>
                </View>

                {/* معلومات إضافية */}
                <View style={styles.statsExtra}>
                  <View style={styles.extraItem}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.extraText}>أكثر جذر: {stats.topRoot}</Text>
                  </View>
                  <View style={styles.extraItem}>
                    <Ionicons name="pricetag" size={14} color="#10b981" />
                    <Text style={styles.extraText}>أكثر فئة: {stats.topCategory}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* فلاتر الفئات */}
            {categories.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryFilter,
                      selectedCategory === category && styles.activeCategoryFilter,
                    ]}
                    onPress={() => filterByCategory(category)}
                  >
                    <Text style={[
                      styles.categoryFilterText,
                      selectedCategory === category && styles.activeCategoryFilterText,
                    ]}>
                      {category === 'all' ? '📚 الكل' : category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* قائمة الجذور */}
            <View style={styles.rootsContainer}>
              <View style={styles.rootsHeader}>
                <View style={styles.headerRight}>
                  <Ionicons name="library" size={22} color={colors.secondary} />
                  <Text style={styles.rootsTitle}>
                    القاموس ({filteredRoots.length})
                  </Text>
                </View>
                <LinearGradient
                  colors={['#4f46e5', '#818cf8']}
                  style={styles.totalWordsBadge}
                >
                  <Text style={styles.totalWords}>
                    {filteredRoots.reduce((sum, r) => sum + r.totalDerives, 0)} كلمة
                  </Text>
                </LinearGradient>
              </View>
              
              {filteredRoots.length === 0 ? (
                <View style={styles.emptyState}>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Ionicons name="search-off" size={80} color="#cbd5e1" />
                  </Animated.View>
                  <Text style={styles.emptyStateText}>لا توجد كلمات</Text>
                  <Text style={styles.emptyStateSubtext}>أضف كلمات جديدة من صفحة التوليد</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredRoots}
                  renderItem={({ item }) => <RootCard root={item} />}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.rootsList}
                />
              )}
            </View>
            
            {/* آخر تحديث */}
            <View style={styles.updateInfo}>
              <Ionicons name="time" size={14} color={colors.textSecondary} />
              <Text style={styles.updateText}>آخر تحديث: {stats.lastUpdate}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.smallRefreshButton}>
                <Ionicons name="refresh" size={12} color={colors.secondary} />
                <Text style={styles.smallRefreshText}>تحديث</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal التحديث */}
      <Modal
        visible={updateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="create" size={24} color={colors.secondary} />
                </View>
                <Text style={styles.modalTitle}>تحديث الجذر</Text>
                <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalLabel}>الجذر الحالي</Text>
              <View style={styles.modalCurrentContainer}>
                <Text style={styles.modalCurrentValue}>{selectedRoot?.racine}</Text>
              </View>
              
              <Text style={styles.modalLabel}>الجذر الجديد</Text>
              <TextInput
                style={styles.modalInput}
                value={updateValue}
                onChangeText={setUpdateValue}
                maxLength={3}
                textAlign="right"
                autoFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setUpdateModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>إلغاء</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalConfirmButton,
                    (updateValue.length !== 3 || updateLoading) && styles.disabledButton
                  ]}
                  onPress={handleUpdateRoot}
                  disabled={updateValue.length !== 3 || updateLoading}
                >
                  <LinearGradient
                    colors={updateLoading || updateValue.length !== 3 ? ['#cbd5e1', '#94a3b8'] : ['#4f46e5', '#818cf8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalConfirmGradient}
                  >
                    {updateLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalConfirmText}>تحديث</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* SweetAlert Modal */}
      <SweetAlertModal />
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
  
  // Header فاخر
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
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
  
  // شريط البحث المتطور
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  searchGradient: {
    padding: 12,
  },
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    marginHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'right',
  },
  
  // بطاقة الإحصائيات
  statsCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  statsGradient: {
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    width: (width - 64) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  statsExtra: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  extraItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  extraText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  
  // فلاتر الفئات
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryFilter: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCategoryFilter: {
    backgroundColor: colors.secondary,
    borderColor: '#fff',
  },
  categoryFilterText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  activeCategoryFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // قائمة الجذور
  rootsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  rootsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rootsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 8,
  },
  totalWordsBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  totalWords: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  rootsList: {
    paddingBottom: 4,
  },
  
  // بطاقة الجذر
  rootCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rootGradient: {
    padding: 12,
  },
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rootInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  rootIconContainer: {
    marginLeft: 10,
  },
  rootIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootTextContainer: {
    flex: 1,
  },
  rootText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
    marginBottom: 4,
  },
  rootMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 3,
  },
  rootDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  
  rootActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginRight: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginRight: 6,
  },
  
  // المشتقات
  derivesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  deriveItem: {
    paddingVertical: 8,
  },
  deriveHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deriveTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  deriveWord: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  playSmallButton: {
    padding: 2,
  },
  deriveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deriveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  deriveFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deriveMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  deriveScheme: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '500',
  },
  deriveDate: {
    fontSize: 9,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginTop: 8,
  },
  noDerives: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  noDerivesText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  
  // خط التقدم
  usageProgress: {
    height: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 1.5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 1.5,
  },
  
  // حالات التحميل والفارغة
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  
  // معلومات التحديث
  updateInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  updateText: {
    color: '#64748b',
    fontSize: 12,
    marginRight: 6,
    flex: 1,
  },
  smallRefreshButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    gap: 4,
  },
  smallRefreshText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 360,
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
  modalCurrentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalCurrentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'right',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },

  // SweetAlert Styles
  sweetAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 28,
    width: '85%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sweetAlertWarning: {
    borderTopWidth: 5,
    borderTopColor: colors.warning,
  },
  sweetAlertSuccess: {
    borderTopWidth: 5,
    borderTopColor: colors.success,
  },
  sweetAlertError: {
    borderTopWidth: 5,
    borderTopColor: colors.danger,
  },
  sweetAlertIcon: {
    marginBottom: 16,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertMessage: {
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 24,
  },
  sweetAlertButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  sweetAlertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  sweetAlertCancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sweetAlertConfirmButton: {
    backgroundColor: colors.danger,
  },
  sweetAlertCancelText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
  sweetAlertConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});