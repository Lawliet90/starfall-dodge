// STARFALL DODGE — a tiny browser game built from one prompt:
// "Build a tiny browser game: fly a little rocket through an asteroid
//  field — dodge the rocks, collect the stars, 3 lives, score climbs
//  the longer you survive. Keyboard and touch. Make it look neon."
//
// Original code and art (all canvas-drawn, no external assets, no network).
// Controls: Arrow keys / WASD to fly, or drag with mouse / touch.
// P or Space pauses. R restarts after game over.
// ?seed=N fixes the random stream. ?demo=1 turns on the autopilot
// (it plays itself — used to record the trailer) and auto-restarts.

'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 540, H = 960;

const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';
let seed = Number(params.get('seed')) || (Date.now() % 2147483647);

// mulberry32 — small deterministic PRNG so a seed replays the same field.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32(seed);
const rand = (lo, hi) => lo + rng() * (hi - lo);
const TAU = Math.PI * 2;

// ---- state ---------------------------------------------------------------
let state = 'title'; // title | playing | paused | over
let score = 0, best = 0, lives = 3;
let elapsed = 0, spawnT = 0, starT = 0, shake = 0, invuln = 0, flash = 0;
let asteroids = [], stars = [], particles = [], bgStars = [];
let overT = 0, titleT = 0;

try { best = Number(localStorage.getItem('starfall-best') || 0) || 0; } catch (e) { best = 0; }

for (let i = 0; i < 90; i++) {
  bgStars.push({ x: rand(0, W), y: rand(0, H), r: rand(0.6, 2.2), s: rand(8, 42), tw: rand(0, TAU) });
}

const rocket = { x: W / 2, y: H - 190, vx: 0, vy: 0, r: 16, tilt: 0 };
const keys = {};
let pointer = null; // {x, y} in canvas coords while dragging

function reset() {
  score = 0; lives = 3; elapsed = 0; spawnT = 0; starT = 0;
  shake = 0; invuln = 0; flash = 0;
  asteroids = []; stars = []; particles = [];
  rocket.x = W / 2; rocket.y = H - 190; rocket.vx = 0; rocket.vy = 0; rocket.tilt = 0;
  rng = mulberry32(seed);
}

function startGame() {
  reset();
  state = 'playing';
}

function spawnAsteroid() {
  const r = rand(16, 44);
  asteroids.push({
    x: rand(r, W - r), y: -r - 10, r,
    vy: rand(120, 210) + elapsed * 2.2,
    vx: rand(-35, 35), rot: rand(0, TAU), vr: rand(-1.6, 1.6),
    crag: Array.from({ length: 9 }, () => rand(0.72, 1.18)),
    hue: rand(0, 1),
  });
}

function spawnStar() {
  stars.push({ x: rand(24, W - 24), y: -20, r: 13, vy: rand(110, 160), rot: 0, vr: rand(1.5, 3) });
}

function burst(x, y, color, n, speed) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(speed * 0.3, speed);
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.3, 0.8), max: 0.8, r: rand(1.5, 4), color });
  }
}

function hitAsteroid(a) {
  lives -= 1;
  flash = 0.35; shake = 14; invuln = 2.2;
  burst(rocket.x, rocket.y, '#ff5d73', 26, 260);
  burst(a.x, a.y, '#b8a6c9', 14, 180);
  asteroids.splice(asteroids.indexOf(a), 1);
  if (lives <= 0) {
    state = 'over'; overT = 0;
    burst(rocket.x, rocket.y, '#ffd166', 40, 320);
    if (score > best) {
      best = Math.floor(score);
      try { localStorage.setItem('starfall-best', String(best)); } catch (e) { /* private mode */ }
    }
  }
}

function collectStar(s) {
  score += 10;
  burst(s.x, s.y, '#ffd166', 12, 160);
  stars.splice(stars.indexOf(s), 1);
}

// ---- input ---------------------------------------------------------------
addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  if ((e.key === ' ' || e.key === 'Enter') && state === 'title') startGame();
  if ((e.key === 'r' || e.key === 'R' || e.key === ' ') && state === 'over' && overT > 0.6) startGame();
  if ((e.key === 'p' || e.key === 'P') && state === 'playing') state = 'paused';
  else if ((e.key === 'p' || e.key === 'P') && state === 'paused') state = 'playing';
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}
canvas.addEventListener('pointerdown', (e) => {
  pointer = toCanvas(e);
  if (state === 'title') startGame();
  else if (state === 'over' && overT > 0.6) startGame();
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => { if (pointer) pointer = toCanvas(e); });
canvas.addEventListener('pointerup', () => { pointer = null; });
canvas.addEventListener('pointercancel', () => { pointer = null; });

// ---- autopilot (demo mode: plays itself, for the trailer) ----------------
function autopilot(dt) {
  // Find the most threatening asteroid: closest above the rocket, roughly in our lane.
  let threat = null, threatScore = Infinity;
  for (const a of asteroids) {
    if (a.y < rocket.y + 40 && a.y > rocket.y - 420) {
      const dx = Math.abs(a.x - rocket.x);
      const s = (rocket.y - a.y) + dx * 2.2;
      if (s < threatScore) { threatScore = s; threat = a; }
    }
  }
  let targetX = rocket.x, targetY = rocket.y;
  // Chase the nearest star when the lane is clear.
  let star = null, starD = Infinity;
  for (const s of stars) {
    const d = Math.abs(s.x - rocket.x) + (rocket.y - s.y);
    if (s.y < rocket.y && d < starD) { starD = d; star = s; }
  }
  if (threat) {
    const away = rocket.x < threat.x ? -1 : 1;
    targetX = rocket.x + away * 150;
    if (Math.abs(threat.x - rocket.x) < threat.r + 46) targetY = rocket.y - 30;
  } else if (star) {
    targetX = star.x; targetY = Math.min(star.y + 40, H - 150);
  } else {
    targetX = W / 2; targetY = H - 190;
  }
  targetX = Math.max(26, Math.min(W - 26, targetX));
  targetY = Math.max(H * 0.45, Math.min(H - 120, targetY));
  const k = Math.min(1, dt * 7);
  rocket.x += (targetX - rocket.x) * k;
  rocket.y += (targetY - rocket.y) * k;
}

// ---- update --------------------------------------------------------------
function update(dt) {
  if (state === 'title') { titleT += dt; return; }
  if (state === 'over') { overT += dt; if (DEMO && overT > 2.2) startGame(); return; }
  if (state !== 'playing') return;

  elapsed += dt;
  score += dt * 5; // survival pays
  if (invuln > 0) invuln -= dt;
  if (flash > 0) flash -= dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 30);

  // Steering: pointer drag wins, then keys, then autopilot.
  if (pointer) {
    rocket.x += (pointer.x - rocket.x) * Math.min(1, dt * 14);
    rocket.y += (pointer.y - rocket.y) * Math.min(1, dt * 14);
    rocket.tilt = Math.max(-0.5, Math.min(0.5, (pointer.x - rocket.x) * 0.004));
  } else if (DEMO) {
    autopilot(dt);
    rocket.tilt = 0;
  } else {
    const ax = (keys['arrowright'] || keys['d'] ? 1 : 0) - (keys['arrowleft'] || keys['a'] ? 1 : 0);
    const ay = (keys['arrowdown'] || keys['s'] ? 1 : 0) - (keys['arrowup'] || keys['w'] ? 1 : 0);
    rocket.vx += ax * 2600 * dt;
    rocket.vy += ay * 2600 * dt;
    rocket.vx *= Math.pow(0.0001, dt); rocket.vy *= Math.pow(0.0001, dt);
    rocket.x += rocket.vx * dt; rocket.y += rocket.vy * dt;
    rocket.tilt = Math.max(-0.55, Math.min(0.55, rocket.vx * 0.0009));
  }
  rocket.x = Math.max(24, Math.min(W - 24, rocket.x));
  rocket.y = Math.max(120, Math.min(H - 90, rocket.y));

  // Spawns get faster and denser as you survive.
  spawnT -= dt;
  if (spawnT <= 0) {
    spawnAsteroid();
    spawnT = Math.max(0.28, 0.85 - elapsed * 0.011) * rand(0.7, 1.3);
  }
  starT -= dt;
  if (starT <= 0) { spawnStar(); starT = rand(1.1, 2.4); }

  for (const a of asteroids) {
    a.y += a.vy * dt; a.x += a.vx * dt; a.rot += a.vr * dt;
    if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx); }
    if (a.x > W - a.r) { a.x = W - a.r; a.vx = -Math.abs(a.vx); }
  }
  asteroids = asteroids.filter((a) => a.y - a.r < H + 20);
  for (const s of stars) { s.y += s.vy * dt; s.rot += s.vr * dt; }
  stars = stars.filter((s) => s.y < H + 30);
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.vy *= 0.98; p.life -= dt; }
  particles = particles.filter((p) => p.life > 0);

  // Collisions (skip while invulnerable).
  if (invuln <= 0) {
    for (const a of asteroids) {
      const dx = a.x - rocket.x, dy = a.y - rocket.y;
      if (dx * dx + dy * dy < (a.r * 0.82 + rocket.r * 0.8) ** 2) { hitAsteroid(a); break; }
    }
  }
  if (state === 'playing') {
    for (const s of stars) {
      const dx = s.x - rocket.x, dy = s.y - rocket.y;
      if (dx * dx + dy * dy < (s.r + rocket.r + 6) ** 2) collectStar(s);
    }
  }
}

// ---- drawing -------------------------------------------------------------
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b0620'); g.addColorStop(0.55, '#12082e'); g.addColorStop(1, '#1d0b33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of bgStars) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + s.tw));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#cfe6ff';
    ctx.beginPath(); ctx.arc(s.x, (s.y + t * s.s) % H, s.r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // faint nebula blobs
  ctx.globalAlpha = 0.07; ctx.fillStyle = '#ff2e88';
  ctx.beginPath(); ctx.arc(80, 200, 95, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2ec8ff';
  ctx.beginPath(); ctx.arc(480, 700, 105, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a5cff';
  ctx.beginPath(); ctx.arc(430, 120, 70, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRocket(t) {
  ctx.save();
  ctx.translate(rocket.x, rocket.y);
  ctx.rotate(rocket.tilt);
  if (invuln > 0 && Math.floor(t * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  // flame
  const fl = 16 + Math.sin(t * 32) * 6 + Math.random() * 4;
  const fg = ctx.createLinearGradient(0, 14, 0, 14 + fl + 18);
  fg.addColorStop(0, '#ffe66d'); fg.addColorStop(0.5, '#ff9f1c'); fg.addColorStop(1, 'rgba(255,46,136,0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(-7, 14); ctx.lineTo(0, 14 + fl + 16); ctx.lineTo(7, 14); ctx.closePath(); ctx.fill();
  // body
  ctx.shadowColor = '#2ec8ff'; ctx.shadowBlur = 18;
  const bg = ctx.createLinearGradient(-12, -26, 12, 18);
  bg.addColorStop(0, '#e8f6ff'); bg.addColorStop(0.5, '#9fdcff'); bg.addColorStop(1, '#2e9fd8');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(13, -6, 11, 14); ctx.lineTo(-11, 14); ctx.quadraticCurveTo(-13, -6, 0, -26); ctx.fill();
  ctx.shadowBlur = 0;
  // window
  ctx.fillStyle = '#12324a';
  ctx.beginPath(); ctx.arc(0, -6, 6.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8fe3ff';
  ctx.beginPath(); ctx.arc(-2, -8, 3, 0, TAU); ctx.fill();
  // fins
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath(); ctx.moveTo(-11, 6); ctx.lineTo(-21, 20); ctx.lineTo(-10, 18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11, 6); ctx.lineTo(21, 20); ctx.lineTo(10, 18); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawAsteroid(a) {
  ctx.save();
  ctx.translate(a.x, a.y); ctx.rotate(a.rot);
  ctx.shadowColor = '#8d7bb5'; ctx.shadowBlur = 10;
  ctx.fillStyle = a.hue > 0.5 ? '#6b5a8c' : '#574a72';
  ctx.beginPath();
  for (let i = 0; i < a.crag.length; i++) {
    const ang = (i / a.crag.length) * TAU, rr = a.r * a.crag[i];
    if (i === 0) ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    else ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.beginPath(); ctx.arc(-a.r * 0.3, -a.r * 0.35, a.r * 0.34, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.arc(a.r * 0.3, a.r * 0.3, a.r * 0.22, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawStar(s) {
  ctx.save();
  ctx.translate(s.x, s.y); ctx.rotate(s.rot);
  ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * TAU - Math.PI / 2, rr = i % 2 === 0 ? s.r : s.r * 0.45;
    if (i === 0) ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    else ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawHUD() {
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.font = '700 30px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#2ec8ff'; ctx.shadowBlur = 8;
  ctx.fillText('SCORE ' + Math.floor(score), 18, 16);
  ctx.shadowBlur = 0;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#9fdcff';
  ctx.fillText('BEST ' + best, 18, 52);
  // lives as hearts, top right
  for (let i = 0; i < 3; i++) {
    const x = W - 30 - i * 38, y = 32;
    ctx.fillStyle = i < lives ? '#ff2e88' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.bezierCurveTo(x - 11, y - 3, x - 5, y - 12, x, y - 4);
    ctx.bezierCurveTo(x + 5, y - 12, x + 11, y - 3, x, y + 8);
    ctx.fill();
  }
}

function drawCenter(text, sub, y) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = 22;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 54px "Arial Black", sans-serif';
  ctx.fillText(text, W / 2, y);
  ctx.shadowBlur = 0;
  if (sub) {
    ctx.font = '400 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cfe6ff';
    ctx.fillText(sub, W / 2, y + 52);
  }
}

function draw(t) {
  ctx.save();
  if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  drawBackground(t);
  for (const s of stars) drawStar(s);
  for (const a of asteroids) drawAsteroid(a);
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (state !== 'over') drawRocket(t);
  drawHUD();
  if (state === 'title') {
    ctx.fillStyle = 'rgba(7,3,18,0.55)'; ctx.fillRect(0, 0, W, H);
    drawCenter('STARFALL', 'D O D G E', 300);
    ctx.textAlign = 'center';
    ctx.font = '400 21px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cfe6ff';
    ctx.fillText('dodge the rocks', W / 2, 420);
    ctx.fillText('collect the stars', W / 2, 452);
    ctx.fillText('3 lives — how long', W / 2, 484);
    ctx.fillText('can you survive?', W / 2, 516);
    if (Math.floor(t * 1.6) % 2 === 0) {
      ctx.font = '700 26px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffd166';
      ctx.fillText('TAP OR PRESS SPACE', W / 2, 620);
    }
    ctx.font = '400 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#8fa8c8';
    ctx.fillText('built from ONE prompt', W / 2, 700);
    ctx.fillText('by an AI agent on make.fun', W / 2, 728);
  } else if (state === 'paused') {
    ctx.fillStyle = 'rgba(7,3,18,0.6)'; ctx.fillRect(0, 0, W, H);
    drawCenter('PAUSED', 'press P to resume', H / 2);
  } else if (state === 'over') {
    ctx.fillStyle = 'rgba(7,3,18,0.62)'; ctx.fillRect(0, 0, W, H);
    drawCenter('GAME OVER', '', 380);
    ctx.textAlign = 'center';
    ctx.font = '700 34px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffd166';
    ctx.fillText('SCORE ' + Math.floor(score), W / 2, 470);
    ctx.font = '400 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cfe6ff';
    ctx.fillText('BEST ' + best, W / 2, 520);
    if (overT > 0.6 && Math.floor(t * 1.6) % 2 === 0) {
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PRESS R TO FLY AGAIN', W / 2, 610);
    }
  }
  ctx.restore();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,46,80,${(flash / 0.35) * 0.28})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ---- main loop -----------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw(now / 1000);
  requestAnimationFrame(frame);
}
if (DEMO && state === 'title') startGame();
requestAnimationFrame(frame);

// Exposed for the trailer recorder / debugging.
window.__starfall = {
  get state() { return state; },
  get score() { return Math.floor(score); },
  get lives() { return lives; },
  start: startGame,
};
