/**
 * NEUTRALIZED: Redundant route group file.
 * Logic centrally located in app/admin/dashboard/page.tsx to resolve parallel route conflicts.
 */
import { redirect } from 'next/navigation';

export default function NeutralizedDashboard() {
    redirect('/admin/dashboard');
}
