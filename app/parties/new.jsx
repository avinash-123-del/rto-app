import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { partyAPI, partyTypeMasterAPI } from '../../src/services/apiService';
import { useAlert } from '../../src/contexts/AlertContext';

export default function NewPartyScreen() {
  const router = useRouter();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [partyTypes, setPartyTypes] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const initialData = {
    partyName: '',
    partyTypeId: '',
    partyTypeName: '',
    partyContactNo: '',
    partyAddress: '',
    partyGstNumber: '',
    partyOpeningBalance: '0',
    partyBalanceType: 1, // Default: Receivable
    partyNumberofvehicles: '0',
  };

  const [formData, setFormData] = useState(initialData);
  const [vehNumbers, setVehNumbers] = useState([]);

  useEffect(() => {
    fetchPartyTypes();
  }, []);

  // When number of vehicles changes, update vehNumbers array
  useEffect(() => {
    const isCustomer = formData.partyTypeName?.toLowerCase().includes('customer');
    if (isCustomer && formData.partyTypeId) {
      const num = parseInt(formData.partyNumberofvehicles) || 0;
      setVehNumbers((prev) => {
        const arr = [...prev];
        if (arr.length < num) {
          return arr.concat(Array(num - arr.length).fill(''));
        } else if (arr.length > num) {
          return arr.slice(0, num);
        }
        return arr;
      });
    } else {
      setVehNumbers([]);
    }
  }, [formData.partyTypeId, formData.partyTypeName, formData.partyNumberofvehicles]);

  const fetchPartyTypes = async () => {
    try {
      const response = await partyTypeMasterAPI.getAll({ isActive: true });
      setPartyTypes(response.data?.data.items || []);
    } catch (error) {
      console.error('Error fetching party types:', error);
    }
  };

  const handlePartyTypeChange = (type) => {
    let balanceType = 1; // Default: Receivable
    const typeName = type.ptmName.toLowerCase();

    if (typeName.includes('rto office') || typeName.includes('rto_office')) {
      balanceType = 0; // Payable
    } else if (typeName.includes('customer')) {
      balanceType = 1; // Receivable
    }

    setFormData((prev) => ({
      ...prev,
      partyTypeId: type.ptmId,
      partyTypeName: type.ptmName,
      partyBalanceType: balanceType,
    }));
    setShowTypeDropdown(false);
  };

  const handleVehNumberChange = (idx, value) => {
    setVehNumbers((prev) => prev.map((v, i) => (i === idx ? value.toUpperCase() : v)));
  };

  const handleRemoveVehNumber = (idx) => {
    setVehNumbers((prev) => prev.filter((_, i) => i !== idx));
    setFormData((prev) => ({
      ...prev,
      partyNumberofvehicles: Math.max(0, parseInt(prev.partyNumberofvehicles) - 1).toString(),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.partyName.trim()) {
      alert.showError('Party name is required');
      return;
    }

    if (!formData.partyTypeId) {
      alert.showError('Party type is required');
      return;
    }

    if (formData.partyContactNo && formData.partyContactNo.length < 10) {
      alert.showError('Contact number must be at least 10 digits');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        partyOpeningBalance: parseFloat(formData.partyOpeningBalance) || 0,
        partyNumberofvehicles: parseInt(formData.partyNumberofvehicles) || 0,
      };

      const isCustomer = formData.partyTypeName?.toLowerCase().includes('customer');
      if (isCustomer && formData.partyTypeId) {
        payload.vehNumbers = vehNumbers.filter((v) => v.trim());
      }

      await partyAPI.create(payload);
      alert.showSuccess('Party created successfully');
      router.back();
    } catch (error) {
      alert.showError(error.data?.message || 'Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  const isCustomer = formData.partyTypeName?.toLowerCase().includes('customer');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="bg-blue-900 px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold w-full">Add New Party</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Party Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Party Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter party name"
                value={formData.partyName}
                onChangeText={(text) => setFormData({ ...formData, partyName: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Party Type */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Party Type <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text className={formData.partyTypeName ? 'text-gray-800' : 'text-gray-400'}>
                  {formData.partyTypeName || 'Select party type'}
                </Text>
                <Ionicons
                  name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {showTypeDropdown && (
                <View className="bg-white border border-gray-300 rounded-xl mt-2 overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }}>
                    {partyTypes.map((type) => (
                      <TouchableOpacity
                        key={type.ptmId}
                        onPress={() => handlePartyTypeChange(type)}
                        className="px-4 py-3 border-b border-gray-100"
                      >
                        <Text className="text-gray-800">{type.ptmName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Contact Number */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Contact Number</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter 10-digit contact number"
                value={formData.partyContactNo}
                onChangeText={(text) =>
                  setFormData({ ...formData, partyContactNo: text.replace(/\D/g, '') })
                }
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-xs text-gray-500 mt-1">Only numeric digits allowed</Text>
            </View>

            {/* Number of Vehicles (Only for Customer) */}
            {isCustomer && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Number of Vehicles
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="Enter number of vehicles"
                  value={formData.partyNumberofvehicles}
                  onChangeText={(text) =>
                    setFormData({ ...formData, partyNumberofvehicles: text.replace(/\D/g, '') })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* Opening Balance */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Opening Balance</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter opening balance"
                value={formData.partyOpeningBalance}
                onChangeText={(text) => setFormData({ ...formData, partyOpeningBalance: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Balance Type */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Balance Type</Text>
              <View className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3">
                <Text className="text-gray-600">
                  {formData.partyBalanceType === 0
                    ? 'Payable (We owe them)'
                    : 'Receivable (They owe us)'}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">Auto-set based on party type</Text>
            </View>

            {/* Address */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Address</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter address"
                value={formData.partyAddress}
                onChangeText={(text) => setFormData({ ...formData, partyAddress: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Vehicle Numbers (Only for Customer with vehicles) */}
            {isCustomer && parseInt(formData.partyNumberofvehicles) > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Vehicle Numbers</Text>
                <View className="bg-white border border-gray-300 rounded-xl p-3">
                  {vehNumbers.map((veh, idx) => (
                    <View key={idx} className="flex-row items-center mb-2">
                      <TextInput
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                        placeholder={`Vehicle #${idx + 1}`}
                        value={veh}
                        onChangeText={(text) => handleVehNumberChange(idx, text)}
                        maxLength={32}
                        autoCapitalize="characters"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveVehNumber(idx)}
                        className="ml-2 p-2"
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Enter vehicle registration numbers
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-6 mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
                disabled={loading}
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
                  <Text className="text-center text-white font-semibold">Create Party</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
