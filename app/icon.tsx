import { ImageResponse } from 'next/og';

export const size = {
  width: 256,
  height: 256,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8ebdc 0%, #e7c59c 100%)',
          color: '#6d4327',
          fontFamily: 'sans-serif',
          fontSize: 132,
          fontWeight: 800,
        }}
      >
        <div
          style={{
            width: 188,
            height: 188,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 56,
            background: 'rgba(255,255,255,0.72)',
            boxShadow: '0 18px 40px rgba(109,67,39,0.18)',
          }}
        >
          W
        </div>
      </div>
    ),
    size
  );
}
