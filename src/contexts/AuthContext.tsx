
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, Omit<User, 'id' | 'email' | 'role'>> = {
  Admin: { name: "Admin User", avatarUrl: "https://picsum.photos/seed/admin/100/100" },
  KepalaSekolah: { name: "Kepala Sekolah", avatarUrl: "https://picsum.photos/seed/kepsek/100/100" },
  WakaKurikulum: { name: "Waka Kurikulum", avatarUrl: "https://picsum.photos/seed/waka/100/100" },
  TataUsaha: { name: "Staff Tata Usaha", avatarUrl: "https://picsum.photos/seed/tu/100/100" },
  Guru: { name: "Guru Pengajar", avatarUrl: "https://picsum.photos/seed/guru/100/100" }, // Default/fallback
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user session (e.g., in localStorage)
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
    const baseUser = mockUsers[role] || mockUsers.Guru;
    const loggedInUser: User = {
      id: Date.now().toString(), // simple unique ID
      email,
      role,
      ...baseUser,
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
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
