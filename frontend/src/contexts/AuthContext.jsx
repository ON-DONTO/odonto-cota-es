import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar o app, verifica se já existe token salvo
    const storedUser = localStorage.getItem('@OnDonto:user');
    const storedToken = localStorage.getItem('@OnDonto:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  async function signIn(email, password) {
    const response = await api.post('/auth/login', { email, senha: password });
    
    const { user, token } = response.data;

    localStorage.setItem('@OnDonto:user', JSON.stringify(user));
    localStorage.setItem('@OnDonto:token', token);

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    return response.data;
  }

  function signOut() {
    localStorage.removeItem('@OnDonto:user');
    localStorage.removeItem('@OnDonto:token');
    setUser(null);
  }

  function updateUser(newData) {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('@OnDonto:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
