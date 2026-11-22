# BUILD — post-x-the-agent-builds-a-game-from-20261122-1709

Competition: **The agent builds a game from one prompt** — $20, top 10 share.
Deadline: **2026-11-24T17:09:00Z (00:09 WIB 25 Nov)**. Entry is FREE (no fee, no credits).
Account: **@rapid-ibis-27**, payout wallet `8cY94YfE7Ccugv3VY6S59utZUUHmGaorYT1j6i2ALj5s`.
Status: **BUILT, NOT SUBMITTED.** The game + video are done and verified. What remains
is the user's X post, then submission (see "What remains").

## The game — STARFALL DODGE

Original code + art, canvas, no external assets, no network at runtime.

- `game/index.html` + `game/game.js` — fly a neon rocket through an asteroid field,
  dodge rocks, collect stars, 3 lives, score climbs as you survive.
  Keyboard (arrows/WASD, P pause, R restart) + mouse/touch drag.
  `?seed=N` fixes the random stream; `?demo=1` autopilot plays itself (used for the trailer).
- Play it: `node serve.ts` then open http://localhost:8080 (or open `game/index.html` directly).
- `main.ts` — the kit starter's grader program: copies `POST.json` to the output.
- Play-tested in headless Chromium (real browser render): autopilot run scored 257,
  lost all 3 lives, game-over screen, auto-restart — 360 frames recorded, see `video/frames/`.

## The video — `video.mp4` (46.5 s, 1080x1920, H.264, 30 fps, 4.4 MB, silent)

Built in this session with ffmpeg (`video/build-video.sh`; frames recorded with
`video/record.mjs` over CDP from headless Chromium). Verified frame by frame:

1. 0–3.5 s — hook: "I gave my AI agent ONE PROMPT. It built a game. I just watched."
2. 3.5–10 s — the prompt, verbatim, on screen.
3. 10–20 s — agent working: real lines from `game.js` appearing in a terminal.
4. 20–44 s — real gameplay footage (score climbing, hits, game over, restart),
   ending on "IT WORKS. Your turn — build on make.fun".
5. 44–46.5 s — make.fun referral end card (press-pack transparent webm, sha256-verified
   against the manifest, used as-is, HOLD=0) with referral code **`xh1mf2kk`**
   typed in JetBrains Mono Bold, ink #191419.

## Exact X post text (user posts this, with the video attached natively)

Post from public account **@indak88**, before the deadline, video uploaded to the post itself.

```
My AI agent built a whole game from ONE prompt — I just watched. Rocket, asteroids, stars, 3 lives. It works.

Made by my AI agent for a $20 bounty on @makefunai: https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709

makefun-yoyo-path-firework
```

- The middle line is the kit's required line, word for word (carries @makefunai + bounty link).
- Play code: **`makefun-yoyo-path-firework`** (code 0 of 4 for @rapid-ibis-27 in this bounty;
  from `makefun check`, 2026-11-22). Any one of the 4 codes passes.
- Referral code in the video's end card: `xh1mf2kk` (link https://make.fun/r/xh1mf2kk).
- Keep the post up and the account public until results are out.

## Kit check result (`makefun check`, 2026-11-22 ~22:04 UTC)

Commit `271de1f8dac7c873a336d0e7557d35d1894096aa` — **4 passed, 1 failed, 15 skipped,
5 checked at submission**. Passes: competition_open, snapshot (39 files, 5.4 MB),
license_osi (MIT), entrypoint (main.ts, node22). The one failure is
**transcripts_present** — expected: no transcript bundle was made in this build-only run;
bundle at submit time (`makefun bundle`, run from the top-level agent once subagents
are done). The 5 at-submission checks (repo_public, repo_owner, repo_created_after_open,
commit_in_repo, duplicate_snapshot) need the GitHub push, which happens at submit time.

## What remains (in order)

1. User posts `video.mp4` to X from @indak88 with the exact text above, before
   2026-11-24T17:09:00Z. Copy the post URL (`https://x.com/indak88/status/<id>`).
2. Put that URL in `POST.json` (`{"url": "..."}`), commit.
3. Create a public GitHub repo (created after 2026-11-22T17:09:00Z), push this commit,
   with `.makefun/owner.json` naming wallet `8cY94YfE7Ccugv3VY6S59utZUUHmGaorYT1j6i2ALj5s`
   (already in the repo — wallet-only account has no GitHub login).
4. Bundle the transcripts of the sessions that built this entry (this session + its parent),
   run `makefun check` again with `--transcripts`, then
   `node cli/makefun.mjs submit --competition post-x-the-agent-builds-a-game-from-20261122-1709
   --repo-url <url> --commit <sha> --title "STARFALL DODGE — one prompt, one game"
   --bundle <transcripts.tar.gz> --keypair ~/workspace/make-fun-bounty/wallet.json`.
5. No submission.md was created (build-only run, as ordered).

## Files

- Game: `game/index.html`, `game/game.js`, `serve.ts`
- Video: `video.mp4` (+ `video/build-video.sh`, `video/record.mjs`, `video/frames/`)
- End card (press pack, sha256-verified): `assets/card-9x16-transparent.webm`
- Kit: `~/workspace/make-fun-bounty/post-x-the-agent-builds-a-game-from-20261122-1709-kit/`
