import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      {children}
    </div>
  );
}
