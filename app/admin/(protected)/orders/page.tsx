import { redirect } from 'next/navigation';
/**
 * NEUTRALIZED: Hotel logic removed. 
 * Please use /admin/portal/orders for bakery management.
 */
export default function Redirect() { redirect('/admin/portal/orders'); }