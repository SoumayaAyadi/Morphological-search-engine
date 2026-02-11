import React from 'react';
import { Tabs } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { colors } from './theme'; // Thabbet fisti el path s7i7 walla la!

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-outline';

          // Mapping exact m3a el names elli louta
          if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'AddRootScreen') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'GenerateScreen') iconName = focused ? 'create' : 'create-outline';
          else if (route.name === 'ValidateScreen') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'SchemesScreen') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'DerivesScreen') iconName = focused ? 'list' : 'list-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors?.primary || '#2c3e50',
        tabBarInactiveTintColor: colors?.textLight || '#7f8c8d',
        headerStyle: { backgroundColor: colors?.primary || '#2c3e50' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      })}
    >
      {/* Kol "name" lezem i9ablou fichier (.js walla .tsx) f west el dossier /app */}
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="AddRootScreen" options={{ title: 'إضافة جذر' }} />
      <Tabs.Screen name="GenerateScreen" options={{ title: 'توليد كلمة' }} />
      <Tabs.Screen name="ValidateScreen" options={{ title: 'التحقق' }} />
      <Tabs.Screen name="SchemesScreen" options={{ title: 'الأنماط' }} />
      <Tabs.Screen name="DerivesScreen" options={{ title: 'الكلمات المشتقة' }} />
    </Tabs>
  );
}