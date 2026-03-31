import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getLocationLabel(data: any) {
  const address = data?.address || {};
  const parts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city || address.town || address.village,
    address.county || address.state,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  if (parts.length > 0) {
    return Array.from(new Set(parts)).join(', ');
  }

  if (typeof data?.display_name === 'string' && data.display_name.trim().length > 0) {
    return data.display_name.split(',').slice(0, 4).join(',').trim();
  }

  return null;
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit({
    key: `location:reverse:${getClientIp(req)}`,
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const lat = req.nextUrl.searchParams.get('lat');
  const lon = req.nextUrl.searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const latitude = Number.parseFloat(lat);
  const longitude = Number.parseFloat(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: 'Coordinates are invalid' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'WhiskeDelights/1.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Location lookup failed' }, { status: 502 });
    }

    const data = await response.json();
    const location = getLocationLabel(data);

    if (!location) {
      return NextResponse.json({ error: 'Location name not found' }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error('[LOCATION_REVERSE_ERROR]', error);
    return NextResponse.json({ error: 'Location lookup failed' }, { status: 500 });
  }
}
