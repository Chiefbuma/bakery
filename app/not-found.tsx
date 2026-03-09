import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel } from 'lucide-react';

/**
 * @fileOverview Global 404 Page
 * Prevents build-time page collection errors in Next.js.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-white p-6 text-center">
      <Hotel className="h-16 w-16 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-black mb-2 font-headline">404 - Not Found</h1>
      <p className="text-stone-400 mb-8 max-w-md">
        The requested resource has been moved or is no longer part of the Wamaghach Management system.
      </p>
      <Link href="/">
        <Button className="font-bold h-12 px-8">Return to Portal</Button>
      </Link>
    </div>
  );
}
