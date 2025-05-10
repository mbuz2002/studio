
import type { PropsWithChildren } from 'react';

export default function MasterDataLayout({ children }: PropsWithChildren) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
