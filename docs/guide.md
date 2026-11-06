# Aurora / Project guide

[← README](../README.md)

Complete setup, behavior and technical notes. Unless stated otherwise, run commands from the repository root.

Aurora（阿朵拉）是一款围绕极光瓶展开的情绪记录应用，提供情绪对话、日记、日历与便签墙。

## Features

- 在极光瓶旁记录当下情绪，与 Aurora 对话。
- 通过日记、情绪日历和便签回看记录。
- 支持访客入口，以及通过 Firebase 提供的 Google 登录与账户数据功能。

## Getting started

```sh
npm ci
npm run dev
```

打开 Vite 输出的本地地址。AI 对话使用 Vercel 服务端的 `OPENAI_API_KEY`（本地开发时在 `.env.local` 中设置）；登录和账户数据功能需要配置 `services/firebase.ts` 对应的 Firebase 项目与授权域名。不要把密钥提交到仓库。

## Project notes

使用 React、TypeScript、Vite、OpenAI 与 Firebase。AI 请求通过同源服务端接口完成，key 不进入浏览器。详见 [AI 服务配置](ai-service.md)。

## Development

```sh
npm run build
```

Banner sources and update instructions: [README artwork](readme/README.md).
