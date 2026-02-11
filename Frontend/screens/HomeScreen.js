// HomeScreen.js - كامل ومصحح
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
} from 'react-native';
import { colors, theme } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// بيانات نموذجية للكلمات
const SAMPLE_WORDS = [
  { id: '1', word: 'مكتب', root: 'كتب', meaning: 'مكان الكتابة', category: 'أماكن', date: '2024-03-15' },
  { id: '2', word: 'كتابة', root: 'كتب', meaning: 'عملية الكتابة', category: 'فعل', date: '2024-03-14' },
  { id: '3', word: 'كاتب', root: 'كتب', meaning: 'الشخص الذي يكتب', category: 'مهنة', date: '2024-03-13' },
  { id: '4', word: 'مدرسة', root: 'درس', meaning: 'مكان التعليم', category: 'أماكن', date: '2024-03-12' },
  { id: '5', word: 'دراسة', root: 'درس', meaning: 'عملية التعلم', category: 'فعل', date: '2024-03-11' },
  { id: '6', word: 'تلميذ', root: 'تلمذ', meaning: 'المتعلم', category: 'شخص', date: '2024-03-10' },
  { id: '7', word: 'كتاب', root: 'كتب', meaning: 'مادة مكتوبة', category: 'أشياء', date: '2024-03-09' },
  { id: '8', word: 'مكتبة', root: 'كتب', meaning: 'مكان حفظ الكتب', category: 'أماكن', date: '2024-03-08' },
  { id: '9', word: 'درس', root: 'درس', meaning: 'مادة تعليمية', category: 'أشياء', date: '2024-03-07' },
  { id: '10', word: 'مدرّس', root: 'درس', meaning: 'المعلم', category: 'مهنة', date: '2024-03-06' },
  { id: '11', word: 'تعليم', root: 'علم', meaning: 'عملية التدريس', category: 'فعل', date: '2024-03-05' },
  { id: '12', word: 'عالم', root: 'علم', meaning: 'الشخص العليم', category: 'مهنة', date: '2024-03-04' },
  { id: '13', word: 'معلومة', root: 'علم', meaning: 'بيان أو خبر', category: 'أشياء', date: '2024-03-03' },
  { id: '14', word: 'علم', root: 'علم', meaning: 'المعرفة', category: 'مفهوم', date: '2024-03-02' },
  { id: '15', word: 'كاتبة', root: 'كتب', meaning: 'المرأة التي تكتب', category: 'مهنة', date: '2024-03-01' },
];

// إحصائيات نموذجية
const INITIAL_STATS = {
  totalRoots: 15,
  generatedWords: 42,
  categories: 8,
  lastUpdate: 'قبل دقيقة',
  topCategory: 'أماكن',
  mostUsedRoot: 'كتب',
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState(SAMPLE_WORDS);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // تصفية الكلمات حسب البحث
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(SAMPLE_WORDS);
    } else {
      const filtered = SAMPLE_WORDS.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.root.includes(searchQuery) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [searchQuery]);

  // تأثير الظهور
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // تحديث البيانات
  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // محاكاة جلب بيانات جديدة
    setTimeout(() => {
      setStats({
        ...stats,
        lastUpdate: 'الآن',
        generatedWords: stats.generatedWords + 1,
      });
      setRefreshing(false);
    }, 1500);
  };

  // تصفية حسب الفئة - مصحح
  const filterByCategory = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(category);
    
    if (category === 'all') {
      setFilteredWords(SAMPLE_WORDS);
    } else {
      const filtered = SAMPLE_WORDS.filter(word => word.category === category);
      setFilteredWords(filtered);
    }
  };

  // عداد متحرك للإحصائيات - مصحح
  const Counter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (value === 0) {
        setCount(0);
        return;
      }
      
      let start = 0;
      const end = value;
      const incrementTime = Math.max(1, duration / end); // إصلاح القسمة على الصفر
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      
      return () => clearInterval(timer);
    }, [value, duration]);
    
    return <Text style={styles.statValue}>{count}</Text>;
  };

  // بطاقة الكلمة - مصحح
  const WordCard = ({ item }) => (
    <TouchableOpacity
      style={styles.wordCard}
      activeOpacity={0.7}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.wordHeader}>
        <Text style={styles.wordText}>{item.word}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.wordDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="leaf" size={16} color={colors.secondary} />
          <Text style={styles.rootText}>الجذر: {item.root}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="book" size={16} color={colors.lightPurple} />
          <Text style={styles.meaningText}>المعنى: {item.meaning}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.dateText}>أضيفت في: {item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // لون الفئة - مصحح
  const getCategoryColor = (category) => {
    const colorsMap = {
      'أماكن': '#60a5fa',
      'فعل': '#34d399',
      'مهنة': '#f472b6',
      'شخص': '#fbbf24',
      'أشياء': '#818cf8',
      'مفهوم': '#a78bfa',
    };
    return colorsMap[category] || '#9ca3af';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن كلمة، جذر، أو معنى..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="filter" size={24} color={colors.secondary} />
        </TouchableOpacity>
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
        {/* إحصائيات سريعة */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="stats-chart" size={28} color={colors.secondary} />
            <Text style={styles.statsTitle}>الإحصائيات</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cube" size={24} color={colors.secondary} />
              </View>
              <Counter value={stats.totalRoots} />
              <Text style={styles.statLabel}>الجذور</Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="create" size={24} color={colors.accent} />
              </View>
              <Counter value={stats.generatedWords} />
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
          
          <View style={styles.advancedStats}>
            <View style={styles.advancedStat}>
              <Ionicons name="trending-up" size={18} color="#10b981" />
              <Text style={styles.advancedStatText}>الجذر الأكثر استخداماً: <Text style={styles.highlight}>{stats.mostUsedRoot}</Text></Text>
            </View>
            <View style={styles.advancedStat}>
              <Ionicons name="star" size={18} color="#f59e0b" />
              <Text style={styles.advancedStatText}>الفئة الرئيسية: <Text style={styles.highlight}>{stats.topCategory}</Text></Text>
            </View>
          </View>
        </View>

        {/* فلاتر الفئات */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {['all', 'أماكن', 'فعل', 'مهنة', 'شخص', 'أشياء'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                activeFilter === category && styles.activeCategoryFilter,
              ]}
              onPress={() => filterByCategory(category)}
            >
              <Text style={[
                styles.categoryFilterText,
                activeFilter === category && styles.activeCategoryFilterText,
              ]}>
                {category === 'all' ? 'الكل' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* القاموس */}
        <View style={styles.dictionaryCard}>
          <View style={styles.dictionaryHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="book" size={28} color={colors.secondary} />
              <Text style={styles.dictionaryTitle}>
                القاموس ({filteredWords.length} كلمة)
              </Text>
            </View>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {filteredWords.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-off" size={60} color={colors.border} />
              <Text style={styles.emptyStateText}>لا توجد نتائج للبحث</Text>
              <Text style={styles.emptyStateSubtext}>حاول البحث بكلمة أخرى</Text>
            </View>
          ) : (
            <FlatList
              data={filteredWords}
              renderItem={({ item }) => <WordCard item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.wordsList}
            />
          )}
        </View>
        
        {/* تحديث تلقائي */}
        <View style={styles.updateInfo}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.updateText}>آخر تحديث: {stats.lastUpdate}</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // شريط البحث
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
    marginLeft: 12,
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
  filterButton: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  
  // بطاقة الإحصائيات
  statsCard: {
    backgroundColor: colors.primary,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.medium,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  advancedStats: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  advancedStat: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  advancedStatText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  highlight: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  
  // فلاتر الفئات
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
  
  // بطاقة القاموس
  dictionaryCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.medium,
  },
  dictionaryHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dictionaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  sortButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  wordsList: {
    paddingBottom: 4,
  },
  
  // بطاقة الكلمة
  wordCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  wordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rootText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  meaningText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginRight: 8,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: 8,
  },
  
  // حالة فارغة
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
  
  // تحديث تلقائي
  updateInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  updateText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
});