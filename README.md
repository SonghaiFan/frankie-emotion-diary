![Aurora](docs/readme/banner.png)

# Aurora

[English](README.md) · [简体中文](README.zh-CN.md)

Give today’s feelings a place in an aurora bottle, then sort through them with conversation, a diary and notes.

[Introduction](https://songhaifan.github.io/frankie-emotion-diary/) · [Guide (中文)](docs/guide.md) · [Run locally](#run-locally)

## What it does

- Record how you feel and talk with Aurora beside the aurora bottle.
- Look back on your entries through the diary and emotion calendar.
- Keep small things that matter as notes on the wall behind the bottle.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. AI conversation uses the server-side `OPENAI_API_KEY` on Vercel (or in `.env.local` for local development). No account or Firebase setup is required.

## Before you start

Messages, diary entries, notes and emotion history are stored in this browser. Existing browser records are retained; old Firebase-only records are not automatically imported. Export your data from the local-records menu before clearing browser storage or changing devices. You can import an Aurora JSON backup there too; preview and confirmation are required before it replaces current records. AI conversation runs through the same-origin `/api/chat` endpoint using OpenAI. The API key stays on the server and is never included in the browser bundle.

## For developers

```sh
npm run build
```

[Local records](docs/local-storage.md) · [AI setup](docs/ai-service.md) · [Project guide (中文)](docs/guide.md) · [Artwork](docs/readme/README.md)

---

Made by [Songhai Fan](https://github.com/SonghaiFan) · A Frankie project
