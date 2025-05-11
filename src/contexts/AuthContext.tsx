
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, School } from '@/types'; // Added School
import { useRouter } from 'next/navigation';
import { useLog } from './LogContext'; 
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY } from '@/types'; // Import storage keys
import { initialSuperAdminUser, initialDefaultSchool, initialSchoolAdminUser, initialGuruUser, DEFAULT_SCHOOL_ID } from '@/lib/initial-data'; // Import initial data
import { 
  initialLessonPlansData, 
  initialAnnualProgramsData, 
  initialSemesterProgramsData,
  initialSubjectsData,
  initialTeachersData,
  initialClassesData,
  initialAcademicEventsData,
  initialModulAjarData
} from '@/lib/initial-data';
import { 
  LESSON_PLANS_STORAGE_KEY, 
  ANNUAL_PROGRAMS_STORAGE_KEY, 
  SEMESTER_PROGRAMS_STORAGE_KEY,
  SUBJECTS_STORAGE_KEY,
  TEACHERS_STORAGE_KEY,
  SCHOOL_CLASSES_STORAGE_KEY,
  ACADEMIC_EVENTS_STORAGE_KEY,
  MODUL_AJAR_STORAGE_KEY
} from '@/types';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void; // Role might be ignored if user exists
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  loading: boolean;
  currentSchool: School | null; // Add current school context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeDefaultData = () => {
  if (typeof window === 'undefined') return;

  const usersExist = localStorage.getItem(APP_USERS_STORAGE_KEY);
  const schoolsExist = localStorage.getItem(SCHOOLS_STORAGE_KEY);

  if (usersExist && schoolsExist) return; // Data already exists or initialized

  // Initialize Schools
  if (!schoolsExist) {
    localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([initialDefaultSchool]));
  }

  // Initialize Users
  if (!usersExist) {
    const usersToStore = [initialSuperAdminUser, initialSchoolAdminUser, initialGuruUser];
    localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(usersToStore));
  }

  // Initialize curriculum data scoped to the default school
  const defaultSchoolId = initialDefaultSchool.id;
  const defaultAdminId = initialSchoolAdminUser.id;
  const defaultGuruId = initialGuruUser.id;

  if (!localStorage.getItem(LESSON_PLANS_STORAGE_KEY)) {
    const lessonPlans = initialLessonPlansData.map(lp => ({ ...lp, id: `lp-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultGuruId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(lessonPlans));
  }
  if (!localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY)) {
    const annualPrograms = initialAnnualProgramsData.map(ap => ({ ...ap, id: `ap-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultGuruId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(annualPrograms));
  }
  if (!localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY)) {
    const semesterPrograms = initialSemesterProgramsData.map(sp => ({ ...sp, id: `sp-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultGuruId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(semesterPrograms));
  }
   if (!localStorage.getItem(MODUL_AJAR_STORAGE_KEY)) {
    const modulAjar = initialModulAjarData.map(ma => ({ ...ma, id: `ma-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultGuruId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), curriculumType: "Kurikulum Merdeka" as const, type: "ModulAjar" as const }));
    localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify(modulAjar));
  }


  // Initialize Master Data scoped to the default school
   if (!localStorage.getItem(SUBJECTS_STORAGE_KEY)) {
    const subjects = initialSubjectsData.map(s => ({ ...s, id: `subj-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultAdminId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  }
  if (!localStorage.getItem(TEACHERS_STORAGE_KEY)) {
    const teachers = initialTeachersData.map(t => ({ ...t, id: `teach-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultAdminId, userId: (t.name === "Guru Inovatif" ? defaultGuruId : undefined), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
     // Ensure the initialGuruUser is also a teacher record
    const guruTeacherRecord = {
        id: `teach-guru-${Date.now()}`,
        name: initialGuruUser.name,
        nip: "123456789012345678", // Example NIP for demo guru
        subjectIds: [], // Assign subjects if needed
        userId: initialGuruUser.id,
        schoolId: defaultSchoolId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: defaultAdminId,
    };
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([...teachers, guruTeacherRecord]));
  }
   if (!localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY)) {
    const classes = initialClassesData.map(c => ({ ...c, id: `class-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultAdminId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(classes));
  }
  if (!localStorage.getItem(ACADEMIC_EVENTS_STORAGE_KEY)) {
    const academicEvents = initialAcademicEventsData.map(ae => ({ ...ae, id: `event-demo-${Math.random().toString(16).slice(2)}`, schoolId: defaultSchoolId, createdByUserId: defaultAdminId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    localStorage.setItem(ACADEMIC_EVENTS_STORAGE_KEY, JSON.stringify(academicEvents));
  }

  console.log("Default SaaS data initialized for demo school and superadmin.");
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addLog } = useLog(); 

  useEffect(() => {
    initializeDefaultData(); // Initialize data on first client-side load if needed
    
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
              if (school) setCurrentSchool(school);
            }
          }
        }
      } catch (error) {
        console.error("Gagal memulihkan sesi pengguna:", error);
        if (!didCancel) {
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

  const login = useCallback((email: string, roleToAttempt: UserRole) => { // roleToAttempt is mainly for demo
    const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    const foundUser = users.find(u => u.email === email);

    if (foundUser) {
      // For demo purposes, allow role override if SuperAdmin or if the user found matches the role
      if (roleToAttempt === "SuperAdmin" && foundUser.role !== "SuperAdmin") {
         // If trying to log in as SuperAdmin but found user is not, fail
         addLog("WARN", `Login gagal: Email ${email} terdaftar sebagai ${foundUser.role}, bukan SuperAdmin.`, "AuthContext-Login");
         // Optionally show a toast to the user
         return;
      }
      
      const userToLogin = { ...foundUser };
      // If not SuperAdmin, ensure their assigned role is used.
      // For demo convenience, if roleToAttempt is not SuperAdmin, we might use it.
      // In a real app, role is determined by the backend/stored user data.
      if (roleToAttempt !== "SuperAdmin") {
          userToLogin.role = roleToAttempt; // Allow role selection for demo for non-SA
      }


      if (userToLogin.role === "SuperAdmin") {
        setUser(userToLogin);
        setCurrentSchool(null); // SuperAdmin is not tied to a specific school context by default
        localStorage.setItem('currentUser', JSON.stringify(userToLogin));
        addLog("INFO", `SuperAdmin ${email} berhasil masuk.`, "AuthContext-Login");
        router.push('/superadmin/dashboard'); // Redirect SuperAdmin to their dashboard
      } else {
        if (userToLogin.schoolId) {
          const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
          const schools: School[] = schoolsData ? JSON.parse(schoolsData) : [];
          const school = schools.find(s => s.id === userToLogin.schoolId && s.isActive);
          if (school) {
            setUser(userToLogin);
            setCurrentSchool(school);
            localStorage.setItem('currentUser', JSON.stringify(userToLogin));
            addLog("INFO", `Pengguna ${email} (Peran: ${userToLogin.role}, Sekolah: ${school.name}) berhasil masuk.`, "AuthContext-Login");
            router.push('/dashboard');
          } else {
            addLog("WARN", `Login gagal untuk ${email}: Sekolah tidak aktif atau tidak ditemukan (ID: ${userToLogin.schoolId}).`, "AuthContext-Login");
            // Optionally show a toast
          }
        } else {
          addLog("WARN", `Login gagal untuk ${email}: Pengguna tidak memiliki schoolId.`, "AuthContext-Login");
           // Optionally show a toast
        }
      }
    } else {
      // Demo: if user not found, create one based on roleToAttempt, but only if it's not SuperAdmin or if the email is the superadmin email
      if (roleToAttempt === "SuperAdmin" && email === initialSuperAdminUser.email) {
        // This case should ideally be handled by initial data seeding.
        setUser(initialSuperAdminUser);
        setCurrentSchool(null);
        localStorage.setItem('currentUser', JSON.stringify(initialSuperAdminUser));
        addLog("INFO", `SuperAdmin ${email} (akun default) berhasil masuk.`, "AuthContext-Login");
        router.push('/superadmin/dashboard');
      } else if (roleToAttempt !== "SuperAdmin" && email === initialSchoolAdminUser.email && roleToAttempt === "Admin") {
        setUser(initialSchoolAdminUser);
        setCurrentSchool(initialDefaultSchool);
        localStorage.setItem('currentUser', JSON.stringify(initialSchoolAdminUser));
        addLog("INFO", `Admin Sekolah Demo ${email} (akun default) berhasil masuk.`, "AuthContext-Login");
        router.push('/dashboard');
      }
      // Handle other demo roles if needed or show error
      else {
        addLog("WARN", `Login gagal: Pengguna dengan email ${email} tidak ditemukan.`, "AuthContext-Login");
      }
    }
  }, [addLog, router]);

  const logout = useCallback(() => {
    const userEmail = user?.email; 
    if (userEmail) {
      addLog("INFO", `Pengguna ${userEmail} keluar.`, "AuthContext-Logout");
    }
    setUser(null);
    setCurrentSchool(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  }, [user, addLog, router]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const newUser = { ...currentUser, ...updatedUserData, updatedAt: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        setTimeout(() => { 
          addLog("INFO", `Profil pengguna ${currentUser.email} diperbarui. Data baru: ${JSON.stringify(Object.keys(updatedUserData))}`, "AuthContext-UpdateUser");
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
