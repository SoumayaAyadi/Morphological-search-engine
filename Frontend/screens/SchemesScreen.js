// SchemesScreen.js - تصميم محسّن ومتطور
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ScrollView,
  Alert,
  Animated
} from 'react-native';
import { colors, shadows } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SchemesScreen() {
  const [schemeName, setSchemeName] = useState('');
  const [rule, setRule] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState('');
  const [schemes, setSchemes] = useState([
    { 
      id: '1', 
      name: 'فاعل', 
      rule: 'C1 + ا + C2 + C3', 
      description: 'صيغة الفاعل من الفعل الثلاثي',
      examples: 'كَتَب → كاتب، دَرَس → دارس',
      usage: '12 مرة'
    },
    { 
      id: '2', 
      name: 'مفعول', 
      rule: 'م + C1 + C2 + و + C3', 
      description: 'صيغة المفعول من الفعل الثلاثي',
      examples: 'كَتَب → مكتوب، عَلَم → معلوم',
      usage: '8 مرات'
    },
    { 
      id: '3', 
      name: 'فعّال', 
      rule: 'C1 + C2 + ا + C3', 
      description: 'صيغة المبالغة',
      examples: 'عَلَم → علام، كَتَب → كتّاب',
      usage: '5 مرات'
    },
    { 
      id: '4', 
      name: 'استفعل', 
      rule: 'ا + س + ت + C1 + C2 + C3', 
      description: 'صيغة الاستفعال',
      examples: 'خَدم → استخدم، عَلَم → استعلم',
      usage: '3 مرات'
    },
  ]);

  // إضافة شيكل جديد
  const addScheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!schemeName.trim() || !rule.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newScheme = {
      id: Date.now().toString(),
      name: schemeName,
      rule: rule,
      description: description,
      examples: examples,
      usage: '0 مرة'
    };

    setSchemes([newScheme, ...schemes]);
    
    // إعادة تعيين الحقول
    setSchemeName('');
    setRule('');
    setDescription('');
    setExamples('');
    
    Alert.alert('نجاح', 'تم إضافة الشيكل بنجاح');
  };

  // حذف شيكل
  const deleteScheme = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الشيكل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            setSchemes(schemes.filter(scheme => scheme.id !== id));
          }
        }
      ]
    );
  };

  // بطاقة الشيكل
  const renderScheme = ({ item }) => (
    <TouchableOpacity 
      style={[styles.schemeCard, shadows.medium]}
      activeOpacity={0.9}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.schemeHeader}>
        <View style={styles.schemeTitleContainer}>
          <View style={[styles.schemeIcon, { backgroundColor: getSchemeColor(item.id) }]}>
            <Ionicons name="code-working" size={20} color="#fff" />
          </View>
          <View style={styles.schemeInfo}>
            <Text style={styles.schemeName}>{item.name}</Text>
            <Text style={styles.schemeRule}>{item.rule}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteScheme(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      {item.description && (
        <View style={styles.schemeDetail}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.schemeDescription}>{item.description}</Text>
        </View>
      )}
      
      {item.examples && (
        <View style={styles.schemeDetail}>
          <Ionicons name="book-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.schemeExamples}>أمثلة: {item.examples}</Text>
        </View>
      )}
      
      <View style={styles.schemeFooter}>
        <View style={styles.usageBadge}>
          <Ionicons name="stats-chart-outline" size={14} color={colors.secondary} />
          <Text style={styles.usageText}>{item.usage}</Text>
        </View>
        
        <TouchableOpacity style={styles.useButton}>
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={styles.useButtonText}>استخدم</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // لون لكل شيكل
  const getSchemeColor = (id) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const index = parseInt(id) % colors.length;
    return colors[index] || '#8b5cf6';
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* بطاقة إضافة شيكل */}
      <View style={[styles.addCard, shadows.medium]}>
        <View style={styles.cardHeader}>
          <Ionicons name="add-circle" size={28} color={colors.secondary} />
          <Text style={styles.cardTitle}>إضافة نمط جديد</Text>
        </View>
        
        <Text style={styles.inputLabel}>اسم النمط</Text>
        <TextInput 
          style={[styles.input, shadows.soft]} 
          placeholder="مثال: فاعل، مفعول، فعّال..." 
          placeholderTextColor="#94a3b8"
          value={schemeName}
          onChangeText={setSchemeName}
          textAlign="right"
        />
        
        <Text style={styles.inputLabel}>قاعدة التحويل</Text>
        <TextInput 
          style={[styles.input, shadows.soft]} 
          placeholder="مثال: C1 + ا + C2 + C3" 
          placeholderTextColor="#94a3b8"
          value={rule}
          onChangeText={setRule}
          textAlign="right"
        />
        
        <Text style={styles.inputLabel}>الوصف (اختياري)</Text>
        <TextInput 
          style={[styles.input, shadows.soft, styles.textArea]} 
          placeholder="وصف مختصر للنمط..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          textAlign="right"
          multiline
          numberOfLines={3}
        />
        
        <Text style={styles.inputLabel}>أمثلة (اختياري)</Text>
        <TextInput 
          style={[styles.input, shadows.soft, styles.textArea]} 
          placeholder="مثال: كَتَب → كاتب، دَرَس → دارس"
          placeholderTextColor="#94a3b8"
          value={examples}
          onChangeText={setExamples}
          textAlign="right"
          multiline
          numberOfLines={2}
        />
        
        <TouchableOpacity 
          style={[styles.addButton, shadows.medium]}
          onPress={addScheme}
          activeOpacity={0.8}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>حفظ النمط</Text>
        </TouchableOpacity>
      </View>

      {/* قسم الأنماط المحفوظة */}
      <View style={styles.schemesSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="layers" size={24} color={colors.secondary} />
          <Text style={styles.sectionTitle}>الأنماط المحفوظة ({schemes.length})</Text>
        </View>
        
        {schemes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="code-slash" size={60} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد أنماط محفوظة</Text>
            <Text style={styles.emptySubtext}>ابدأ بإضافة نمط جديد</Text>
          </View>
        ) : (
          <FlatList
            data={schemes}
            renderItem={renderScheme}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.schemesList}
          />
        )}
      </View>
      
      {/* معلومات مساعدة */}
      <View style={[styles.infoCard, shadows.soft]}>
        <View style={styles.infoHeader}>
          <Ionicons name="help-circle" size={22} color={colors.secondary} />
          <Text style={styles.infoTitle}>كيفية استخدام الأنماط</Text>
        </View>
        <Text style={styles.infoText}>
          • C1, C2, C3 تمثل حروف الجذر
        </Text>
        <Text style={styles.infoText}>
          • يمكنك استخدام + لربط الحروف والحركات
        </Text>
        <Text style={styles.infoText}>
          • استخدم الأنماط لتوليد كلمات جديدة من الجذور
        </Text>
      </View>
    </ScrollView>
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
  
  // بطاقة الإضافة
  addCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  
  // قسم الأنماط
  schemesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  schemesList: {
    paddingBottom: 4,
  },
  
  // بطاقة الشيكل
  schemeCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  schemeHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schemeTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  schemeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  schemeRule: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  schemeDetail: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  schemeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  schemeExamples: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    flex: 1,
    marginRight: 8,
    fontStyle: 'italic',
  },
  schemeFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  usageBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 6,
  },
  useButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  
  // بطاقة المعلومات
  infoCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 16,
    padding: 16,
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
});

// إضافة shadows إذا لم تكن موجودة في theme
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