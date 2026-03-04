
import { redirect } from 'next/navigation';

export default function LegacyPaymentPage() {
  // Redirecting legacy cake-paradise routes to the new hotel root
  redirect('/');
}
