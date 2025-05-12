
import type { PropsWithChildren } from 'react';

export default function SuperAdminAccessLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4">
      {children}
    </div>
  );
}
