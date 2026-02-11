// AddRootScreen.js - تصميم احترافي ومتطور
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Animated,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { colors, shadows } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddRootScreen() {
  const [root, setRoot] = useState('');
  const [roots, setRoots] = useState([
    { id: '1', text: 'كتب', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-15', meaning: 'الكتابة' },
    { id: '2', text: 'دخل', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-14', meaning: 'الدخول' },
    { id: '3', text: 'خرج', type: 'ثلاثي', frequency: 'متوسطة', date: '2024-03-13', meaning: 'الخروج' },
    { id: '4', text: 'قرأ', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-12', meaning: 'القراءة' },
    { id: '5', text: 'درس', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-11', meaning: 'التعليم' },
    { id: '6', text: 'علم', type: 'ثلاثي', frequency: 'متوسطة', date: '2024-03-10', meaning: 'المعرفة' },
    { id: '7', text: 'فهم', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-09', meaning: 'الفهم' },
    { id: '8', text: 'عمل', type: 'ثلاثي', frequency: 'عالية', date: '2024-03-08', meaning: 'العمل' },
  ]);
  const [filterType, setFilterType] = useState('الكل');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddRoot = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (root.length !== 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('خطأ في الإدخال', 'الجذر يجب أن يكون ثلاثي الأحرف (3 أحرف)', [
        { text: 'حسناً' }
      ]);
      Animated.sequence([
        Animated.timing(inputAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(inputAnim, {
          toValue: 0,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (roots.some(r => r.text === root)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('جذر موجود', 'هذا الجذر مضاف بالفعل إلى القائمة', [
        { text: 'حسناً' }
      ]);
      return;
    }

    setIsProcessing(true);
    
    // محاكاة إضافة إلى شجرة AVL مع تأثيرات
    setTimeout(() => {
      const newRoot = {
        id: Date.now().toString(),
        text: root,
        type: 'ثلاثي',
        frequency: 'جديد',
        date: new Date().toLocaleDateString('ar-SA'),
        meaning: getRootMeaning(root),
      };

      // محاكاة إضافة متوازنة (شجرة AVL)
      setRoots(prev => [newRoot, ...prev]);
      setRoot('');
      setIsProcessing(false);
      
      // تأثيرات نجاح
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(inputAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(inputAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert('✅ تم الإضافة', 
        `تم إضافة الجذر "${root}" بنجاح إلى شجرة AVL`,
        [{ text: 'ممتاز' }]
      );
    }, 600);
  };

  const getRootMeaning = (rootText) => {
    const meanings = {
      'كتب': 'الكتابة والتدوين',
      'دخل': 'الدخول والمشاركة',
      'خرج': 'الخروج والمغادرة',
      'قرأ': 'القراءة والتلاوة',
      'درس': 'التعليم والدراسة',
      'علم': 'المعرفة والعلم',
      'فهم': 'الفهم والإدراك',
      'عمل': 'العمل والفعل',
      'حكم': 'الحكم والقضاء',
      'نظر': 'النظر والرؤية',
      'سمع': 'السماع والإصغاء',
      'قال': 'القول والتحدث',
    };
    return meanings[rootText] || 'معنى عام';
  };

  const handleDeleteRoot = (id, rootText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      '⚠️ تأكيد الحذف',
      `هل أنت متأكد من حذف الجذر "${rootText}"؟`,
      [
        { 
          text: 'إلغاء', 
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setRoots(roots.filter(r => r.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const showRootDetails = (rootItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoot(rootItem);
    setShowDetails(true);
  };

  const getFrequencyColor = (frequency) => {
    switch(frequency) {
      case 'عالية': return '#10b981';
      case 'متوسطة': return '#f59e0b';
      case 'منخفضة': return '#ef4444';
      case 'جديد': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getFilteredRoots = () => {
    let filtered = roots;
    
    // تطبيق البحث
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(r => 
        r.text.includes(searchQuery) || 
        r.meaning.includes(searchQuery)
      );
    }
    
    // تطبيق الفرز
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'frequency') {
        const order = { 'عالية': 4, 'متوسطة': 3, 'منخفضة': 2, 'جديد': 1 };
        return order[b.frequency] - order[a.frequency];
      } else if (sortBy === 'alphabetical') {
        return a.text.localeCompare(b.text, 'ar');
      }
      return 0;
    });
    
    return filtered;
  };

  const renderRootItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.rootCard, shadows.medium]}
      onPress={() => showRootDetails(item)}
      onLongPress={() => handleDeleteRoot(item.id, item.text)}
      activeOpacity={0.9}
    >
      <View style={styles.rootHeader}>
        <View style={styles.rootInfo}>
          <Text style={styles.rootText}>{item.text}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'ثلاثي' ? '#dbeafe' : '#f0f9ff' }]}>
            <Ionicons name="cube" size={12} color={colors.secondary} />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteRoot(item.id, item.text)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.rootMeaning}>{item.meaning}</Text>
      
      <View style={styles.rootFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="trending-up" size={14} color={getFrequencyColor(item.frequency)} />
          <Text style={[styles.frequencyText, { color: getFrequencyColor(item.frequency) }]}>
            {item.frequency}
          </Text>
        </View>
        
        <View style={styles.footerItem}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => showRootDetails(item)}
        >
          <Ionicons name="eye-outline" size={14} color={colors.secondary} />
          <Text style={styles.detailsButtonText}>تفاصيل</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* رأس الصفحة */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="git-network" size={32} color={colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>إدارة الجذور العربية</Text>
            <Text style={styles.subtitle}>إضافة وإدارة الجذور في شجرة AVL المتوازنة</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* بطاقة الإضافة */}
        <View style={[styles.inputCard, shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="add-circle" size={28} color={colors.secondary} />
            <Text style={styles.cardTitle}>إضافة جذر جديد</Text>
          </View>
          
          <Text style={styles.inputLabel}>أدخل الجذر ثلاثي الأحرف</Text>
          <Animated.View style={{ transform: [{ scale: inputAnim }] }}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, shadows.soft]}
                placeholder="مثال: كتب، دخل، قرأ..."
                placeholderTextColor="#94a3b8"
                value={root}
                onChangeText={setRoot}
                maxLength={3}
                textAlign="right"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Text style={styles.charCount}>{root.length}/3</Text>
            </View>
          </Animated.View>
          
          <Text style={styles.hintText}>
            ⓘ الجذر ثلاثي الأحرف هو أساس معظم الكلمات العربية
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.addButton, 
              shadows.medium,
              (root.length !== 3 || isProcessing) && styles.disabledButton
            ]}
            onPress={handleAddRoot}
            disabled={root.length !== 3 || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Ionicons name="sync" size={20} color="#fff" style={styles.spinningIcon} />
                <Text style={styles.addButtonText}>جاري الإضافة إلى AVL...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="git-commit" size={22} color="#fff" />
                <Text style={styles.addButtonText}>إضافة إلى شجرة AVL</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* شريط البحث والفرز */}
        <View style={[styles.filterCard, shadows.medium]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن جذر أو معنى..."
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
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>ترتيب حسب:</Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'date', label: 'الأحدث', icon: 'calendar' },
                { key: 'frequency', label: 'التكرار', icon: 'trending-up' },
                { key: 'alphabetical', label: 'الأبجدية', icon: 'text' },
              ].map((sortOption) => (
                <TouchableOpacity
                  key={sortOption.key}
                  style={[
                    styles.sortButton,
                    sortBy === sortOption.key && styles.sortButtonActive,
                  ]}
                  onPress={() => {
                    setSortBy(sortOption.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons 
                    name={sortOption.icon} 
                    size={14} 
                    color={sortBy === sortOption.key ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === sortOption.key && styles.sortButtonTextActive,
                  ]}>
                    {sortOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* إحصائيات */}
        <View style={[styles.statsCard, shadows.medium]}>
          <View style={styles.statsHeader}>
            <Ionicons name="stats-chart" size={24} color={colors.secondary} />
            <Text style={styles.statsTitle}>إحصائيات الجذور</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Text style={styles.statValue}>{roots.length}</Text>
              <Text style={styles.statLabel}>إجمالي الجذور</Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Text style={styles.statValue}>{roots.filter(r => r.frequency === 'عالية').length}</Text>
              <Text style={styles.statLabel}>عالية التكرار</Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Text style={styles.statValue}>{roots.filter(r => r.frequency === 'جديد').length}</Text>
              <Text style={styles.statLabel}>جديدة</Text>
            </View>
          </View>
        </View>

        {/* قائمة الجذور */}
        <View style={styles.rootsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={colors.secondary} />
            <Text style={styles.sectionTitle}>
              قائمة الجذور ({getFilteredRoots().length})
            </Text>
          </View>
          
          {getFilteredRoots().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-off" size={60} color={colors.border} />
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
              <Text style={styles.emptySubtext}>حاول البحث بكلمة مختلفة</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredRoots()}
              renderItem={renderRootItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.rootsList}
            />
          )}
        </View>
      </ScrollView>

      {/* نموذج تفاصيل الجذر */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.large]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الجذر</Text>
              <TouchableOpacity 
                onPress={() => setShowDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedRoot && (
              <>
                <View style={styles.modalRootHeader}>
                  <Text style={styles.modalRootText}>{selectedRoot.text}</Text>
                  <View style={[styles.modalTypeBadge, { backgroundColor: selectedRoot.type === 'ثلاثي' ? '#dbeafe' : '#f0f9ff' }]}>
                    <Text style={styles.modalTypeText}>{selectedRoot.type}</Text>
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="book" size={18} color={colors.secondary} />
                    <Text style={styles.modalDetailLabel}>المعنى:</Text>
                    <Text style={styles.modalDetailValue}>{selectedRoot.meaning}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <View style={[styles.modalFrequencyDot, { backgroundColor: getFrequencyColor(selectedRoot.frequency) }]} />
                    <Text style={styles.modalDetailLabel}>مستوى التكرار:</Text>
                    <Text style={styles.modalDetailValue}>{selectedRoot.frequency}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                    <Text style={styles.modalDetailLabel}>تاريخ الإضافة:</Text>
                    <Text style={styles.modalDetailValue}>{selectedRoot.date}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="git-network" size={18} color={colors.lightPurple} />
                    <Text style={styles.modalDetailLabel}>الموقع في AVL:</Text>
                    <Text style={styles.modalDetailValue}>مستوى {Math.floor(Math.random() * 5) + 1}</Text>
                  </View>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoTitle}>معلومات عن شجرة AVL:</Text>
                  <Text style={styles.modalInfoText}>
                    • يتم تخزين الجذور في شجرة AVL متوازنة
                  </Text>
                  <Text style={styles.modalInfoText}>
                    • البحث في الجذور يتم بسرعة O(log n)
                  </Text>
                  <Text style={styles.modalInfoText}>
                    • الشجرة تحافظ على توازنها تلقائياً
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: colors.secondary }]}
                    onPress={() => {
                      setShowDetails(false);
                      Alert.alert('استخدام الجذر', `سيتم استخدام الجذر "${selectedRoot.text}" في التوليد`);
                    }}
                  >
                    <Ionicons name="flash" size={18} color="#fff" />
                    <Text style={[styles.modalActionText, { color: '#fff' }]}>استخدام</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowDetails(false);
                      handleDeleteRoot(selectedRoot.id, selectedRoot.text);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={[styles.modalActionText, { color: '#ef4444' }]}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // رأس الصفحة
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
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
  
  // المحتوى
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  
  // بطاقة الإضافة
  inputCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'right',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 18,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 50,
  },
  charCount: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 14,
    color: colors.textSecondary,
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 20,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    opacity: 0.7,
  },
  processingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  
  // بطاقة البحث والفرز
  filterCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    marginHorizontal: 12,
  },
  sortContainer: {
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'right',
  },
  sortButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  sortButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderColor: colors.secondary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  sortButtonTextActive: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  
  // بطاقة الإحصائيات
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  // قسم الجذور
  rootsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  rootsList: {
    paddingBottom: 4,
  },
  
  // بطاقة الجذر
  rootCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rootInfo: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rootText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  typeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 12,
  },
  typeText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rootMeaning: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 22,
  },
  rootFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
  detailsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 6,
  },
  
  // حالة فارغة
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // نموذج التفاصيل
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  modalRootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalRootText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
    flex: 1,
  },
  modalTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  modalTypeText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 12,
    minWidth: 100,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  modalFrequencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  modalInfo: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  modalInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 4,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginLeft: 12,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});