import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { documentAPI } from "../../src/services/apiService";
import DocumentFormModal from "../components/DocumentFormModal";

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "active":
      return { bg: "bg-green-100", text: "text-green-600" };
    case "expiring":
      return { bg: "bg-yellow-100", text: "text-yellow-600" };
    case "expired":
      return { bg: "bg-red-100", text: "text-red-600" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalParams, setModalParams] = useState({});

  const fetchDocuments = async (
    pageNum = 1,
    searchQuery = "",
    status = "all"
  ) => {
    try {
      const params = {
        page: pageNum,
        limit: 20,
        search: searchQuery,
      };

      if (status !== "all") {
        params.status = status;
      }

      const response = await documentAPI.getAll(params);
      const { items, pagination } = response.data.data;

      let data = items;

      if (pageNum === 1) {
        setDocuments(data || []);
      } else {
        setDocuments((prev) => [...prev, ...(data || [])]);
      }

      setHasMore(pagination?.hasMore || false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Alert.alert("Error", "Failed to load documents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchDocuments(1, search, filter);
  }, [search, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchDocuments(1, search, filter);
  }, [search, filter]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDocuments(nextPage, search, filter);
    }
  };

  const renderDocumentItem = ({ item }) => {
    const statusColors = getStatusColor(item.status);
    const itemDocumentsArray = item?.documents || [];
    return (
      <Pressable
        className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm"
        onPress={() => router.push(`/document/${item?.docId}`)}
      >
        <View className="flex-row items-center justify-between mb-3 border-b border-b-violet-500">
          {item.party && (
            <Text className="text-blue-500 text-lg mt-1">
              {item?.party?.partyName}
            </Text>
          )}

          {item?.vehNumber && (
            <Text className="text-gray-400 text-lg">{item?.vehNumber}</Text>
          )}
        </View>

        {itemDocumentsArray.length > 0 &&
          itemDocumentsArray?.map((doc, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#8B5CF6" />
              </View>

              <View className="flex-1">
                <Text className="text-gray-800 font-semibold">
                  {doc?.documentType?.dtmName}
                </Text>

                <View className="flex-row items-center mt-2">
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                    Expires: {formatDate(doc.docExpiryDate)}
                  </Text>
                </View>
              </View>

              {doc?.docStatus ?

              <View className={`px-2 py-1 rounded ${statusColors.bg}`}>
                <Text className={`text-xs font-medium ${statusColors.text}`}>
                  {doc?.docStatus}
                </Text>
              </View>

              : <Pressable
                  className="px-2 py-1 rounded bg-blue-500"
                  onPress={() => {
                    setModalParams({
                      partyId: item.party?.partyId,
                      partyName: item.party?.partyName,
                      vehId: item.vehId,
                      vehNumber: item.vehNumber,
                      docTypeId: doc?.documentType?.dtmId,
                    });
                    setShowModal(true);
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="add-circle" size={12} color="white" />
                    <Text className="text-xs font-medium text-white ml-1">
                      Upload
                    </Text>
                  </View>
                </Pressable>
              }
            </View>
          ))}
      </Pressable>
    );
  };

  const FilterButton = ({ label, value }) => (
    <Pressable
      className={`px-4 py-2 rounded-full mr-2 flex-row items-end ${
        filter === value ? "bg-blue-500" : "bg-gray-200"
      }`}
      onPress={() => setFilter(value)}
    >
      <Ionicons
        name={
          value === "all"
            ? "document-text-outline"
            : value === "valid"
            ? "checkmark-circle-outline"
            : value === "expiring"
            ? "alert-circle-outline"
            : "close-circle-outline"
        }
        size={16}
        color={filter === value ? "white" : "#4B5563"}
        className="mr-1"
      />
      <Text
        className={
          filter === value ? "text-white font-medium" : "text-gray-600"
        }
      >
        {label}
      </Text>
    </Pressable>
  );

  if (loading && page === 1) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 mb-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-800"
            placeholder="Search documents..."
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Buttons */}
        <View className="flex-row justify-between">
          <FilterButton label="All" value="all" icon="" />
          <FilterButton label="Valid" value="valid" />
          <FilterButton label="Expiring" value="expiring" />
          <FilterButton label="Expired" value="expired" />
        </View>
      </View>

      {/* Documents List */}
      <FlatList
        data={documents}
        keyExtractor={(item) => item?.docId}
        renderItem={renderDocumentItem}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3">No documents found</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && documents.length > 0 ? (
            <ActivityIndicator
              size="small"
              color="#3B82F6"
              style={{ marginVertical: 10 }}
            />
          ) : null
        }
      />

      {/* Add Button */}
      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          setModalParams({});
          setShowModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* Document Form Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50" style={{ justifyContent: 'flex-end' }}>
            <View className="bg-white rounded-t-3xl h-screen-safe-or-12">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">
                  {modalParams.isRenewal ? "Renew Document" : "Upload New Document"}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <DocumentFormModal
                params={modalParams}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                  setShowModal(false);
                  onRefresh();
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
