import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

function MenuItem({ icon, title, subtitle, onPress, color = '#3B82F6' }) {
  return (
    <Pressable
      className="flex-row items-center bg-white p-4 border-b border-gray-100"
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function MoreScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* User Profile Card */}
      <View className="bg-white m-4 p-5 rounded-xl shadow-sm">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 text-lg font-bold">{user?.userName || 'User'}</Text>
            <Text className="text-gray-500">{user?.userEmail}</Text>
            {user?.userMobile && (
              <Text className="text-gray-400 text-sm">{user.userMobile}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden mb-4">
        <MenuItem
          icon="wallet"
          title="Expenses"
          subtitle="Track your expenses"
          onPress={() => router.push('/expenses')}
          color="#10B981"
        />
        <MenuItem
          icon="book"
          title="Ledger"
          subtitle="View ledger entries"
          onPress={() => router.push('/ledger')}
          color="#8B5CF6"
        />
        <MenuItem
          icon="notifications"
          title="Notifications"
          subtitle="View all notifications"
          onPress={() => router.push('/notifications')}
          color="#F59E0B"
        />
        <MenuItem
          icon="database"
          title="Master Data"
          subtitle="Manage master data"
          onPress={() => router.push('/masters')}
          color="#EC4899"
        />
      </View>

      <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden mb-4">
        <MenuItem
          icon="person"
          title="Profile"
          subtitle="Update your profile"
          onPress={() => router.push('/profile')}
          color="#6366F1"
        />
        <MenuItem
          icon="settings"
          title="Settings"
          subtitle="App settings"
          onPress={() => router.push('/settings')}
          color="#6B7280"
        />
      </View>

      {/* Logout Button */}
      <Pressable
        className="bg-white mx-4 p-4 rounded-xl shadow-sm flex-row items-center justify-center mb-6"
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#EF4444" />
        <Text className="text-red-500 font-semibold ml-2">Logout</Text>
      </Pressable>

      {/* App Version */}
      <Text className="text-center text-gray-400 text-sm mb-6">
        RTO Agent Pro v1.0.0
      </Text>
    </ScrollView>
  );
}
