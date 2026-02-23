"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  rede: string | null;
  tipoUsuario: string;
  flgParticipaMVV: boolean;
  flgAceitoNotificacao: boolean;
  flgAceitoEmail: boolean;
  flgAtivo: boolean;
}

interface AuthContextValue {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canEdit: boolean;
  login: (u: Usuario) => void;
  logout: () => void;
  setUsuario: (u: Usuario | null) => void;
}

const STORAGE_KEY = "usuario";

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUsuario(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUsuarioState(getStoredUsuario());
    setIsLoading(false);
  }, []);

  const setUsuario = useCallback((u: Usuario | null) => {
    setUsuarioState(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback((u: Usuario) => {
    setUsuario(u);
  }, [setUsuario]);

  const logout = useCallback(() => {
    setUsuarioState(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
  }, []);

  const canEdit = !usuario || !isPastor(usuario.tipoUsuario);

  const value: AuthContextValue = {
    usuario,
    isLoading,
    isAuthenticated: !!usuario,
    canEdit,
    login,
    logout,
    setUsuario,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

export function isAdmin(tipo: string): boolean {
  return /administrador/i.test(tipo);
}

export function isPastor(tipo: string): boolean {
  return /pastor/i.test(tipo);
}

export function isMembro(tipo: string): boolean {
  return /membro/i.test(tipo);
}

export function needsRedeFilter(tipo: string): boolean {
  return isPastor(tipo) || isMembro(tipo);
}
