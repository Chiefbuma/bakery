import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'standalone-deploy/**', 'node_modules/**', '.git/**'],
  },
  ...nextVitals,
];

export default config;
