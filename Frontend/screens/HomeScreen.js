// HomeScreen.js - نسخة محسنة مع ترتيب أبجدي ✅
import React, { useState, useEffect, useMemo } from 'react';
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

const { width, height } = Dimensions.get('window');

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
    type: 'warning'
  });
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  // دالة الترتيب الأبجدي للعربية
  const sortArabicAlphabetically = (rootsList) => {
    return [...rootsList].sort((a, b) => {
      // ترتيب تصاعدي (أ - ي)
      return a.racine.localeCompare(b.racine, 'ar');
    });
  };

  // 📥 تحميل كل الجذور مع مشتقاتها
  const loadAllRootsWithDerives = async () => {
    console.log('\n🔵 ===== بداية تحميل الجذور =====');
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

      // ترتيب الجذور أبجدياً
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
    loadAllRootsWithDerives();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // تحسين الفلترة مع الحفاظ على الترتيب الأبجدي
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

  // 🗑️ دالة الحذف مع SweetAlert
  const handleDeleteRoot = (root) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
    
    try {
      setSweetAlert(prev => ({ ...prev, visible: false }));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      setDeleteLoading(root);
      
      const response = await racineService.deleteRacine(root);
      
      if (response && response.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadAllRootsWithDerives();
        
        setSweetAlert({
          visible: true,
          message: `✅ تم حذف الجذر "${root}" بنجاح`,
          type: 'success',
          autoClose: true
        });
        
        setTimeout(() => {
          setSweetAlert(prev => ({ ...prev, visible: false }));
        }, 2000);
      } else {
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
              <Ionicons name="git-network" size={22} color={colors.secondary} />
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
                    <Text style={styles.deriveWord}>{derive.word}</Text>
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
      </View>
    );
  };

  const categories = getAllCategories();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن جذر أو كلمة..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
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
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <>
            {/* بطاقة الإحصائيات */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={styles.headerRight}>
                  <Ionicons name="stats-chart" size={22} color={colors.secondary} />
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
                  <Ionicons name="library" size={22} color={colors.secondary} />
                  <Text style={styles.rootsTitle}>
                    القاموس ({filteredRoots.length})
                  </Text>
                </View>
                <Text style={styles.totalWords}>
                  {filteredRoots.reduce((sum, r) => sum + r.totalDerives, 0)} كلمة
                </Text>
              </View>
              
              {filteredRoots.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-off" size={50} color={colors.border} />
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحديث الجذر</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginLeft: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 6,
    textAlign: 'right',
  },
  
  statsCard: {
    backgroundColor: colors.primary,
    margin: 12,
    borderRadius: 16,
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 8,
  },
  refreshButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  statItem: {
    width: (width - 56) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginLeft: 6,
  },
  activeCategoryFilter: {
    backgroundColor: colors.secondary,
  },
  categoryFilterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryFilterText: {
    color: colors.primary,
  },
  
  rootsContainer: {
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
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
    color: colors.textPrimary,
    marginRight: 8,
  },
  totalWords: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rootsList: {
    paddingBottom: 4,
  },
  
  rootCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  rootInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  rootIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  rootTextContainer: {
    flex: 1,
  },
  rootText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 2,
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
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 3,
  },
  rootDate: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  rootActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginRight: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginRight: 6,
  },
  
  derivesContainer: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  deriveWord: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deriveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deriveBadgeText: {
    color: colors.primary,
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
  },
  deriveScheme: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '500',
    marginRight: 3,
  },
  deriveDate: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  noDerives: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  noDerivesText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
  
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  updateInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  updateText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginRight: 4,
    flex: 1,
  },
  smallRefreshButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  smallRefreshText: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'right',
  },
  modalCurrentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
    marginBottom: 16,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
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
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 300,
    alignItems: 'center',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertMessage: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 22,
  },
  sweetAlertButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  sweetAlertButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sweetAlertCancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sweetAlertConfirmButton: {
    backgroundColor: colors.danger,
  },
  sweetAlertCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  sweetAlertConfirmText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
});