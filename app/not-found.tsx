import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';

/**
 * @fileOverview WhiskeDelights Global 404 Page
 * Handles missing routes with brand-consistent styling.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-900 p-6 text-center">
      <Utensils className="h-16 w-16 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-black mb-2 font-headline tracking-tighter">404 - Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md font-medium">
        The requested masterpiece or artisanal resource is not available in our current catalog.
      </p>
      <Link href="/">
        <Button className="font-black h-12 px-8 rounded-xl shadow-lg shadow-primary/10">Return to Gallery</Button>
      </Link>
    </div>
  );
}
