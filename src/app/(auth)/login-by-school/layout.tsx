
import type { PropsWithChildren } from 'react';

export default function LoginBySchoolLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      {children}
    </div>
  );
}