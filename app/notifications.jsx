import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../src/contexts/AlertContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'Document Expiry',
      message: 'Vehicle RC (MH12AB1234) will expire in 7 days',
      party: 'ABC Transport',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'Insurance',
      message: 'Insurance for GJ01CD5678 expires tomorrow',
      party: 'XYZ Logistics',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      type: 'Payment',
      message: 'Payment received from ABC Transport',
      party: 'ABC Transport',
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const [tabCounts, setTabCounts] = useState({
    all: 3,
    unread: 2,
    read: 1,
  });

  const updateTabCounts = () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const readCount = notifications.filter((n) => n.isRead).length;
    setTabCounts({
      all: notifications.length,
      unread: unreadCount,
      read: readCount,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      alert.showSuccess('Notifications refreshed');
    }, 1000);
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setTimeout(updateTabCounts, 100);
    alert.showSuccess('Marked as read');
  };

  const handleMarkAllAsRead = async () => {
    const confirmed = await alert.showConfirm(
      'Are you sure you want to mark all notifications as read?',
      {
        title: 'Mark All as Read',
        confirmLabel: 'Yes, Mark All',
        cancelLabel: 'Cancel',
      }
    );

    if (confirmed) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setTimeout(updateTabCounts, 100);
      alert.showSuccess('All notifications marked as read');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.showConfirm(
      'Are you sure you want to delete this notification?',
      {
        title: 'Delete Notification',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      }
    );

    if (confirmed) {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setTimeout(updateTabCounts, 100);
      alert.showSuccess('Notification deleted');
    }
  };

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-900 px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Ionicons name="checkmark-done" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
        {['all', 'unread', 'read'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            className={`px-4 py-2 mr-2 rounded-lg ${
              filter === tab ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <View className="flex-row items-center">
              <Text
                className={`capitalize font-medium ${
                  filter === tab ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                {tab}
              </Text>
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  filter === tab ? 'bg-blue-200' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    filter === tab ? 'text-blue-700' : 'text-gray-600'
                  }`}
                >
                  {tabCounts[tab]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06337c']} />
        }
      >
        <View className="p-4">
          {filteredNotifications.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4">No notifications found</Text>
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <View
                key={notification.id}
                className={`mb-3 p-4 rounded-xl border ${
                  notification.isRead
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View
                        className={`px-2 py-1 rounded ${
                          notification.isRead ? 'bg-gray-200' : 'bg-blue-500'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-white'
                          }`}
                        >
                          {notification.type}
                        </Text>
                      </View>
                      {!notification.isRead && (
                        <View className="ml-2 px-2 py-0.5 bg-blue-500 rounded-full">
                          <Text className="text-xs text-white font-bold">New</Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-gray-800 mb-2 text-sm">{notification.message}</Text>

                    <View className="flex-row items-center">
                      <Text className="text-sm text-gray-500 mr-4">
                        Party: {notification.party}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center ml-2">
                    {!notification.isRead && (
                      <TouchableOpacity
                        onPress={() => handleMarkAsRead(notification.id)}
                        className="p-2"
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDelete(notification.id)}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
