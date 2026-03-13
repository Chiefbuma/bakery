/**
 * NEUTRALIZED: Redundant route group file.
 * Logic centrally located in app/admin/orders/page.tsx to resolve parallel route conflicts.
 */
import { redirect } from 'next/navigation';

export default function NeutralizedOrders() {
    redirect('/admin/orders');
}
