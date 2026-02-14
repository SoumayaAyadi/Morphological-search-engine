// HomeScreen.js - نسخة كاملة مع SweetAlert ✅
import React, { useState, useEffect } from 'react';
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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { racineService } from '../services/racineService';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#ffffff',
  secondary: '#4f46e5',
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
  
  // State للتحديث
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State للحذف
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // State للـ SweetAlert المخصص
  const [sweetAlert, setSweetAlert] = useState({
    visible: false,
    rootToDelete: null,
    message: '',
    type: 'warning' // 'warning', 'success', 'error'
  });
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 📥 تحميل كل الجذور مع مشتقاتها
  const loadAllRootsWithDerives = async () => {
    console.log('\n🔵 ===== بداية تحميل الجذور =====');
    try {
      setLoading(true);
      
      console.log('🔵 استدعاء racineService.getAllRacines()...');
      const response = await racineService.getAllRacines();
      console.log('🔵 الاستجابة:', response);
      
      const rootsData = response.data || response || [];
      console.log(`🔵 عدد الجذور المستلمة: ${rootsData.length}`);
      
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

      formattedRoots.sort((a, b) => b.totalDerives - a.totalDerives);
      
      setRoots(formattedRoots);
      setFilteredRoots(formattedRoots);
      
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
      console.log('🔵 الإحصائيات المحدثة:', newStats);

    } catch (error) {
      console.error('🔴 خطأ في تحميل الجذور:', error);
      Alert.alert('خطأ', 'فشل تحميل الجذور من الخادم');
    } finally {
      setLoading(false);
      console.log('🔵 ===== انتهاء تحميل الجذور =====\n');
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
    loadAllRootsWithDerives();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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
    console.log('✏️ فتح نافذة تحديث للجذر:', root.racine);
    setSelectedRoot(root);
    setUpdateValue(root.racine);
    setUpdateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ✏️ تحديث جذر
  const handleUpdateRoot = async () => {
    console.log('\n🟡 ===== بداية تحديث الجذر =====');
    
    if (!selectedRoot) {
      console.log('🟡 لا يوجد جذر محدد');
      return;
    }
    
    console.log('🟡 الجذر القديم:', selectedRoot.racine);
    console.log('🟡 الجذر الجديد:', updateValue);
    
    if (updateValue.length !== 3) {
      console.log('🟡 الجذر الجديد غير صالح (يجب أن يكون 3 أحرف)');
      Alert.alert('تنبيه', 'الجذر يجب أن يكون 3 أحرف');
      return;
    }

    try {
      setUpdateLoading(true);
      
      console.log('🟡 استدعاء racineService.updateRacine...');
      const response = await racineService.updateRacine(selectedRoot.racine, updateValue);
      console.log('🟡 استجابة التحديث:', response);
      
      Alert.alert('نجاح', `تم تحديث الجذر إلى "${updateValue}"`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setUpdateModalVisible(false);
      await loadAllRootsWithDerives();
      
    } catch (error) {
      console.error('🔴 خطأ في التحديث:', error);
      Alert.alert('خطأ', 'فشل تحديث الجذر');
    } finally {
      setUpdateLoading(false);
      console.log('🟡 ===== انتهاء تحديث الجذر =====\n');
    }
  };

  // 🗑️ دالة الحذف مع SweetAlert
  const handleDeleteRoot = (root) => {
    console.log("🔴 ===== بداية عملية الحذف =====");
    console.log("🔴 الجذر المراد حذفه:", root);
    
    // ✅ تأثير الهابتك
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // ✅ إظهار SweetAlert المخصص
    setSweetAlert({
      visible: true,
      rootToDelete: root,
      message: `🗑️ هل أنت متأكد من حذف الجذر "${root}"؟`,
      type: 'warning'
    });
  };

  // ✅ تنفيذ الحذف الفعلي
  const confirmDelete = async () => {
    const root = sweetAlert.rootToDelete;
    console.log("🔴 تنفيذ الحذف للجذر:", root);
    
    try {
      // ✅ إخفاء SweetAlert
      setSweetAlert(prev => ({ ...prev, visible: false }));
      
      // ✅ تأثير الهابتك ثقيل
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      setDeleteLoading(root);
      console.log("🔴 إرسال طلب الحذف...");
      
      const response = await racineService.deleteRacine(root);
      console.log("🟢 استجابة الحذف:", response);
      
      if (response && response.success) {
        // ✅ تأثير نجاح
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // ✅ إعادة تحميل البيانات
        await loadAllRootsWithDerives();
        
        // ✅ SweetAlert نجاح
        setSweetAlert({
          visible: true,
          message: `✅ تم حذف الجذر "${root}" بنجاح`,
          type: 'success',
          autoClose: true
        });
        
        // ✅ إخفاء تلقائي بعد 2 ثانية
        setTimeout(() => {
          setSweetAlert(prev => ({ ...prev, visible: false }));
        }, 2000);
        
      } else {
        // ✅ تأثير خطأ
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        setSweetAlert({
          visible: true,
          message: response?.message || '❌ فشل حذف الجذر',
          type: 'error',
          autoClose: true
        });
        
        setTimeout(() => {
          setSweetAlert(prev => ({ ...prev, visible: false }));
        }, 2000);
      }
    } catch (error) {
      console.error('🔴 خطأ في الحذف:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setSweetAlert({
        visible: true,
        message: '❌ حدث خطأ أثناء الحذف',
        type: 'error',
        autoClose: true
      });
      
      setTimeout(() => {
        setSweetAlert(prev => ({ ...prev, visible: false }));
      }, 2000);
    } finally {
      setDeleteLoading(null);
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

  // ✅ SweetAlert Modal المخصص
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
        <View style={[
          styles.sweetAlertContent,
          sweetAlert.type === 'warning' && styles.sweetAlertWarning,
          sweetAlert.type === 'success' && styles.sweetAlertSuccess,
          sweetAlert.type === 'error' && styles.sweetAlertError,
        ]}>
          {/* أيقونة حسب النوع */}
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
          
          {/* الرسالة */}
          <Text style={styles.sweetAlertMessage}>{sweetAlert.message}</Text>
          
          {/* أزرار - تظهر فقط في نوع التحذير */}
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
          
          {/* رسائل النجاح/الخطأ تختفي تلقائياً */}
        </View>
      </View>
    </Modal>
  );

  // 📋 بطاقة الجذر
  const RootCard = ({ root }) => {
    const isExpanded = expandedRoots[root.id];
    
    return (
      <View style={styles.rootCard}>
        <TouchableOpacity 
          style={styles.rootHeader}
          onPress={() => toggleExpandRoot(root.id)}
          activeOpacity={0.7}
        >
          <View style={styles.rootInfo}>
            <View style={styles.rootIconContainer}>
              <Ionicons name="git-network" size={24} color={colors.secondary} />
            </View>
            <View style={styles.rootTextContainer}>
              <Text style={styles.rootText}>{root.racine}</Text>
              <View style={styles.rootMeta}>
                <View style={styles.badge}>
                  <Ionicons name="cube" size={12} color={colors.secondary} />
                  <Text style={styles.badgeText}>{root.totalDerives} مشتقات</Text>
                </View>
                <Text style={styles.rootDate}>{root.createdAt}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rootActions}>
            {/* زر التحديث */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => openUpdateModal(root)}
            >
              <Ionicons name="pencil" size={18} color={colors.info} />
            </TouchableOpacity>
            
            {/* زر الحذف مع SweetAlert */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteRoot(root.racine)}
              disabled={deleteLoading === root.racine}
            >
              {deleteLoading === root.racine ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              )}
            </TouchableOpacity>
            
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={22} 
              color={colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.derivesContainer}>
            {root.derives.length === 0 ? (
              <View style={styles.noDerives}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.noDerivesText}>لا توجد مشتقات لهذا الجذر</Text>
              </View>
            ) : (
              root.derives.map((derive, index) => (
                <View key={derive.id} style={styles.deriveItem}>
                  <View style={styles.deriveHeader}>
                    <Text style={styles.deriveWord}>{derive.word}</Text>
                    <View style={[styles.deriveBadge, { backgroundColor: getCategoryColor(derive.category) }]}>
                      <Text style={styles.deriveBadgeText}>{derive.category}</Text>
                    </View>
                  </View>
                  <View style={styles.deriveFooter}>
                    <View style={styles.deriveMeta}>
                      <Ionicons name="pricetag" size={12} color={colors.secondary} />
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
      </View>
    );
  };

  const categories = getAllCategories();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن جذر أو كلمة مشتقة..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
            <Text style={styles.loadingText}>جاري تحميل الجذور والمشتقات...</Text>
          </View>
        ) : (
          <>
            {/* بطاقة الإحصائيات */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={styles.headerRight}>
                  <Ionicons name="stats-chart" size={28} color={colors.secondary} />
                  <Text style={styles.statsTitle}>الإحصائيات</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="git-network" size={24} color={colors.secondary} />
                  </View>
                  <Counter value={stats.totalRoots} />
                  <Text style={styles.statLabel}>الجذور</Text>
                </View>
                
                <View style={[styles.statItem, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="create" size={24} color={colors.accent} />
                  </View>
                  <Counter value={stats.totalDerives} />
                  <Text style={styles.statLabel}>كلمات مولدة</Text>
                </View>
                
                <View style={[styles.statItem, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="layers" size={24} color={colors.lightPurple} />
                  </View>
                  <Counter value={stats.categories} />
                  <Text style={styles.statLabel}>فئات</Text>
                </View>
              </View>
            </View>

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
                  <Ionicons name="library" size={28} color={colors.secondary} />
                  <Text style={styles.rootsTitle}>
                    القاموس ({filteredRoots.length} جذر • {filteredRoots.reduce((sum, r) => sum + r.totalDerives, 0)} كلمة)
                  </Text>
                </View>
              </View>
              
              {filteredRoots.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-off" size={60} color={colors.border} />
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
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={styles.updateText}>آخر تحديث: {stats.lastUpdate}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.smallRefreshButton}>
                <Ionicons name="refresh" size={16} color={colors.secondary} />
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحديث الجذر</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>الجذر الحالي</Text>
            <Text style={styles.modalCurrentValue}>{selectedRoot?.racine}</Text>
            
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
                {updateLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>تحديث</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SweetAlert Modal */}
      <SweetAlertModal />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  
  statsCard: {
    backgroundColor: colors.primary,
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: (width - 72) / 3,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
  },
  activeCategoryFilter: {
    backgroundColor: colors.secondary,
  },
  categoryFilterText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryFilterText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  
  rootsContainer: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  rootsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rootsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  rootsList: {
    paddingBottom: 4,
  },
  
  rootCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rootInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  rootIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  rootTextContainer: {
    flex: 1,
  },
  rootText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 4,
  },
  rootDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  rootActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginRight: 8,
  },
  
  derivesContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deriveItem: {
    paddingVertical: 12,
  },
  deriveHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deriveWord: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deriveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deriveBadgeText: {
    color: colors.primary,
    fontSize: 11,
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
  },
  deriveScheme: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
    marginRight: 4,
  },
  deriveDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 12,
  },
  noDerives: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDerivesText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  
  updateInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  updateText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  smallRefreshButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  smallRefreshText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'right',
  },
  modalCurrentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginLeft: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },

  // SweetAlert Styles
  sweetAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertContent: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 28,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sweetAlertWarning: {
    borderTopWidth: 6,
    borderTopColor: colors.warning,
  },
  sweetAlertSuccess: {
    borderTopWidth: 6,
    borderTopColor: colors.success,
  },
  sweetAlertError: {
    borderTopWidth: 6,
    borderTopColor: colors.danger,
  },
  sweetAlertIcon: {
    marginBottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertMessage: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 26,
  },
  sweetAlertButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  sweetAlertButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  sweetAlertCancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sweetAlertConfirmButton: {
    backgroundColor: colors.danger,
  },
  sweetAlertCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  sweetAlertConfirmText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

// ===juste lezemni nzid el sound===//