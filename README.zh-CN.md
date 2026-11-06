![Aurora](docs/readme/banner.png)

# Aurora

[English](README.md) · [简体中文](README.zh-CN.md)

把今天的情绪交给一只极光瓶，在对话、日记和便签里慢慢整理。

[介绍页](https://songhaifan.github.io/frankie-emotion-diary/zh/) · [项目指南](docs/guide.md) · [本地运行](#本地运行)

## 可以做什么

- 在极光瓶旁记录此刻的情绪，与 Aurora 对话。
- 用日记和情绪日历回看自己的记录。
- 把想留下的小事写成便签，贴在身后的墙上。

## 本地运行

```sh
npm ci
npm run dev
```

打开 Vite 输出的地址。AI 对话使用 Vercel 服务端的 `OPENAI_API_KEY`（本地开发时在 `.env.local` 中设置），无需账号或 Firebase 配置。

## 开始之前

无需登录。对话、日记、便签和情绪记录保存在当前浏览器；已有浏览器记录会保留，旧 Firebase 云端独有记录不会自动导入。清理浏览器或更换设备前，可从本地记录菜单导出数据。AI 对话通过同源 `/api/chat` 接口调用 OpenAI，key 仅保存在服务端，不进入浏览器构建产物。

## 开发说明

```sh
npm run build
```

[本地记录](docs/local-storage.md) · [AI 配置](docs/ai-service.md) · [项目指南](docs/guide.md) · [Banner 维护](docs/readme/README.md)

---

由 [Songhai Fan](https://github.com/SonghaiFan) 制作 · Frankie 系列项目
