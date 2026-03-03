import { useState, useEffect, useCallback } from 'react';
import { getAppointments, appointmentAction } from '../api/appointments';

export function useAppointments(params = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAppointments(params);
      setAppointments(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba při načítání objednávek');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async (id, action) => {
    await appointmentAction(id, action);
    await fetch();
  };

  return { appointments, loading, error, refetch: fetch, handleAction };
}
