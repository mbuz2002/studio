
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const { addLog } = useLog(); 

  useEffect(() => {
    let didCancel = false;

    const attemptUserRestore = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && !didCancel) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Log restoration success (deferred if needed, but usually fine as it's post-initial setUser)
          // setTimeout(() => addLog("INFO", `Sesi pengguna ${parsedUser.email} dipulihkan.`, "AuthContext"),0);
        }
      } catch (error) {
        console.error("Gagal memulihkan sesi pengguna:", error);
        if (!didCancel) {
          // Defer the addLog call to prevent issues during render phases
          setTimeout(() => {
            addLog("ERROR", `Gagal memulihkan sesi pengguna dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, "AuthContext");
          }, 0);
          localStorage.removeItem('currentUser');
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    attemptUserRestore();

    return () => {
      didCancel = true;
    };
  }, [addLog]);

  const login = useCallback((email: string, role: UserRole) => {
    const baseUser = mockUsers[role] || mockUsers.Guru; 
    const loggedInUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, 
      email,
      role,
      ...baseUser,
      avatarUrl: baseUser.avatarUrl || `https://picsum.photos/seed/${email}/100/100` 
    };
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    // addLog is called after state updates and navigation, generally safe.
    addLog("INFO", `Pengguna ${email} (Peran: ${role}) berhasil masuk.`, "AuthContext");
    router.push('/dashboard');
  }, [addLog, router]);

  const logout = useCallback(() => {
    if (user) {
      // addLog is called before state updates, potentially defer if issues arise.
      addLog("INFO", `Pengguna ${user.email} keluar.`, "AuthContext");
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  }, [user, addLog, router]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Defer the addLog call to prevent issues during render phases
        setTimeout(() => {
          addLog("INFO", `Profil pengguna ${currentUser.email} diperbarui. Data baru: ${JSON.stringify(Object.keys(updatedUserData))}`, "AuthContext");
        }, 0);
        
        return newUser;
      }
      return null;
    });
  }, [addLog]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    loading
  }), [user, login, logout, updateUser, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
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

