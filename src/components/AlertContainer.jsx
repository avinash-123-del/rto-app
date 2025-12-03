import React, { useEffect, useRef } from "react";
import {
  ToastAndroid,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useAlert, ALERT_TYPES } from "../contexts/AlertContext";

const AlertItem = ({ alert, onRemove }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // If it's a confirmation dialog, show modal with animation
    if (alert.persistent && alert.actionLabel) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      // Otherwise, show ToastAndroid
      if (Platform.OS === "android") {
        const duration =
          alert.duration > 3000 ? ToastAndroid.LONG : ToastAndroid.SHORT;

        // Format message with title if available
        const message = alert.title
          ? `${alert.title}\n${alert.message}`
          : alert.message;

        // Show toast with gravity at bottom
        ToastAndroid.showWithGravityAndOffset(
          message,
          duration,
          ToastAndroid.BOTTOM,
          0,
          100 // 100px from bottom
        );
      } else {
        // For iOS/Web, you could use Alert.alert or a different solution
        console.log(`${alert.title || "Alert"}: ${alert.message}`);
      }

      // Auto-remove the alert after showing
      const timer = setTimeout(() => {
        onRemove(alert.id);
      }, alert.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [alert, onRemove]);

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onRemove(alert.id);
    });
  };

  const getAlertConfig = () => {
    switch (alert.type) {
      case ALERT_TYPES.SUCCESS:
        return {
          bgColor: "bg-green-500",
          buttonColor: "#10B981",
        };
      case ALERT_TYPES.ERROR:
        return {
          bgColor: "bg-red-500",
          buttonColor: "#DC2626",
        };
      case ALERT_TYPES.WARNING:
        return {
          bgColor: "bg-yellow-500",
          buttonColor: "#F59E0B",
        };
      default:
        return {
          bgColor: "bg-blue-500",
          buttonColor: "#3B82F6",
        };
    }
  };

  // Only render modal for confirmation dialogs
  if (alert.persistent && alert.actionLabel) {
    const config = getAlertConfig();

    return (
      <Modal
        transparent
        visible={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              width: "100%",
              maxWidth: 400,
            }}
          >
            <View className="bg-white rounded-3xl overflow-hidden shadow-2xl"  style={{borderRadius:25}}>
              {/* Content */}
              <View
                style={{
                  alignItems: "center",
                  padding:15,
                  backgroundColor: config.bgColor,
                }}
              >
                {alert.title && (
                  <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
                    {alert.title}
                  </Text>
                )}
                <Text className="text-base text-gray-600 text-center leading-6">
                  {alert.message}
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 px-6 pb-8">
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  className="py-4 bg-gray-100 rounded-2xl border border-gray-200"
                  style={{ flex: 1, padding: 15 }}
                >
                  <Text className="text-gray-700 font-semibold text-center text-base">
                    {alert.cancelLabel || "Cancel"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (alert.onAction) alert.onAction();
                    handleClose();
                  }}
                  activeOpacity={0.8}
                  className="py-4 rounded-2xl shadow-lg"
                  style={{
                    flex: 1,
                    backgroundColor: config.buttonColor,
                  }}
                >
                  <Text className="text-white font-semibold text-center text-base">
                    {alert.actionLabel || "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // ToastAndroid doesn't render any components
  return null;
};

export default function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  // Separate confirmation dialogs from toast notifications
  const confirmAlerts = alerts.filter((a) => a.persistent && a.actionLabel);
  const toastAlerts = alerts.filter((a) => !a.persistent || !a.actionLabel);

  return (
    <>
      {/* Toast Notifications - handled via ToastAndroid */}
      {toastAlerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
      ))}

      {/* Confirmation Dialogs - rendered as modals */}
      {confirmAlerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
      ))}
    </>
  );
}
