import { redirect } from 'next/navigation';
/**
 * Redirecting toportal to avoid route group collisions.
 */
export default function Redirect() { redirect('/admin/portal/orders'); }