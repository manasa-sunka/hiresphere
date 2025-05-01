// app/student/layout.tsx

import { checkRole } from '@/lib/roles';
import { NextResponse } from 'next/server';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Protect the page from users who are not students
  const isStudent = await checkRole('student');

  if (!isStudent) {
    return <div className='text-center'>Unauthorized: Student role required</div>
  }

  return <>{children}</>;
}