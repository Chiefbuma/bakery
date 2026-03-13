/**
 * NEUTRALIZED: Redundant route group file.
 * Logic centrally located in app/admin/users/page.tsx to resolve parallel route conflicts.
 */
import { redirect } from 'next/navigation';

export default function NeutralizedUsers() {
    redirect('/admin/users');
}
