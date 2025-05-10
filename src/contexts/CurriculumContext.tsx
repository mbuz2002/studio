
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { CurriculumFramework } from '@/types';

const CURRICULUM_STORAGE_KEY = "app-default-curriculum";

interface CurriculumContextType {
  defaultCurriculum: CurriculumFramework;
  setDefaultCurriculum: (curriculum: CurriculumFramework) => void;
  availableCurriculums: { value: CurriculumFramework; label: string }[];
}

const availableCurriculumsList: { value: CurriculumFramework; label: string }[] = [
  { value: "Kurikulum Merdeka", label: "Kurikulum Merdeka" },
  { value: "K-13", label: "Kurikulum 2013 (K-13)" },
  { value: "KTSP 2006", label: "Kurikulum Tingkat Satuan Pendidikan (KTSP 2006)" },
];

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider = ({ children }: PropsWithChildren) => {
  const [defaultCurriculum, setDefaultCurriculumState] = useState<CurriculumFramework>("Kurikulum Merdeka");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedCurriculum = localStorage.getItem(CURRICULUM_STORAGE_KEY) as CurriculumFramework | null;
    if (storedCurriculum && availableCurriculumsList.some(c => c.value === storedCurriculum)) {
      setDefaultCurriculumState(storedCurriculum);
    } else {
        // If not stored or invalid, set to default and store it
        setDefaultCurriculumState("Kurikulum Merdeka");
        localStorage.setItem(CURRICULUM_STORAGE_KEY, "Kurikulum Merdeka");
    }
  }, []);

  const setDefaultCurriculum = useCallback((curriculum: CurriculumFramework) => {
    setDefaultCurriculumState(curriculum);
    localStorage.setItem(CURRICULUM_STORAGE_KEY, curriculum);
  }, []);
  
  const contextValue = useMemo(() => ({
    defaultCurriculum,
    setDefaultCurriculum,
    availableCurriculums: availableCurriculumsList
  }), [defaultCurriculum, setDefaultCurriculum]);

  if (!isMounted) {
    return null; 
  }

  return (
    <CurriculumContext.Provider value={contextValue}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (context === undefined) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};

