import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar o app, verifica se já existe token salvo
    const storedUser = localStorage.getItem('@OdontoCota:user');
    const storedToken = localStorage.getItem('@OdontoCota:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  async function signIn(email, password) {
    const response = await api.post('/auth/login', { email, senha: password });
    
    const { user, token } = response.data;

    localStorage.setItem('@OdontoCota:user', JSON.stringify(user));
    localStorage.setItem('@OdontoCota:token', token);

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
  }

  function signOut() {
    localStorage.removeItem('@OdontoCota:user');
    localStorage.removeItem('@OdontoCota:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
