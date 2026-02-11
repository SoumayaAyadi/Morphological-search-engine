// DerivesScreen.js - تصميم راقي ومتطور
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  FlatList,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from './theme';
import * as Haptics from 'expo-haptics';

export default function DerivesScreen() {
  const [selectedRoot, setSelectedRoot] = useState('الكل');
  const [selectedScheme, setSelectedScheme] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedWords, setGeneratedWords] = useState([
    { id: '1', word: 'مكتوب', scheme: 'مفعول', root: 'كتب', date: '2024-03-15', frequency: 'عالية' },
    { id: '2', word: 'كاتب', scheme: 'فاعل', root: 'كتب', date: '2024-03-14', frequency: 'عالية' },
    { id: '3', word: 'كتابة', scheme: 'مصدر', root: 'كتب', date: '2024-03-13', frequency: 'متوسطة' },
    { id: '4', word: 'مقروء', scheme: 'مفعول', root: 'قرأ', date: '2024-03-12', frequency: 'عالية' },
    { id: '5', word: 'قارئ', scheme: 'فاعل', root: 'قرأ', date: '2024-03-11', frequency: 'عالية' },
    { id: '6', word: 'قراءة', scheme: 'مصدر', root: 'قرأ', date: '2024-03-10', frequency: 'متوسطة' },
    { id: '7', word: 'مدرّس', scheme: 'مفعل', root: 'درس', date: '2024-03-09', frequency: 'عالية' },
    { id: '8', word: 'دارس', scheme: 'فاعل', root: 'درس', date: '2024-03-08', frequency: 'متوسطة' },
    { id: '9', word: 'تدريس', scheme: 'تفعيل', root: 'درس', date: '2024-03-07', frequency: 'منخفضة' },
    { id: '10', word: 'عالم', scheme: 'فاعل', root: 'علم', date: '2024-03-06', frequency: 'عالية' },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, word, frequency
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const fadeAnim = useState(new Animated.Value(0))[0];

  const roots = ['الكل', 'كتب', 'قرأ', 'درس', 'علم', 'فهم', 'عمل', 'حكم'];
  const schemes = ['الكل', 'فاعل', 'مفعول', 'مفعل', 'فعّال', 'استفعل', 'تفعيل', 'مصدر'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const generateNewWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const randomRoot = roots.filter(r => r !== 'الكل')[Math.floor(Math.random() * (roots.length - 1))];
    const randomScheme = schemes.filter(s => s !== 'الكل')[Math.floor(Math.random() * (schemes.length - 1))];
    
    const wordMap = {
      'كتب': { 'فاعل': 'كاتب', 'مفعول': 'مكتوب', 'مفعل': 'مكتب', 'فعّال': 'كتّاب', 'استفعل': 'استكتب', 'تفعيل': 'كتابة', 'مصدر': 'كتابة' },
      'قرأ': { 'فاعل': 'قارئ', 'مفعول': 'مقروء', 'مفعل': 'مقرأ', 'فعّال': 'قرّاء', 'استفعل': 'استقرأ', 'تفعيل': 'قراءة', 'مصدر': 'قراءة' },
      'درس': { 'فاعل': 'دارس', 'مفعول': 'مدروس', 'مفعل': 'مدرّس', 'فعّال': 'درّاس', 'استفعل': 'استدرك', 'تفعيل': 'تدريس', 'مصدر': 'دراسة' },
    };

    const newWord = {
      id: Date.now().toString(),
      word: wordMap[randomRoot]?.[randomScheme] || `${randomRoot}ة`,
      scheme: randomScheme,
      root: randomRoot,
      date: new Date().toLocaleDateString('ar-SA'),
      frequency: ['عالية', 'متوسطة', 'منخفضة'][Math.floor(Math.random() * 3)]
    };

    setGeneratedWords([newWord, ...generatedWords]);
    
    Alert.alert(
      '✅ تم التوليد',
      `الكلمة الجديدة: ${newWord.word}`,
      [
        { text: 'حسناً' },
        { 
          text: 'عرض التفاصيل', 
          onPress: () => {
            setSelectedWord(newWord);
            setShowDetailsModal(true);
          }
        }
      ]
    );
  };

  const deleteWord = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      '⚠️ تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الكلمة؟',
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
            setGeneratedWords(generatedWords.filter(word => word.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const showWordDetails = (word) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWord(word);
    setShowDetailsModal(true);
  };

  const getSchemeColor = (scheme) => {
    const colorsMap = {
      'فاعل': '#3b82f6',
      'مفعول': '#8b5cf6',
      'مفعل': '#10b981',
      'فعّال': '#f59e0b',
      'استفعل': '#ef4444',
      'تفعيل': '#ec4899',
      'مصدر': '#06b6d4',
    };
    return colorsMap[scheme] || '#667eea';
  };

  const getFrequencyColor = (frequency) => {
    switch(frequency) {
      case 'عالية': return '#10b981';
      case 'متوسطة': return '#f59e0b';
      case 'منخفضة': return '#ef4444';
      default: return '#64748b';
    }
  };

  const filteredWords = generatedWords.filter(word => {
    const matchesRoot = selectedRoot === 'الكل' || word.root === selectedRoot;
    const matchesScheme = selectedScheme === 'الكل' || word.scheme === selectedScheme;
    const matchesSearch = word.word.includes(searchQuery) || 
                         word.root.includes(searchQuery) || 
                         word.scheme.includes(searchQuery);
    return matchesRoot && matchesScheme && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
    } else if (sortBy === 'word') {
      return sortOrder === 'desc' 
        ? b.word.localeCompare(a.word, 'ar')
        : a.word.localeCompare(b.word, 'ar');
    } else if (sortBy === 'frequency') {
      const order = { 'عالية': 3, 'متوسطة': 2, 'منخفضة': 1 };
      return sortOrder === 'desc' 
        ? order[b.frequency] - order[a.frequency]
        : order[a.frequency] - order[b.frequency];
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderWordItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.wordCard, shadows.medium]}
      onPress={() => showWordDetails(item)}
      onLongPress={() => deleteWord(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.wordHeader}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordText}>{item.word}</Text>
          <View style={[styles.schemeBadge, { backgroundColor: getSchemeColor(item.scheme) }]}>
            <Text style={styles.schemeText}>{item.scheme}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteWord(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.wordDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="leaf" size={14} color={colors.secondary} />
            <Text style={styles.detailLabel}>الجذر:</Text>
            <Text style={styles.detailValue}>{item.root}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>التاريخ:</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={[styles.frequencyDot, { backgroundColor: getFrequencyColor(item.frequency) }]} />
            <Text style={styles.detailLabel}>التكرار:</Text>
            <Text style={styles.detailValue}>{item.frequency}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => showWordDetails(item)}
          >
            <Ionicons name="eye-outline" size={14} color={colors.secondary} />
            <Text style={styles.viewDetailsText}>تفاصيل</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="layers" size={32} color={colors.secondary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>الكلمات المشتقة</Text>
            <Text style={styles.subtitle}>مكتبة الكلمات المولدة من الجذور العربية</Text>
          </View>
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* شريط البحث */}
        <View style={[styles.searchCard, shadows.medium]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن كلمة، جذر، أو نمط..."
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

        {/* بطاقة الفلاتر والإحصائيات */}
        <View style={[styles.card, shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="funnel" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>الفلاتر والإحصائيات</Text>
          </View>

          {/* فلتر الجذور */}
          <Text style={styles.filterLabel}>تصفية حسب الجذر</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {roots.map((root) => (
                <TouchableOpacity
                  key={root}
                  style={[
                    styles.filterButton,
                    selectedRoot === root && styles.filterButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedRoot(root);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedRoot === root && styles.filterButtonTextSelected,
                  ]}>
                    {root}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* فلتر الأنماط */}
          <Text style={[styles.filterLabel, { marginTop: 16 }]}>تصفية حسب النمط</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {schemes.map((scheme) => (
                <TouchableOpacity
                  key={scheme}
                  style={[
                    styles.filterButton,
                    selectedScheme === scheme && styles.filterButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedScheme(scheme);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedScheme === scheme && styles.filterButtonTextSelected,
                  ]}>
                    {scheme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* أزرار الفرز */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>ترتيب حسب:</Text>
            <View style={styles.sortButtons}>
              {['date', 'word', 'frequency'].map((field) => (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.sortButton,
                    sortBy === field && styles.sortButtonActive,
                  ]}
                  onPress={() => toggleSort(field)}
                >
                  <Ionicons 
                    name={sortOrder === 'desc' && sortBy === field ? "arrow-down" : "arrow-up"} 
                    size={14} 
                    color={sortBy === field ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === field && styles.sortButtonTextActive,
                  ]}>
                    {field === 'date' ? 'التاريخ' : field === 'word' ? 'الكلمة' : 'التكرار'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* زر توليد جديد */}
          <TouchableOpacity 
            style={[styles.generateButton, shadows.medium]}
            onPress={generateNewWord}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={styles.generateButtonText}>توليد كلمة جديدة</Text>
          </TouchableOpacity>

          {/* الإحصائيات */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <Ionicons name="text" size={20} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{filteredWords.length}</Text>
              <Text style={styles.statLabel}>كلمة</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Ionicons name="leaf" size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{[...new Set(filteredWords.map(w => w.root))].length}</Text>
              <Text style={styles.statLabel}>جذر</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="cube" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{[...new Set(filteredWords.map(w => w.scheme))].length}</Text>
              <Text style={styles.statLabel}>نمط</Text>
            </View>
          </View>
        </View>

        {/* قائمة الكلمات */}
        <View style={styles.wordsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={colors.secondary} />
            <Text style={styles.sectionTitle}>
              الكلمات المشتقة ({filteredWords.length})
            </Text>
          </View>

          {filteredWords.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color={colors.border} />
              <Text style={styles.emptyText}>لا توجد كلمات مطابقة</Text>
              <Text style={styles.emptySubtext}>حاول تغيير الفلاتر أو توليد كلمات جديدة</Text>
            </View>
          ) : (
            <FlatList
              data={filteredWords}
              renderItem={renderWordItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.wordsList}
            />
          )}
        </View>
      </ScrollView>

      {/* نموذج تفاصيل الكلمة */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.large]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الكلمة</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedWord && (
              <>
                <View style={styles.modalWordHeader}>
                  <Text style={styles.modalWordText}>{selectedWord.word}</Text>
                  <View style={[styles.modalSchemeBadge, { backgroundColor: getSchemeColor(selectedWord.scheme) }]}>
                    <Text style={styles.modalSchemeText}>{selectedWord.scheme}</Text>
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="leaf" size={18} color={colors.secondary} />
                    <Text style={styles.modalDetailLabel}>الجذر:</Text>
                    <Text style={styles.modalDetailValue}>{selectedWord.root}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                    <Text style={styles.modalDetailLabel}>تاريخ التوليد:</Text>
                    <Text style={styles.modalDetailValue}>{selectedWord.date}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <View style={[styles.modalFrequencyDot, { backgroundColor: getFrequencyColor(selectedWord.frequency) }]} />
                    <Text style={styles.modalDetailLabel}>مستوى التكرار:</Text>
                    <Text style={styles.modalDetailValue}>{selectedWord.frequency}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="cube" size={18} color={colors.lightPurple} />
                    <Text style={styles.modalDetailLabel}>قاعدة النمط:</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedWord.scheme === 'مفعول' ? 'م + C1 + C2 + و + C3' : 
                       selectedWord.scheme === 'فاعل' ? 'C1 + ا + C2 + C3' : 
                       'C1 + C2 + C3'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowDetailsModal(false);
                      deleteWord(selectedWord.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={[styles.modalActionText, { color: '#ef4444' }]}>حذف</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: colors.secondary }]}
                    onPress={() => setShowDetailsModal(false)}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={[styles.modalActionText, { color: '#fff' }]}>تم</Text>
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
    backgroundColor: colors.primary,
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
  headerText: {
    flex: 1,
    marginRight: 12,
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
  
  // شريط البحث
  searchCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    marginHorizontal: 12,
  },
  
  // بطاقة الفلاتر
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
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
    marginRight: 10,
  },
  
  // الفلاتر
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'right',
  },
  filtersRow: {
    flexDirection: 'row-reverse',
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  
  // الفرز
  sortContainer: {
    marginTop: 20,
    marginBottom: 24,
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
  
  // زر التوليد
  generateButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  
  // الإحصائيات
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  // قسم الكلمات
  wordsSection: {
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
  wordsList: {
    paddingBottom: 4,
  },
  
  // بطاقة الكلمة
  wordCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  wordHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wordInfo: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  schemeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  schemeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  
  // تفاصيل الكلمة في البطاقة
  wordDetails: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 6,
  },
  frequencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  viewDetailsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 8,
  },
  viewDetailsText: {
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
  modalWordHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalWordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
    flex: 1,
  },
  modalSchemeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  modalSchemeText: {
    color: '#fff',
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