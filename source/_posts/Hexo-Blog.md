---
title: Hexo-Blog
date: 2026-10-25 15:03:59
tags: [教程, Hexo]
categories: [技术, 前端]
description: 从本地预览、静态生成到 GitHub Pages 发布，整理 Hexo 博客的核心工作流。
cover: /img/covers/aurora.svg
top_img: false
---

# 必要组件

| 工具      | 职责                         | 日常是否需要直接操作 |
| --------- | ---------------------------- | -------------------- |
| `Node.js` | 提供JavaScript运行环境       | 通常不需要           |
| `npm`     | 安装、管理项目依赖和执行脚本 | 需要                 |
| `Hexo`    | 管理文章并生成静态网站       | 经常需要             |
| `Git`     | 记录版本、提交和同步代码     | 经常需要             |
| `GitHub`  | 托管仓库、协作和保存代码     | 经常需要             |

# 经典Hexo项目结构：

```
my-blog/
├── _config.yml          # Hexo 主配置
├── db.json
├── package.json         # 项目信息、依赖、npm 脚本
├── package-lock.json    # 锁定 npm 依赖版本
├── scaffolds/           # 新文章的模板
├── source/
│   ├── _posts/          # 博客文章
│   ├── about/           # 自定义页面（如果有）
│   └── images/          # 可自建的图片目录
├── themes/              # 主题
├── public/              # Hexo 生成的网站，通常不直接编辑
└── node_modules/        # npm 安装的依赖
```




# 博客日更工作流

## 本地预览文章

启动本地预览服务

```powershell
npx hexo server
```

正常情况下，浏览器打开：

[http://localhost:4000/](http://localhost:4000/?utm_source=chatgpt.com)

即可查看本地博客。

Hexo Server 通常会监视文件变化，因此编辑文章后可以刷新浏览器查看效果；如果涉及配置、主题或插件修改，建议重新生成，必要时重启服务。

退出服务时，在运行 Hexo 的终端中按 `Ctrl+C`。

## 草稿与正式文章

如果你想先写一篇文章，暂时不让它出现在正式网站上，可以使用草稿：

```powershell
npx hexo new draft "还在整理的技术笔记"
```

草稿通常放在 `source/_drafts/`，默认不会作为正式文章发布。需要正式发布时执行：

```powershell
npx hexo publish "还在整理的技术笔记"
```

## 生成网站：理解Hexo的三个核心命令

日常使用时，最重要的是这三个命令：

| 命令                | 作用                     | 是否会直接发布到 GitHub |
| ------------------- | ------------------------ | ----------------------- |
| `npx hexo clean`    | 清理缓存和旧的生成文件   | 否                      |
| `npx hexo generate` | 生成静态网站到 `public/` | 否                      |
| `npx hexo deploy`   | 根据部署配置发布网站     | 是，前提是部署配置正确  |

其中，`npx hexo generate` 也可以简写成：

```powershell
npx hexo g
```

而：

```powershell
npx hexo clean
npx hexo generate
```

适合在主题、插件或配置修改后执行，以避免旧的缓存和生成产物影响检查结果

生成完成后，你可以查看：

```powershell
Get-ChildItem .\public
```

正常情况下，会看到 `index.html`、文章目录、CSS、JavaScript 等生成文件。

## 发布到GitHub

这里必须先明确一点：Hexo 项目源码仓库与 GitHub Pages 网站仓库，不一定是同一个仓库。

### 方式 A：通过 Hexo 自动部署到 `gh-pages` 分支

这种方式通常是：

- `main` 分支：保存 Hexo 源码、文章、主题配置。
- `gh-pages` 分支：保存生成的静态网站。
- Hexo 的 `hexo-deployer-git` 插件负责把 `public/` 发布到网站分支。

如果你当前使用的是这种方式，日常发布可以非常简单。

首先检查根目录的 `_config.yml`，看看是否存在类似配置：

```powershell
deploy:
  type: git
  repo: https://github.com/你的用户名/你的仓库.git
  branch: gh-pages
```

注意，这里只是示例，应该保留你已经配置好的真实仓库地址和分支。

必要组件：
```powershell
npm ls hexo-deployer-git
```

正式发布：
```
npx hexo clean
npx hexo generate
npx hexo deploy
```

`hexo deploy` 负责将网站发布出去；在常见的 Git 部署配置下，配合 `-g` 参数还可以在发布前自动生成网站：

```powershell
npx hexo deploy -g
```

### 方式 B：通过 GitHub Actions 自动构建和发布

另一种方式是把 Hexo 源码推送到 GitHub 的默认分支，由 GitHub Actions 在云端执行构建，再发布到 GitHub Pages。

这种方式下，日常操作通常是：
```
npx hexo clean
npx hexo generate
npx hexo server
```

在本地检查无误后，执行 Git 提交与推送：

```po
git add .
git commit -m "Add a new blog post"
git push origin main
```

随后在 GitHub 仓库的 Actions 页面查看构建状态。如果工作流成功，网站就会自动更新。GitHub 官方文档也说明了 Actions 构建并部署 Pages 的基本流程

# Git 日常工作流

Hexo 负责生成网站，Git 负责记录你对项目做过的修改。这两个职责要分清。

先确认当前 Git 状态：

```powershell
git status
git branch --show-current
git remote -v
```

这三个命令分别用于检查：

- 哪些文件被修改或尚未提交。
- 当前所在分支。
- 本地仓库连接了哪个远程仓库。

如果当前项目尚未初始化 Git，或者你正在另一个目录中执行命令，需要先确认目录与仓库状态，不要直接重新初始化或覆盖已有配置。
