# 语音教练

实时语音转文字（中文 / English US）+ AI 表达反馈助手。打开网页即可用，无需安装任何软件。

## 功能

- 浏览器实时语音识别，大字字幕显示，支持中文和英语（US）切换
- 停顿时自动触发 AI 分析，对铺垫过长、车轱辘话、缺少结论、逻辑跳跃给出简短建议
- 4 个可选模型：2 个免费（DeepSeek、Llama），访客不需要任何 API Key；2 个付费（DeepSeek、OpenAI GPT-4.1 mini），需要访客自己在设置里填 OpenRouter Key
- 付费模型的 Key 只保存在访客浏览器本地，直接从浏览器发往 OpenRouter，不经过你的服务器

## 本地运行

```bash
npm install
npm run dev
```

用 Chrome、Edge 或 Safari 打开 http://localhost:3000 。语音识别依赖浏览器的 `SpeechRecognition` API，Firefox 暂不支持。

免费模型走的是服务器端接口 `/api/analyze`，本地运行需要在项目根目录新建 `.env.local`（已在 `.gitignore` 里，不会被提交）：

```
OPENROUTER_API_KEY=sk-or-v1-你自己的key
```

## 部署

部署到 [Vercel](https://vercel.com/)：导入本仓库、保持默认设置即可一键生成公网访问地址。

**必须配置一个环境变量**，否则免费模型会报错：在 Vercel 项目的 **Settings → Environment Variables** 里新增

- Key: `OPENROUTER_API_KEY`
- Value: 你自己在 [openrouter.ai/keys](https://openrouter.ai/keys) 生成的 Key

这个 Key 是网站两个免费模型的"公共账户"，任何打开你网站的人调用免费模型都会花这个 Key 的额度。**强烈建议**在 OpenRouter 后台给这个 Key 单独设置一个较低的消费上限（Key 详情页里的 credit limit），避免被滥用产生意外账单。付费模型不受影响，用的是访客自己的 Key。

配置好环境变量后需要重新部署一次（改环境变量不会自动触发新部署）。

## 使用说明

1. 打开网页，选择识别语言，点击"开始"并允许麦克风权限
2. 点"设置"，选一个模型：标 🆓 的免费模型直接能用；标 💳 的付费模型需要先填入你自己的 OpenRouter API Key（[免费注册](https://openrouter.ai/keys)）
3. 勾选"开启表达反馈"，说话时字幕会实时显示；每次停顿超过约 1.5 秒，右侧"表达建议"栏会给出反馈

## 技术栈

- Next.js（App Router）+ TypeScript
- 浏览器原生 `SpeechRecognition` Web API 做语音转文字
- `/api/analyze` 服务端路由代理 OpenRouter Chat Completions：免费模型用站点自己的 Key，付费模型透传访客的 Key
