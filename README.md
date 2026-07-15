# 语音教练

实时语音转文字（中文 / English US）+ AI 表达反馈助手。打开网页即可用，无需安装任何软件。

## 功能

- 浏览器实时语音识别，大字字幕显示，支持中文和英语（US）切换
- 停顿时自动触发 AI 分析，对铺垫过长、车轱辘话、缺少结论、逻辑跳跃给出简短建议
- AI 模型通过 [OpenRouter](https://openrouter.ai/) 统一接入：可以使用免费模型，也可以在设置里填入自己的 API Key 使用付费模型
- 所有设置（包括 API Key）只保存在浏览器本地，不经过任何自建后端

## 本地运行

```bash
npm install
npm run dev
```

用 Chrome、Edge 或 Safari 打开 http://localhost:3000 。语音识别依赖浏览器的 `SpeechRecognition` API，Firefox 暂不支持。

## 部署

推荐部署到 [Vercel](https://vercel.com/)：导入本仓库、保持默认设置即可一键生成公网访问地址。整个应用是纯前端静态站点，没有需要额外配置的后端服务。

## 使用说明

1. 打开网页，选择识别语言，点击“开始”并允许麦克风权限
2. 如果想要表达反馈，点击“设置”，填入 OpenRouter API Key（[免费注册](https://openrouter.ai/keys)），选择一个模型（标 🆓 的是免费模型），并勾选“开启表达反馈”
3. 说话时字幕会实时显示；每次停顿超过约 1.5 秒，右侧“表达建议”栏会给出反馈

## 技术栈

- Next.js（App Router）+ TypeScript
- 浏览器原生 `SpeechRecognition` Web API 做语音转文字
- OpenRouter Chat Completions API 做表达反馈
