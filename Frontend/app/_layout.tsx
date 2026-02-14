// AppLayout.tsx

import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';

export const colors = {
  primary: '#1a365d',
  secondary: '#d69e2e',
  background: '#f7fafc',
  lightGold: '#f6e05e',
  white: '#ffffff',
};

// ================= CUSTOM DRAWER =================
function CustomDrawerContent(props: any) {
  return (
    <LinearGradient
      colors={[colors.primary, '#243b55']}
      style={styles.drawerContainer}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* HEADER */}
        <View style={styles.drawerHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={38} color={colors.white} />
          </View>

          <Text style={styles.appTitle}>المحرك الصرفي</Text>
          
        </View>

        {/* ITEMS */}
        <View style={{ paddingHorizontal: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

// ================= MAIN LAYOUT =================
export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        drawerType: 'slide',
        headerShown: true,

        // ===== HEADER STYLE =====
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },

        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 19,
          letterSpacing: 1,
        },

        // ===== DRAWER STYLE =====
        drawerStyle: {
          width: 270,
        },

        drawerActiveBackgroundColor: 'rgba(246, 224, 94, 0.15)',
        drawerActiveTintColor: colors.lightGold,
        drawerInactiveTintColor: '#e2e8f0',

        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'right',
        },

        drawerItemStyle: {
          borderRadius: 14,
          marginVertical: 6,
        },
      }}
    >
      {/* ===== SCREENS ===== */}

      <Drawer.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          drawerIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.activeIconWrapper,
              ]}
            >
              <Ionicons name="home-outline" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="ajouter"
        options={{
          title: 'إضافة جذر',
          drawerIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.activeIconWrapper,
              ]}
            >
              <Ionicons name="add-circle-outline" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="generer"
        options={{
          title: 'توليد الكلمات',
          drawerIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.activeIconWrapper,
              ]}
            >
              <Ionicons name="flash-outline" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="valider"
        options={{
          title: 'التحقق الصرفي',
          drawerIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.activeIconWrapper,
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="schemes"
        options={{
          title: 'قائمة الأنماط',
          drawerIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.activeIconWrapper,
              ]}
            >
              <Ionicons name="color-palette-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Drawer>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },

  drawerHeader: {
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 15,
  },

  logoCircle: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 100,
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 4,
  },

  iconWrapper: {
    padding: 6,
    borderRadius: 10,
  },

  activeIconWrapper: {
    backgroundColor: 'rgba(246,224,94,0.2)',
  },
});
