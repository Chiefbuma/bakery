/**
 * NEUTRALIZED: Redundant route group file.
 * Logic centrally located in app/admin/cakes/page.tsx to resolve parallel route conflicts.
 */
import { redirect } from 'next/navigation';

export default function NeutralizedCakes() {
    redirect('/admin/cakes');
}
