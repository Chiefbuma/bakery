import { redirect } from 'next/navigation';
/**
 * RESOLVED: Moved to app/admin/cakes/page.tsx to fix parallel route conflict.
 */
export default function RedirectToMain() { redirect('/admin/cakes'); }
