# AIBernard Blog 前端自定义开发指南

本文对应本仓库当前的 Hexo 7.3.0 + Butterfly 5.6.0 配置。目标不是让你修改 `node_modules`，而是通过站点配置、覆盖配置、静态资源、CSS 和少量 JavaScript，稳定地控制博客的布局、视觉和交互。

## 1. 先理解四个层次

| 层次 | 位置 | 作用 | 是否直接编辑 |
| --- | --- | --- | --- |
| Hexo 站点层 | `_config.yml` | 站点标题、URL、文章路径、搜索索引、渲染器、部署方式 | 是 |
| Butterfly 层 | `_config.butterfly.yml` | 导航、侧栏、卡片、文章目录、搜索、主题色、动效 | 是 |
| 项目视觉层 | `source/css/custom.css` | 对主题进行项目级视觉覆盖 | 是 |
| 项目交互层 | `source/js/custom.js` | 搜索快捷键、卡片入场等主题之外的增强 | 是 |

上游主题源码位于：

```text
node_modules/hexo-theme-butterfly/
```

它由 `package.json` 和 `package-lock.json` 管理。不要直接修改这里，因为重新安装依赖或升级主题时会被覆盖。自定义应优先写入：

```text
_config.butterfly.yml
source/css/custom.css
source/js/custom.js
```

Hexo 生成：

```text
public/
```

`public/` 是构建产物，不是源码。它不会提交到 `master`，发布时会由 Hexo Deployer 推送到 `gh-pages`。

## 2. 当前仓库结构

```text
myblog/
├─ _config.yml                  # Hexo 主配置
├─ _config.butterfly.yml       # Butterfly 项目配置
├─ package.json                # 构建、发布依赖和 npm 脚本
├─ package-lock.json           # 精确依赖版本
├─ source/
│  ├─ _posts/                  # 博客文章
│  ├─ about/                   # 关于页
│  ├─ archives/                # 若手动创建，可覆盖默认归档页
│  ├─ categories/              # 分类总览页
│  ├─ tags/                    # 标签总览页
│  ├─ css/custom.css           # 项目视觉覆盖
│  ├─ js/custom.js             # 项目交互增强
│  └─ img/                     # 头像、封面、404、favicon
├─ docs/                       # 开发文档，不进入静态站点
├─ public/                     # hexo generate 输出，被 Git 忽略
└─ .deploy_git/                # hexo deploy 临时仓库，被 Git 忽略
```

## 3. 环境与常用命令

### 3.1 安装依赖

```powershell
npm install
```

需要完整复现依赖环境时使用：

```powershell
npm ci
```

`npm ci` 会严格按照 `package-lock.json` 安装，适合新机器和部署环境；`npm install` 适合主动添加或升级依赖。

### 3.2 本地开发

```powershell
hexo clean
hexo g
hexo s
```

含义：

- `hexo clean`：删除缓存和旧的 `public/` 输出。
- `hexo g`：生成静态网站。
- `hexo s`：在 `http://localhost:4000/` 启动开发服务器。

`hexo generate` 可简写为 `hexo g`，`hexo server` 可简写为 `hexo s`。

如果当前终端找不到 `hexo`，可以先进入项目根目录执行：

```powershell
npx hexo clean
npx hexo generate
npx hexo server
```

修改 Markdown 或 CSS 后，Hexo Server 通常会自动重建；修改 `_config.yml`、`_config.butterfly.yml`、主题依赖或搜索配置后，建议关闭服务并重新执行完整三步。

### 3.3 预览检查顺序

每次提交和发布前至少检查：

1. 首页浅色与深色模式。
2. 文章页目录、代码复制和上一篇/下一篇。
3. 搜索弹窗能显示结果。
4. 关于、归档、标签、分类和 404 页面。
5. 约 375px、768px、1280px 三种宽度。
6. 浏览器控制台没有红色错误。
7. `public/search.json`、`public/404.html` 和自定义 CSS/JS 均已生成。

## 4. Hexo 主配置 `_config.yml`

### 4.1 站点身份

```yaml
title: AIBernard
subtitle: '记录技术、思考与生活'
description: 'AIBernard 的个人博客，记录技术实践、学习笔记与生活思考。'
keywords: [AIBernard, Hexo, Butterfly, 前端, 技术博客]
author: AIBernard
language: zh-CN
timezone: 'Asia/Shanghai'
```

| 键 | 当前作用 | 修改影响 |
| --- | --- | --- |
| `title` | 浏览器标题、页脚和主题品牌 | 全站标题 |
| `subtitle` | 副标题 | SEO 与部分主题区域 |
| `description` | 全站摘要 | 搜索与社交分享 |
| `keywords` | 站点关键词 | 页面元数据 |
| `author` | 作者名 | 页脚、版权与文章元数据 |
| `language` | 界面语言 | Butterfly 语言包 |
| `timezone` | 构建时间时区 | 文章日期和“更新时间” |

`language` 改变后，Butterfly 会切换到对应语言包。中文界面当前使用 `zh-CN.yml`。

### 4.2 URL 与永久链接

```yaml
url: https://aibernard.github.io
permalink: posts/:title/
```

当前文章 URL 形如：

```text
https://aibernard.github.io/posts/Hexo-Blog/
```

如果博客部署在 `username.github.io/project` 子路径下，`url` 必须包含子路径，例如：

```yaml
url: https://username.github.io/project
```

否则 CSS、搜索索引和内部链接可能指向错误根路径。

永久链接一旦被搜索引擎收录或分享，不建议频繁修改。可用变量包括：

```yaml
permalink: :year/:month/:day/:title/
```

或：

```yaml
permalink: posts/:title/
```

### 4.3 文章与渲染

```yaml
render_drafts: false
post_asset_folder: true
future: true
syntax_highlighter: highlight.js
```

- `render_drafts: false`：未发布草稿不进入正式站点。
- `post_asset_folder: true`：新建文章时创建同名资源目录。
- `future: true`：允许日期在未来的文章出现。
- `syntax_highlighter`：决定代码块处理方式；当前使用 Highlight.js。

```yaml
highlight:
  line_number: true
  auto_detect: false
  tab_replace: '  '
  wrap: true
  hljs: true
```

| 键 | 作用 |
| --- | --- |
| `line_number` | 显示代码行号 |
| `auto_detect` | 无语言标记时自动猜测语言 |
| `tab_replace` | 将 Tab 替换为两个空格 |
| `wrap` | 生成带工具栏的代码块包装 |
| `hljs` | 使用 `hljs-*` 类名配色 |

Butterfly 的代码复制按钮、折叠和语言标签主要由 `_config.butterfly.yml` 的 `code_blocks` 控制。

### 4.4 首页分页

```yaml
index_generator:
  path: ''
  per_page: 10
  order_by: -date
```

- `path: ''`：首页根路径。
- `per_page`：每页文章数；设为 `0` 可禁用分页。
- `order_by: -date`：按日期降序。

### 4.5 搜索与字数

```yaml
search:
  path: search.json
  field: post
  content: true
  format: striptags
```

`hexo-generator-searchdb` 会生成 `public/search.json`。Butterfly 的本地搜索读取这个文件，在浏览器内完成匹配，不需要 Algolia 等外部服务。

| 键 | 建议 |
| --- | --- |
| `path` | 与 Butterfly `search.local_search.CDN` 关联；留空时使用该路径 |
| `field` | `post` 仅文章，`page` 仅页面，`all` 全部 |
| `content` | `true` 才能搜索正文 |
| `format` | `striptags` 体积较小；`html` 保留标签；`raw` 保留 Markdown |

```yaml
symbols_count_time:
  symbols: true
  time: true
  total_symbols: true
  total_time: true
  exclude_codeblock: false
  wpm: 300
  suffix: ''
```

- `symbols`：文章总字数。
- `time`：单篇阅读时长。
- `total_symbols`、`total_time`：站点累计统计。
- `exclude_codeblock`：是否排除代码块。
- `wpm`：中文为主时可用 300，混合英文可使用 275。
- `suffix: ''`：单位由 Butterfly 语言包提供，避免显示“分钟分钟”。

### 4.6 部署

```yaml
deploy:
  type: git
  repo: https://github.com/aibernard/aibernard.github.io.git
  branch: gh-pages
```

执行 `hexo deploy` 时，插件把 `public/` 的内容作为一次静态站点提交推送到远端 `gh-pages`。`master` 与 `gh-pages` 因此存放完全不同的内容。

## 5. Butterfly 配置 `_config.butterfly.yml`

该文件是项目覆盖配置。未写的键会继承主题自己的默认配置，因此不必复制整份上千行默认文件。

### 5.1 导航 `nav`

```yaml
nav:
  logo:
  display_title: true
  display_post_title: true
  fixed: true
```

| 键 | 当前行为 |
| --- | --- |
| `logo` | 导航左侧图片；为空时只显示文字 |
| `display_title` | 显示博客标题 |
| `display_post_title` | 文章页显示文章标题 |
| `fixed` | 导航固定在顶部 |

导航玻璃质感不在这里设置，而由 `#nav` CSS 控制。

### 5.2 菜单 `menu`

```yaml
menu:
  首页: / || fas fa-home
  归档: /archives/ || fas fa-archive
  标签: /tags/ || fas fa-tags
  分类: /categories/ || fas fa-folder-open
  关于: /about/ || fas fa-user
```

格式为：

```text
显示名称: 目标地址 || Font Awesome 图标
```

下拉菜单示例：

```yaml
menu:
  资源: / || fas fa-box
    工具: /tools/ || fas fa-toolbox
    友链: /links/ || fas fa-link
```

修改后必须重新生成。目标页面也必须实际存在，否则菜单会进入 404。

### 5.3 代码块 `code_blocks`

| 键 | 当前值 | 作用 |
| --- | --- | --- |
| `theme` | `light` | 代码高亮主题 |
| `macStyle` | `true` | 显示 macOS 风格圆点 |
| `height_limit` | `500` | 超过高度后折叠 |
| `word_wrap` | `false` | 长代码是否自动换行 |
| `copy` | `true` | 复制按钮 |
| `language` | `true` | 显示语言标签 |
| `shrink` | `false` | 默认展开 |
| `fullpage` | `false` | 全屏代码按钮 |

### 5.4 社交、头像与图片

```yaml
social:
  fab fa-github: https://github.com/aibernard || GitHub || '#24292f'
```

格式：

```text
图标类: 地址 || 提示文字 || 品牌色
```

```yaml
favicon: /img/favicon.svg
avatar:
  img: /img/avatar.svg
  effect: true
```

- `favicon` 是浏览器标签图标。
- `avatar.img` 同时用于侧栏作者卡和移动抽屉。
- `effect: true` 启用主题自带的头像动效。

前三张本地封面由以下配置轮换：

```yaml
cover:
  index_enable: true
  aside_enable: true
  archives_enable: true
  default_cover:
    - /img/covers/aurora.svg
    - /img/covers/lagoon.svg
    - /img/covers/sunrise.svg
```

文章自身的 `cover` 优先于 `default_cover`。

### 5.5 顶部大图

```yaml
disable_top_img: true
index_img: false
archive_img: false
tag_img: false
category_img: false
default_top_img: false
footer_img: false
```

当前采用内容优先的卡片布局，不显示大横幅。如果要恢复文章头图：

- 将 `disable_top_img` 改为 `false`。
- 为文章 front-matter 添加 `cover: /img/xxx.jpg`。
- 或配置 `default_top_img`。

`top_img: false` 可对单篇文章继续禁用头图。

### 5.6 错误图片和 404

```yaml
error_img:
  flink: /img/cover-fallback.svg
  post_page: /img/cover-fallback.svg

error_404:
  enable: true
  subtitle: '这里没有你要找的页面'
  background: /img/404.svg
```

`error_img` 是图片加载失败时的兜底图。`error_404` 会由 Butterfly 生成 `public/404.html`。

GitHub Pages 可直接识别根目录 `404.html`，但用户站点使用自定义域名时应继续保持根路径。

### 5.7 文章元信息 `post_meta`

首页：

```yaml
post_meta:
  page:
    date_type: created
    date_format: date
    categories: true
    tags: false
    label: true
```

文章页：

```yaml
  post:
    position: left
    date_type: created
    date_format: date
    categories: true
    tags: true
    label: true
```

`date_type` 可取 `created`、`updated`、`both`；`date_format` 可取绝对日期或相对日期。

### 5.8 首页文章卡

```yaml
index_layout: 3
index_post_content:
  method: 3
  length: 260
```

`index_layout`：

| 值 | 布局 |
| --- | --- |
| 1 | 封面在左 |
| 2 | 封面在右 |
| 3 | 左右交替，当前使用 |
| 4 | 封面上、文字下 |
| 5 | 文字叠加在封面 |
| 6 | Masonry 封面卡片 |
| 7 | Masonry 封面叠加文字 |

`index_post_content.method`：

- `1`：只使用 front-matter 的 `description`。
- `2`：优先 `description`，否则自动截取。
- `3`：自动截取。
- `false`：不显示摘要。

### 5.9 目录、版权和文章操作

```yaml
toc:
  post: true
  page: false
  number: true
  expand: false
  style_simple: false
  scroll_percent: true
```

- `post/page`：文章或独立页面是否显示目录。
- `number`：标题是否编号。
- `expand`：目录默认展开。
- `scroll_percent`：显示阅读位置。

`post_copyright` 当前关闭；`post_edit` 当前关闭；`reward` 当前关闭。开启时分别会影响文章底部版权块、编辑链接和赞赏面板。

### 5.10 相关文章与翻页

```yaml
related_post:
  enable: true
  limit: 3
  date_type: created

post_pagination: 2
```

`post_pagination: 2` 表示“下一篇”指向更新的文章；`1` 指向更旧文章；`false` 关闭。

### 5.11 文章过期提示

```yaml
noticeOutdate:
  enable: true
  style: flat
  limit_day: 365
  position: top
```

超过 `limit_day` 天没有更新的文章会显示提示。它依赖 Hexo 的 `updated` 时间；当前 `updated_option: mtime`，因此文件修改时间可能影响提示。

### 5.12 页脚 `footer`

```yaml
footer:
  owner:
    enable: true
    since: 2026
  copyright:
    enable: true
    version: true
  custom_text: '保持好奇，持续记录。'
```

`since` 控制年份起点，`version` 显示 Hexo 和 Butterfly 版本，`custom_text` 显示附加文字。

### 5.13 侧栏 `aside`

```yaml
aside:
  enable: true
  hide: false
  button: true
  mobile: true
  position: right
```

当前启用：

- 作者卡 `card_author`
- 公告卡 `card_announcement`
- 最新文章 `card_recent_post`
- 分类 `card_categories`
- 标签 `card_tags`
- 网站信息 `card_webinfo`

当前关闭：

- 最新评论 `card_newest_comments`
- 归档卡 `card_archives`
- 文章系列 `card_post_series`

作者卡按钮：

```yaml
button:
  enable: true
  icon: fab fa-github
  text: 访问 GitHub
  link: https://github.com/aibernard
```

修改 `description`、`content`、链接和卡片的 `limit` 即可控制内容。`aside.position` 可改为 `left`。

`card_webinfo.runtime_date` 是网站运行时间起点，格式为 `MM/DD/YYYY HH:mm`。它只影响统计显示，不控制发布日期。

### 5.14 右下角控件与模式

```yaml
readmode: true

darkmode:
  enable: true
  button: true
  autoChangeMode: 1
  start: 18
  end: 6

rightside_scroll_percent: true
rightside_config_animation: true
```

- `readmode`：阅读模式。
- `darkmode.autoChangeMode: 1`：跟随系统主题；系统不支持时按时间切换。
- `start/end`：时间模式的日夜边界。
- 显示模式按钮受 `display_mode: light` 影响，作为首次访问的默认值。
- `rightside_scroll_percent`：在回到顶部按钮中绘制阅读进度。
- `rightside_config_animation`：设置按钮的展开动画。

### 5.15 标题锚点与复制

```yaml
anchor:
  auto_update: true
  click_to_scroll: true

copy:
  enable: true
  copyright:
    enable: false
```

`auto_update` 让滚动时 URL 的 `#标题` 同步更新；`click_to_scroll` 允许点击标题跳到锚点。`copy.copyright` 可为大段复制追加来源信息。

### 5.16 字数、站点统计

```yaml
wordcount:
  enable: true
  post_wordcount: true
  min2read: true
  total_wordcount: true

busuanzi:
  site_uv: false
  site_pv: false
  page_pv: false
```

字数和阅读时长来自 `hexo-word-counter`。Busuanzi 默认关闭，因为它是第三方计数服务，不是静态构建的一部分。启用前应确认网络可达与隐私要求。

### 5.17 本地搜索

```yaml
search:
  use: local_search
  placeholder: 搜索文章...
  local_search:
    preload: true
    top_n_per_article: 2
    unescape: false
    pagination:
      enable: true
      hitsPerPage: 6
    CDN:
```

- `preload: true`：页面打开时预加载搜索数据。
- `top_n_per_article`：每篇文章最多显示几个命中片段。
- `pagination`：搜索结果分页。
- `CDN` 留空时使用 `_config.yml` 中 `search.path`。

搜索流程：

1. 点击导航搜索，或按 `Ctrl+K`、`Cmd+K`、`/`。
2. 主题打开 `#local-search` 弹窗。
3. `source/js/custom.js` 自动将焦点放入输入框。
4. 首次输入时拉取 `search.json`。
5. `local-search.js` 在浏览器内匹配标题和正文并标记关键词。

全文搜索没有数据库和外部 API，因此文章很多时可考虑关闭 `preload`，避免每次访问都提前下载索引。

### 5.18 分享与评论

`share.use` 和 `comments.use` 当前为空，即关闭。这样构建和后端依赖最少。

若以后使用 Waline，可在 `comments.use: Waline` 后按主题文档填写 `waline` 配置。Giscus 需要 GitHub Discussions、公开仓库名和分类 ID。没有完成服务端与权限配置前，不应只打开评论开关。

### 5.19 主题色

```yaml
theme_color:
  enable: true
  main: '#49b1f5'
  paginator: '#00c4b6'
  button_hover: '#ff7242'
  text_selection: '#00c4b6'
```

主色 `#49b1f5` 与辅助色 `#00c4b6` 决定 Butterfly 的按钮、高亮、代码、分页和链接基准色。`source/css/custom.css` 的 `--blog-accent`、`--blog-secondary` 要同步修改，才能让导航渐变、卡片悬停和自定义元素保持一致。

### 5.20 UI、动效与字体

| 配置 | 当前值 | 用途 |
| --- | --- | --- |
| `category_ui` | `index` | 分类页沿用首页卡片 UI |
| `tag_ui` | `index` | 标签页沿用首页卡片 UI |
| `rounded_corners_ui` | `true` | 主题默认圆角 |
| `text_align_justify` | `false` | 正文左对齐 |
| `mask.header/footer` | `true` | 头图遮罩 |
| `preloader.enable` | `false` | 不显示全屏加载层 |
| `enter_transitions` | `true` | 页面入场过渡 |
| `display_mode` | `light` | 首次访问默认浅色 |

正文标题美化：

```yaml
beautify:
  enable: true
  field: post
  title_prefix_icon: '\f0da'
  title_prefix_icon_color: '#49b1f5'
```

图标值是 Font Awesome 的 Unicode；修改前应确认目标图标已加载。

`font.global_font_size`、`font.code_font_size`、`font.font_family` 和 `font.code_font_family` 控制全局字体。外部字体可通过 `blog_title_font.font_link` 加载。

### 5.21 图片预览、页面增强和 CDN

```yaml
lightbox: fancybox
instantpage: true
lazyload:
  enable: true
  native: true
  field: site
```

- `lightbox: fancybox`：点击文章图片放大预览。
- `instantpage: true`：鼠标悬停内部链接时预取页面。
- `native: true`：使用浏览器原生懒加载。
- `placeholder`：懒加载占位图。

```yaml
pjax:
  enable: false
```

PJAX 能在站内切换时避免整页刷新，但会让第三方脚本和事件绑定变复杂。当前主题的普通跳转稳定且足够快，因此保持关闭。

```yaml
CDN:
  internal_provider: local
  third_party_provider: jsdelivr
  version: true
```

主题自身的脚本和样式从本地 `public/` 加载；Fancybox 等第三方资源使用 jsDelivr。若部署地区无法访问 jsDelivr，可把第三方资源切换到其他 CDN，或安装 `hexo-butterfly-extjs` 后设为 `local`。

### 5.22 自定义文件注入

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/custom.css">
  bottom:
    - <script src="/js/custom.js" defer></script>
```

这是项目视觉和交互增强进入页面的入口。

- `head` 在页面样式确定前加载 CSS。
- `bottom` 在主体 HTML 后加载 JS。
- `defer` 保证脚本在 DOM 解析后执行。

如果站点部署在子路径，优先使用 Hexo 的 `url_for` 能力或相应绝对路径，避免资源 404。

## 6. CSS 自定义地图

`source/css/custom.css` 在主题 CSS 后注入，因此使用同一优先级时通常能覆盖主题。调整时优先从前面的 CSS 变量和类选择器入手，少用 `!important`。

### 6.1 颜色与尺寸变量

```css
:root {
  --blog-accent: #49b1f5;
  --blog-accent-strong: #2580b8;
  --blog-secondary: #00c4b6;
  --blog-warm: #ff7242;
  --blog-surface: rgba(255, 255, 255, 0.92);
  --blog-border: rgba(77, 122, 155, 0.12);
  --blog-shadow: 0 10px 36px rgba(42, 87, 118, 0.09);
  --blog-radius: 14px;
  --blog-content-width: 1320px;
}
```

| 变量 | 用途 |
| --- | --- |
| `--blog-accent` | 主蓝色 |
| `--blog-accent-strong` | 链接和悬停深蓝 |
| `--blog-secondary` | 青绿色 |
| `--blog-warm` | 强调橙色 |
| `--blog-surface` | 卡片半透明背景 |
| `--blog-border` | 卡片边框 |
| `--blog-shadow` | 默认阴影 |
| `--blog-shadow-hover` | 悬停阴影 |
| `--blog-radius` | 卡片圆角 |
| `--blog-content-width` | 主内容最大宽度 |

深色模式通过覆盖同名变量实现：

```css
[data-theme='dark'] {
  --blog-surface: rgba(18, 18, 18, 0.94);
  --blog-shadow: 0 10px 36px rgba(0, 0, 0, 0.24);
}
```

### 6.2 全局背景和导航

| 选择器 | 作用 |
| --- | --- |
| `body` | 浅色径向渐变背景 |
| `[data-theme='dark'] body` | 深色背景 |
| `::selection` | 文本选中颜色 |
| `#page-header` | 移除大横幅背景 |
| `#nav` | 吸顶玻璃导航 |
| `#nav .site-name` | 博客标题字重 |
| `#nav .site-name::after` | 标题后的渐变小圆点 |
| `#nav .menus_items .site-page` | 导航菜单项 |
| `#nav .menus_items .site-page::after` | 菜单悬停下划线 |
| `.site-page:hover/.active` | 当前菜单状态 |

导航背景的关键声明是：

```css
backdrop-filter: saturate(145%) blur(16px);
```

不支持 `backdrop-filter` 的浏览器会退回半透明背景，不影响阅读。

### 6.3 页面网格与侧栏

| 选择器 | 作用 |
| --- | --- |
| `#content-inner` | 主内容最大宽度 |
| `#content-inner.layout` | 主栏与侧栏间距 |
| `#recent-posts` | 首页文章流 |
| `#aside-content` | 右侧栏宽度 |
| `.layout > div:first-child:not(.nc)` | 单页卡片 |

Butterfly 本身使用 Flex 布局。CSS 只调整宽度和间距，不应随意将其变成固定定位，否则移动端侧栏容易重叠。

### 6.4 首页文章卡

| 选择器 | 作用 |
| --- | --- |
| `.recent-post-item` | 卡片背景、边框、圆角、阴影、移动 |
| `.recent-post-item:hover` | 上浮与悬停阴影 |
| `.recent-post-info` | 卡片内边距 |
| `.article-title` | 文章标题 |
| `.article-meta-wrap` | 日期、分类等元信息 |
| `.content` | 摘要 |
| `.post_cover` | 封面容器 |
| `.post_cover::after` | 悬停高光 |
| `.post_cover .post-bg` | 封面图片缩放 |

封面悬停依赖两个过渡：

```css
.recent-post-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-bg {
  transition: transform 0.7s cubic-bezier(0.2, 0.65, 0.25, 1);
}
```

### 6.5 分页

| 选择器 | 作用 |
| --- | --- |
| `.layout .pagination > :not(.space)` | 分页按钮外观 |
| `.page-number.current` | 当前页渐变背景 |

### 6.6 侧栏卡片

| 选择器 | 作用 |
| --- | --- |
| `#aside-content .card-widget` | 所有侧栏卡片 |
| `.item-headline` | 卡片标题 |
| `.card-info .avatar-img img` | 头像描边和光晕 |
| `.card-info #card-info-btn` | 作者按钮渐变 |
| `.card-info-social-icons` | 当前隐藏，避免 GitHub 重复 |
| `.card-tag-cloud a` | 标签胶囊 |
| `.aside-list .aside-list-item` | 最新文章行 |

若以后添加多个社交链接，可以删除 CSS 中隐藏 `.card-info-social-icons` 的规则。

### 6.7 文章正文

| 选择器 | 作用 |
| --- | --- |
| `#article-container` | 正文字号、行高、断词 |
| `#article-container h1~h4` | 标题间距和字重 |
| `#article-container h2` | 左侧蓝色强调、渐变背景 |
| `#article-container img` | 图片圆角 |
| `#article-container blockquote` | 引用块 |
| `#article-container table` | 表格宽度 |
| `#article-container pre` | 代码块圆角 |
| `.highlight` | 代码块阴影 |
| `.post-copyright` | 版权块 |

### 6.8 页脚、右侧按钮和搜索

| 选择器 | 作用 |
| --- | --- |
| `#footer` | 透明页脚和文字颜色 |
| `#rightside > div > button` | 右侧控件 |
| `#rightside > div > a` | 右侧链接 |
| `#local-search .search-dialog` | 搜索弹窗 |
| `#local-search .local-search-input input` | 搜索输入框 |
| `#local-search .local-search-hit-item` | 搜索结果行 |

### 6.9 移动端与无障碍

```css
@media screen and (max-width: 1024px) { ... }
@media screen and (max-width: 768px) { ... }
@media (prefers-reduced-motion: reduce) { ... }
```

1024px 以下取消侧栏固定宽度，文章卡缩小内边距。768px 以下进一步减小圆角、卡片间距和标题尺寸。

`prefers-reduced-motion` 会关闭大部分动画，这是对晕动症用户和低性能设备的兼容。

### 6.10 入场动画

```css
.page-ready #recent-posts .recent-post-item {
  animation: card-in 0.55s both;
  animation-delay: calc(var(--card-index, 0) * 55ms);
}
```

`custom.js` 为每张卡片设置 `--card-index`，再用 `page-ready` 触发错峰入场。

## 7. JavaScript 交互逻辑

`source/js/custom.js` 是一个立即执行函数，避免污染全局命名空间。

### 7.1 `ready`

兼容两种加载时机：

- DOM 尚未加载：监听 `DOMContentLoaded`。
- 脚本延迟执行时 DOM 已加载：立即运行。

### 7.2 `markCards`

执行顺序：

1. 找到首页 `.recent-post-item`。
2. 写入每张卡的索引。
3. 下一帧在 `<html>` 添加 `page-ready`。
4. CSS 根据索引触发错峰动画。

### 7.3 `openSearch` 与 `focusSearch`

`openSearch` 模拟点击主题的搜索按钮。搜索弹窗由主题创建，因此 `focusSearch` 会最多等待约 960ms，找到 `.local-search-input input` 后设置焦点。

### 7.4 搜索快捷键

```js
const isCommandK =
  (event.ctrlKey || event.metaKey) &&
  event.key.toLowerCase() === 'k';
```

支持：

- Windows/Linux：`Ctrl+K`
- macOS：`Cmd+K`
- `/`

输入框、文本域和 `contenteditable` 内不会拦截按键，避免用户输入斜杠时误开搜索。

### 7.5 `improveSearchA11y`

为输入框添加 `aria-label`，为弹窗添加 `role="dialog"` 和 `aria-modal="true"`。`MutationObserver` 监听动态插入的搜索 DOM。

### 7.6 Butterfly 已负责的交互

| 交互 | 负责模块 |
| --- | --- |
| 日夜模式 | `main.js` |
| 设置按钮展开 | `main.js` |
| 阅读模式 | `main.js` |
| 单双栏切换 | `main.js` |
| 移动抽屉 | `main.js` |
| 回到顶部与进度 | `main.js` |
| 文章目录高亮 | `main.js` |
| 搜索匹配 | `local-search.js` |
| 代码复制 | `main.js` |
| 图片灯箱 | Fancybox |
| 页面入场 | Butterfly transitions |

只有主题没有提供或需要项目化调整的行为才放入 `custom.js`。

## 8. 内容与 front-matter

### 创建文章：

仅创建草稿：
```powershell
hexo new draft "Rust Clap学习"
```

默认情况下，草稿不会像正式文章一样直接进入网站。

你可以运行：

```powershell
hexo --draft server
```

如果想将草稿转为正式文章，可以执行：

```powershell
hexo publish "Rust Clap学习"
```



文章示例：

```yaml
---
title: 文章标题
date: 2026-10-25 15:03:59
updated: 2026-10-26 09:00:00
tags: [Hexo, Frontend]
categories: [技术, 前端]
description: 首页卡片和分享摘要。
cover: /img/covers/aurora.svg
top_img: false
comments: false
---
```

常见字段：

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `date` | 创建时间 |
| `updated` | 更新时间 |
| `tags` | 标签，多个可并列 |
| `categories` | 分类层级 |
| `description` | 摘要 |
| `cover` | 首页封面 |
| `top_img` | 文章头图；`false` 禁用 |
| `comments` | 单篇评论开关 |
| `sticky` | 置顶权重 |

新建文章：

```powershell
hexo new "文章标题"
```

新建独立页面：

```powershell
hexo new page "独立页面"
```

标签总览页必须包含：

```yaml
type: tags
```

分类总览页必须包含：

```yaml
type: categories
```

## 9. 常见定制配方

### 9.1 更换主色

同时修改：

1. `_config.butterfly.yml` 的 `theme_color.main`。
2. `source/css/custom.css` 的 `--blog-accent`。
3. 如有深色强调，再修改 `--blog-accent-strong`。

### 9.2 更换头像

把图片放到 `source/img/`，然后修改：

```yaml
avatar:
  img: /img/your-avatar.webp
  effect: true
```

建议方形、至少 512×512。

### 9.3 更换首页封面

文章 front-matter：

```yaml
cover: /img/your-cover.webp
```

或修改 `cover.default_cover` 数组。推荐宽高比约 3:2，文件控制在 200–400KB。

### 9.4 关闭侧栏

```yaml
aside:
  enable: false
```

若只想默认单栏，保留侧栏开关，让用户通过设置按钮切换。

### 9.5 增加菜单页面

1. 创建页面，例如 `source/links/index.md`。
2. 填写 front-matter。
3. 在 `menu` 中加入 `/links/`。
4. `hexo clean; hexo g; hexo s`。

### 9.6 添加第二篇社媒链接

在 `social` 中加入键值，然后根据是否需要显示、是否已有按钮，调整 `.card-info-social-icons` 的 CSS。

### 9.7 调整内容宽度

```css
:root {
  --blog-content-width: 1440px;
}
```

图片过多时不要让卡片过宽；阅读正文也需要合适的行长。

## 10. 主题更新与依赖

主题当前精确锁定：

```json
"hexo-theme-butterfly": "5.6.0"
```

主动升级前先备份并阅读 Butterfly 更新日志：

```powershell
npm install hexo-theme-butterfly@latest --save-exact
hexo clean
hexo g
hexo s
```

升级后重点检查配置键是否改名、Pug 模板是否要求新的插件、第三方 CDN 版本是否变化。

不要直接修改 `node_modules`。如果确实需要覆盖主题模板，可参考 Butterfly 官方文档，把必要的模板文件复制到 `layout/`，但应记录来源与版本，避免升级后难以维护。

## 11. `master` 与 `gh-pages` 的职责

| 分支 | 内容 | 何时更新 | 是否手写 |
| --- | --- | --- | --- |
| `master` | Hexo 源码、文章、配置、CSS、JS、图片、依赖锁文件 | 改代码、配置、样式、文章或教程后 | 是 |
| `gh-pages` | `public/` 生成的 HTML/CSS/JS/搜索索引 | 希望线上网站更新时 | 否，由 Hexo Deployer 生成 |

最重要的原则：

- `master` 是唯一源码真相。
- `gh-pages` 是构建产物，不应作为日常编辑入口。
- 先提交并推送 `master`，再从同一份源码构建并部署 `gh-pages`。

### 11.1 什么时候只更新 `master`

以下情况可以先不发布：

- 正在重构 CSS 或 JavaScript。
- 修改开发文档、脚本、依赖说明。
- 文章仍是草稿。
- 本地尚未验收。
- 只想保存源码备份。

### 11.2 什么时候需要更新 `gh-pages`

以下情况需要重新部署：

- 修改了 `_config.yml` 或 `_config.butterfly.yml`。
- 修改了 `custom.css`、`custom.js`。
- 新增或修改文章、页面、标签、分类。
- 更换头像、封面、favicon。
- 新增依赖或搜索配置。
- 修改 front-matter 的标题、日期、封面。

如果只改了 `master`，`aibernard.github.io` 不会自动发生变化，因为 GitHub Pages 当前使用 `gh-pages` 分支。

## 12. Git 提交流程

### 12.1 检查现状

```powershell
git status
git branch --show-current
git remote -v
```

确认当前在 `master`，远程是：

```text
git@github.com:aibernard/aibernard.github.io.git
```

### 12.2 查看改动

```powershell
git diff
git diff --cached
```

- `git diff`：尚未暂存的改动。
- `git diff --cached`：已暂存、下次提交会包含的改动。

### 12.3 暂存

精确暂存：

```powershell
git add _config.yml _config.butterfly.yml package.json package-lock.json
git add source/css source/js source/img
git add source/_posts source/about source/tags source/categories
git add docs
```

暂存所有允许提交的修改：

```powershell
git add -A
```

`node_modules/`、`public/`、`db.json` 和 `.deploy_git/` 已被 `.gitignore` 排除。

### 12.4 提交

```powershell
git commit -m "feat: customize Hexo blog with Butterfly"
```

可读的提交类型：

- `feat:` 新功能或新页面。
- `fix:` 修复。
- `style:` 纯视觉调整。
- `docs:` 文档。
- `chore:` 依赖或工具维护。
- `content:` 适合文章内容更新，是项目自定义约定。

### 12.5 推送 `master`

```powershell
git push origin master
```

首次推送或本地分支没有上游时：

```powershell
git push -u origin master
```

确认提交：

```powershell
git log -1 --oneline
git status
```

`git status` 最后应显示：

```text
Your branch is up to date with 'origin/master'.
nothing to commit, working tree clean
```

## 13. 发布到 `gh-pages`

### 13.1 标准发布流程

确保 `master` 已提交并推送后执行：

```powershell
hexo clean
hexo g
hexo deploy
```

也可简写为：

```powershell
hexo deploy -g
```

`-g` 表示部署前先生成。但它不会替你执行 `hexo clean`，配置或主题大量变化后仍建议完整三步。

### 13.2 部署器实际做了什么

`hexo-deployer-git` 大致会：

1. 读取 `_config.yml` 的 `deploy` 段。
2. 把 `public/` 内容同步到 `.deploy_git/`。
3. 在 `.deploy_git/` 创建静态站点提交。
4. 推送到远端 `gh-pages` 分支。

`.deploy_git/` 是临时发布仓库，被忽略，不应手动编辑。

### 13.3 验证远端分支

```powershell
git ls-remote --heads origin master gh-pages
```

查看本地分支：

```powershell
git branch -a
```

查看提交图：

```powershell
git log --oneline --graph --decorate --all
```

### 13.4 验证线上网站

打开：

```text
https://aibernard.github.io/
```

检查：

- 标题是 AIBernard，而不是初始 Hexo。
- 导航、卡片和头像正常。
- 搜索能返回文章。
- 文章页可访问。
- 404 页可访问。

GitHub Pages 更新可能需要几十秒到几分钟。若 GitHub 已收到新提交但网页仍旧，先使用无痕窗口或强制刷新，排除浏览器缓存。

## 14. 推荐的两级发布策略

### 14.1 只保存源码

```powershell
git add -A
git commit -m "content: save unfinished redesign"
git push origin master
```

不执行 `hexo deploy`，线上保持旧版。

### 14.2 发布完整更新

```powershell
git add -A
git commit -m "content: publish new article"
git push origin master
hexo clean
hexo g
hexo deploy
```

执行顺序建议固定为：

```text
本地预览 → git status → git add → git commit → git push master → hexo clean/generate/deploy → 线上检查
```

## 15. 回滚与错误处理

### 15.1 本地服务端口被占用

```powershell
hexo s -p 4001
```

或找出占用 4000 的本地进程后关闭它。不要终止来源不明的进程。

### 15.2 页面样式没有变化

```powershell
hexo clean
hexo g
hexo s
```

然后强制刷新浏览器。配置变化时仅刷新页面有时不会重建。

### 15.3 搜索无结果

检查：

```powershell
Test-Path public/search.json
Get-Item public/search.json | Select-Object Length
```

确认 `_config.yml` 有 `search.path`，Butterfly 的 `search.use` 是 `local_search`，并检查浏览器网络面板是否成功请求 `/search.json`。

### 15.4 线上 CSS 或图片 404

优先检查：

- `_config.yml` 的 `url`。
- 资源是否真的位于 `source/css`、`source/img`。
- `hexo generate` 后是否出现在 `public/`。
- 部署是否在生成之后执行。
- 是否误把 `public/` 作为源码提交到 `master`。

### 15.5 发布错误后的推荐回滚

不要立即强制改写公共分支。推荐：

```powershell
git revert <问题提交的SHA>
git push origin master
hexo clean
hexo g
hexo deploy
```

`revert` 会创建新的反向提交，保留完整历史，比 `reset --hard` 和强推安全。

## 16. 修改后的验收清单

- [ ] 在 `master` 分支。
- [ ] `git status` 中没有意外文件。
- [ ] `public/`、`node_modules/` 没有被暂存。
- [ ] `hexo clean; hexo g` 无错误。
- [ ] 本地首页、文章、搜索、404 均正常。
- [ ] 浅色和深色模式都正常。
- [ ] 桌面和手机宽度都没有横向滚动。
- [ ] 源码已提交并推送 `master`。
- [ ] 已执行 `hexo deploy`。
- [ ] `gh-pages` 远端已有新提交。
- [ ] 线上 URL 显示新内容。

## 17. 官方资料

- Hexo：https://hexo.io/docs/
- Hexo 部署：https://hexo.io/docs/one-command-deployment
- Butterfly：https://butterfly.js.org/
- Butterfly GitHub：https://github.com/jerryc127/hexo-theme-butterfly
- GitHub Pages：https://docs.github.com/pages

建议把本文件与项目源码一起纳入版本控制。以后每次修改主题，先更新对应配置段，再更新 CSS 选择器地图和验收清单，避免文档与实现逐渐偏离。
