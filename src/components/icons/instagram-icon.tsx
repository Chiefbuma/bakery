import type { SVGProps } from 'react';

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm-.14 1.95A3.66 3.66 0 0 0 3.95 7.6v8.79a3.66 3.66 0 0 0 3.66 3.66h8.79a3.66 3.66 0 0 0 3.66-3.66V7.6a3.66 3.66 0 0 0-3.66-3.66H7.6Zm9.47 1.46a1.2 1.2 0 1 1 0 2.39 1.2 1.2 0 0 1 0-2.39ZM12 7.04A4.96 4.96 0 1 1 7.04 12 4.97 4.97 0 0 1 12 7.04Zm0 1.95A3.01 3.01 0 1 0 15.01 12 3.02 3.02 0 0 0 12 8.99Z" />
    </svg>
  );
}
