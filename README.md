# 江西文明答题挑战 H5

面向手机竖屏和线下扫码活动的纯静态 H5 小游戏。玩家在 30 秒内判断江西特色场景中的文明或不文明行为，点亮文明观赛、文明旅游、文明交通、文明餐桌四类成就。

## 项目特点

- 入口文件位于仓库根目录的 `index.html`。
- 仅使用原生 HTML、CSS 和 JavaScript，无后端、无数据库、无第三方接口。
- 图片、音频、样式和脚本全部使用相对路径，可部署在 GitHub Pages 的项目子目录中。
- 适配微信内置浏览器、iOS Safari 和 Android 手机浏览器。
- 进度和历史最佳成绩保存在每位参与者自己的浏览器中，互不影响。
- 题库包含 31 个可进入游戏的场景题目，覆盖江西文旅、赛事、交通和餐桌等内容。

## 目录说明

```text
.
├─ index.html                 # 网页入口
├─ manifest.webmanifest       # Web App 配置
├─ icon.svg                   # 网站图标
├─ src/
│  ├─ styles.css              # 竖屏布局、动效与响应式样式
│  └─ app.js                  # 题库、计时、计分、音频与交互
├─ assets/
│  ├─ audio/                  # 背景音乐和反馈音效
│  ├─ scenes/                 # 每道题的独立场景背景
│  └─ *.webp / *.png          # 封面和官方 IP 网页素材
└─ .github/workflows/pages.yml
```

直接打开根目录的 `index.html` 即可检查静态页面。手机浏览器通常会限制自动播放，第一次点击页面或音乐按钮后即可播放声音。

## 上传到 GitHub

1. 登录 GitHub，点击 **New repository** 创建一个空仓库，例如 `jiangxi-civilized-quiz`。
2. 不勾选自动生成 README、许可证或 `.gitignore`。
3. 在本项目目录中打开终端，依次执行：

```bash
git init
git add .
git commit -m "Deploy Jiangxi civilized quiz H5"
git branch -M main
git remote add origin https://github.com/<你的用户名>/jiangxi-civilized-quiz.git
git push -u origin main
```

## 开启 GitHub Pages

1. 打开 GitHub 仓库的 **Settings**。
2. 左侧进入 **Pages**。
3. 在 **Build and deployment** 中把 **Source** 设为 **GitHub Actions**。
4. 推送到 `main` 后，仓库的 **Actions** 页面会运行 `Deploy static site to Pages`。
5. 部署成功后，Pages 页面会显示访问地址，通常格式为：

```text
https://<你的用户名>.github.io/jiangxi-civilized-quiz/
```

以后修改项目后，只需执行：

```bash
git add .
git commit -m "Update H5"
git push
```

GitHub Actions 会自动重新部署。

## 现场使用

将 Pages 地址生成二维码并放入活动物料即可。每位参与者扫码后使用自己的浏览器存储成绩和四境点亮进度，因此单机进度不会互相覆盖。实时多人排行榜需要额外接入数据库与身份识别，不属于当前纯静态版本。

## 素材说明

官方 IP 原文件不改动，网页使用导出的 `assets/ganxiaowen-front.webp` 和 `assets/poxiaoming-front.webp`。每道题的背景位于 `assets/scenes/`，替换同名文件即可更新场景画面。
