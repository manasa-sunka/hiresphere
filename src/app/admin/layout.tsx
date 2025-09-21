// app/admin/layout.tsx

import { checkRole } from '@/lib/roles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin');

  if (!isAdmin) {
    return <div className='text-center'>Unauthorized: Admin role required</div>
  }

  return <>{children}</>;
}