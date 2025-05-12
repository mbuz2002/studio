
import type { PropsWithChildren } from 'react';

export default function SignupLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 p-4">
      {children}
    </div>
  );
}
