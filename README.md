# 语音教练

实时语音转文字（中文 / English US）+ AI 表达反馈助手。打开网页即可用，无需安装任何软件。

## 功能

- 浏览器实时语音识别，大字字幕显示，支持中文和英语（US）切换
- 开讲前可以在右下角"讲话背景"面板打字或语音输入这段要讲什么、想达到什么目标，随时可编辑，AI 会结合背景给建议
- 说话时每句话停顿后都会触发一次 AI 分析（约 0.6 秒），反馈维度基于 MIT 教授 Patrick Winston 经典课程《How to Speak》的方法论（参考开源 Claude skill：[xeichelberger/how-to-speak-](https://github.com/xeichelberger/how-to-speak-)）：先给一句整体点评（讲得好会具体夸，没问题也会给实际反馈），再判断开场承诺、路标语、重复质量、记忆点、收尾交代五个具体技巧
- 点顶部"结束"按钮，AI 会针对整段讲话给一次总体点评：做得好的地方、可以改进的地方、内容总结
- 表达反馈默认开启，主页面顶部有一个打钩框可以随时关闭
- 4 个可选模型：2 个免费（OpenAI gpt-oss-20b、Google Gemma 4），访客不需要任何 API Key；2 个付费（DeepSeek、OpenAI GPT-4.1 mini），需要访客自己在设置里填 OpenRouter Key
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

1. 打开网页，选择识别语言；可以先在右下角"讲话背景"里打字或点"语音输入"说一下这段要讲什么
2. 顶部"表达反馈"打钩框默认是开的；如果想换模型或用付费模型，点"设置"——标 🆓 的免费模型直接能用，标 💳 的付费模型需要先填入你自己的 OpenRouter API Key（[免费注册](https://openrouter.ai/keys)）
3. 点"开始"并允许麦克风权限，字幕会实时显示；每句话说完停顿一下，右侧"表达建议"栏就会给出反馈
4. 讲完点"结束"，会弹出一次总体点评（做得好的地方 / 可以改进 / 内容总结）

## 技术栈

- Next.js（App Router）+ TypeScript
- 浏览器原生 `SpeechRecognition` Web API 做语音转文字（也用于"讲话背景"的语音输入）
- `/api/analyze`（逐句反馈）与 `/api/summary`（结束后的总体点评）两个服务端路由代理 OpenRouter Chat Completions：免费模型用站点自己的 Key，付费模型透传访客的 Key
