// Async ffmpeg wrapper — runs ffmpeg as a child process without blocking
// the Node.js event loop. Use this instead of spawnSync for all ffmpeg calls.

import { spawn } from 'child_process';

/**
 * Runs ffmpeg with the given args. Resolves true on success, false on failure.
 * @param {string[]} args - ffmpeg arguments (do NOT include 'ffmpeg' itself)
 * @param {number} [timeoutMs=300000] - kill timeout in ms (default 5 min)
 */
export function spawnFfmpeg(args, timeoutMs = 5 * 60 * 1000) {
  return new Promise((resolve) => {
    const proc = spawn('ffmpeg', args);

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve(false);
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve(code === 0);
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}
