import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConfig, updateConfig as apiUpdateConfig } from '../api/config';
import { useAuth } from './AuthContext';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await getConfig();
      setConfig(res.data.data);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfigValue = async (updates) => {
    const res = await apiUpdateConfig(updates);
    setConfig(res.data.data);
    return res.data.data;
  };

  return (
    <ConfigContext.Provider value={{ config, loading, refetch: fetchConfig, updateConfig: updateConfigValue }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
