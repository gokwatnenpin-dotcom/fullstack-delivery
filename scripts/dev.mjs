import { spawn } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const backend = path.join(root, 'backend', 'src', 'server.js');
const children = [
  spawn(node, ['--watch', backend], { cwd: root, stdio: 'inherit', env: process.env }),
  spawn(node, [vite, '--host'], { cwd: root, stdio: 'inherit', env: process.env }),
];

function shutdown() {
  for (const child of children) child.kill('SIGTERM');
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
for (const child of children) child.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code;
});
