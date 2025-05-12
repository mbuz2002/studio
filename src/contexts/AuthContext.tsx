"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, School } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useLog } from './LogContext';
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from '@/types';
import { 
  initialSuperAdminUser, 
  initialDefaultSchool, 
  initialDemoAdminUser,
  initialDemoKepsekUser,
  initialDemoWakaUser,
  initialDemoGuruUser,
  initialDemoTUUser,
  DEFAULT_SCHOOL_ID 
} from '@/lib/initial-data';
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
  const logSource = "AuthContext-InitData";

  // Initialize Users
  const usersExist = localStorage.getItem(APP_USERS_STORAGE_KEY);
  let currentUsers: User[] = [];
  if (usersExist) {
    try {
      currentUsers = JSON.parse(usersExist);
    } catch (e) {
      console.error(`${logSource}: Error parsing existing users, re-initializing.`, e);
      currentUsers = []; // Reset if parsing fails
    }
  }

  const demoUsersToAdd: User[] = [
    initialSuperAdminUser,
    initialDemoAdminUser,
    initialDemoKepsekUser,
    initialDemoWakaUser,
    initialDemoGuruUser,
    initialDemoTUUser,
  ];

  let usersModified = false;
  demoUsersToAdd.forEach(demoUser => {
    if (!currentUsers.some(u => u.id === demoUser.id)) {
      // User with this ID doesn't exist, add it.
      // Also check if user with same email and role (but different ID) exists to avoid duplicates.
      const existingUserByEmailAndRole = currentUsers.find(u => u.email === demoUser.email && u.role === demoUser.role);
      if (existingUserByEmailAndRole) {
        // If such a user exists, update their ID to the demoUser's ID and merge other properties
        // This is a bit complex for a simple init, might be better to just ensure the demoUser ID wins.
        // For now, we'll just overwrite if the ID is different but email/role match the demo.
        currentUsers = currentUsers.filter(u => u.email !== demoUser.email || u.role !== demoUser.role);
      }
      currentUsers.push(demoUser);
      usersModified = true;
      console.log(`${logSource}: Added demo user: ${demoUser.email} (Role: ${demoUser.role})`);
    } else {
      // User with this ID exists, ensure its details are correct (e.g., role for SuperAdmin)
      const userIndex = currentUsers.findIndex(u => u.id === demoUser.id);
      if (userIndex !== -1 && (currentUsers[userIndex].role !== demoUser.role || currentUsers[userIndex].email !== demoUser.email)) {
        currentUsers[userIndex] = { ...currentUsers[userIndex], ...demoUser }; // Prioritize demoUser details
        usersModified = true;
        console.warn(`${logSource}: Corrected demo user record for ID: ${demoUser.id}`);
      }
    }
  });

  if (usersModified || !usersExist) {
    localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(currentUsers));
    if(!usersExist) console.log(`${logSource}: Initialized APP_USERS with SuperAdmin and demo users.`);
  }


  // Initialize Schools
  const schoolsExist = localStorage.getItem(SCHOOLS_STORAGE_KEY);
  if (!schoolsExist) {
    localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([initialDefaultSchool]));
    console.log(`${logSource}: Initialized SCHOOLS with default demo school.`);
  } else {
    try {
      const schools: School[] = JSON.parse(schoolsExist);
      if (!schools.some(s => s.id === DEFAULT_SCHOOL_ID)) {
        schools.push(initialDefaultSchool);
        localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(schools));
        console.log(`${logSource}: Added missing default demo school to existing schools.`);
      }
    } catch (e) {
      console.error(`${logSource}: Error processing existing schools, re-initializing with default.`, e);
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([initialDefaultSchool]));
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
          } else if (parsedUser.role !== "SuperAdmin") {
            // Non-SA users must have a schoolId
            addLog("ERROR", `Pengguna ${parsedUser.email} (Peran: ${parsedUser.role}) tidak memiliki schoolId. Sesi tidak dipulihkan.`, "AuthContext-Restore");
            localStorage.removeItem('currentUser');
            setUser(null); // Clear invalid user
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
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/login-by-school') || pathname.startsWith('/signup') || pathname.startsWith('/superadmin-access');
      const isPublicPage = pathname === '/' || pathname.startsWith('/legal') || pathname.startsWith('/about') || pathname.startsWith('/documentation') || pathname.startsWith('/faq') || pathname.startsWith('/terms-of-service');
      
      if (!isAuthPage && !isPublicPage) {
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
       if (foundUser && passwordAttempt === "Payaman123") { // Hardcoded SuperAdmin password
        setUser(foundUser);
        setCurrentSchool(null); // SuperAdmin is not tied to a specific school context here
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        addLog("INFO", `SuperAdmin ${emailOrUsername} berhasil masuk.`, logSource);
        router.push('/superadmin/dashboard');
        return;
      } else {
        if (!foundUser) {
          addLog("ERROR", `SuperAdmin login GAGAL: Pengguna SuperAdmin dengan email "${emailOrUsername}" tidak ditemukan.`, logSource);
        } else { 
          addLog("ERROR", `SuperAdmin login GAGAL: Kata sandi salah untuk SuperAdmin "${emailOrUsername}".`, logSource);
        }
      }
    } else {
      // Regular user login (Admin, Guru, etc.)
      if (!schoolIdToLogin) {
          toast({ title: "Login Gagal", description: "Informasi sekolah tidak disediakan. Harap pilih sekolah Anda.", variant: "destructive" });
          addLog("WARN", `Login gagal untuk ${emailOrUsername}: ID Sekolah tidak disediakan.`, logSource);
          window.location.reload(); // Force reload to reset state and retry
          return;
      }
      
      const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      const schools: School[] = schoolsData ? JSON.parse(schoolsData) : [];
      const school = schools.find(s => s.id === schoolIdToLogin);

      if (!school) {
        toast({ title: "Login Gagal", description: "Sekolah tidak ditemukan atau tidak aktif.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah dengan ID ${schoolIdToLogin} tidak ditemukan.`, logSource);
        window.location.reload();
        return;
      }
      if (!school.isActive) {
        toast({ title: "Login Gagal", description: "Sekolah ini tidak aktif. Hubungi administrator.", variant: "destructive" });
        addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah "${school.name}" (ID: ${schoolIdToLogin}) tidak aktif.`, logSource);
        window.location.reload();
        return;
      }
      
      // For demo purposes, all non-SuperAdmin roles use "password"
      if (passwordAttempt === "password") {
        foundUser = users.find(u => 
          u.email === emailOrUsername && 
          u.role === roleToAttempt && 
          u.schoolId === schoolIdToLogin
        );
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
    
    // If no successful login path was hit
    toast({ title: "Login Gagal", description: "Email, peran, atau kata sandi salah, atau akun tidak sesuai dengan sekolah yang dipilih.", variant: "destructive" });
    addLog("WARN", `Login gagal (jalur umum): Pengguna dengan email/username ${emailOrUsername}, peran ${roleToAttempt} untuk sekolah ID ${schoolIdToLogin || 'N/A'} tidak ditemukan atau kredensial salah.`, logSource);
    window.location.reload(); // Force reload to allow re-attempt
  }, [addLog, router, toast]);

  const logout = useCallback(() => {
    const userEmail = user?.email;
    if (userEmail) {
      addLog("INFO", `Pengguna ${userEmail} keluar.`, "AuthContext-Logout");
    }
    setUser(null);
    setCurrentSchool(null);
    localStorage.removeItem('currentUser');
    router.push('/'); 
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
