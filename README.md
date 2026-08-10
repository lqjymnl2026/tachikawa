# 東京中神教会 · 网站原型

> 在东京，和一群人一起生活。

一个温暖、现代、开放的华人教会单页网站原型。
不刻意宣传宗派名称，而是通过「信仰告白 · 安静时光 · 联系我们」等内容，自然呈现复临信仰背景。

## 如何打开

- 直接双击 `index.html` 即可离线打开（图标已内联，无需网络）。
- 或本地起服务：
  ```bash
  cd 東京中神教会所在目录
  python3 -m http.server 8000
  # 打开 http://localhost:8000
  ```

## 包含的模块

| 模块 | 位置 | 说明 |
| --- | --- | --- |
| 首页 | `#home` | 「你最近，过得怎么样？」+ 暖色插画与东京楼群 + 聚会邀请 |
| 信仰告白 | `#creeds` | 使徒信经 / 尼西亚信经（可展开） |
| 安静时光 | `#quiet` | 安息理念 + 60 秒安静体验 |
| 联系我们 | `#contact` | 地址 + Google 地图导航 + 微信二维码 + 郑长老 |
| 页脚 | footer | 品牌语言三行诗 + 站点地图 |

## 文件结构

```
tachikawa-church/
├── index.html      # 全部页面结构（图标已内联）
├── assets/
│   ├── style.css   # 设计系统与全部样式
│   ├── main.js     # 全部交互逻辑
│   └── icons.svg   # 线条图标库（源文件，页面已内联）
└── README.md
```

## 自定义

- **文案**：直接在 `index.html` 中修改对应区块；`main.js` 顶部的 `HOURS / QUIZ / RESULT / TOPICS / SIXTY` 是弹窗与测验数据。
- **配色**：`assets/style.css` 顶部 `:root` 变量（主绿 `--green`、暖橙 `--amber`、纸白 `--paper` 等）。
- **祷告种子数据 / 健康挑战进度**：存于浏览器 localStorage，改 `main.js` 中 `seeds` 数组即可换初始祷告。
- **字体**：默认加载 Google Fonts（Noto Sans SC / Noto Serif SC），断网时自动回退到系统中文字体。

## 技术说明

- 纯 HTML + CSS + JS，无框架、无构建步骤。
- 完全响应式（桌面 / 平板 / 手机），适配 `prefers-reduced-motion`。
- 全部插画为手绘 SVG + CSS 渐变，无需图片素材。
