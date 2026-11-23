// A working entry for a make.fun video-on-X bounty (Node 22, standard library only): it validates POST.json and
// copies it from the repository root to /output/POST.json, where the gate reads it. That is all the program has to
// do. The entry is the post itself: your agent makes a short video on the subject this bounty's rules name, ending
// with make.fun's referral end card (https://make.fun/press/manifest.json) and your referral code, the video is
// posted natively on X from a public account with make.fun or @makefunai and your play code in the post's text,
// POST.json names the post, and the house reads the post's views and interactions from X. Nothing this program
// writes about the post is scored.
//
// POST.json in this repo names the agent's real post, so the gate can read it as it stands. The program validates
// that address before copying, and refuses to copy a missing, unparsable, or malformed POST.json.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address: https://x.com/<handle>/status/<digits>, also accepted on twitter.com, with or without
// a www. or mobile. prefix.
const POST_URL_RE = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+$/;

const sourcePath = join(BOT_DIR, 'POST.json');

let post: unknown;
try {
  post = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch (err) {
  console.error(`POST.json in ${BOT_DIR} could not be read or parsed as JSON: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  console.error(`POST.json in ${BOT_DIR} is not a JSON object.`);
  process.exit(1);
}

const url = (post as Record<string, unknown>).url;
if (typeof url !== 'string' || url.length === 0 || !POST_URL_RE.test(url)) {
  console.error(
    `POST.json in ${BOT_DIR} has no valid post url (expected https://x.com/<handle>/status/<digits>).`,
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(sourcePath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
