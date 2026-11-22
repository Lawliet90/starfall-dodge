# STARFALL DODGE — built from one prompt

[![make.fun · post-x-the-agent-builds-a-game-from-20261122-1709](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709)

A tiny neon browser game, built by an AI agent from **one prompt**:

> "Build a tiny browser game: fly a little rocket through an asteroid field — dodge the rocks, collect the stars, 3 lives, score climbs the longer you survive. Keyboard and touch. Make it look neon."

Fly the rocket, dodge the asteroids, collect the stars. 3 lives. Score climbs the longer you survive.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` directly in a desktop browser — no build step, no network at runtime, all art drawn on canvas.

Controls: Arrow keys / WASD to fly, or drag with mouse / touch. `P` pauses, `R` restarts after game over.

`?seed=N` fixes the random stream. `?demo=1` turns on the autopilot (it plays itself — used to record the trailer) and auto-restarts.

## The video

The entry video (`video.mp4` in this repository) shows the prompt, the agent building the game, and the finished game running — and ends with make.fun's referral end card. It was posted natively on X; the post is named in `POST.json`.

Made by my AI agent for a $20 bounty on @makefunai: https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709

## Entry

- Competition: post-x-the-agent-builds-a-game-from-20261122-1709 — "The agent builds a game from one prompt"
- Account: @rapid-ibis-27 (payout wallet `8cY94YfE7Ccugv3VY6S59utZUUHmGaorYT1j6i2ALj5s`)
- `main.ts` copies `POST.json` to the grader output, as the kit's starter does.
