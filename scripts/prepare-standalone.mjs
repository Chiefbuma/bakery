import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const nextDir = join(rootDir, '.next');
const standaloneDir = join(nextDir, 'standalone');
const staticDir = join(nextDir, 'static');
const publicDir = join(rootDir, 'public');
const deployDir = join(rootDir, 'standalone-deploy');

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writePassengerHtaccess() {
  const contents = `PassengerAppRoot "/home/whisked1/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/whisked1/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerFriendlyErrorPages off

RewriteEngine On
RewriteBase /

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
`;

  writeFileSync(join(deployDir, '.htaccess'), contents, 'utf8');
}

function writeDeployReadme() {
  const contents = `WhiskeDelights shared-hosting bundle

Upload the contents of this folder to:
domains/whiskedelights.co.ke

Important files in this bundle:
- server.js
- .next/
- public/
- node_modules/
- .htaccess

Shared-hosting setup:
1. Set the application root to domains/whiskedelights.co.ke
2. Set the startup file to server.js
3. Set NODE_ENV to production
4. Add the production environment variables in the Node.js app panel
5. Restart the Node.js app

Recommended production variables:
- DB_HOST=localhost
- DB_PORT=3306
- DB_DATABASE=whisked1_whiskedelights
- DB_USER=whisked1_whiskedelights
- DB_PASSWORD=your_real_password
- JWT_SECRET=use_a_long_random_secret
- ALLOWED_ORIGINS=https://whiskedelights.co.ke
- NEXT_PUBLIC_API_URL=https://whiskedelights.co.ke/api
- NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER=254796280138
- NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_real_key
- NEXT_PUBLIC_MPESA_BUSINESS_NAME=WhiskeDelights
- NEXT_PUBLIC_MPESA_PAYBILL_NUMBER=880100
- NEXT_PUBLIC_MPESA_ACCOUNT_NUMBER=908128

Notes:
- Use the WhatsApp number in international format with no leading zero.
- If your hosting provider uses a different Node path, update PassengerNodejs in .htaccess.
`;

  writeFileSync(join(deployDir, 'DEPLOY.txt'), contents, 'utf8');
}

function copyBuildArtifacts() {
  if (!existsSync(standaloneDir)) {
    throw new Error('Missing .next/standalone. Run `next build` first.');
  }

  rmSync(deployDir, { recursive: true, force: true });
  ensureDir(deployDir);

  cpSync(standaloneDir, deployDir, { recursive: true });

  if (existsSync(staticDir)) {
    ensureDir(join(deployDir, '.next'));
    cpSync(staticDir, join(deployDir, '.next', 'static'), { recursive: true });
  }

  if (existsSync(publicDir)) {
    cpSync(publicDir, join(deployDir, 'public'), { recursive: true });
  }

  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  writeFileSync(
    join(deployDir, 'package.json'),
    JSON.stringify(
      {
        name: packageJson.name,
        private: true,
        scripts: {
          start: 'node server.js',
        },
      },
      null,
      2
    ),
    'utf8'
  );
}

copyBuildArtifacts();
writePassengerHtaccess();
writeDeployReadme();

console.log('Prepared standalone-deploy/ for shared-hosting upload.');
