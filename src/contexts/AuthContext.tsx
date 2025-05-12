
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, School } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useLog } from './LogContext';
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from '@/types';
import { initialSuperAdminUser } from '@/lib/initial-data';
import {
  LESSON_PLANS_STORAGE_KEY,
  ANNUAL_PROGRAMS_STORAGE_KEY,
  SEMESTER_PROGRAMS_STORAGE_KEY,
  MODUL_AJAR_STORAGE_KEY,
  SUBJECTS_STORAGE_KEY,
  TEACHERS_STORAGE_KEY,
  SCHOOL_CLASSES_STORAGE_KEY,
  ACADEMIC_EVENTS_STORAGE_KEY,
} from '@/types';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, passwordAttempt: string, roleToAttempt: UserRole, schoolIdToLogin?: string) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  loading: boolean;
  currentSchool: School | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeDefaultData = () => {
  if (typeof window === 'undefined') return;

  const usersExist = localStorage.getItem(APP_USERS_STORAGE_KEY);
  if (!usersExist) {
    localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify([initialSuperAdminUser]));
  } else {
    try {
        const users: User[] = JSON.parse(usersExist);
        if (!users.find(u => u.id === initialSuperAdminUser.id && u.role === "SuperAdmin")) {
        // Check if a user with the same email but different role exists, if so, don't add.
        // Or, decide if SuperAdmin email must be unique across all roles. For now, assume ID is key.
        const existingSA = users.find(u => u.id === initialSuperAdminUser.id);
        if (!existingSA) {
            users.push(initialSuperAdminUser);
            localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(users));
        } else if (existingSA.role !== "SuperAdmin") {
            // Handle conflict or update logic if necessary
            console.warn("User ID for SuperAdmin exists with a different role. SuperAdmin not added to prevent conflict.");
        }
        }
    } catch (e) {
        console.error("Error initializing SuperAdmin user:", e);
        // Fallback: ensure SuperAdmin is there if parsing fails or array is malformed
        localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify([initialSuperAdminUser]));
    }
  }


  const keysToInitializeAsEmpty = [
    LESSON_PLANS_STORAGE_KEY,
    ANNUAL_PROGRAMS_STORAGE_KEY,
    SEMESTER_PROGRAMS_STORAGE_KEY,
    MODUL_AJAR_STORAGE_KEY,
    SUBJECTS_STORAGE_KEY,
    TEACHERS_STORAGE_KEY,
    SCHOOL_CLASSES_STORAGE_KEY,
    ACADEMIC_EVENTS_STORAGE_KEY,
  ];

  keysToInitializeAsEmpty.forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
  if (!localStorage.getItem(SCHOOLS_STORAGE_KEY)) {
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([])); 
  }
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); 
  const { addLog } = useLog();
  const { toast } = useToast();

  useEffect(() => {
    initializeDefaultData();

    let didCancel = false;
    const attemptUserRestore = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && !didCancel) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser.schoolId) {
            const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
            if (schoolsData) {
              const schools: School[] = JSON.parse(schoolsData);
              const school = schools.find(s => s.id === parsedUser.schoolId);
              if (school) {
                setCurrentSchool({ ...school, featureSettings: school.featureSettings || { ...DEFAULT_FEATURE_SETTINGS } });
              } else {
                 addLog("WARN", `Sekolah dengan ID ${parsedUser.schoolId} tidak ditemukan saat memulihkan sesi untuk pengguna ${parsedUser.email}.`, "AuthContext-Restore");
              }
            }
          }
        }
      } catch (error) {
        console.error("Gagal memulihkan sesi pengguna:", error);
        if (!didCancel) {
          addLog("ERROR", `Gagal memulihkan sesi pengguna dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, "AuthContext-Restore");
          localStorage.removeItem('currentUser');
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    attemptUserRestore();
    return () => { didCancel = true; };
  }, [addLog]);

  // Effect for redirecting unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/superadmin-access' || pathname === '/login-by-school' || pathname.startsWith('/forgot-password');
      if (!isAuthPage && pathname !== '/' && !pathname.startsWith('/legal') && !pathname.startsWith('/about') && !pathname.startsWith('/documentation') && !pathname.startsWith('/faq') && !pathname.startsWith('/terms-of-service')) { 
        if (pathname.startsWith('/superadmin')) {
          router.push('/superadmin-access');
        } else {
          router.push('/login-by-school');
        }
      }
    }
  }, [loading, user, pathname, router]);


  const login = useCallback((emailOrUsername: string, passwordAttempt: string, roleToAttempt: UserRole, schoolIdToLogin?: string) => {
    const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    let foundUser: User | undefined;
    
    const logSource = "AuthContext-Login";

    if (roleToAttempt === "SuperAdmin") {
      foundUser = users.find(u => u.email === emailOrUsername && u.role === "SuperAdmin");
       if (foundUser && passwordAttempt === "Payaman123") { // SuperAdmin password
        setUser(foundUser);
        setCurrentSchool(null);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        addLog("INFO", `SuperAdmin ${emailOrUsername} berhasil masuk.`, logSource);
        router.push('/superadmin/dashboard');
        return;
      }
    } else { 
      // Regular user login
      if (!schoolIdToLogin) {
          toast({ title: "Login Gagal", description: "Informasi sekolah tidak disediakan. Harap pilih sekolah Anda.", variant: "destructive" });
          addLog("WARN", `Login gagal untuk ${emailOrUsername}: ID Sekolah tidak disediakan.`, logSource);
          window.location.reload();
          return;
      }
      
      const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      const schools: School[] = schoolsData ? JSON.parse(schoolsData) : [];
      const school = schools.find(s => s.id === schoolIdToLogin);

      if (!school) {
        toast({ title: "Login Gagal", description: "Sekolah tidak ditemukan atau tidak aktif.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah dengan ID ${schoolIdToLogin} tidak ditemukan/aktif.`, logSource);
        window.location.reload();
        return;
      }
      if (!school.isActive) {
        toast({ title: "Login Gagal", description: "Sekolah ini tidak aktif. Hubungi administrator.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah "${school.name}" (ID: ${schoolIdToLogin}) tidak aktif.`, logSource);
        window.location.reload();
        return;
      }
      
      // For demo, all regular users use "password"
      if (passwordAttempt === "password") {
        foundUser = users.find(u => u.email === emailOrUsername && u.role === roleToAttempt && u.schoolId === schoolIdToLogin);
        if (foundUser) {
          setUser(foundUser);
          setCurrentSchool({ ...school, featureSettings: school.featureSettings || { ...DEFAULT_FEATURE_SETTINGS } });
          localStorage.setItem('currentUser', JSON.stringify(foundUser));
          addLog("INFO", `Pengguna ${emailOrUsername} (Peran: ${foundUser.role}, Sekolah: ${school.name}) berhasil masuk.`, logSource);
          router.push('/dashboard');
          return;
        }
      }
    }
    
    // General failure for both SuperAdmin (if password incorrect) and regular users (if not found or password incorrect)
    toast({ title: "Login Gagal", description: "Email, peran, atau kata sandi salah, atau akun tidak sesuai dengan sekolah yang dipilih.", variant: "destructive" });
    addLog("WARN", `Login gagal: Pengguna dengan email/username ${emailOrUsername}, peran ${roleToAttempt} untuk sekolah ID ${schoolIdToLogin || 'N/A'} tidak ditemukan atau kredensial salah.`, logSource);
    window.location.reload();
  }, [addLog, router, toast]);

  const logout = useCallback(() => {
    const userEmail = user?.email;
    const userRole = user?.role;
    if (userEmail) {
      addLog("INFO", `Pengguna ${userEmail} keluar.`, "AuthContext-Logout");
    }
    setUser(null);
    setCurrentSchool(null);
    localStorage.removeItem('currentUser');
    if (userRole === "SuperAdmin") {
      router.push('/superadmin-access');
    } else {
      router.push('/login-by-school'); 
    }
  }, [user, addLog, router]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
        if (storedUsers) {
            let usersList: User[] = JSON.parse(storedUsers);
            usersList = usersList.map(u => u.id === newUser.id ? newUser : u);
            localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(usersList));
        }
        addLog("INFO", `Profil pengguna ${currentUser.email} diperbarui. Data baru: ${JSON.stringify(Object.keys(updatedUserData))}`, "AuthContext-UpdateUser");
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
    loading,
    currentSchool
  }), [user, login, logout, updateUser, loading, currentSchool]);

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
