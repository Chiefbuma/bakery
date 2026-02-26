
import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  // Set POS as the main landing page for admin
  redirect('/admin/pos')
}
