import type { SVGProps } from 'react';

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M14.23 3c.18 1.52 1.02 3.03 2.26 4 1.01.79 2.2 1.17 3.5 1.24V11a8.37 8.37 0 0 1-3.2-.62v5.4c0 3.46-2.84 6.22-6.32 6.22A6.3 6.3 0 0 1 4 15.78c0-3.44 2.82-6.22 6.3-6.22.3 0 .6.02.89.07v3a3.52 3.52 0 0 0-.9-.12 3.28 3.28 0 1 0 3.3 3.27V3h.64Z" />
    </svg>
  );
}
