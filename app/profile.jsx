import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { useAlert } from '../src/contexts/AlertContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const alert = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    businessName: user?.businessName || '',
    businessAddress: user?.businessAddress || '',
    gstNumber: user?.gstNumber || '',
    panNumber: user?.panNumber || '',
    licenseNumber: user?.licenseNumber || '',
  });

  const handleSave = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      alert.showError('Full name is required');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert.showError('Phone number is required');
      return;
    }

    if (formData.phoneNumber.length < 10) {
      alert.showError('Phone number must be at least 10 digits');
      return;
    }

    try {
      // TODO: Call API to update profile
      // await userAPI.updateProfile(formData);

      setIsEditing(false);
      alert.showSuccess('Profile updated successfully');
      console.log('Saving profile:', formData);
    } catch (error) {
      alert.showError('Failed to update profile');
    }
  };

  const handleCancel = async () => {
    if (isEditing) {
      const confirmed = await alert.showConfirm(
        'Discard unsaved changes?',
        {
          title: 'Cancel Editing',
          confirmLabel: 'Discard',
          cancelLabel: 'Keep Editing',
        }
      );

      if (!confirmed) return;
    }

    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      businessName: user?.businessName || '',
      businessAddress: user?.businessAddress || '',
      gstNumber: user?.gstNumber || '',
      panNumber: user?.panNumber || '',
      licenseNumber: user?.licenseNumber || '',
    });
    setIsEditing(false);
  };

  const InfoField = ({ icon, label, value, name, editable = true }) => (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-2">{label}</Text>
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 py-3">
        <Ionicons name={icon} size={20} color="#6B7280" className="mr-3" />
        {isEditing && editable ? (
          <TextInput
            value={formData[name]}
            onChangeText={(text) => setFormData({ ...formData, [name]: text })}
            className="flex-1 ml-3 text-gray-800"
            placeholder={label}
          />
        ) : (
          <Text className="flex-1 ml-3 text-gray-800">{value || 'Not provided'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-900 px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">My Profile</Text>
        </View>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-blue-900 pb-8 items-center">
          <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
            <Ionicons name="person" size={28} color="#02245c" />
          </View>
          <Text className="text-white text-xl font-bold mt-3">
            {user?.fullName || 'User'}
          </Text>
          <Text className="text-blue-200 text-sm">{user?.email}</Text>
        </View>

        {/* Personal Information */}
        <View className="px-4 py-6 -mt-4 bg-gray-50 rounded-t-3xl">
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Personal Information
            </Text>

            <InfoField
              icon="person-outline"
              label="Full Name"
              value={formData.fullName}
              name="fullName"
            />
            <InfoField
              icon="mail-outline"
              label="Email Address"
              value={formData.email}
              name="email"
              editable={false}
            />
            <InfoField
              icon="call-outline"
              label="Phone Number"
              value={formData.phoneNumber}
              name="phoneNumber"
            />
            <InfoField
              icon="card-outline"
              label="License Number"
              value={formData.licenseNumber}
              name="licenseNumber"
            />
          </View>

          {/* Business Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Business Information
            </Text>

            <InfoField
              icon="business-outline"
              label="Business Name"
              value={formData.businessName}
              name="businessName"
            />
            <InfoField
              icon="location-outline"
              label="Business Address"
              value={formData.businessAddress}
              name="businessAddress"
            />
            <InfoField
              icon="receipt-outline"
              label="GST Number"
              value={formData.gstNumber}
              name="gstNumber"
            />
            <InfoField
              icon="document-text-outline"
              label="PAN Number"
              value={formData.panNumber}
              name="panNumber"
            />
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-300 py-3 rounded-lg"
              >
                <Text className="text-center text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-blue-900 py-3 rounded-lg"
              >
                <Text className="text-center text-white font-semibold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
