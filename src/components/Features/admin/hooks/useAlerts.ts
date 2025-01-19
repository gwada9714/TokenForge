import { useState, useCallback } from 'react';

export type AlertSeverity = 'info' | 'warning' | 'error';
export type AlertTarget = 'all' | 'users' | 'admins';

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  target: AlertTarget;
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      ...alert,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, []);

  const updateAlert = useCallback((id: string, updates: Partial<Alert>) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? { ...alert, ...updates }
          : alert
      )
    );
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const getActiveAlerts = useCallback((target: AlertTarget = 'all') => {
    const now = new Date();
    return alerts.filter(alert =>
      alert.active &&
      (!alert.expiresAt || alert.expiresAt > now) &&
      (target === 'all' || alert.target === target || alert.target === 'all')
    );
  }, [alerts]);

  return {
    alerts,
    addAlert,
    updateAlert,
    deleteAlert,
    getActiveAlerts,
  };
};

export default useAlerts;
