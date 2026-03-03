import { useState, useEffect, useCallback } from 'react';
import { getClients } from '../api/clients';

export function useClients(params = {}) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClients(params);
      setClients(res.data.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { clients, loading, refetch: fetch };
}
