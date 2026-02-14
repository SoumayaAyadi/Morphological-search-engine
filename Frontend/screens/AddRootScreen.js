// AddRootScreen.js - نسخة فاخرة مع بحث وترتيب أبجدي ✅
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ScrollView,
  Animated,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { racineService } from '../services/racineService';

const { width } = Dimensions.get('window');

export default function AddRootScreen() {
  // State للإضافة
  const [root, setRoot] = useState('');
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State للبحث والترتيب
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  
  // State للحذف
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // State للتحديث
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
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

  // 📥 تحميل الجذور
  const loadRoots = async () => {
    try {
      const response = await racineService.getAllRacines();
      const rootsData = response.data || response || [];
      
      const formattedRoots = rootsData.map((root, index) => ({
        id: root.id || index.toString(),
        text: root.racine,
        date: new Date(root.createdAt || Date.now()).toLocaleDateString('ar-SA'),
        derives: root.derives?.length || 0
      }));
      
      setRoots(formattedRoots);
    } catch (error) {
      console.error('Error loading roots:', error);
    }
  };

  useEffect(() => {
    loadRoots();
    
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

  // دالة الترتيب الأبجدي
  const sortArabicAlphabetically = (items, order = 'asc') => {
    return [...items].sort((a, b) => {
      const comparison = a.text.localeCompare(b.text, 'ar');
      return order === 'asc' ? comparison : -comparison;
    });
  };

  // دالة التصفية والترتيب
  const getFilteredAndSortedRoots = useMemo(() => {
    let filtered = [...roots];
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.text.includes(searchQuery)
      );
    }
    
    if (filterType === 'used') {
      filtered = filtered.filter(item => item.derives > 0);
    } else if (filterType === 'unused') {
      filtered = filtered.filter(item => item.derives === 0);
    }
    
    return sortArabicAlphabetically(filtered, sortOrder);
  }, [roots, searchQuery, sortOrder, filterType]);

  // ✅ التحقق من صحة الجذر
  const validateRoot = (text) => {
    if (text.length !== 3) {
      showSweetAlert('⚠️ الجذر يجب أن يكون 3 أحرف', 'warning');
      return false;
    }
    const arabicRegex = /^[\u0600-\u06FF]+$/;
    if (!arabicRegex.test(text)) {
      showSweetAlert('⚠️ أحرف عربية فقط', 'warning');
      return false;
    }
    return true;
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

  // ➕ إضافة جذر
  const handleAddRoot = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!validateRoot(root)) return;

    try {
      setLoading(true);
      await racineService.addRacine(root);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSweetAlert(`✅ تم إضافة الجذر "${root}" بنجاح`, 'success');
      loadRoots();
      setRoot('');
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل إضافة الجذر';
      if (error.response?.status === 409) {
        message = `⚠️ الجذر "${root}" موجود مسبقاً`;
      }
      
      showSweetAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ حذف جذر
  const handleDeleteRoot = (rootText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSweetAlert({
      visible: true,
      rootToDelete: rootText,
      message: `🗑️ هل أنت متأكد من حذف الجذر "${rootText}"؟`,
      type: 'warning',
      autoClose: false
    });
  };

  // ✅ تنفيذ الحذف
  const confirmDelete = async () => {
    const rootText = sweetAlert.rootToDelete;
    
    try {
      setSweetAlert(prev => ({ ...prev, visible: false }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setDeleteLoading(rootText);
      
      await racineService.deleteRacine(rootText);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSweetAlert(`✅ تم حذف الجذر "${rootText}" بنجاح`, 'success');
      loadRoots();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showSweetAlert('❌ فشل حذف الجذر', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  // ✏️ فتح نافذة التحديث
  const openUpdateModal = (rootItem) => {
    setSelectedRoot(rootItem);
    setUpdateValue(rootItem.text);
    setUpdateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ✏️ تحديث جذر
  const handleUpdateRoot = async () => {
    if (!selectedRoot) return;
    
    if (!validateRoot(updateValue)) return;

    try {
      setUpdateLoading(true);
      
      await racineService.updateRacine(selectedRoot.text, updateValue);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSweetAlert(`✅ تم تحديث الجذر إلى "${updateValue}"`, 'success');
      
      setUpdateModalVisible(false);
      loadRoots();
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل تحديث الجذر';
      if (error.response?.status === 409) {
        message = `⚠️ الجذر "${updateValue}" موجود مسبقاً`;
      }
      
      showSweetAlert(message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // تبديل ترتيب الفرز
  const toggleSortOrder = () => {
    Haptics.selectionAsync();
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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
                sweetAlert.type === 'warning' ? '#f59e0b' :
                sweetAlert.type === 'success' ? '#10b981' :
                '#ef4444'
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

  // 📋 عرض عنصر الجذر
  const renderRootItem = ({ item }) => (
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
        <View style={styles.rootHeader}>
          <View style={styles.rootTitleContainer}>
            <View style={styles.rootIcon}>
              <Ionicons name="git-network" size={24} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.rootText}>{item.text}</Text>
              <Text style={styles.rootType}>جذر ثلاثي</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => openUpdateModal(item)}
            >
              <Ionicons name="pencil" size={18} color="#3b82f6" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteRoot(item.text)}
              disabled={deleteLoading === item.text}
            >
              {deleteLoading === item.text ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.rootFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={12} color="#94a3b8" />
            <Text style={styles.rootDate}>{item.date}</Text>
          </View>
          
          <View style={styles.derivesBadge}>
            <LinearGradient
              colors={item.derives > 0 ? ['#4f46e5', '#818cf8'] : ['#94a3b8', '#cbd5e1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.derivesGradient}
            >
              <Ionicons name="git-branch" size={10} color="#fff" />
              <Text style={styles.rootDerives}>{item.derives}</Text>
            </LinearGradient>
          </View>
        </View>
        
        {/* خط تقدم المشتقات */}
        <View style={styles.usageProgress}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(item.derives * 10, 100)}%` }
            ]} 
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
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

  
        

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* شريط البحث */}
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
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 بحث عن جذر..."
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
            
            {/* أزرار التحكم */}
            <View style={styles.controlBar}>
              <TouchableOpacity 
                style={[styles.filterChip, filterType === 'all' && styles.activeFilterChip]}
                onPress={() => {
                  setFilterType('all');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.filterChipText, filterType === 'all' && styles.activeFilterChipText]}>
                  📚 الكل
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterChip, filterType === 'used' && styles.activeFilterChip]}
                onPress={() => {
                  setFilterType('used');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.filterChipText, filterType === 'used' && styles.activeFilterChipText]}>
                  ✅ مستخدمة
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterChip, filterType === 'unused' && styles.activeFilterChip]}
                onPress={() => {
                  setFilterType('unused');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.filterChipText, filterType === 'unused' && styles.activeFilterChipText]}>
                  🆕 جديدة
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={toggleSortOrder}
              >
                <Ionicons 
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={18} 
                  color="#4f46e5" 
                />
                <Text style={styles.sortButtonText}>ترتيب</Text>
              </TouchableOpacity>
            </View>
            
            {/* نتائج البحث */}
            {searchQuery.length > 0 && (
              <View style={styles.searchResults}>
                <Ionicons name="search-outline" size={14} color="#94a3b8" />
                <Text style={styles.searchResultsText}>
                  {getFilteredAndSortedRoots.length} نتيجة لـ "{searchQuery}"
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ➕ بطاقة الإضافة */}
        <Animated.View style={[styles.addCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.addCardGradient}
          >
            <View style={styles.addCardHeader}>
              <View style={styles.addIcon}>
                <Ionicons name="add-circle" size={24} color="#4f46e5" />
              </View>
              <Text style={styles.addTitle}>إضافة جذر ثلاثي جديد</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  root.length === 3 && styles.inputValid
                ]}
                placeholder="مثال: كتب"
                placeholderTextColor="#94a3b8"
                value={root}
                onChangeText={setRoot}
                maxLength={3}
                textAlign="right"
              />
              <View style={[
                styles.charCount,
                root.length === 3 ? styles.charCountValid : styles.charCountInvalid
              ]}>
                <Text style={styles.charCountText}>{root.length}/3</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, (root.length !== 3 || loading) && styles.disabledButton]}
              onPress={handleAddRoot}
              disabled={root.length !== 3 || loading}
            >
              <LinearGradient
                colors={loading || root.length !== 3 ? ['#cbd5e1', '#94a3b8'] : ['#4f46e5', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.addButtonText}>إضافة جذر</Text>
                    <Ionicons name="add" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* 📋 قائمة الجذور */}
        <View style={styles.rootsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={20} color="#4f46e5" />
            <Text style={styles.sectionTitle}>
              الجذور المحفوظة ({getFilteredAndSortedRoots.length})
            </Text>
          </View>
          
          {getFilteredAndSortedRoots.length === 0 ? (
            <View style={styles.emptyState}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="search-off" size={80} color="#cbd5e1" />
              </Animated.View>
              <Text style={styles.emptyText}>لا توجد جذور</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'جرب بحثاً آخر' : 'أضف جذراً جديداً'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredAndSortedRoots}
              renderItem={renderRootItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* ✏️ Modal التحديث */}
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
                  <Ionicons name="create" size={24} color="#4f46e5" />
                </View>
                <Text style={styles.modalTitle}>تحديث الجذر</Text>
                <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalLabel}>الجذر الحالي</Text>
              <View style={styles.modalCurrentContainer}>
                <Text style={styles.modalCurrentValue}>{selectedRoot?.text}</Text>
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
                      <ActivityIndicator color="#fff" />
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
  
  statsContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  
  scrollContent: {
    padding: 16,
  },
  
  searchContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  searchGradient: {
    padding: 15,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    marginHorizontal: 10,
    textAlign: 'right',
  },
  controlBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  activeFilterChip: {
    backgroundColor: '#4f46e5',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  searchResults: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 5,
  },
  searchResultsText: {
    fontSize: 12,
    color: '#64748b',
  },
  
  addCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  addCardGradient: {
    padding: 20,
  },
  addCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 16,
    paddingLeft: 60,
    fontSize: 18,
    color: '#0f172a',
    textAlign: 'right',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  inputValid: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  charCount: {
    position: 'absolute',
    left: 16,
    top: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  charCountValid: {
    backgroundColor: '#10b981',
  },
  charCountInvalid: {
    backgroundColor: '#cbd5e1',
  },
  charCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  rootsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  
  rootCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rootGradient: {
    padding: 16,
  },
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rootTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  rootIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  rootType: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rootFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  rootDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  derivesBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  derivesGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  rootDerives: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  usageProgress: {
    height: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 1.5,
  },
  
  emptyState: {
    alignItems: 'center',
    padding: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 400,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalLabel: {
    fontSize: 13,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'right',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
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
    fontSize: 15,
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
    fontSize: 15,
  },
  
  sweetAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sweetAlertWarning: {
    borderTopWidth: 5,
    borderTopColor: '#f59e0b',
  },
  sweetAlertSuccess: {
    borderTopWidth: 5,
    borderTopColor: '#10b981',
  },
  sweetAlertError: {
    borderTopWidth: 5,
    borderTopColor: '#ef4444',
  },
  sweetAlertIcon: {
    marginBottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetAlertMessage: {
    fontSize: 18,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '500',
    lineHeight: 26,
  },
  sweetAlertButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  sweetAlertButton: {
    flex: 1,
    padding: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  sweetAlertCancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sweetAlertConfirmButton: {
    backgroundColor: '#ef4444',
  },
  sweetAlertCancelText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  sweetAlertConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
});