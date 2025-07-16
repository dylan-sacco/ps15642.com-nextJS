import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import crypto from 'crypto';

const SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(body);
  const digest = 'sha256=' + hmac.digest('hex');

  if (sig !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const command = `
    cd /home/ubuntu/ps15642.com-nextJS/ &&
    echo "Node: $(which node)" &&
    echo "NPM: $(which npm)" &&
    echo "USER: $(whoami)" &&
    echo "PATH: $PATH" &&
    git fetch origin && git reset --hard origin/main &&
    npm install --include=dev &&
    NODE_ENV=production npm run build &&
    pm2 restart ps15642
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
