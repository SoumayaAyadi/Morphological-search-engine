// theme.js - ملف جديد أو تعديل الموجود
export const colors = {
  primary: '#ffffff',
  secondary: '#4f46e5',
  accent: '#ec4899',
  background: '#f8fafc',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  lightBlue: '#818cf8',
  lightPink: '#f472b6',
  lightGreen: '#10b981',
  lightPurple: '#8b5cf6',
  border: '#e2e8f0',
};

// تعريف shadows مباشرة
export const shadows = {
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

// كائن theme إذا كنت تحتاجه
export const theme = {
  colors,
  shadows,
};

// أو يمكنك استيراد colors مباشرة دون theme