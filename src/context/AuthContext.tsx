import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('invitecraft_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('invitecraft_user');
      }
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('invitecraft_users') || '[]');
    } catch {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('invitecraft_users', JSON.stringify(users));
  };

  const login = (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('invitecraft_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Неверный email или пароль' };
  };

  const register = (name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    const newUser: User = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      email,
      name,
      password,
    };
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem('invitecraft_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('invitecraft_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
