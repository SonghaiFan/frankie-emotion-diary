# Aurora introduction maintenance / 介绍页维护

English is the default; Chinese is `zh/`. Introduction: https://songhaifan.github.io/frankie-emotion-diary/ . App: https://aurora-taupe.vercel.app . / 英文默认，中文位于 `zh/`；应用与介绍页独立部署。

## Content and implementation / 内容与实现

- `site/content.json`: all bilingual product copy, workflow, privacy explanation and gallery captions. Update `en` and `zh` together. It is independent of README formatting. / 双语内容独立维护，不再从 README 段落位置推断。
- `site/project.json`: repository, live app/Pages links and capture revision/date. The renderer uses `content.json` for text and gallery order. / 仓库、线上链接与采集版本日期；正文及画廊顺序使用 `content.json`。
- `site/build.py`: standard-library static renderer; copies only approved screenshot assets, signature and banner. It never reads environment files, builds the app or calls AI. / 标准库构建器，不读取 key、不请求 AI。
- `site/style.css`: app-derived `#FAFAF9`/stone palette, rounded controls and native rounded font stack. Actual app uses Zen Maru Gothic; the static page uses installed rounded fonts without a network font dependency. / 保持应用配色与圆润视觉，静态页使用本地字体回退。
- `site/AUDIT.md`: owning source paths, capture evidence and verification limits. / 源码与采集依据。

## Replace these assets / 更新这些素材

| Asset | Recapture when / 何时重拍 |
| --- | --- |
| `site/assets/landing-current.png` | `LandingPage.tsx` or bottle/character styling changes. Hero is a CSS crop around this untouched screenshot. / 入口或极光瓶角色变化；主图通过 CSS 裁切。 |
| `site/assets/bottle-current.png` | Workspace, greeting, input or layout changes. / 主界面、问候或输入区变化。 |
| `site/assets/zen-current.png` | `ZenMode.tsx` writing/mood/topic controls change. Use labelled, unsaved synthetic text. / 书写与选择器变化，使用标明的示例草稿。 |
| `site/assets/diary.png` | `MyDiary.tsx` changes. / 日记界面变化。 |
| `site/assets/calendar.png` | `EmotionCalendar.tsx` date grouping/counting or visual changes. / 情绪时间线变化。 |
| `site/assets/import-backup.png` | Import controls, version, size limit, count preview or restore behavior changes. / 导入格式、预览、上限或替换行为变化。 |
| `docs/readme/banner.png` | Approved banner changes; copied as page Open Graph image. / 已确认的 banner 更新。 |

Capture current source on a separate unused local origin. Never clear or overwrite a user's existing records to make a screenshot. Use built-in greetings and explicitly labelled synthetic records; never publish a real journal or fabricated AI answer. Wait for entrance transitions to settle before capturing. / 使用独立本地地址和明确标明的示例内容，勿清理现有数据、发布真实日记或伪造 AI 回复；等待动画稳定。

```sh
npm run dev -- --host 127.0.0.1 --port 8334
```

Open the printed URL, switch to English on the landing, capture it, enter the workspace, and open the feather button for Zen Writing. No AI request is needed. Existing sample diary/calendar/import images may be replaced using an isolated preview with synthetic data. Add new screenshot filenames and bilingual captions to `content.json` → `gallery`; all `site/assets/` files are copied to generated `media/`. / 打开入口后切英文、进入主界面、点击羽毛书写；不需要调用 AI。新增截图登记到 `gallery`。

When replacing the landing capture, inspect `.hero-art img` cropping at desktop and phone widths. Keep the bottle fully visible and do not leave clipped text at the crop boundary. All source PNGs remain genuine untouched captures. / 更换入口截图后检查主图裁切，保留完整角色，避免裁切边缘出现残缺文字。

## Update behavior claims / 同步行为说明

- Diary/chat separation: `App.tsx → handleZenSave`, `services/openaiService.ts` history filtering.
- Data sent online: `services/openaiService.ts`, `api/chat.js`, `server/openai.js`. Do not describe the entire app as offline, encrypted end-to-end or guaranteed zero-retention.
- Local storage and migration: `services/localStorage.ts`.
- Backup version/limits/replacement: `services/localStorage.ts`, `components/ImportBackup.tsx`, `App.tsx → handleRestore`.
- Mood timeline: `components/EmotionCalendar.tsx`; it groups recorded moods, not clinical measurements.

同步更新上述功能与隐私说明。不要把“本地存储”写成“整个应用离线”或“端到端加密”，不要把情绪标签写成医疗测量。

## Build, check, publish / 构建与发布

```sh
python3 site/build.py --out _site
python3 -m http.server 8080 --bind 127.0.0.1 --directory _site
```

Open `/` and `/zh/` at desktop and 390px phone width. Check gallery loading, all anchors (especially `use`/`start`), the app link, backup warnings and language links. No AI API call is required for this page. / 检查双语、手机宽度、图片、锚点、恢复提示与应用入口。

Commit only reviewed `site/` changes (and approved shared assets if deliberately updated). Push `main`; `.github/workflows/pages.yml` builds the introduction. App code/Vercel deployment remains separate. Never include `.env` or unrelated changes. / 只提交本次介绍页与确认更新的素材；应用部署独立处理。

The app's Frankie signature remains `public/frankie-signature.svg`, linked to this introduction. / 应用签名保留原有文件与介绍链接。
