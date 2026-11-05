![Aurora](docs/readme/banner.png)

# Aurora

Give today’s feelings a place in an aurora bottle, then sort through them with conversation, a diary and notes.

[Guide (中文)](docs/guide.md) · [Run locally](#run-locally) · [中文](README.zh-CN.md)

## What it does

- Record how you feel and talk with Aurora beside the aurora bottle.
- Look back on your entries through the diary and emotion calendar.
- Keep small things that matter as notes on the wall behind the bottle.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. AI conversation requires `GEMINI_API_KEY` in a local `.env.local`. Account features require the Firebase project and authorized domains configured through `services/firebase.ts`.

## Before you start

You can start through the guest entrance. Firebase provides Google sign-in and account data. The current Vite configuration injects the Gemini key into browser code, so a build containing a private key should not be shared publicly.

## For developers

```sh
npm run build
```

[Project guide (中文)](docs/guide.md) · [Artwork](docs/readme/README.md)

---

Made by [Songhai Fan](https://github.com/SonghaiFan) · A Frankie project
