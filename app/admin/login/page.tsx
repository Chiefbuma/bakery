
import { redirect } from 'next/navigation';

export default function LegacyAdminLoginPage() {
  // The new unified login is at the root '/'
  redirect('/');
}
