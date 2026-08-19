![不知名迪克](https://cdn.jsdelivr.net/gh/moaeiou/Mineradio@main/build/icon.ico)

# Mineradio

Mineradio 是一款以电影镜头、粒子视觉和歌词舞台为核心的沉浸式音乐播放器。

该项目已停止维护，若要接收更新请转到<https://github.com/XxHuberrr/Mineradio>。

## 🚀 特性（相比原版）

这是<https://github.com/XxHuberrr/Mineradio>的修改版

- 增加macOS和Linux支持
- 图形API选项更加智能
- 更新了数个依赖
- 使用速度和易用性都更佳的pnpm
- 大量安全性和跨平台支持优化
- 功能几乎完全一致

### 原版特性

- 首页包含每日推荐、平台推荐、继续听、听歌画像和我的歌单入口
- 完整桌面模式保留播放器、主页、歌单和桌面交互
- 支持本地 MP4 与 Wallpaper Engine 视觉内容
- 播放后切换到 Emily / 默认播放态视觉，歌词舞台与粒子舞台同步工作
- 基于节奏的电影镜头视觉系统
- 面向长播客和 DJ 曲目的专属视觉模式
- 歌词舞台、自定义歌词、歌词位置与视觉控制
- 自定义专辑封面上传与裁剪
- 右键唤起 3D 歌单架，支持歌单队列浏览
- 网易云音乐账号、搜索、歌单、播客等体验接入
- QQ 音乐搜索、登录态与音源补充接入
- GitHub Releases 更新检测与下载入口
- 首次启动内置「默认测试」视觉用户存档，软件内默认视觉参数与该存档一致

## 📦 开箱使用

### 下载

[GitHub Release](https://github.com/moaeiou/mineradio/releases)

## 🛠 开发和自编译

### 版本号声明

为了跟原版区分 此项目以`2026.2.0`开始作为版本号 之后每更改一次加0.0.1

### 运行本地demo

确保你已经有了pnpm nodejs和一个可以轻松连接GitHub的网络

```
git clone https://github.com/moaeiou/mineradio.git
cd mineradio
pnpm install
```

对于运行一个Web测试版，保留了类似Astro的启动方式

```
pnpm dev
```

`pnpm dev` 和所有 `build:*` 命令都会先执行 `pnpm bundle`：把
`public/js/modules/` 下散落的 100+ 个模块按加载顺序合并压缩成
`public/js/index.bundle.js`（单个文件）。打包时散模块不再进安装包，只带
bundle，因此安装包更小；开发时若 bundle 缺失，`index-loader.js` 会自动回退到
逐模块加载，不会阻塞调试。

### 编译 对于Windows和macOS

这里Windows只有`amd64` `macOS只有arm64` 以保证主流平台兼容

如果你是小众平台可以自行修改package.json加入你的平台

```bash
pnpm build:windows
pnpm build:macos
```

编译 对于Linux

```bash
pnpm build:linux:AppImage # 还支持pacman,rpm,deb 只需要把AppImage替换即可
```

如果你使用archlinux或其他Arch发行版 你可能会遇到fpm不存在 请安装下列软件包指向依赖到一个更新的文件名

```bash
sudo pacman -Syyuu --needed libxcrypt-compat
```

对于打包维护者 可能需要输出纯文件而不是已经封装好的安装包 可以使用下列命令

```bash
pnpm build:原系统:原包格式:dir
```

### 👂 监听地址

Mineradio 的本地服务默认只监听 `127.0.0.1`，仅允许本机访问。如果需要让局域网中的其他设备访问，可以在启动时指定监听地址：

```bash
./Mineradio -l 0.0.0.0
./Mineradio --listen 0.0.0.0
```

开发环境可以通过环境变量指定：

直接运行服务端时也使用同一个环境变量。

```bash
MINERADIO_LISTEN_HOST=0.0.0.0 pnpm dev
```

为了兼容旧配置，原有的 `HOST` 环境变量仍然有效，`命令行参数的优先级高于环境变量`。

监听 `0.0.0.0` 会将本地服务暴露给同一网络中的其他设备，请只在可信网络中使用。

### ⬇️ 缓存

节奏分析缓存默认保存在系统缓存目录中，例如 Linux 下为 `~/.cache/Mineradio/beatmaps`。

如需使用其他目录，可以设置：

```bash
MINERADIO_BEAT_CACHE_DIR=/path/to/beatmaps pnpm dev
```

## 🙏 致谢

由`MoAEIOU`二次开发

Mineradio 由 [XxHuberrr](https://github.com/XxHuberrr) 主要设计与打造。

emily 作为早期视觉底层想法与 `emily 视觉预设改进方向`的共创者和灵感来源之一，特此感谢。

同时感谢小天才e宝、应春日、锋将军、軌跡、林中、骊、风痕、花椰菜🥦、MidQwerty在早期体验、测试反馈和发布准备中的帮助。

## ⚖️ 使用条款、许可和法律、版权声明

### 第三方音乐平台说明

Mineradio 不是任何音乐集团、公司的官方客户端，也不隶属于任何音乐平台。

项目中的第三方平台接入仅用于个人学习、本地客户端体验和用户自有账号的播放辅助。请遵守对应平台的用户协议、版权规则和会员权益规则。项目不会提供绕过付费、绕过会员、破解音质或重新分发音乐内容的能力。

### 用户数据与隐私

登录 Cookie、搜索历史、自定义封面、自定义歌词、节奏分析缓存等数据只应保存在本机用户数据目录或浏览器本地存储中，不应提交到仓库。

更多说明见 [PRIVACY.md](https://github.com/XxHuberrr/Mineradio/blob/main/PRIVACY.md)

### 版权与授权

Copyright (C) 2026 MoAEIOU & XxHuberrr

原作者为[XxHuberrr](https://github.com/XxHuberrr)

本项目采用 GPL-3.0 授权。详见 [LICENSE](https://github.com/XxHuberrr/Mineradio/blob/main/LICENSE)

MR Logo、Mineradio 名称、界面视觉设计与原创视觉表达归作者所有；第三方依赖和第三方服务分别遵循其各自授权与服务条款。
