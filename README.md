# OpenClaw 课程智能助手

**天津财经大学统计学院 · 龚凤乾教授**

基于 DeepSeek 大语言模型，部署于 Netlify 的 OpenClaw Agent 框架课程网站，内置支持 TTS 语音朗读的智能 AI 助手。

---

## 项目结构

```
├── index.html                  # 主页面（课程大纲 + AI 助手）
├── netlify.toml                # Netlify 配置
├── package.json
├── netlify/
│   └── functions/
│       └── chat.js             # Serverless 函数，调用 DeepSeek API
└── README.md
```

## 部署步骤

### 1. 克隆并推送到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. 在 Netlify 创建站点

- 登录 [netlify.com](https://netlify.com)
- 选择 **Add new site → Import an existing project**
- 连接 GitHub 仓库

### 3. 设置环境变量

在 Netlify 后台 **Site settings → Environment variables** 中添加：

| Key | Value |
|-----|-------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |

### 4. 部署

推送代码后 Netlify 自动构建部署。

---

## 本地开发

```bash
npm install
# 创建 .env 文件，填入 DEEPSEEK_API_KEY=sk-xxx
netlify dev
```

访问 `http://localhost:8888`

---

## 功能说明

- 📚 完整 8 讲课程大纲展示
- 🤖 AI 助手随时回答课程相关问题
- 🔊 TTS 语音朗读（点击喇叭播放，再次点击停止；仅朗读纯文字，过滤标点与 emoji）
- 💬 多轮对话支持
