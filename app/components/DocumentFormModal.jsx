import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { documentAPI } from "../../src/services/apiService";
import { useAlert } from "../../src/contexts/AlertContext";
import { Ionicons } from "@expo/vector-icons";

const DocumentFormModal = ({ docId, params = {}, onClose, onSuccess }) => {
  const alert = useAlert();
  const isEdit = Boolean(docId);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const initialData = {
    partyId: "",
    documentTypeId: "",
    documentVehicleNo: "",
    documentNumber: "",
    documentIssueDate: new Date().toISOString().split("T")[0],
    documentExpiryDate: "",
    documentDescription: "",
    document: "",
    docVehicleId: ""
  };

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchDocument();

    // Pre-fill form data from params
    if (params.partyId) {
      setFormData(prev => ({
        ...prev,
        partyId: params.partyId.toString(),
        ...(params.vehId && { documentVehicleId: params.vehId.toString() }),
        ...(params.vehNumber && { documentVehicleNo: params.vehNumber }),
        ...(params.docTypeId && { documentTypeId: params.docTypeId.toString() }),
        ...(params.vehId && { docVehicleId: params.vehId.toString() })
      }));
    }
  }, [docId, params]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      if (!docId) throw new Error("Document ID is required");

      const response = await documentAPI.getById(docId);
      const doc = response.data.items?.[0] || response.data.items || response.data;

      if (!doc || !doc.docId) throw new Error("Document data not found");

      setFormData({
        partyId: doc.docPartyId || "",
        documentTypeId: doc.docTypeId || "",
        documentVehicleNo: doc.docVehicleNo || "",
        documentNumber: doc.docNumber || "",
        documentIssueDate: doc.docIssueDate?.split("T")[0] || "",
        documentExpiryDate: doc.docExpiryDate?.split("T")[0] || "",
        documentDescription: doc.docDescription || "",
        document: doc.docCloudinaryUrl || "",
      });

      if (doc.docCloudinaryUrl) {
        setPreviewUrl(doc.docCloudinaryUrl);
      }
    } catch (error) {
      alert.showError("Failed to fetch document details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if ((name === "documentTypeId" || name === "documentIssueDate") &&
        formData.documentIssueDate && value) {
      calculateExpiryDate(
        name === "documentTypeId" ? value : formData.documentTypeId,
        name === "documentIssueDate" ? value : formData.documentIssueDate
      );
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const calculateExpiryDate = (documentTypeId, issueDate) => {
    // Auto-calculate expiry date based on validity days
    // This can be enhanced later with actual document type data
    if (issueDate) {
      const issue = new Date(issueDate);
      issue.setDate(issue.getDate() + 365); // Default 1 year validity
      setFormData((prev) => ({
        ...prev,
        documentExpiryDate: issue.toISOString().split("T")[0],
      }));
    }
  };

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFile(result.assets[0]);
        setPreviewUrl(result.assets[0].uri);
      }
    } catch (error) {
      alert.showError("Failed to pick image");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.partyId) newErrors.partyId = "Party is required";
    if (!formData.documentTypeId) newErrors.documentTypeId = "Document type is required";
    if (!formData.documentVehicleNo) newErrors.documentVehicleNo = "Vehicle number is required";
    if(!formData.documentNumber) newErrors.documentNumber = "Document number is required";
    if(!formData.documentIssueDate) newErrors.documentIssueDate = "Issue date is required";
    if(!formData.documentExpiryDate) newErrors.documentExpiryDate = "Expiry date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert.showError("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("partyId", formData.partyId);
      formDataToSend.append("documentTypeId", formData.documentTypeId);
      formDataToSend.append("documentVehicleNo", formData.documentVehicleNo);
      formDataToSend.append("documentNumber", formData.documentNumber);
      formDataToSend.append("documentIssueDate", formData.documentIssueDate);
      formDataToSend.append("docVehicleId", formData.docVehicleId);

      if (formData.documentExpiryDate) {
        formDataToSend.append("documentExpiryDate", formData.documentExpiryDate);
      }
      if (formData.documentDescription) {
        formDataToSend.append("documentDescription", formData.documentDescription);
      }
      if (file) {
        formDataToSend.append("document", {
          uri: file.uri,
          type: file.mimeType || 'image/jpeg',
          name: file.fileName || 'document.jpg',
        });
      }

      if (isEdit) {
        await documentAPI.update(docId, formDataToSend);
        alert.showSuccess("Document updated successfully");
      } else {
        await documentAPI.create(formDataToSend);
        alert.showSuccess("Document uploaded successfully");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert.showError(error.response?.data?.message || "Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <View className="flex-1 items-center justify-center p-20">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="p-6">
        {/* Renewal Mode Indicator */}
        {params.isRenewal && (
          <View className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <View className="flex-row items-center gap-2">
              <Ionicons name="sync" size={24} color="#059669" />
              <View className="flex-1">
                <Text className="text-lg font-bold text-green-800">Document Renewal Mode</Text>
                <Text className="text-sm text-green-700">Update expiry date and upload new document</Text>
              </View>
            </View>
          </View>
        )}

        {/* Form Fields */}
        <View className="space-y-4">
          {/* Party Selection - Simplified for now */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Customer <Text className="text-red-500">*</Text>
            </Text>
            <Text className="bg-gray-100 p-3 rounded-lg text-gray-800">
              {params.partyName || "Select Customer"}
            </Text>
            {errors.partyId && (
              <Text className="text-red-500 text-xs mt-1">{errors.partyId}</Text>
            )}
          </View>

          {/* Document Type */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Document Type <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., RC, Insurance, PUC"
              value={formData.documentTypeId}
              onChangeText={(text) => handleChange("documentTypeId", text)}
            />
            {errors.documentTypeId && (
              <Text className="text-red-500 text-xs mt-1">{errors.documentTypeId}</Text>
            )}
          </View>

          {/* Document Number */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Document Number  <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="AY546652ER"
              value={formData.documentNumber}
              onChangeText={(text) => handleChange("documentNumber", text)}
            />
          </View>

          {/* Vehicle Number */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Vehicle Number <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="MH12AB1234"
              value={formData.documentVehicleNo.toUpperCase()}
              onChangeText={(text) => handleChange("documentVehicleNo", text)}
              maxLength={20}
            />
            {errors.documentVehicleNo && (
              <Text className="text-red-500 text-xs mt-1">{errors.documentVehicleNo}</Text>
            )}
          </View>

          {/* Issue Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Issue Date <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="YYYY-MM-DD"
              value={formData.documentIssueDate}
              onChangeText={(text) => handleChange("documentIssueDate", text)}
            />
            {errors.documentIssueDate && (
              <Text className="text-red-500 text-xs mt-1">{errors.documentIssueDate}</Text>
            )}
          </View>

          {/* Expiry Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Expiry Date {formData.documentTypeId !== "1" && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="YYYY-MM-DD"  
              value={formData.documentExpiryDate}
              onChangeText={(text) => handleChange("documentExpiryDate", text)}
            />
          </View>

          {/* Document Upload */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Upload Document 
            </Text>
            <TouchableOpacity
              onPress={pickDocument}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
            >
              {previewUrl ? (
                <Image
                  source={{ uri: previewUrl }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
              )}
              <Text className="text-blue-500 mt-2">
                {file || previewUrl ? "Change file" : "Upload a file"}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {params.isRenewal ? "Renewal Notes" : "Description/Notes"}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder={params.isRenewal ? "Add renewal notes..." : "Add notes..."}
              value={formData.documentDescription}
              onChangeText={(text) => handleChange("documentDescription", text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-gray-200 py-3 rounded-lg"
            disabled={loading}
          >
            <Text className="text-center text-gray-800 font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-1 bg-blue-500 py-3 rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center">
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {isEdit ? "Update" : "Upload"} Document
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DocumentFormModal;
