import type { Metadata } from 'next';
import type { Cake } from '@/lib/types';
import { getOptionalEnv } from '@/lib/env';

const DEFAULT_SITE_URL = 'https://whiskedelights.co.ke';
const DEFAULT_OG_PATH = '/opengraph-image';

export const SITE_NAME = 'WhiskeDelights Kenya';
export const SITE_DESCRIPTION =
  'Order handcrafted celebration cakes in Nairobi with simple checkout, delivery scheduling, and deposit payment.';
export const SITE_KEYWORDS = [
  'WhiskeDelights Kenya',
  'Nairobi bakery',
  'cake shop Nairobi',
  'custom cakes Kenya',
  'birthday cakes Nairobi',
  'wedding cakes Kenya',
  'cake delivery Nairobi',
  'artisan cakes Kenya',
  'celebration cakes Nairobi',
];

function stripApiSuffix(value: string) {
  return value.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
}

export function getSiteUrl() {
  const configured =
    getOptionalEnv('SITE_URL') ||
    getOptionalEnv('NEXT_PUBLIC_SITE_URL') ||
    getOptionalEnv('NEXT_PUBLIC_API_URL');

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  return stripApiSuffix(configured);
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path = '/') {
  return new URL(path, getMetadataBase()).toString();
}

export function resolveSeoImage(imagePath?: string | null) {
  if (imagePath && /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath && imagePath.startsWith('/')) {
    return absoluteUrl(imagePath);
  }

  return absoluteUrl(DEFAULT_OG_PATH);
}

function summarize(text: string, maxLength = 155) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function formatKenyanPrice(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildCakeMetadata(cake: Cake): Metadata {
  const title = `Order ${cake.name} Cake in Nairobi`;
  const description = summarize(
    `${cake.description} ${cake.customizable ? 'Customize flavor, size, and finish for your celebration.' : 'Available in a ready-made signature finish for quick ordering.'} Starting from ${formatKenyanPrice(cake.base_price)} at WhiskeDelights Kenya.`
  );
  const canonicalPath = `/cakes/${cake.id}`;
  const image = resolveSeoImage(cake.image_data_uri);

  return {
    title,
    description,
    keywords: [
      cake.name,
      `${cake.name} cake Nairobi`,
      `${cake.category} cake Kenya`,
      'cake order online Nairobi',
      ...SITE_KEYWORDS,
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_KE',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${cake.name} from ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
