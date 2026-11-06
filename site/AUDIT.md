# Aurora introduction audit

Audited 2026-11-06 against source `81b54512f93e42ffc2fce4e57b9489fdd3a06e5a`. Changes are confined to the standalone introduction in `site/`.

## Actual UI opened

Opened the live application at https://aurora-taupe.vercel.app and its local-records menu. No conversation was submitted and no paid AI request was made. Opened current source with Vite on a fresh, separate `127.0.0.1:8334` origin to avoid existing browser records. Inspected the English landing, bottle workspace, mood/topic controls and Zen Writing editor. Captured the settled real interfaces in `landing-current.png`, `bottle-current.png` and `zen-current.png`. The Zen editor contains explicitly labelled synthetic draft text, was not saved, and did not request an AI response. The screenshot greeting is the app's built-in `NEW_USER_GREETING`, not a generated response.

Existing `diary.png`, `calendar.png` and `import-backup.png` remain clearly labelled sample-data captures. The hero uses CSS to crop the actual landing PNG around the existing bottle; it is not a recreated product mockup.

## Code evidence

- `components/LandingPage.tsx`, `index.html`: `#FAFAF9`, stone text, rounded translucent white controls, Zen Maru Gothic and pastel character. Intro uses native CSS, a rounded system-font fallback, the actual screenshot, and the same quiet palette. It does not add a font CDN dependency.
- `components/AuroraSphere.tsx`, `constants.ts`, `App.tsx`: emotion expressions, category palettes, local typing/tapping reactions and built-in greeting. No health inference or measured efficacy is claimed.
- `components/InputArea.tsx`, `components/ZenMode.tsx`, `App.tsx → handleZenSave`: feather opens local writing; selected emotion/topic; Save to Diary writes a diary message and emotion log, without calling `sendMessage`.
- `components/MyDiary.tsx`: filters diary entries; editing/deleting; local view.
- `components/MemoWall.tsx`, `App.tsx → handleSaveTodo/toggleTodo/updateTodoPosition`: explicit pinning, draggable positions, completion and removal.
- `components/EmotionCalendar.tsx`: a date-grouped timeline, not a month grid. Dominant daily mood/category are simple counts. `ChatHistory.tsx` provides date-grouped conversation.
- `services/localStorage.ts`: versioned browser snapshot (`aurora_local_v1`), no account synchronization; strict v1 import validation; 10 MiB limit; one atomic write after full validation.
- `components/ImportBackup.tsx`, `App.tsx → exportBackup/handleRestore`: local file read, count preview, export-first action, explicit replace (no merge), cancel/invalid-file preservation, active-reply guard and local remount.
- `services/openaiService.ts`: chat excludes diary, initial greeting and reaction messages from history, sends recent 20 non-diary conversation messages and up to 100 wall notes with the submitted text and selected context. `api/chat.js` validates/forwards that context. `server/openai.js` uses a server environment key, calls OpenAI Responses with `store:false`; this does not justify an end-to-end encryption or zero-retention claim.

## Design read

A calm app introduction for personal reflection, preserving Aurora's warm white, rounded type and controls, stone text and original bottle character. Shared overview, explanation, workflow, screenshot gallery, runtime/data and maintenance structure; no generic green feature-template visual. Variance 5, motion 1, density 3. Explicit app light identity overrides generic dual-theme styling. No animation or app dependency was added.

## Verification

- Standard-library Python build generated EN root and Chinese `zh/`; local link/asset checker found two pages and zero issues.
- Opened both generated language pages in Ego. Desktop width 1468: no overflow; loaded images had no failures.
- Chinese phone viewport 390×844: scrollWidth equals innerWidth (390), screenshot inspected. English mobile also checked. Per-page device override cleared.
- Checked native links, maintenance URL, canonical/language alternates and existing banner OG metadata. `git diff --check` passed.
- No new application behavior, dependency, credential, private journal record or AI request is included. This task did not retest online AI generation; it documents the actual request path from source.
