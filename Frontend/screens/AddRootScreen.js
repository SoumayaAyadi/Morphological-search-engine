// AddRootScreen.js - نسخة كاملة مع SweetAlert ✅
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ScrollView,
  Alert,
  Animated,
  Modal,
  ActivityIndicator
} from 'react-native';
import { colors } from './theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { racineService } from '../services/racineService';

export default function AddRootScreen() {
  // State للإضافة
  const [root, setRoot] = useState('');
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State للحذف
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // State للتحديث
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State للـ SweetAlert المخصص
  const [sweetAlert, setSweetAlert] = useState({
    visible: false,
    rootToDelete: null,
    message: '',
    type: 'warning' // 'warning', 'success', 'error'
  });
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 📥 تحميل الجذور
  const loadRoots = async () => {
    try {
      const response = await racineService.getAllRacines();
      const rootsData = response.data || [];
      
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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ التحقق من صحة الجذر
  const validateRoot = (text) => {
    if (text.length !== 3) {
      Alert.alert('تنبيه', 'الجذر يجب أن يكون 3 أحرف');
      return false;
    }
    const arabicRegex = /^[\u0600-\u06FF]+$/;
    if (!arabicRegex.test(text)) {
      Alert.alert('تنبيه', 'أحرف عربية فقط');
      return false;
    }
    return true;
  };

  // ➕ إضافة جذر - مع SweetAlert
  const handleAddRoot = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (root.length !== 3) {
      setSweetAlert({
        visible: true,
        message: '⚠️ الجذر يجب أن يكون 3 أحرف',
        type: 'warning',
        autoClose: true
      });
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      return;
    }

    try {
      setLoading(true);
      await racineService.addRacine(root);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم إضافة الجذر "${root}" بنجاح`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      loadRoots();
      setRoot('');
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل إضافة الجذر';
      if (error.response?.status === 409) {
        message = `⚠️ الجذر "${root}" موجود مسبقاً`;
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

  // 🗑️ حذف جذر - مع SweetAlert
  const handleDeleteRoot = (rootText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSweetAlert({
      visible: true,
      rootToDelete: rootText,
      message: `🗑️ هل أنت متأكد من حذف الجذر "${rootText}"؟`,
      type: 'warning'
    });
  };

  // ✅ تنفيذ الحذف الفعلي
  const confirmDelete = async () => {
    const rootText = sweetAlert.rootToDelete;
    
    try {
      setSweetAlert(prev => ({ ...prev, visible: false }));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setDeleteLoading(rootText);
      
      await racineService.deleteRacine(rootText);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم حذف الجذر "${rootText}" بنجاح`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      loadRoots();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setSweetAlert({
        visible: true,
        message: '❌ فشل حذف الجذر',
        type: 'error',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
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

  // ✏️ تحديث جذر - مع SweetAlert
  const handleUpdateRoot = async () => {
    if (!selectedRoot) return;
    
    if (updateValue.length !== 3) {
      setSweetAlert({
        visible: true,
        message: '⚠️ الجذر يجب أن يكون 3 أحرف',
        type: 'warning',
        autoClose: true
      });
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      return;
    }

    try {
      setUpdateLoading(true);
      
      await racineService.updateRacine(selectedRoot.text, updateValue);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSweetAlert({
        visible: true,
        message: `✅ تم تحديث الجذر إلى "${updateValue}"`,
        type: 'success',
        autoClose: true
      });
      
      setTimeout(() => setSweetAlert(prev => ({ ...prev, visible: false })), 2000);
      
      setUpdateModalVisible(false);
      loadRoots();
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let message = '❌ فشل تحديث الجذر';
      if (error.response?.status === 409) {
        message = `⚠️ الجذر "${updateValue}" موجود مسبقاً`;
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

  // 📋 عرض عنصر الجذر
  const renderRootItem = ({ item }) => (
    <View style={styles.rootCard}>
      <View style={styles.rootHeader}>
        <Text style={styles.rootText}>{item.text}</Text>
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
        <Text style={styles.rootDate}>{item.date}</Text>
        <View style={styles.derivesBadge}>
          <Ionicons name="git-network" size={12} color="#4f46e5" />
          <Text style={styles.rootDerives}>{item.derives} مشتقات</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الجذور العربية</Text>
        <Text style={styles.subtitle}>إدارة جذور الكلمات</Text>
        
        {/* إحصائيات سريعة */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{roots.length}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{roots.filter(r => r.derives > 0).length}</Text>
            <Text style={styles.statLabel}>مشتقات</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{roots.filter(r => r.derives === 0).length}</Text>
            <Text style={styles.statLabel}>جديد</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ➕ بطاقة الإضافة */}
        <View style={styles.addCard}>
          <Text style={styles.inputLabel}>جذر ثلاثي جديد</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, root.length === 3 && styles.inputValid]}
              placeholder="مثال: كتب"
              value={root}
              onChangeText={setRoot}
              maxLength={3}
              textAlign="right"
            />
            <Text style={[
              styles.charCount,
              root.length === 3 ? styles.charCountValid : styles.charCountInvalid
            ]}>
              {root.length}/3
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, (root.length !== 3 || loading) && styles.disabledButton]}
            onPress={handleAddRoot}
            disabled={root.length !== 3 || loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'جاري الإضافة...' : '➕ إضافة جذر'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 📋 قائمة الجذور */}
        <View style={styles.rootsSection}>
          <Text style={styles.sectionTitle}>📚 الجذور المحفوظة ({roots.length})</Text>
          
          {roots.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="git-network-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>لا توجد جذور</Text>
              <Text style={styles.emptySubtext}>أضف جذراً جديداً</Text>
            </View>
          ) : (
            <FlatList
              data={roots}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ تحديث الجذر</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>الجذر الحالي</Text>
            <Text style={styles.modalCurrentValue}>{selectedRoot?.text}</Text>
            
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
                <Text style={styles.modalCancelText}>❌ إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalConfirmButton,
                  (updateValue.length !== 3 || updateLoading) && styles.disabledButton
                ]}
                onPress={handleUpdateRoot}
                disabled={updateValue.length !== 3 || updateLoading}
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
  rootsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'right',
  },
  rootCard: {
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
  rootHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rootText: {
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
  rootFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rootDate: {
    fontSize: 12,
    color: '#64748b',
  },
  derivesBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rootDerives: {
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


//nzid des racines a partir min fichier //