import { ImageResponse } from 'next/og';

export const alt = 'WhiskeDelights Kenya social preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, rgba(214,171,112,0.45), transparent 32%), linear-gradient(135deg, #fff9f2 0%, #f2e0c9 52%, #ead2b4 100%)',
          color: '#2b1b12',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -70,
            top: -90,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(168,95,46,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 90,
            bottom: -120,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(116,68,34,0.12)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '64px 72px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#8c562d',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#8c562d',
                color: '#fff8ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              W
            </div>
            WhiskeDelights Kenya
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              maxWidth: 760,
            }}
          >
            <div
              style={{
                fontSize: 76,
                lineHeight: 1.02,
                fontWeight: 700,
              }}
            >
              Handcrafted cakes for Nairobi celebrations.
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: '#5d4638',
              }}
            >
              Elegant cake ordering with delivery scheduling, backend-verified pricing, and fast deposit payment.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 18,
              alignItems: 'center',
              color: '#5d4638',
              fontSize: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '14px 22px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(140,86,45,0.18)',
              }}
            >
              Custom cakes
            </div>
            <div
              style={{
                display: 'flex',
                padding: '14px 22px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(140,86,45,0.18)',
              }}
            >
              Nairobi delivery
            </div>
            <div
              style={{
                display: 'flex',
                padding: '14px 22px',
                borderRadius: 999,
                background: '#8c562d',
                color: '#fff8ef',
              }}
            >
              whiskedelights.co.ke
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
