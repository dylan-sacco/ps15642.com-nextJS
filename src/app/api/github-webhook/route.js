import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import crypto from 'crypto';

const SECRET = process.env.WEBHOOK_SECRET;

// The branch that triggers a deployment. Only push events targeting this
// branch will run the deploy command — all others are acknowledged and ignored.
const DEPLOY_BRANCH = process.env.DEPLOY_BRANCH || 'main';

// Absolute path to the repo on the server. Set DEPLOY_DIR in .env if the repo
// lives somewhere other than the default path below.
const DEPLOY_DIR = process.env.DEPLOY_DIR || '/home/ubuntu/ps15642.com-nextJS';

// exec() spawns a non-interactive, non-login shell, so nvm is not initialized
// by default. Sourcing nvm.sh manually makes `node` and `npm` available without
// hardcoding a version-specific path — nvm's default alias is used automatically,
// so upgrading Node on the server requires no changes here.
const NVM_DIR = process.env.NVM_DIR || '/home/ubuntu/.nvm';

export async function POST(req) {
  if (!SECRET) {
    console.error('[WEBHOOK] WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const sig = req.headers.get('x-hub-signature-256');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 403 });
  }

  const body = await req.text();

  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(body);
  const digest = 'sha256=' + hmac.digest('hex');

  let sigValid = false;
  try {
    sigValid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
  } catch {
    // timingSafeEqual throws if buffers differ in length (i.e. malformed sig)
  }

  if (!sigValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // Only deploy on push events targeting the configured branch.
  // GitHub sends the full ref (e.g. "refs/heads/main") in the push payload.
  const payload = JSON.parse(body);
  const pushedRef = payload.ref || '';
  if (pushedRef !== `refs/heads/${DEPLOY_BRANCH}`) {
    return NextResponse.json({ message: `Ignoring push to ${pushedRef}` });
  }

  const command = `
    source ${NVM_DIR}/nvm.sh &&
    cd ${DEPLOY_DIR} &&
    echo "Node: $(which node) $(node -v)" &&
    echo "NPM: $(which npm) $(npm -v)" &&
    echo "USER: $(whoami)" &&
    git fetch origin && git reset --hard origin/${DEPLOY_BRANCH} &&
    npm install --include=dev &&
    NODE_ENV=production npm run build &&
    pm2 startOrRestart ecosystem.config.js
  `;

  exec(command, { shell: '/bin/bash' }, (err, stdout, stderr) => {
    console.log('[DEPLOY OUTPUT]');
    console.log(stdout);
    console.error('[DEPLOY ERR]');
    console.error(stderr);
    if (err) {
      console.error('[EXEC ERROR]', err);
    }
  });

  return NextResponse.json({ message: 'Deployment triggered' });
}
