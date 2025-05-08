
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useLog } from './LogContext'; // Import useLog

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
  const { addLog } = useLog(); // Get addLog function from LogContext

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // addLog("INFO", `Sesi pengguna ${parsedUser.email} dipulihkan dari penyimpanan lokal.`, "AuthContext");
      }
    } catch (error) {
      console.error("Gagal memulihkan sesi pengguna:", error);
      addLog("ERROR", `Gagal memulihkan sesi pengguna dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, "AuthContext");
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, [addLog]); // Add addLog to dependency array if it's stable (which it is with useCallback)

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
    addLog("INFO", `Pengguna ${email} (Peran: ${role}) berhasil masuk.`, "AuthContext");
    router.push('/dashboard');
  };

  const logout = () => {
    if (user) {
      addLog("INFO", `Pengguna ${user.email} keluar.`, "AuthContext");
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        addLog("INFO", `Profil pengguna ${currentUser.email} diperbarui. Data baru: ${JSON.stringify(updatedUserData)}`, "AuthContext");
        return newUser;
      }
      return null;
    });
  }, [addLog]);

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
