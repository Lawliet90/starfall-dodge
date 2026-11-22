// Records STARFALL DODGE gameplay in headless Chromium over CDP.
// Node 22+ stdlib only (global WebSocket, fetch). Usage:
//   node record.mjs [seconds] [seed] [outdir]
// Chromium must already run with --remote-debugging-port=9223.
// Frames land as frame-NNNN.jpg (15 fps); state.jsonl logs the game state.
import { writeFileSync, mkdirSync } from 'node:fs';

const SECONDS = Number(process.argv[2] || 24);
const SEED = process.argv[3] || '7';
const OUT = process.argv[4] || './video/frames';
const PORT = 9223;
const FPS = 15;
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Open a fresh tab at the game URL (demo mode: autopilot plays).
const res = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8123/?demo=1%26seed=${SEED}`, { method: 'PUT' });
if (!res.ok) throw new Error('could not open tab: ' + res.status);
const target = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id;
  pending.set(mid, { resolve, reject });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id).resolve(msg.result);
    pending.delete(msg.id);
  }
};

await send('Page.enable');
await send('Runtime.enable');
await sleep(1500); // let the game boot and the autopilot start

const total = Math.floor(SECONDS * FPS);
const log = [];
for (let i = 0; i < total; i++) {
  const t0 = Date.now();
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78 });
  writeFileSync(`${OUT}/frame-${String(i).padStart(4, '0')}.jpg`, Buffer.from(shot.data, 'base64'));
  if (i % FPS === 0) {
    const ev = await send('Runtime.evaluate', { expression: 'JSON.stringify({s:window.__starfall.state,score:window.__starfall.score,lives:window.__starfall.lives})', returnByValue: true });
    const st = JSON.parse(ev.result.value);
    log.push({ t: +(i / FPS).toFixed(1), ...st });
    console.log(`t=${(i / FPS).toFixed(1)}s`, st);
  }
  const wait = 1000 / FPS - (Date.now() - t0);
  if (wait > 0) await sleep(wait);
}
writeFileSync(`${OUT}/state.jsonl`, log.map((l) => JSON.stringify(l)).join('\n') + '\n');
console.log(`done: ${total} frames in ${OUT}`);
ws.close();
process.exit(0);
