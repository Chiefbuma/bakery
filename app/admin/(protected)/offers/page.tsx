/**
 * NEUTRALIZED: Redundant route group file.
 * Logic centrally located in app/admin/offers/page.tsx to resolve parallel route conflicts.
 */
import { redirect } from 'next/navigation';

export default function NeutralizedOffers() {
    redirect('/admin/offers');
}
