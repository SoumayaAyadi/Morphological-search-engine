// SchemesScreen.js - بنفس تصميم AddRootScreen ✅
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { colors } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { schemeService } from '../services/schemeService';

export default function SchemesScreen() {
  // State للإضافة
  const [schemeName, setSchemeName] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State للحذف
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // State للتحديث
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State للـ SweetAlert المخصص
  const [sweetAlert, setSweetAlert] = useState({
    visible: false,
    schemeToDelete: null,
    message: '',
    type: 'warning' // 'warning', 'success', 'error'
  });
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 📥 تحميل الأنماط
  const loadSchemes = async () => {
    try {
      const response = await schemeService.getAllSchemes();
      
      // تنسيق البيانات
      let schemesData = [];
      if (Array.isArray(response)) {
        schemesData = response;
      } else if (response && response.data) {
        schemesData = response.data;
      }
      
      const formattedSchemes = schemesData.map((scheme, index) => ({
        id: scheme.id || scheme.nom || index.toString(),
        text: scheme.nom || scheme.name || '',
        usage: scheme.usageCount || scheme.usage || 0,
        date: new Date(scheme.createdAt || Date.now()).toLocaleDateString('ar-SA'),
        type: scheme.type || 'CUSTOM'
      }));
      
      setSchemes(formattedSchemes);
    } catch (error) {
      console.error('Error loading schemes:', error);
    }
  };

  useEffect(() => {
    loadSchemes();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ التحقق من صحة النمط
  const validateScheme = (text) => {
    if (text.length < 3) {
      setSweetAlert({
        visible: true,
        message: '⚠️ النمط يجب أن يكون 3 أحرف على الأقل',
        type: 'warning',
        autoClose: true
      });
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      return false;
    }
    
    // التحقق من وجود ف، ع، ل
    if (!text.includes('ف') || !text.includes('ع') || !text.includes('ل')) {
      setSweetAlert({
        visible: true,
        message: '⚠️ يجب أن يحتوي النمط على ف، ع، ل',
        type: 'warning',
        autoClose: true
      });
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      return false;
    }
    
    const arabicRegex = /^[\u0600-\u06FF]+$/;
    if (!arabicRegex.test(text)) {
      setSweetAlert({
        visible: true,
        message: '⚠️ أحرف عربية فقط',
        type: 'warning',
        autoClose: true
      });
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      return false;
    }
    return true;
  };

  // ➕ إضافة نمط - مع SweetAlert
  const handleAddScheme = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!validateScheme(schemeName)) return;

    try {
      setLoading(true);
      await schemeService.addScheme({
        nom: schemeName.trim()
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم إضافة النمط "${schemeName}" بنجاح`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      loadSchemes();
      setSchemeName('');
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل إضافة النمط';
      if (error.response?.status === 409) {
        message = `⚠️ النمط "${schemeName}" موجود مسبقاً`;
      }
      
      setSweetAlert({
        visible: true,
        message,
        type: 'error',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ حذف نمط - مع SweetAlert
  const handleDeleteScheme = (schemeText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSweetAlert({
      visible: true,
      schemeToDelete: schemeText,
      message: `🗑️ هل أنت متأكد من حذف النمط "${schemeText}"؟`,
      type: 'warning'
    });
  };

  // ✅ تنفيذ الحذف الفعلي
  const confirmDelete = async () => {
    const schemeText = sweetAlert.schemeToDelete;
    
    try {
      setSweetAlert(prev => ({ ...prev, visible: false }));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setDeleteLoading(schemeText);
      
      await schemeService.deleteScheme(schemeText);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم حذف النمط "${schemeText}" بنجاح`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      loadSchemes();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setSweetAlert({
        visible: true,
        message: '❌ فشل حذف النمط',
        type: 'error',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
    } finally {
      setDeleteLoading(null);
    }
  };

  // ✏️ فتح نافذة التحديث
  const openUpdateModal = (schemeItem) => {
    setSelectedScheme(schemeItem);
    setUpdateValue(schemeItem.text);
    setUpdateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ✏️ تحديث نمط - مع SweetAlert
  const handleUpdateScheme = async () => {
    if (!selectedScheme) return;
    
    if (!validateScheme(updateValue)) return;

    try {
      setUpdateLoading(true);
      
      await schemeService.modifyScheme(selectedScheme.text, updateValue.trim());
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم تحديث النمط إلى "${updateValue}"`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      setUpdateModalVisible(false);
      loadSchemes();
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل تحديث النمط';
      if (error.response?.status === 409) {
        message = `⚠️ النمط "${updateValue}" موجود مسبقاً`;
      } else if (error.response?.status === 404) {
        message = `⚠️ النمط غير موجود`;
      }
      
      setSweetAlert({
        visible: true,
        message,
        type: 'error',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
    } finally {
      setUpdateLoading(false);
    }
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
                sweetAlert.type === 'warning' ? '#f59e0b' :
                sweetAlert.type === 'success' ? '#10b981' :
                '#ef4444'
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
        </View>
      </View>
    </Modal>
  );

  // 📋 عرض عنصر النمط
  const renderSchemeItem = ({ item }) => (
    <View style={styles.schemeCard}>
      <View style={styles.schemeHeader}>
        <Text style={styles.schemeText}>{item.text}</Text>
        <View style={styles.actionButtons}>
          {/* زر التحديث */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openUpdateModal(item)}
          >
            <Ionicons name="pencil" size={18} color="#3b82f6" />
          </TouchableOpacity>
          
          {/* زر الحذف مع SweetAlert */}
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteScheme(item.text)}
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
      
      <View style={styles.schemeFooter}>
        <Text style={styles.schemeDate}>{item.date}</Text>
        <View style={styles.usageBadge}>
          <Ionicons name="stats-chart" size={12} color="#4f46e5" />
          <Text style={styles.schemeUsage}>{item.usage} استخدام</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الأنماط الصرفية</Text>
        <Text style={styles.subtitle}>إدارة أوزان الكلمات العربية</Text>
        
        {/* إحصائيات سريعة */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{schemes.length}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{schemes.filter(s => s.usage > 0).length}</Text>
            <Text style={styles.statLabel}>مستخدمة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{schemes.filter(s => s.usage === 0).length}</Text>
            <Text style={styles.statLabel}>جديدة</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ➕ بطاقة الإضافة */}
        <View style={styles.addCard}>
          <Text style={styles.inputLabel}>نمط جديد</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input, 
                schemeName.length >= 3 && 
                schemeName.includes('ف') && 
                schemeName.includes('ع') && 
                schemeName.includes('ل') && styles.inputValid
              ]}
              placeholder="مثال: فاعل"
              value={schemeName}
              onChangeText={setSchemeName}
              textAlign="right"
            />
            <Text style={[
              styles.charCount,
              schemeName.length >= 3 ? styles.charCountValid : styles.charCountInvalid
            ]}>
              {schemeName.length}/3+
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.disabledButton]}
            onPress={handleAddScheme}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'جاري الإضافة...' : '➕ إضافة نمط'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 📋 قائمة الأنماط */}
        <View style={styles.schemesSection}>
          <Text style={styles.sectionTitle}>📚 الأنماط المحفوظة ({schemes.length})</Text>
          
          {schemes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="code-slash-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>لا توجد أنماط</Text>
              <Text style={styles.emptySubtext}>أضف نمطاً جديداً</Text>
            </View>
          ) : (
            <FlatList
              data={schemes}
              renderItem={renderSchemeItem}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ تحديث النمط</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>النمط الحالي</Text>
            <Text style={styles.modalCurrentValue}>{selectedScheme?.text}</Text>
            
            <Text style={styles.modalLabel}>النمط الجديد</Text>
            <TextInput
              style={styles.modalInput}
              value={updateValue}
              onChangeText={setUpdateValue}
              textAlign="right"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setUpdateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>❌ إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalConfirmButton,
                  updateLoading && styles.disabledButton
                ]}
                onPress={handleUpdateScheme}
                disabled={updateLoading}
              >
                <Text style={styles.modalConfirmText}>
                  {updateLoading ? 'جاري...' : '✅ تحديث'}
                </Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#0f172a',
    textAlign: 'right',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingRight: 50,
  },
  inputValid: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  charCount: {
    position: 'absolute',
    left: 16,
    top: 14,
    fontSize: 14,
    fontWeight: 'bold',
  },
  charCountValid: {
    color: '#10b981',
  },
  charCountInvalid: {
    color: '#94a3b8',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  schemesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'right',
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  schemeHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  schemeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
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
  schemeFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeDate: {
    fontSize: 12,
    color: '#64748b',
  },
  usageBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  schemeUsage: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#0f172a',
  },
  modalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'right',
  },
  modalCurrentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'right',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  modalInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: '#0f172a',
    textAlign: 'right',
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#f1f5f9',
    marginLeft: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748b',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
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
    borderTopColor: '#f59e0b',
  },
  sweetAlertSuccess: {
    borderTopWidth: 6,
    borderTopColor: '#10b981',
  },
  sweetAlertError: {
    borderTopWidth: 6,
    borderTopColor: '#ef4444',
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
    color: '#0f172a',
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
    fontSize: 15,
  },
  sweetAlertConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
//najjim nziid des schemes a partir min fichier//