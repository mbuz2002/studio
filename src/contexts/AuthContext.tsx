
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, School } from '@/types'; 
import { useRouter } from 'next/navigation';
import { useLog } from './LogContext'; 
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from '@/types'; 
import { initialSuperAdminUser } from '@/lib/initial-data'; 
import { 
  LESSON_PLANS_STORAGE_KEY, 
  ANNUAL_PROGRAMS_STORAGE_KEY, 
  SEMESTER_PROGRAMS_STORAGE_KEY,
  SUBJECTS_STORAGE_KEY,
  TEACHERS_STORAGE_KEY,
  SCHOOL_CLASSES_STORAGE_KEY,
  ACADEMIC_EVENTS_STORAGE_KEY,
  MODUL_AJAR_STORAGE_KEY,
  SCHOOL_PROFILE_STORAGE_KEY, // For clearing if needed
  TEACHING_PERIOD_SETTINGS_KEY // For clearing if needed
} from '@/types';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, roleToAttempt: UserRole) => void; 
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  loading: boolean;
  currentSchool: School | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeDefaultData = () => {
  if (typeof window === 'undefined') return;

  const usersExist = localStorage.getItem(APP_USERS_STORAGE_KEY);
  const schoolsExist = localStorage.getItem(SCHOOLS_STORAGE_KEY);

  // Initialize SuperAdmin User if not exists
  if (!usersExist) {
    localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify([initialSuperAdminUser]));
  } else {
    // Ensure SuperAdmin is always present
    const users: User[] = JSON.parse(usersExist);
    if (!users.find(u => u.id === initialSuperAdminUser.id)) {
      users.push(initialSuperAdminUser);
      localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  // Initialize other storage keys to empty arrays if they don't exist
  // This effectively removes demo data on first run after this change
  const keysToInitializeAsEmpty = [
    SCHOOLS_STORAGE_KEY, // Schools will be created by SuperAdmin or signup
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
  
  // School profile and teaching period settings are specific to a school,
  // so they don't need global initialization here if schools are created dynamically.
  // However, if there's a single 'schoolProfile' key, it might need to be handled
  // based on currentSchool or cleared if no school is active.
  // For now, we'll let them be created/managed when a school context is active.

  console.log("Initial data check complete. SuperAdmin ensured, other data initialized as empty if not present.");
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addLog } = useLog(); 

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
              }
            }
          }
        }
      } catch (error) {
        console.error("Gagal memulihkan sesi pengguna:", error);
        if (!didCancel) {
          addLog("ERROR", `Gagal memulihkan sesi pengguna dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, "AuthContext");
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

  const login = useCallback((emailOrUsername: string, roleToAttempt: UserRole) => {
    const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    let foundUser: User | undefined;

    if (roleToAttempt === "SuperAdmin") {
      // SuperAdmin uses "admin" as email/username for login
      foundUser = users.find(u => u.email === emailOrUsername && u.role === "SuperAdmin");
    } else {
      foundUser = users.find(u => u.email === emailOrUsername && u.role === roleToAttempt);
    }

    if (foundUser) {
      if (foundUser.role === "SuperAdmin") {
        setUser(foundUser);
        setCurrentSchool(null); // SuperAdmin is not tied to a specific school context globally
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        addLog("INFO", `SuperAdmin ${emailOrUsername} berhasil masuk.`, "AuthContext-Login");
        router.push('/superadmin/dashboard'); 
      } else { // Regular user roles
        if (foundUser.schoolId) {
          const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
          const schools: School[] = schoolsData ? JSON.parse(schoolsData) : [];
          const school = schools.find(s => s.id === foundUser!.schoolId && s.isActive);
          if (school) {
            setUser(foundUser);
            setCurrentSchool({ ...school, featureSettings: school.featureSettings || { ...DEFAULT_FEATURE_SETTINGS } });
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            addLog("INFO", `Pengguna ${emailOrUsername} (Peran: ${foundUser.role}, Sekolah: ${school.name}) berhasil masuk.`, "AuthContext-Login");
            router.push('/dashboard');
          } else {
            addLog("WARN", `Login gagal untuk ${emailOrUsername}: Sekolah tidak aktif atau tidak ditemukan (ID: ${foundUser.schoolId}).`, "AuthContext-Login");
             // Optionally: toast({ title: "Login Gagal", description: "Sekolah Anda tidak aktif atau tidak ditemukan.", variant: "destructive" });
          }
        } else {
          addLog("WARN", `Login gagal untuk ${emailOrUsername}: Pengguna tidak memiliki ID Sekolah yang terkait.`, "AuthContext-Login");
          // Optionally: toast({ title: "Login Gagal", description: "Akun Anda tidak terkait dengan sekolah manapun.", variant: "destructive" });
        }
      }
    } else {
      addLog("WARN", `Login gagal: Pengguna dengan email/username ${emailOrUsername} dan peran ${roleToAttempt} tidak ditemukan.`, "AuthContext-Login");
      // Optionally: toast({ title: "Login Gagal", description: "Email/username atau peran tidak valid.", variant: "destructive" });
    }
  }, [addLog, router]);

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
      router.push('/superadmin/login');
    } else {
      router.push('/login');
    }
  }, [user, addLog, router]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Also update in the main appUsers list
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
