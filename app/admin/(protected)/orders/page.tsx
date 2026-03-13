import { redirect } from 'next/navigation';
/**
 * RESOLVED: Moved to app/admin/orders/page.tsx to fix parallel route conflict.
 */
export default function RedirectToMain() { redirect('/admin/orders'); }
