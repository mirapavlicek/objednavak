import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('vetbook_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vetbook_token');
    if (token && !user) {
      getMe()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('vetbook_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('vetbook_token');
          localStorage.removeItem('vetbook_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, pin) => {
    const res = await apiLogin(email, pin);
    localStorage.setItem('vetbook_token', res.data.token);
    localStorage.setItem('vetbook_user', JSON.stringify(res.data.employee));
    setUser(res.data.employee);
    return res.data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem('vetbook_token');
    localStorage.removeItem('vetbook_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
