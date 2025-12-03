import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Alert Context
const AlertContext = createContext();

// Alert types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Generate simple ID
const generateId = (prefix = 'alert_') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add alert
  const addAlert = useCallback((message, type = ALERT_TYPES.INFO, options = {}) => {
    const alert = {
      id: generateId('alert_'),
      message,
      type,
      title: options.title || '',
      duration: options.duration || 3000,
      persistent: options.persistent || false,
      position: options.position || 'top',
      onClose: options.onClose,
      onAction: options.onAction,
      actionLabel: options.actionLabel,
      cancelLabel: options.cancelLabel,
      timestamp: new Date(),
    };

    setAlerts(prev => [...prev, alert]);

    // Auto remove non-persistent alerts
    if (!alert.persistent && alert.duration > 0) {
      setTimeout(() => {
        removeAlert(alert.id);
      }, alert.duration);
    }

    return alert.id;
  }, []);

  // Remove alert
  const removeAlert = useCallback((id, skipOnClose = false) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === id);
      if (alert && alert.onClose && !skipOnClose) {
        alert.onClose();
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Update alert
  const updateAlert = useCallback((id, updates) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((message, options = {}) => {
    return addAlert(message, ALERT_TYPES.SUCCESS, {
      title: options.title || 'Success',
      ...options,
    });
  }, [addAlert]);

  const showError = useCallback((message, options = {}) => {
    return addAlert(message, ALERT_TYPES.ERROR, {
      title: options.title || 'Error',
      duration: options.duration || 3000,
      ...options,
    });
  }, [addAlert]);

  const showWarning = useCallback((message, options = {}) => {
    return addAlert(message, ALERT_TYPES.WARNING, {
      title: options.title || 'Warning',
      ...options,
    });
  }, [addAlert]);

  const showInfo = useCallback((message, options = {}) => {
    return addAlert(message, ALERT_TYPES.INFO, {
      title: options.title || 'Info',
      ...options,
    });
  }, [addAlert]);

  // Show confirmation dialog
  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const alertId = addAlert(message, ALERT_TYPES.WARNING, {
        title: options.title || 'Confirm',
        persistent: true,
        actionLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        onAction: () => {
          removeAlert(alertId, true);
          resolve(true);
        },
        onClose: () => {
          resolve(false);
        },
        ...options,
      });
    });
  }, [addAlert, removeAlert]);

  // Show loading alert
  const showLoading = useCallback((message, options = {}) => {
    return addAlert(message, ALERT_TYPES.INFO, {
      title: options.title || 'Loading...',
      persistent: true,
      ...options,
    });
  }, [addAlert]);

  // Hide loading alert
  const hideLoading = useCallback((id) => {
    removeAlert(id);
  }, [removeAlert]);

  const contextValue = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    updateAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    hideLoading,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook to use Alert Context
export const useAlert = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }

  return context;
};

export default AlertContext;
