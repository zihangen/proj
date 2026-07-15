# 语音教练

实时语音转文字（中文 / English US）+ AI 表达反馈助手。打开网页即可用，访客不需要安装任何软件。

这是一个开源模板：fork 这个仓库、按下面的步骤配置好你自己的 Vercel 账号和 API Key，几分钟内就能有一个属于你自己的、可以直接分享给别人用的网站。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzihangen%2Fproj&env=OPENROUTER_API_KEY&envDescription=%E9%A9%B1%E5%8A%A8%E4%B8%A4%E4%B8%AA%E5%85%8D%E8%B4%B9%E6%A8%A1%E5%9E%8B%E7%9A%84%20OpenRouter%20Key%EF%BC%8C%E8%AE%BF%E5%AE%A2%E4%B8%8D%E9%9C%80%E8%A6%81%E8%87%AA%E5%B7%B1%E5%A1%AB&envLink=https%3A%2F%2Fgithub.com%2Fzihangen%2Fproj%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F&project-name=speech-coach&repository-name=speech-coach)

## 功能

- 浏览器实时语音识别，大字字幕显示，支持中文和英语（US）切换
- 开讲前可以在右下角"讲话背景"面板打字或语音输入这段要讲什么、想达到什么目标，随时可编辑，AI 会结合背景给建议
- 说话时每句话停顿后都会触发一次 AI 分析（约 0.6 秒），反馈维度基于 MIT 教授 Patrick Winston 经典课程《How to Speak》的方法论（参考开源 Claude skill：[xeichelberger/how-to-speak-](https://github.com/xeichelberger/how-to-speak-)）：先给一句整体点评（讲得好会具体夸，没问题也会给实际反馈），再判断开场承诺、路标语、重复质量、记忆点、收尾交代五个具体技巧
- 点顶部"结束"按钮，AI 会针对整段讲话给一次总体点评：做得好的地方、可以改进的地方、内容总结
- 表达反馈默认开启，主页面顶部有一个打钩框可以随时关闭
- 4 个可选模型：2 个免费（OpenAI gpt-oss-20b、Google Gemma 4），访客不需要任何 API Key；2 个付费（DeepSeek、OpenAI GPT-4.1 mini），需要访客自己在设置里填 OpenRouter Key
- 付费模型的 Key 只保存在访客浏览器本地，直接从浏览器发往 OpenRouter，不经过你的服务器

## 一键部署（推荐）

点上面的 **Deploy with Vercel** 按钮，跟着 Vercel 的引导走：

1. 用你的 GitHub 账号登录 Vercel（没有账号的话现场注册，免费）
2. Vercel 会把这个仓库 fork 一份到你自己的 GitHub 账号下，并新建一个 Vercel 项目
3. 引导流程里会让你填 `OPENROUTER_API_KEY` 这个环境变量——去 [openrouter.ai/keys](https://openrouter.ai/keys) 免费注册并生成一个 Key，粘贴进去（详见下面的[环境变量](#环境变量)说明）
4. 点 Deploy，一两分钟后你会拿到一个 `你的项目名.vercel.app` 的公网网址，打开就能用

部署完成后强烈建议做一件事：回到 OpenRouter 后台，给这个 Key 单独设置一个较低的消费上限，见下文说明。

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | 是 | 驱动两个免费模型（OpenAI gpt-oss-20b、Google Gemma 4）。去 [openrouter.ai/keys](https://openrouter.ai/keys) 免费注册获取，不需要绑卡。**这个 Key 是你网站的"公共账户"**，任何打开你网站的人用免费模型都会消耗它的额度——强烈建议在 OpenRouter 后台给这个 Key 单独设一个较低的消费上限（Key 详情页里的 credit limit），避免被滥用产生意外账单。付费模型（DeepSeek、GPT-4.1 mini）不受影响，访客要用的话得自己在网页的"设置"里填自己的 Key。 |

Vercel 项目里改环境变量后，需要手动 **Redeploy** 一次才会生效（改环境变量本身不会自动触发新部署）。

## 手动部署 / 本地开发

如果不想用一键部署按钮，也可以自己 fork/clone 后手动来：

```bash
git clone <你 fork 出来的仓库地址>
cd proj
npm install
npm run dev
```

用 Chrome、Edge 或 Safari 打开 http://localhost:3000 。语音识别依赖浏览器的 `SpeechRecognition` API，Firefox 暂不支持。

本地运行免费模型需要在项目根目录新建 `.env.local`（可以从 `.env.example` 复制一份，已在 `.gitignore` 里，不会被提交）：

```
OPENROUTER_API_KEY=sk-or-v1-你自己的key
```

手动部署到 Vercel：[vercel.com/new](https://vercel.com/new) 导入你 fork 的仓库，保持默认设置，按上面的[环境变量](#环境变量)说明配置好 `OPENROUTER_API_KEY` 再部署。

## 使用说明

1. 打开网页，选择识别语言；可以先在右下角"讲话背景"里打字或点"语音输入"说一下这段要讲什么
2. 顶部"表达反馈"打钩框默认是开的；如果想换模型或用付费模型，点"设置"——标 🆓 的免费模型直接能用，标 💳 的付费模型需要先填入你自己的 OpenRouter API Key（[免费注册](https://openrouter.ai/keys)）
3. 点"开始"并允许麦克风权限，字幕会实时显示；每句话说完停顿一下，右侧"表达建议"栏就会给出反馈
4. 讲完点"结束"，会弹出一次总体点评（做得好的地方 / 可以改进 / 内容总结）

## 自定义

- **换模型**：改 `lib/models.ts` 里的 `CURATED_MODELS` 列表。OpenRouter 的免费模型名单会不定期变动（这个项目已经踩过坑），换之前去 [openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0) 确认一下模型还在线
- **换反馈框架**：逐句反馈的 prompt 在 `lib/feedback.ts`，结束后总体点评的 prompt 在 `lib/summary.ts`，都是普通字符串，改起来不需要碰其他代码
- **换语言**：识别语言目前写死中文/英语（US）两个选项，在 `lib/useSpeechRecognition.ts` 的 `SpeechLang` 类型和 `app/page.tsx`/`components/SettingsPanel.tsx` 里的 `<select>` 选项里加

## 技术栈

- Next.js（App Router）+ TypeScript
- 浏览器原生 `SpeechRecognition` Web API 做语音转文字（也用于"讲话背景"的语音输入）
- `/api/analyze`（逐句反馈）与 `/api/summary`（结束后的总体点评）两个服务端路由代理 OpenRouter Chat Completions：免费模型用站点自己的 Key，付费模型透传访客的 Key

## License

[MIT](./LICENSE) —— 随便 fork、改、部署，不需要署名，但也不提供任何担保。
