import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CakeDetailClient from './CakeDetailClient';
import { getCakeByIdFromDb, getCustomizationOptionsFromDb } from '@/lib/catalog';
import { buildCakeMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const cake = await getCakeByIdFromDb(id);
    if (!cake) {
      return {
        title: 'Cake Not Found',
        description: 'The requested cake design is not available right now.',
      };
    }

    return buildCakeMetadata(cake);
  } catch {
    return {
      title: 'Cake Details',
      description: 'Browse cake details and ordering information from WhiskeDelights Kenya.',
    };
  }
}

export default async function CakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cake, options] = await Promise.all([
    getCakeByIdFromDb(id),
    getCustomizationOptionsFromDb(),
  ]);

  if (!cake) {
    notFound();
  }

  return <CakeDetailClient cake={cake} options={options} />;
}
