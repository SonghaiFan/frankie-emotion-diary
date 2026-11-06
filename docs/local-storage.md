# Local records / 本地记录

Aurora no longer uses Google sign-in, Firebase Auth or Firestore. Calendar, diary and chat history are available without an account. / Aurora 不再使用 Google 登录、Firebase Auth 或 Firestore；无需登录即可打开日历、日记和对话记录。

- Current records are saved atomically as a versioned `aurora_local_v1` localStorage snapshot, including messages/diary entries, notes and positions, completion state, mood history, language and entry preference. / 版本化本地快照包含对话、日记、便签位置与完成状态、情绪历史、语言与入口偏好。
- On first load, valid existing `aurora_messages`, `aurora_todos`, `aurora_category`, `aurora_emotion`, `aurora_visited` and related local keys are read and migrated. Legacy keys are left untouched. Once a snapshot exists it takes precedence, so old deleted entries cannot reappear. Cached Google profiles are not read. / 首次读取并迁移已有浏览器数据，保留旧键；新快照优先，防止旧记录复活，不读取缓存的 Google 账号。
- Diary edits/deletions update the same in-memory source as persistence and history views. Diary saves are local and do not make an AI request. / 日记编辑、删除与历史页面共用数据源；日记保存只在本地完成，不触发 AI 请求。
- Corrupt or unsupported data is not overwritten automatically. If storage is blocked or full, a visible warning explains that records cannot be saved. The local menu can export the current session as JSON. / 损坏或不支持的数据不会自动覆盖；存储禁用或容量不足时会提示，可导出当前会话 JSON。
- Storage belongs to this browser profile and origin. Different devices, browsers and hostnames do not synchronize. Clearing site data removes current local records. / 不同设备、浏览器与域名不自动同步；清理站点数据会移除本地记录。
- The local-records menu provides JSON export and import. It contains private diary/chat content; choose where to keep it. / 本地记录菜单支持 JSON 导出与导入，内容包含私人日记和对话，请自行妥善保管。
- Existing Firebase cloud data is neither fetched nor deleted by this version. It has not been automatically transferred to this browser. / 此版本不读取或删除旧 Firebase 云端数据，也不会自动迁入当前浏览器。
- AI conversation still requires internet. When you explicitly send a chat message for a response, that text and relevant chat/note context go through the app's server to OpenAI; the key stays on Vercel. / AI 回复仍需联网：发送聊天时，正文与相关聊天、便签上下文会通过应用服务端交给 OpenAI，key 保存在 Vercel。

```sh
npm run test:storage
npm run test:ai
npm run typecheck
npm run build
```

Diary entries are excluded from the AI conversation context. They are sent only if you explicitly copy their text into a chat message. / 日记不会自动加入 AI 对话上下文；只有你主动将正文复制到聊天中发送时，才会交给 AI。

## Restore a backup / 从备份恢复

1. Open **Local records → Import backup** and select the JSON exported by Aurora. The file is read locally; it is not uploaded. Files up to 10 MB and backup version 1 are supported. / 打开本地记录菜单中的“导入备份”，选择 Aurora 导出的 JSON 文件；仅在本地读取，不上传，支持最大 10 MB 的 v1 备份。
2. Review the chat, diary, note and mood counts. Use **Export current records first** to keep a copy before proceeding. Preferences, note positions and completion state are restored too. / 核对数量，建议先导出当前记录；语言、显示偏好、便签位置和完成状态也会恢复。
3. Choose **Replace records and restore** to replace this browser's current snapshot. This is replacement, not merging. The page reloads after the atomic write to reset old timers, drafts and AI context. / 确认后替换当前快照，不合并；写入成功后刷新页面，重置旧计时器、草稿和 AI 上下文。
4. Cancelling or selecting an invalid file does not change current records. Malformed JSON, unsupported versions, invalid nested fields and duplicate IDs are rejected. A storage/quota failure leaves the previous snapshot intact. An empty backup requires the same explicit confirmation and is clearly labelled as clearing current records. / 取消和无效文件不会改变数据；格式、版本、记录字段和重复 ID 都会校验，存储失败不会覆盖原快照，空备份会明确提示清空当前记录。

Restoring is disabled while an AI response is pending. If the backup changes language or the entry-screen preference, those settings take effect after reload. / AI 回复进行中不可恢复；备份中的语言和入口偏好会在刷新后生效。
