
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, Omit<User, 'id' | 'email' | 'role'>> = {
  Admin: { name: "Admin User", avatarUrl: "https://picsum.photos/seed/admin/100/100" },
  KepalaSekolah: { name: "Kepala Sekolah", avatarUrl: "https://picsum.photos/seed/kepsek/100/100" },
  WakaKurikulum: { name: "Waka Kurikulum", avatarUrl: "https://picsum.photos/seed/waka/100/100" },
  TataUsaha: { name: "Staff Tata Usaha", avatarUrl: "https://picsum.photos/seed/tu/100/100" },
  Guru: { name: "Guru Pengajar", avatarUrl: "https://picsum.photos/seed/guru/100/100" }, 
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const baseUser = mockUsers[role] || mockUsers.Guru; // Fallback to Guru if role not in mock
    const loggedInUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, 
      email,
      role,
      ...baseUser,
      avatarUrl: baseUser.avatarUrl || `https://picsum.photos/seed/${email}/100/100` // Ensure avatar URL exists
    };
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return newUser;
      }
      return null;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

