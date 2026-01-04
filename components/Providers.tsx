'use client';

import { ReactNode } from 'react';
import { DataProvider } from '@/lib/context/DataContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
