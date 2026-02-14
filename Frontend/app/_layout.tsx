import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const colors = {
  primary: '#1a365d',
  secondary: '#d69e2e',
  background: '#f7fafc',
  lightGold: '#f6e05e',
  white: '#ffffff',
};

// --- DESIGN DU CONTENU DU MENU LATÉRAL ---
function CustomDrawerContent(props: any) {
  return (
    <LinearGradient colors={[colors.primary, '#2d3748']} style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* Header du Menu : Logo + Titre */}
        <View style={{ padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
          <View style={{ backgroundColor: colors.secondary, padding: 10, borderRadius: 50, marginBottom: 10 }}>
            <Ionicons name="leaf" size={40} color={colors.white} />
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>المحرك الصرفي</Text>
          
        </View>

        {/* Liste des écrans */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

    </LinearGradient>
  );
}

// --- MAIN LAYOUT ---
export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // Configuration globale
        drawerPosition: 'right', // Menu à droite pour l'arabe
        drawerType: 'slide',
        headerShown: true,
        
        // Style du Header (Barre du haut)
        headerStyle: { backgroundColor: colors.primary, height: 100 },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        
        // Style des items dans le menu
        drawerActiveBackgroundColor: 'rgba(214, 158, 46, 0.2)',
        drawerActiveTintColor: colors.lightGold,
        drawerInactiveTintColor: '#fff',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'right', // Alignement pour l'arabe
          marginRight: -10,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginVertical: 5,
          paddingHorizontal: 10,
        }
      }}
    >
      {/* Chaque écran avec son icône spécifique */}
      <Drawer.Screen 
        name="index" 
        options={{ 
          title: 'الرئيسية',
          drawerIcon: ({color}) => <Ionicons name="home-outline" size={22} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="ajouter" 
        options={{ 
          title: 'إضافة جذر',
          drawerIcon: ({color}) => <Ionicons name="add-circle-outline" size={22} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="generer" 
        options={{ 
          title: 'توليد الكلمات',
          drawerIcon: ({color}) => <Ionicons name="flash-outline" size={22} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="valider" 
        options={{ 
          title: 'التحقق الصرفي',
          drawerIcon: ({color}) => <Ionicons name="shield-checkmark-outline" size={22} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="schemes" 
        options={{ 
          title: 'قائمة الأنماط',
          drawerIcon: ({color}) => <Ionicons name="color-palette-outline" size={22} color={color} />
        }} 
      />
    </Drawer>
  );
}