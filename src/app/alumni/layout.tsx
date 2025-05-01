// app/alumni/layout.tsx

import { checkRole } from '@/lib/roles';
import { NextResponse } from 'next/server';

export default async function AlumniLayout({ children }: { children: React.ReactNode }) {
  // Protect the page from users who are not alumni
  const isAlumni = await checkRole('alumni');

  if (!isAlumni) {
    return <div className='text-center'>Unauthorized: Alumni role required</div>
  }

  return <>{children}</>;
}