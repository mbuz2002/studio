
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, School } from '@/types';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
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
    const users: User[] = JSON.parse(usersExist);
    if (!users.find(u => u.id === initialSuperAdminUser.id)) {
      users.push(initialSuperAdminUser);
      localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  const keysToInitializeAsEmpty = [
    // SCHOOLS_STORAGE_KEY, // Keep schools data if exists from signup/SA
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
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([])); // Initialize schools if not present
  }
  // console.log("Initial data check complete in AuthContext.");
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
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
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/superadmin-access' || pathname === '/login-by-school';
      if (!isAuthPage && pathname !== '/') { // Also allow landing page
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
    
    if (roleToAttempt === "SuperAdmin") {
      // SuperAdmin uses "admin" as username and specific password
      foundUser = users.find(u => u.email === emailOrUsername && u.role === "SuperAdmin");
       if (foundUser && passwordAttempt === "Payaman123") {
        setUser(foundUser);
        setCurrentSchool(null);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        addLog("INFO", `SuperAdmin ${emailOrUsername} berhasil masuk.`, "AuthContext-Login");
        router.push('/superadmin/dashboard');
        return;
      }
    } else { // Regular user roles
      if (!schoolIdToLogin) {
        toast({ title: "Login Gagal", description: "Informasi sekolah tidak disediakan. Harap pilih sekolah Anda.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: ID Sekolah tidak disediakan.`, "AuthContext-Login");
        router.push('/login-by-school'); // Redirect to school selection
        return;
      }
      
      const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      const schools: School[] = schoolsData ? JSON.parse(schoolsData) : [];
      const school = schools.find(s => s.id === schoolIdToLogin);

      if (!school) {
        toast({ title: "Login Gagal", description: "Sekolah tidak ditemukan.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah dengan ID ${schoolIdToLogin} tidak ditemukan.`, "AuthContext-Login");
        return;
      }
      if (!school.isActive) {
        toast({ title: "Login Gagal", description: "Sekolah ini tidak aktif. Hubungi administrator.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah "${school.name}" (ID: ${schoolIdToLogin}) tidak aktif.`, "AuthContext-Login");
        return;
      }
      
      foundUser = users.find(u => u.email === emailOrUsername && u.role === roleToAttempt && u.schoolId === schoolIdToLogin);
      // Simplified password check for demo for regular users
       if (foundUser && passwordAttempt === "password") { 
        setUser(foundUser);
        setCurrentSchool({ ...school, featureSettings: school.featureSettings || { ...DEFAULT_FEATURE_SETTINGS } });
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        addLog("INFO", `Pengguna ${emailOrUsername} (Peran: ${foundUser.role}, Sekolah: ${school.name}) berhasil masuk.`, "AuthContext-Login");
        router.push('/dashboard');
        return;
      }
    }
    
    toast({ title: "Login Gagal", description: "Email, peran, atau kata sandi salah, atau akun tidak terkait dengan sekolah yang dipilih.", variant: "destructive" });
    addLog("WARN", `Login gagal: Pengguna dengan email/username ${emailOrUsername}, peran ${roleToAttempt} untuk sekolah ID ${schoolIdToLogin || 'N/A'} tidak ditemukan atau kredensial salah.`, "AuthContext-Login");
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
      router.push('/login-by-school'); // Regular users redirect to school selection
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
