# 《"装箱"的艺术：前端视角下的 Docker 实战》

[![](https://img.shields.io/badge/在线阅读-brightgreen.svg)](https://miniliupeng.github.io/Docker-Guide-For-Frontend/)

欢迎来到前端 Docker 实战教程！本教程专为希望在工程化、DevOps 领域深入发展的前端专家设计。

为了获得最佳阅读体验，请访问我们为您精心制作的 **[在线文档网站](https://miniliupeng.github.io/Docker-Guide-For-Frontend/)**。

---

## 教程目录 (源文件)

如果您希望直接浏览 Markdown 源文件或为本项目贡献内容，可以使用以下目录：

- **[简介](./docs/introduction/README.md)**
  - *为什么前端专家需要学习 Docker？我们将学到什么？*

- **[第一章：Docker 基础入门](./docs/chapter-1-basics/README.md)**
  - *核心概念、安装、以及你的第一个 Docker 容器。*

- **[第二章：为你的前端应用"装箱"](./docs/chapter-2-containerizing-frontend/README.md)**
  - *为现代前端项目 (Vite/Next.js) 编写 `Dockerfile`。*

- **[第三章：优化你的前端镜像](./docs/chapter-3-optimizing-images/README.md)**
  - *多阶段构建、缓存策略、减小镜像体积的最佳实践。*

- **[第四章：深入原理 - Docker 的“引擎室”](./docs/chapter-4-internals/README.md)**
  - *揭示 Docker 客户端/服务器架构、构建缓存和镜像层背后的秘密。*

- **[第五章：服务编排 - Docker Compose 实战](./docs/chapter-5-docker-compose/README.md)**
  - *使用 `docker compose` 和 Nginx 组织前端、后端与反向代理。*

- **[第六章：高级 DevOps - 自动化 CI/CD](./docs/chapter-6-advanced-devops/README.md)**
  - *将 Docker 集成到 GitHub Actions，实现自动化镜像构建与发布。*

- **[第七章：初探容器编排 - Kubernetes 入门](./docs/chapter-7-kubernetes-intro/README.md)**
  - *了解 K8s 的核心概念，以及你的 Docker 镜像如何在 K8s 集群中运行。*

- **[附录：常用命令速查表](./docs/appendix/cheatsheet.md)**
  - *一份核心命令的快速参考。*

- **[附录：实用技巧](./docs/appendix/practical-tips.md)**
  - *包含配置镜像加速器等最佳实践。*

- **[附录：面试问题索引](./docs/appendix/interview-q-a.md)**
  - *高频面试题与本教程答案章节的快速映射。*

---

## 本地开发

想在本地运行本文档网站？

1. 克隆本仓库
   ```bash
   git clone https://github.com/miniliupeng/Docker-Guide-For-Frontend.git
   cd Docker-Guide-For-Frontend
   ```
2. 安装依赖
   ```bash
   pnpm install
   ```
3. 启动开发服务器
   ```bash
   pnpm docs:dev
   ```