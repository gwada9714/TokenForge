import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { logger } from '../../../core/logger';

export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
    require2FA: boolean;
  };
  fees: {
    tokenCreation: number;
    stakingFee: number;
    marketingFee: number;
    kycFee: number;
  };
  networks: {
    ethereum: boolean;
    bsc: boolean;
    polygon: boolean;
    avalanche: boolean;
    solana: boolean;
    arbitrum: boolean;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  maintenance: {
    enabled: false,
    message: 'Site en maintenance. Veuillez réessayer plus tard.'
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    requireEmailVerification: true,
    require2FA: false
  },
  fees: {
    tokenCreation: 0.1,
    stakingFee: 0.05,
    marketingFee: 0.5,
    kycFee: 50
  },
  networks: {
    ethereum: true,
    bsc: true,
    polygon: true,
    avalanche: true,
    solana: false,
    arbitrum: false
  }
};

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as SystemSettings;
        setSettings(data);
        logger.info({ 
          message: 'Paramètres système chargés avec succès',
          category: 'SystemSettings'
        });
      } else {
        // Initialiser avec les paramètres par défaut si aucun document n'existe
        await saveSettings(DEFAULT_SETTINGS);
        logger.info({ 
          message: 'Paramètres système initialisés avec les valeurs par défaut',
          category: 'SystemSettings'
        });
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement des paramètres système';
      logger.error({ 
        message: errorMessage, 
        error: err as Error,
        category: 'SystemSettings'
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SystemSettings) => {
    try {
      setError(null);
      await setDoc(doc(db, 'system', 'settings'), newSettings);
      setSettings(newSettings);
      logger.info({ 
        message: 'Paramètres système sauvegardés avec succès',
        category: 'SystemSettings'
      });
      return true;
    } catch (err) {
      const errorMessage = 'Erreur lors de la sauvegarde des paramètres système';
      logger.error({ 
        message: errorMessage, 
        error: err as Error,
        category: 'SystemSettings'
      });
      setError(errorMessage);
      return false;
    }
  };

  const updateMaintenanceMode = async (enabled: boolean, message?: string) => {
    const newSettings = {
      ...settings,
      maintenance: {
        enabled,
        message: message || settings.maintenance.message
      }
    };
    return saveSettings(newSettings);
  };

  const updateSecuritySettings = async (securitySettings: Partial<SystemSettings['security']>) => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        ...securitySettings
      }
    };
    return saveSettings(newSettings);
  };

  const updateFees = async (fees: Partial<SystemSettings['fees']>) => {
    const newSettings = {
      ...settings,
      fees: {
        ...settings.fees,
        ...fees
      }
    };
    return saveSettings(newSettings);
  };

  const updateNetworks = async (networks: Partial<SystemSettings['networks']>) => {
    const newSettings = {
      ...settings,
      networks: {
        ...settings.networks,
        ...networks
      }
    };
    return saveSettings(newSettings);
  };

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateMaintenanceMode,
    updateSecuritySettings,
    updateFees,
    updateNetworks,
    reloadSettings: loadSettings
  };
}; 