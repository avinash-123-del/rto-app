import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  partyTypeMasterAPI,
  documentTypeMasterAPI,
  expenseCategoryMasterAPI,
  paymentModeMasterAPI,
  notificationTypeAPI,
} from '../../src/services/apiService';
import { useAlert } from '../../src/contexts/AlertContext';

export default function MastersScreen() {
  const router = useRouter();
  const alert = useAlert();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState(params.tab || 'partyType');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [masterData, setMasterData] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    partyType: 0,
    documentType: 0,
    expenseCategory: 0,
    paymentMode: 0,
    notificationType: 0,
  });

  const getMasterConfig = () => {
    const configs = {
      partyType: {
        title: 'Party Types',
        api: partyTypeMasterAPI,
        fields: [
          { name: 'ptmName', label: 'Party Type Name', type: 'text', required: true },
          { name: 'ptmDescription', label: 'Description', type: 'textarea', required: false },
        ],
        idKey: 'ptmId',
        nameKey: 'ptmName',
        isPredefinedKey: 'ptmIsPredefined',
      },
      documentType: {
        title: 'Document Types',
        api: documentTypeMasterAPI,
        fields: [
          { name: 'dtmName', label: 'Document Type Name', type: 'text', required: true },
          { name: 'dtmValidityDays', label: 'Validity (Days)', type: 'number', required: false },
          { name: 'dtmDescription', label: 'Description', type: 'textarea', required: false },
        ],
        idKey: 'dtmId',
        nameKey: 'dtmName',
        isPredefinedKey: 'dtmIsPredefined',
      },
      expenseCategory: {
        title: 'Expense Categories',
        api: expenseCategoryMasterAPI,
        fields: [
          { name: 'ecmName', label: 'Category Name', type: 'text', required: true },
          { name: 'ecmDescription', label: 'Description', type: 'textarea', required: false },
        ],
        idKey: 'ecmId',
        nameKey: 'ecmName',
        isPredefinedKey: 'ecmIsPredefined',
      },
      paymentMode: {
        title: 'Payment Modes',
        api: paymentModeMasterAPI,
        fields: [
          { name: 'pmmName', label: 'Payment Mode Name', type: 'text', required: true },
        ],
        idKey: 'pmmId',
        nameKey: 'pmmName',
        isPredefinedKey: 'pmmIsPredefined',
      },
      notificationType: {
        title: 'Notification Types',
        api: notificationTypeAPI,
        fields: [
          { name: 'ntmName', label: 'Type Name', type: 'text', required: true },
          { name: 'ntmReminderDaysBefore', label: 'Reminder Days Before', type: 'number', required: true },
          { name: 'ntmAutoDeleteHours', label: 'Auto-Delete (Hours)', type: 'number', required: false },
          { name: 'ntmIsActive', label: 'Active', type: 'switch', required: false },
        ],
        idKey: 'ntmId',
        nameKey: 'ntmName',
        isPredefinedKey: 'ntmIsPredefined',
      },
    };
    return configs[activeTab];
  };

  useEffect(() => {
    fetchMasterData();
    fetchTabCounts();
  }, [activeTab]);

  const fetchTabCounts = async () => {
    try {
      const [partyTypeRes, documentTypeRes, expenseCategoryRes, paymentModeRes, notificationTypeRes] =
        await Promise.all([
          partyTypeMasterAPI.getAll({ page: 1, limit: 1 }),
          documentTypeMasterAPI.getAll({ page: 1, limit: 1 }),
          expenseCategoryMasterAPI.getAll({ page: 1, limit: 1 }),
          paymentModeMasterAPI.getAll({ page: 1, limit: 1 }),
          notificationTypeAPI.getAll({ page: 1, limit: 1 }),
        ]);

      setTabCounts({
        partyType: partyTypeRes.data?.data?.pagination?.total || 0,
        documentType: documentTypeRes.data?.data?.pagination?.total || 0,
        expenseCategory: expenseCategoryRes.data?.data?.pagination?.total || 0,
        paymentMode: paymentModeRes.data?.data?.pagination?.total || 0,
        notificationType: notificationTypeRes.data?.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch tab counts', error);
    }
  };

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const config = getMasterConfig();
      const response = await config.api.getAll({});
      console.log('Master Data Response:', response.data);
      setMasterData(response.data.data.items || []);
    } catch (error) {
      alert.showError('Failed to fetch master data');
      setMasterData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMasterData();
    fetchTabCounts();
  }, [activeTab]);

  const handleAdd = () => {
    setEditingItem(null);
    const defaultValues = {};
    if (activeTab === 'notificationType') {
      defaultValues.ntmIsActive = true;
      defaultValues.ntmAutoDeleteHours = '24';
    }
    setFormData(defaultValues);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    const config = getMasterConfig();
    if (item[config.isPredefinedKey]) {
      alert.showWarning('Cannot edit predefined system records');
      return;
    }
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    const config = getMasterConfig();
    if (item[config.isPredefinedKey]) {
      alert.showWarning('Cannot delete predefined system records');
      return;
    }

    const confirmed = await alert.showConfirm(
      `Are you sure you want to delete "${item[config.nameKey]}"?`,
      {
        title: 'Delete Confirmation',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      }
    );

    if (confirmed) {
      try {
        await config.api.delete(item[config.idKey]);
        alert.showSuccess('Item deleted successfully');
        fetchMasterData();
        fetchTabCounts();
      } catch (error) {
        alert.showError(error.data?.message || 'Failed to delete item');
      }
    }
  };

  const handleSubmit = async () => {
    const config = getMasterConfig();

    // Validation
    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        alert.showError(`${field.label} is required`);
        return;
      }
    }

    try {
      setLoading(true);
      if (editingItem) {
        await config.api.update(editingItem[config.idKey], formData);
        alert.showSuccess('Item updated successfully');
      } else {
        await config.api.create(formData);
        alert.showSuccess('Item created successfully');
      }
      setShowModal(false);
      fetchMasterData();
      fetchTabCounts();
    } catch (error) {
      alert.showError(error.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'partyType', label: 'Party Types', count: tabCounts.partyType, icon: 'people' },
    { id: 'documentType', label: 'Documents', count: tabCounts.documentType, icon: 'document-text' },
    { id: 'expenseCategory', label: 'Expenses', count: tabCounts.expenseCategory, icon: 'wallet' },
    { id: 'paymentMode', label: 'Payments', count: tabCounts.paymentMode, icon: 'card' },
    { id: 'notificationType', label: 'Notifications', count: tabCounts.notificationType, icon: 'notifications' },
  ];

  const config = getMasterConfig();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="bg-blue-900 px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Master Data - {config.title}</Text>
        </View>
      </View>

      {/* Tabs - Grid Layout */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row justify-between flex-wrap gap-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl flex-row items-center gap-2 ${
                activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? 'white' : '#374151'}
              />
              <View
                className={`px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white' : 'bg-blue-100'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-blue-700'
                  }`}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Master Data List */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06337c']} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#06285f" className="mt-10" />
          ) : masterData.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name={tabs.find(t => t.id === activeTab)?.icon} size={40} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 text-lg font-bold mb-2">No data found</Text>
              <Text className="text-gray-500 text-sm mb-6">Add your first {config.title.toLowerCase()}</Text>
              <TouchableOpacity
                onPress={handleAdd}
                className="bg-blue-500 px-6 py-3 rounded-xl"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Add New</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            masterData.map((item, index) => {
              const isPredefined = item[config.isPredefinedKey];
              return (
                <View
                  key={index}
                  className="bg-white rounded-2xl mb-3 shadow-sm overflow-hidden"
                >
                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 flex-row items-center">
                        <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name={tabs.find(t => t.id === activeTab)?.icon}
                            size={20}
                            color="#3b82f6"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                            {item[config.nameKey]}
                          </Text>
                          {isPredefined && (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="shield-checkmark" size={12} color="#6B7280" />
                              <Text className="text-xs text-gray-500 ml-1">System Record</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {!isPredefined && (
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => handleEdit(item)}
                            className="p-2"
                          >
                            <Ionicons name="create-outline" size={20} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(item)}
                            className="p-2"
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Additional fields */}
                    {config.fields.slice(1).some(field =>
                      item[field.name] !== undefined && item[field.name] !== null && item[field.name] !== ''
                    ) && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        {config.fields.slice(1).map((field , index) => {
                          if (field.type === 'switch') {
                            return (
                              <View key={index} className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm text-gray-600">{field.label}</Text>
                                <View
                                  className={`px-3 py-1 rounded-full ${
                                    item[field.name] ? 'bg-green-100' : 'bg-gray-100'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-semibold ${
                                      item[field.name] ? 'text-green-700' : 'text-gray-600'
                                    }`}
                                  >
                                    {item[field.name] ? 'Active' : 'Inactive'}
                                  </Text>
                                </View>
                              </View>
                            );
                          }
                          if (item[field.name] && field.type !== 'textarea') {
                            return (
                              <View key={field.name} className="flex-row items-center mb-2">
                                <Text className="text-sm text-gray-600 flex-1">{field.label}:</Text>
                                <Text className="text-sm text-gray-900 font-semibold">
                                  {item[field.name]}
                                </Text>
                              </View>
                            );
                          }
                          if (item[field.name] && field.type === 'textarea') {
                            return (
                              <View key={field.name} className="mb-2">
                                <Text className="text-sm text-gray-600 mb-1">{field.label}:</Text>
                                <Text className="text-sm text-gray-900">{item[field.name]}</Text>
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAdd}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl"
        activeOpacity={0.8}
        style={{
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-white rounded-t-3xl p-6 min-h-[300px]" style={{ maxHeight: '100%' }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {config.title.slice(0, -1)}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {config.fields.map((field) => (
                  <View key={field.name} className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      {field.label} {field.required && <Text className="text-red-500">*</Text>}
                    </Text>
                    {field.type === 'textarea' ? (
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name]?.toString() || ''}
                        onChangeText={(text) => setFormData({ ...formData, [field.name]: text })}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        placeholderTextColor="#9CA3AF"
                      />
                    ) : field.type === 'switch' ? (
                      <View className="flex-row items-center">
                        <Switch
                          value={formData[field.name] !== undefined ? formData[field.name] : true}
                          onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                          thumbColor={formData[field.name] ? '#ffffff' : '#f3f4f6'}
                        />
                        <Text className="ml-3 text-sm text-gray-600">Enable this option</Text>
                      </View>
                    ) : (
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name]?.toString() || ''}
                        onChangeText={(text) => setFormData({ ...formData, [field.name]: text })}
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        placeholderTextColor="#9CA3AF"
                      />
                    )}
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  <Text className="text-center text-gray-800 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="flex-1 bg-blue-500 py-3 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-white font-semibold">
                      {editingItem ? 'Update' : 'Create'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
