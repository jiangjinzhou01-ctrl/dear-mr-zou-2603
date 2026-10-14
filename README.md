# DEAR MR. ZOU

**An Unexpected Proposal · 2603 Class**

致邹老师：一份意想不到的提案。一部以商业文件为外壳、以认识彼此为转折、以欢迎为结尾的互动短片。

这是一份完全独立的新工程。没有复用任何旧站源码、组件、颜色或动画。

## 开始观看

打开页面后，片头会在约四秒内完成。自然向下滚动，或轻点“打开提案”。

- 开场：保密标题被红线划开，片名与纸质邀请依次进入画面。
- 提案：2603 的印刷数字随滚动归位，文件内容展开，红色修订条穿过版面。
- 转折：向右拖动红色封条。协议与印在其上的文字分成六片，露出真正想说的话。轻点拆开按钮也能完成同一个动作；键盘可用方向键和 End。
- 对话：连续滚动让“我们还不熟悉”缓缓转成“NOT YET.”。
- 欢迎：轻点印章，纸片重新组成 WELCOME，显露欢迎语。“再看一次”会重置整个作品。

右上角可以切换中英文、打开场景目录。在目录里可手动减弱动效。默认尊重设备的 `prefers-reduced-motion`，减弱模式保留完整故事和互动结果。

## 本地运行

需要 Node.js 20 或更新版本。项目没有第三方运行依赖，也无需执行 npm install。

```bash
npm run build
npm run dev
```

浏览器访问 `http://localhost:4173`。不建议直接双击 index.html：浏览器对本地 ES Module 有访问限制。

```bash
npm test
npm run check
```

`check` 需要先构建；它会启动临时本地 HTTP 服务，分别在根路径和 `/dear-mr-zou/` 子路径下检查 HTML、CSS、全部模块、字体与图形资源，再关闭服务。

## GitHub Pages 免费部署

1. 将解压后的项目文件上传到 GitHub 仓库根目录，包含 `.github/workflows/pages.yml`。
2. 仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送 `main` 分支；或在 Actions 中手动运行 **Publish the film to GitHub Pages**。
4. 流水线先测试，再构建与检查子路径资源，最后部署 `dist/`。

所有资源都使用相对路径，不需要修改仓库名或配置绝对 Base URL。不需要服务器、数据库、付费 API 或外部字体 CDN。GitHub Pages 本身的访问情况取决于访问者的网络。

已有静态托管也可以直接上传 `dist/` 的内容。`.nojekyll` 已自动生成。

## 工程目录

```text
index.html                   语义化场景、交互控件、静态故事
src/
  content.js                 中英文正文、控件文案与无障碍标签
  main.js                    导航、语言、观看状态与滚动编排
  style.css                  视觉变量、构图、断点与减弱动效样式
  motion/
    tokens.js                时长、曲线、纸片几何、系统动效偏好
    opening.js               字符级片头、封条与邀请入场
    scroll.js                ViewTimeline / WAAPI 兼容调度
    tear.js                  触屏与键盘封条、协议的连续拆解
    resolution.js            印章、纸片重组、结尾与重置
public/assets/               本地字体、原创图形、字体许可
scripts/                     构建、静态服务器、HTTP 资源验证
tests/                       交互边界、双语完整性与故事结构检查
.github/workflows/pages.yml  GitHub Pages 部署流程
dist/                        已构建的可部署版本
VALIDATION.md                实际检查范围与结果
```

## 艺术与运动系统

以深炭黑、纸白和信号红组织电影的明暗节奏。纸张、封条、印章是贯穿故事的真实交互对象。

字体采用本地 Nimbus Sans Narrow、Nimbus Sans 与 Nimbus Mono 子集。中文使用设备本地中文字体。没有调用远程字体；字体不可用时回退到系统字体。

运动分为四种语言：片头的快速切入、协议拆解的连续运动、对话段的慢节奏聚焦、结尾纸片的交错归位。变量与曲线集中在 `tokens.js` 和 CSS 顶部。滚动保持原生，不拦截 wheel 或 touchmove，也不锁定页面。

支持 `ViewTimeline` 的浏览器使用原生滚动时间轴。其他浏览器使用暂停的 Web Animations 时间轴，只在滚动位置变化时更新。页面不可见时停止兼容调度。没有 WebGL、视频解码、粒子循环或持续音频。

## 内容与隐私

仅使用已知事实：邹老师是2603班的新任班主任，教授商务英语，师生正在相互熟悉。没有虚构人物照片、履历、台词或已经发生的共同回忆。

不收集身份、留言、浏览记录或统计数据。没有 Cookie、埋点、第三方接口或上传功能；语言和交互状态仅存在于当前页面内存。

## 许可

项目源码与原创图形使用 MIT。Nimbus 字体保留原始许可和字体嵌入例外，完整条款位于 `public/assets/FONT-LICENSE.txt`。
