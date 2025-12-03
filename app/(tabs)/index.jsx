import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { dashboardAPI, documentAPI } from "../../src/services/apiService";
import { useAuth } from "../../src/contexts/AuthContext";

function StatCard({ title, value, icon, color, bgColor }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mx-1 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">{title}</Text>
          <Text className="text-xl font-bold text-gray-800 mt-1">{value}</Text>
        </View>
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Ionicons name={icon} size={14} color={color} />
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState();
  const [documentCounts, setDocumentCounts] = useState();

  const fetchDashboardData = async () => {
    try {
      const [statsRes, docCountsRes] = await Promise.all([
        dashboardAPI.getStats(),
        documentAPI.getCounts(),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data?.data?.items[0].stats);
      }

      if (docCountsRes.data) {
        setDocumentCounts(docCountsRes.data.data?.items[0]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#06285f" />
      </View>
    );
  }

  console.log("Dashboard Stats:", documentCounts);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#06337c"]}
        />
      }
    >
      <View className="p-4">
        {/* Stats Grid */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Overview</Text>

        <View className="flex-row">
          <StatCard
            title="Total Parties"
            value={stats?.totalParties}
            icon="people"
            color="#3B82F6"
            bgColor="#DBEAFE"
          />
          <StatCard
            title="Total Vehicles"
            value={stats?.totalVehicles}
            icon="car"
            color="#10B981"
            bgColor="#D1FAE5"
          />
        </View>

        {/* Document Status */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">
          Document Status
        </Text>

        <View className="bg-white rounded-xl p-3 shadow-sm">
          <View className="flex-row justify-between mb-3">
             <View className="items-center flex-1">
              <Text className="text-xl font-bold text-blue-600">
                {documentCounts?.all}
              </Text>
              <Text className="text-gray-500 text-sm">Total</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-green-600">
                {documentCounts?.valid}
              </Text>
              <Text className="text-gray-500 text-sm">Active</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-yellow-600">
                {documentCounts?.expiring}
              </Text>
              <Text className="text-gray-500 text-sm">Expiring</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-red-600">
                {documentCounts?.expired}
              </Text>
              <Text className="text-gray-500 text-sm">Expired</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">
          Financial Summary
        </Text>

        <View className="flex-row">
          <StatCard
            title="Total Receivables"
            value={`₹${stats?.totalReceivables?.toLocaleString() || 0}`}
            icon="cash"
            color="#10B981"
            bgColor="#D1FAE5"
          />
          <StatCard
            title="Total Payabales"
            value={`₹${stats?.totalPayables?.toLocaleString() || 0}`}
            icon="card-outline"
            color="#EF4444"
            bgColor="#FEE2E2"
          />
        </View>
        <View className="flex-row">
          <StatCard
            title="Total Expenses"
            value={`₹${stats?.totalExpenses?.toLocaleString() || 0}`}
            icon="wallet"
            color="#EF4444"
            bgColor="#FEE2E2"
          />
          <StatCard
            title="Net Position"
            value={`₹${stats?.netPosition?.toLocaleString() || 0}`}
            icon="trending-up"
            color="#6366F1"
            bgColor="#E0E7FF"
          />
        </View>
      </View>
    </ScrollView>
  );
}
