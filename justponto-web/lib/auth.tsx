'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, Usuario } from './api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('justponto_token');
    const u = localStorage.getItem('justponto_usuario');
    if (t && u) {
      setToken(t);
      setUsuario(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, senha: string) {
    const res = await apiLogin(email, senha);
    localStorage.setItem('justponto_token', res.access_token);
    localStorage.setItem('justponto_usuario', JSON.stringify(res.usuario));
    setToken(res.access_token);
    setUsuario(res.usuario);
  }

  function signOut() {
    localStorage.removeItem('justponto_token');
    localStorage.removeItem('justponto_usuario');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
