
"use client";

import { GraduationCap, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';
import { SAAS_APP_SETTINGS_STORAGE_KEY } from '@/types';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export function AppLogo() {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(SAAS_APP_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        try {
          setAppSettings(JSON.parse(storedSettings));
        } catch (e) {
          console.error("Failed to parse app settings from localStorage", e);
          localStorage.removeItem(SAAS_APP_SETTINGS_STORAGE_KEY);
        }
      }
    }
  }, []);

  const appName = isClient && appSettings?.appName ? appSettings.appName : "GUMPLA AI";
  const appLogoUrl = isClient && appSettings?.appLogoUrl ? appSettings.appLogoUrl : null;

  return (
    <div className="flex items-center justify-between w-full">
      <Link 
        href={user?.role === 'SuperAdmin' ? "/superadmin/dashboard" : "/dashboard"} 
        className="flex items-center gap-2.5 px-2 py-1 text-xl font-bold text-sidebar-primary-foreground hover:text-sidebar-primary-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background rounded-md"
      >
        {appLogoUrl ? (
          <Image 
            src={appLogoUrl} 
            alt={`${appName} Logo`} 
            width={28} 
            height={28} 
            className="object-contain" 
            data-ai-hint="application logo"
          />
        ) : (
          <GraduationCap className="h-7 w-7 text-sidebar-primary" />
        )}
        <span className="hidden group-data-[state=expanded]:md:inline animated-gradient-text">{appName}</span>
      </Link>
      {user?.role === 'SuperAdmin' && isClient && (
        <Link 
          href="/superadmin/app-settings" 
          className="hidden group-data-[state=expanded]:md:inline-flex items-center justify-center p-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          title="Pengaturan Aplikasi (Super Admin)"
        >
          <Settings size={18} />
        </Link>
      )}
    </div>
  );
}
