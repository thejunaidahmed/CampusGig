import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('currentUser', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('currentUser');
      setLoading(false);
    }
  }, []);

  // Real Email & Password Login
  const loginWithCredentials = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return res.data;
  };

  // Real Registration
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token, user: newUser } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
