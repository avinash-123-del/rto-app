import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { partyAPI, partyTypeMasterAPI } from "../../src/services/apiService";
import { useAlert } from "../../src/contexts/AlertContext";

export default function PartiesScreen() {
  const alert = useAlert();
  const [parties, setParties] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);

  // Local state for immediate UI updates
  const [localSearch, setLocalSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchPartyTypes();
  }, []);

  useEffect(() => {
    fetchParties();
  }, [search, selectedType, pagination.page]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearch(localSearch);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localSearch]);


  const fetchPartyTypes = async () => {
    try {
      const response = await partyTypeMasterAPI.getAll({ isActive: true });
      let items = response.data?.data?.items || [];
      // Prepend "All" option
      items.unshift({ ptmId: "", ptmName: "All" });
      setPartyTypes(items);
    } catch (error) {
      console.error("Error fetching party types:", error);
    }
  };

  const fetchParties = async () => {
    try {
      if (isInitialMount.current) {
        setLoading(true);
      } else {
        setSearching(true);
      }

      const response = await partyAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        partyTypeId: selectedType,
      });

      const partiesData = response.data?.data?.items || [];

      setParties(partiesData);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
      }));

      if (isInitialMount.current) {
        isInitialMount.current = false;
      }
    } catch (error) {
      alert.showError(error.data?.message || "Failed to load parties");
      setParties([]);
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
    }
  };

  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchParties();
  }, [search, selectedType]);

  const handleDelete = async (party) => {
    const confirmed = await alert.showConfirm(
      `Are you sure you want to delete "${party.partyName}"?`,
      {
        title: "Delete Party",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      }
    );

    if (confirmed) {
      try {
        await partyAPI.delete(party.partyId);
        alert.showSuccess("Party deleted successfully");
        fetchParties();
      } catch (error) {
        alert.showError(error.data?.message || "Failed to delete party");
      }
    }
  };

  const renderPartyItem = ({ item }) => {
    const balance = Math.abs(item.partyCurrentBalance || 0);
    const isReceivable = item.partyBalanceType === 1;
    return (
      <TouchableOpacity
        className="mx-4 mb-3 bg-white rounded-2xl overflow-hidden shadow-md"
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/partyDetails',
          params: { partyId: item.partyId, partyName: item.partyName }
        })}
      >
        <View className="p-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                >
                  <Text className="text-white font-bold text-lg">
                    {item.partyName?.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View className="flex-1">
                  <Text
                    className="text-gray-900 font-bold text-base"
                    numberOfLines={1}
                  >
                    {item.partyName}
                  </Text>
                  {item.partyContactNo && (
                    <Text className="text-gray-500 text-xs mt-0.5">
                      {item.partyContactNo}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View className="items-end">
              <View
                className={`px-2 py-1 rounded-lg ${
                  item.partyType !== "RTO OFFICE"
                    ? "bg-purple-100"
                    : "bg-amber-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    item?.partyType !== "RTO OFFICE"
                      ? "text-purple-700"
                      : "text-amber-700"
                  }`}
                >
                  {item?.partyType || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {item.partyAddress && (
            <View className="flex-row items-start mb-3">
              <Ionicons
                name="location-outline"
                size={14}
                color="#6B7280"
                style={{ marginTop: 2 }}
              />
              <Text
                className="text-gray-600 text-xs ml-1 flex-1"
                numberOfLines={1}
              >
                {item.partyAddress}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons
                name={isReceivable ? "arrow-down-circle" : "arrow-up-circle"}
                size={20}
                color={isReceivable ? "#10b981" : "#ef4444"}
              />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">
                  {isReceivable ? "Receivable" : "Payable"}
                </Text>
                <Text
                  className={`text-base font-bold ${
                    isReceivable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{balance.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/parties/edit/${item.partyId}`);
                }}
                className="p-2"
              >
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <ActivityIndicator size="large" color="#06285f" />
        <Text className="text-gray-600 mt-4">Loading parties...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#f8fafc" }}>
      {/* Search and Filter Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-3 py-2">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search by name or contact..."
              value={localSearch}
              onChangeText={setLocalSearch}
              placeholderTextColor="#9CA3AF"
            />
            {searching && <ActivityIndicator size="small" color="#3b82f6" />}
            {localSearch && !searching ? (
              <TouchableOpacity onPress={() => setLocalSearch("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <View>
        <FlatList
          data={partyTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          keyExtractor={(item) => item.ptmId?.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedType === item.ptmId;
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedType(isSelected ? "" : item.ptmId);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item.ptmName}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Parties List */}
      <FlatList
        data={parties}
        keyExtractor={(item) => item.partyId?.toString()}
        renderItem={renderPartyItem}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#06337c"]}
            tintColor="#06337c"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 text-lg font-bold mb-2">
              No parties found
            </Text>
            <Text className="text-gray-500 text-sm mb-6">
              {search
                ? "Try a different search term"
                : "Start by adding your first party"}
            </Text>
            {!search && (
              <TouchableOpacity
                onPress={() => router.push("/parties/new")}
                className="bg-blue-500 px-6 py-3 rounded-xl"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Add First Party
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Floating Action Button */}
      <View className="absolute bottom-20 right-6">
        <View
          style={{
            width: 50,
            height: 0,
            borderRadius: 32,
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 0,
            elevation: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/parties/new")}
            activeOpacity={0.8}
            style={{
              width: 50,
              height: 50,
              borderRadius: 32,
              overflow: "hidden", // IMPORTANT
            }}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
