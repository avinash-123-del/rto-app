import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { partyAPI } from "../../src/services/apiService";
import DocumentFormModal from "../components/DocumentFormModal";

export default function PartyDetails() {
  const params = useLocalSearchParams();
  const { partyId } = params;

  const [party, setParty] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentParams, setDocumentParams] = useState({});

  useEffect(() => {
    if (partyId) {
      fetchPartyDetails();
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  const fetchPartyDetails = async () => {
    try {
      setLoading(true);
      const response = await partyAPI.getById(partyId);
      setParty(response.data?.data.items[0] || response.data?.data);
    } catch (error) {
      console.error("Failed to fetch party details", error);
      Alert.alert("Error", "Failed to load party details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await partyAPI.getVehicles(partyId, {
        page: 1,
        limit: 100,
      });
      setVehicles(response.data?.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      setVehicles([]);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPartyDetails();
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  const handleOpenVehicleModal = (vehicle = null) => {
    setEditVehicle(vehicle);
    setVehicleNumber(vehicle ? vehicle.vehNumber : "");
    setVehicleModalOpen(true);
  };

  const handleCloseVehicleModal = () => {
    setVehicleModalOpen(false);
    setEditVehicle(null);
    setVehicleNumber("");
  };

  const handleSaveVehicle = async () => {
    if (!vehicleNumber.trim()) {
      Alert.alert("Error", "Please enter vehicle number");
      return;
    }

    try {
      if (editVehicle) {
        // Update vehicle
        await partyAPI.updateVehicle(editVehicle.vehId, {
          vehNumber: vehicleNumber.trim().toUpperCase(),
        });
        Alert.alert("Success", "Vehicle updated successfully");
      } else {
        // Create new vehicle
        await partyAPI.createVehicle({
          vehNumber: vehicleNumber.trim().toUpperCase(),
          vehPartyId: parseInt(partyId),
        });
        Alert.alert("Success", "Vehicle added successfully");
      }
      fetchVehicles();
      handleCloseVehicleModal();
    } catch (error) {
      console.error("Failed to save vehicle", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save vehicle"
      );
    }
  };

  const handleDeleteVehicle = (vehId) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await partyAPI.deleteVehicle(vehId);
              Alert.alert("Success", "Vehicle deleted successfully");
              fetchVehicles();
            } catch (error) {
              console.error("Failed to delete vehicle", error);
              Alert.alert("Error", "Failed to delete vehicle");
            }
          },
        },
      ]
    );
  };

  const handleOpenDocumentModal = (vehicle) => {
    setDocumentParams({
      vehId: vehicle.vehId,
      vehNumber: vehicle.vehNumber,
      partyId: partyId,
      partyName: party?.partyName,
    });
    setShowDocumentModal(true);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setTimeout(() => {
      setDocumentParams({});
      fetchVehicles(); // Refresh to get updated document counts
    }, 300);
  };

  const handleViewDocuments = (vehicle) => {
    // Navigate to documents page with filters for this vehicle
    router.push(`/documents?search=${vehicle.vehNumber}`);
  };

  const handleViewAllDocuments = () => {
    // Navigate to documents page with party filter
    router.push(`/documents?searchCustomer=${partyId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading party details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!party) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-outline" size={80} color="#9CA3AF" />
          <Text className="text-gray-900 text-xl font-bold mt-4">
            Party Not Found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            The party you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCustomer = party.partyTypeId === 1;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-start">
      {/* Header */}
      <View className="bg-blue-900 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold" numberOfLines={1}>
                {party.partyName}
              </Text>
              <Text className="text-blue-200 text-sm">
                {party.partyType?.ptmName || "N/A"}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-white/20 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={16} color="white" />
              <Text className="text-white font-semibold ml-1 text-xs">
                Edit
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
          />
        }
      >
        <View className="p-4">
          {/* Info Cards Grid */}
          <View className="flex-row justify-start items-center gap-0 mb-4 bg-white rounded-2xl">
            {/* Contact Information Card */}
            <View className="px-4 py-2 shadow-sm flex-row ">
              <View className="w-4 h-4 bg-blue-100 rounded-xl items-center justify-center mb-3">
                <Ionicons name="call" size={10} color="#3B82F6" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-500 text-xs mb-1">Phone Number</Text>
                <Text
                  className="text-gray-900 font-bold text-base"
                  numberOfLines={1}
                >
                  {party.partyContactNo || "N/A"}
                </Text>
              </View>
            </View>

            {/* Balance Card */}
            <View className="px-4 py-2 shadow-sm flex-row">
              <View
                className={`w-4 h-4 rounded-xl items-center justify-center mb-3 ${
                  party.partyBalanceType === 1 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Ionicons
                  name="wallet"
                  size={10}
                  color={party.partyBalanceType === 1 ? "#10B981" : "#EF4444"}
                />
              </View>
              <View className="ml-3">
                <Text className="text-gray-500 text-xs mb-1">
                  Current Balance
                </Text>
                <View className=" ">
                  <Text
                    className={`font-bold text-base ${
                      party.partyBalanceType === 1
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    numberOfLines={1}
                  >
                    {formatCurrency(party.partyCurrentBalance)}
                  </Text>
                  {/* <Text className="text-gray-400 text-xs">
                    {party.partyBalanceType === 1 ? "Receivable" : "Payable"}
                  </Text> */}
                </View>
              </View>
            </View>

            {/* Total Vehicles Card (for customers) */}
            {isCustomer && (
              <View className="px-4 py-2 shadow-sm flex-row ">
                <View className="w-4 h-4 bg-blue-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="car-sport" size={10} color="#F97316" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-500 text-xs mb-1">
                    Total Vehicles
                  </Text>
                  <Text className="text-gray-900 font-bold text-base">
                    {vehicles.length}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Address Card */}
          {party.partyAddress && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="location" size={20} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1">Address</Text>
                  <Text className="text-gray-900 font-medium">
                    {party.partyAddress}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Vehicles Section (Only for Customers) */}
          {isCustomer && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="car-sport" size={24} color="#3B82F6" />
                  <Text className="text-gray-900 text-lg font-bold ml-2">
                    Vehicles
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenVehicleModal()}
                  className="bg-blue-500 px-3 py-2 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="add" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1 text-xs">
                      Add
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <View
                    key={vehicle.vehId}
                    className={`border border-gray-200 rounded-xl p-3 ${
                      index < vehicles.length - 1 ? "mb-3" : ""
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-base uppercase">
                          {vehicle.vehNumber}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          Added: {formatDate(vehicle.createdAt)}
                        </Text>
                      </View>
                      {vehicle.documents?.length > 0 ? (
                        <TouchableOpacity
                          onPress={() => handleViewDocuments(vehicle)}
                          className="bg-blue-100 px-3 py-1.5 rounded-lg"
                        >
                          <View className="flex-row items-center">
                            <Ionicons
                              name="document-text"
                              size={14}
                              color="#3B82F6"
                            />
                            <Text className="text-blue-600 font-semibold text-xs ml-1">
                              {vehicle.documents.length}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-gray-400 text-xs">No docs</Text>
                      )}
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleOpenVehicleModal(vehicle)}
                        className="flex-1 bg-blue-50 py-2 rounded-lg"
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color="#3B82F6"
                          />
                          <Text className="text-blue-600 font-semibold text-xs ml-1">
                            Edit
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleOpenDocumentModal(vehicle)}
                        className="flex-1 bg-green-50 py-2 rounded-lg"
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons
                            name="cloud-upload-outline"
                            size={16}
                            color="#10B981"
                          />
                          <Text className="text-green-600 font-semibold text-xs ml-1">
                            Upload
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteVehicle(vehicle.vehId)}
                        className="bg-red-50 py-2 px-3 rounded-lg"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <Ionicons
                      name="car-sport-outline"
                      size={32}
                      color="#9CA3AF"
                    />
                  </View>
                  <Text className="text-gray-900 font-bold mb-1">
                    No vehicles yet
                  </Text>
                  <Text className="text-gray-500 text-sm text-center mb-4">
                    Add your first vehicle to get started
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleOpenVehicleModal()}
                    className="bg-blue-500 px-4 py-2 rounded-xl"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="add" size={16} color="white" />
                      <Text className="text-white font-semibold ml-1">
                        Add Vehicle
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Recent Transactions */}
          {party.ledgers && party.ledgers.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={24} color="#3B82F6" />
                  <Text className="text-gray-900 text-lg font-bold ml-2">
                    Recent Transactions
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/ledgers/${partyId}`)}
                >
                  <Text className="text-blue-500 font-semibold text-sm">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {party.ledgers.slice(0, 5).map((ledger, index) => (
                <View
                  key={ledger.ledgerId}
                  className={`py-3 ${
                    index < party.ledgers.slice(0, 5).length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1 mr-2">
                      <Text
                        className="text-gray-900 font-medium"
                        numberOfLines={1}
                      >
                        {ledger.ledgerDescription}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        {formatDate(ledger.ledgerDate)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`font-bold text-base ${
                          ledger.ledgerType === "Credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {ledger.ledgerType === "Credit" ? "+" : "-"}
                        {formatCurrency(ledger.ledgerAmount)}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Bal: {formatCurrency(ledger.ledgerBalanceAfter)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={handleViewAllDocuments}
              className="flex-1 bg-blue-500 py-4 rounded-xl"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="white"
                />
                <Text className="text-white font-semibold ml-2">
                  View Documents
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra padding for bottom tabs */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Vehicle Add/Edit Modal */}
      <Modal
        visible={vehicleModalOpen}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
                </Text>
                <TouchableOpacity onPress={handleCloseVehicleModal}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-semibold uppercase"
                  placeholder="Enter vehicle number (e.g., MH12AB1234)"
                  value={vehicleNumber}
                  onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
                  autoCapitalize="characters"
                  autoFocus
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCloseVehicleModal}
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  <Text className="text-center text-gray-800 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveVehicle}
                  className="flex-1 bg-blue-500 py-3 rounded-xl"
                  disabled={!vehicleNumber.trim()}
                >
                  <Text className="text-center text-white font-semibold">
                    {editVehicle ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        visible={showDocumentModal}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl h-screen-safe-or-12">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">
                  Upload Document
                </Text>
                <TouchableOpacity onPress={handleCloseDocumentModal}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <DocumentFormModal
                params={documentParams}
                onClose={handleCloseDocumentModal}
                onSuccess={() => {
                  handleCloseDocumentModal();
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
