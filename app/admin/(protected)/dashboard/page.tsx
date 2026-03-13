import { redirect } from 'next/navigation';
/**
 * RESOLVED: Moved to app/admin/dashboard/page.tsx to fix parallel route conflict.
 */
export default function RedirectToMain() { redirect('/admin/dashboard'); }
