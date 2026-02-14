// ValidateScreen.js - نسخة مصححة ✅
import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { morphologyService } from '../services/morphologyService';

const colors = {
  primary: '#ffffff',
  secondary: '#4f46e5',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  success: '#10b981',
  danger: '#ef4444',
};

export default function ValidateScreen() {
  const [word, setWord] = useState('');
  const [root, setRoot] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [scheme, setScheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // التحقق من الكلمة
  const validateWord = async () => {
    if (!word.trim() || !root.trim()) {
      setError('أدخل الكلمة والجذر');
      return;
    }

    setLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // ✅ response هو البيانات مباشرة من api.js
      const response = await morphologyService.validateWord(root.trim(), word.trim());
      console.log('✅ Validate response:', response);
      
      // ✅ استخراج قيمة الصحة
      let validValue = false;
      let schemeValue = '';
      
      if (response && response.success) {
        // إذا كان success = true
        if (response.data) {
          validValue = response.data.valid === true;
          schemeValue = response.data.scheme || '';
        }
      } else if (response && response.data) {
        // إذا كان فيه data
        validValue = response.data.valid === true;
        schemeValue = response.data.scheme || '';
      } else if (response && response.valid !== undefined) {
        // إذا كان فيه valid مباشرة
        validValue = response.valid === true;
        schemeValue = response.scheme || '';
      }
      
      console.log('✅ Valid value:', validValue);
      console.log('✅ Scheme value:', schemeValue);
      
      // تحديث الحالات
      setIsValid(validValue);
      setScheme(schemeValue);
      
      // الاهتزاز حسب النتيجة
      if (validValue) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
    } catch (err) {
      console.error('Validation error:', err);
      setError('فشل الاتصال بالخادم: ' + (err.response?.data?.message || err.message));
      setIsValid(null);
      setScheme('');
    } finally {
      setLoading(false);
    }
  };

  // تحليل الكلمة (عكسي)
  const analyzeWord = async () => {
    if (!word.trim()) {
      setError('أدخل كلمة للتحليل');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // ✅ response هو البيانات مباشرة من api.js
      const response = await morphologyService.analyzeWord(word.trim());
      console.log('✅ Analyze response:', response);
      
      let found = false;
      let rootValue = '';
      let schemeValue = '';
      
      if (response && response.data) {
        if (response.data.found) {
          found = true;
          rootValue = response.data.racine || '';
          schemeValue = response.data.scheme || '';
        }
      } else if (response && response.found) {
        found = true;
        rootValue = response.racine || '';
        schemeValue = response.scheme || '';
      }
      
      if (found) {
        setRoot(rootValue);
        setScheme(schemeValue);
        setIsValid(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError('لم يتم العثور على تحليل');
        setIsValid(false);
        setScheme('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('فشل الاتصال بالخادم: ' + (err.response?.data?.message || err.message));
      setIsValid(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setWord('');
    setRoot('');
    setIsValid(null);
    setScheme('');
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التحقق الصرفي</Text>
        <Text style={styles.subtitle}>تحقق من صحة الكلمة مع جذرها</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* بطاقة الإدخال */}
        <View style={styles.card}>
          <Text style={styles.label}>الكلمة</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="مثال: كاتب"
              value={word}
              onChangeText={setWord}
              textAlign="right"
            />
            {word.length > 0 && (
              <TouchableOpacity onPress={() => setWord('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* زر التحليل */}
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={analyzeWord}
            disabled={!word.trim() || loading}
          >
            <Text style={styles.analyzeButtonText}>🔍 تحليل تلقائي</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 16 }]}>الجذر</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="مثال: كتب"
              value={root}
              onChangeText={setRoot}
              textAlign="right"
            />
            {root.length > 0 && (
              <TouchableOpacity onPress={() => setRoot('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* زر التحقق */}
          <TouchableOpacity
            style={[styles.validateButton, (!word.trim() || !root.trim()) && styles.disabledButton]}
            onPress={validateWord}
            disabled={!word.trim() || !root.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.validateButtonText}>تحقق</Text>
            )}
          </TouchableOpacity>

          {/* إعادة تعيين */}
          {(word || root) && (
            <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
              <Text style={styles.resetText}>إعادة تعيين</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* النتيجة */}
        {isValid !== null && (
          <View style={[
            styles.resultCard,
            isValid ? styles.validCard : styles.invalidCard
          ]}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={isValid ? "checkmark-circle" : "close-circle"} 
                size={32} 
                color={isValid ? colors.success : colors.danger} 
              />
              <Text style={[styles.resultTitle, { color: isValid ? colors.success : colors.danger }]}>
                {isValid ? '✓ صحيحة' : '✗ غير صحيحة'}
              </Text>
            </View>
            
            <Text style={styles.resultText}>
              {isValid 
                ? `"${word}" ← "${root}"` 
                : `"${word}" لا تنتمي لـ "${root}"`}
            </Text>

            {isValid && scheme && (
              <View style={styles.schemeBox}>
                <Text style={styles.schemeLabel}>الوزن:</Text>
                <Text style={styles.schemeValue}>{scheme}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  analyzeButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  analyzeButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'right',
  },
  validateButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  validateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  resetText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  validCard: {
    backgroundColor: '#f0fdf4',
    borderColor: colors.success,
  },
  invalidCard: {
    backgroundColor: '#fef2f2',
    borderColor: colors.danger,
  },
  resultHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  resultText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  schemeBox: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  schemeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  schemeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
});