# 附录：面试问题与章节索引

本附录旨在为您提供一份快速参考，将常见的 Docker 面试问题与本教程中能够找到详尽答案的章节直接对应起来。善用这份索引，可以帮助您在面试前进行高效、有针对性的复习。

---

## 第一轮：基础筛选问题

> 面试官的目标：确认你是否具备 Docker 的基本使用经验。

| 常见面试问题 | 答案索引 |
| :--- | :--- |
| “请解释一下什么是 Docker？你为什么要在前端项目里用它？” | **[第一章：Docker 基础入门](./../chapter-1-basics/README.md)** |
| “容器和虚拟机有什么区别？” | **[第一章：Docker 基础入门](./../chapter-1-basics/README.md)** |
| “镜像 (Image) 和容器 (Container) 的关系是什么？” | **[第一章：Docker 基础入门](./../chapter-1-basics/README.md)** |
| “请介绍一下 `Dockerfile` 是什么，以及一些常用的指令？” | **[第二章：为你的前端应用"装箱"](./../chapter-2-containerizing-frontend/README.md)** |
| “你如何减小前端镜像的体积？” | **[第三章：优化你的前端镜像](./../chapter-3-optimizing-images/README.md)** (核心：多阶段构建) |
| “你如何优化 `Dockerfile` 的构建速度？” | **[第三章：优化你的前端镜像](./../chapter-3-optimizing-images/README.md)** (核心：缓存策略) |

---

## 第二轮：实践与进阶问题

> 面试官的目标：考察你的实际操作经验和对最佳实践的理解。

| 常见面试问题 | 答案索引 |
| :--- | :--- |
| “`CMD` 和 `ENTRYPOINT` 有什么区别？” | **[第二章：为你的前端应用"装箱"](./../chapter-2-containerizing-frontend/README.md)** |
| “`EXPOSE` 指令和 `docker run -p` 参数有什么区别？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** |
| “如何进入一个正在运行的容器进行调试？” | **[第二章：为你的前端应用"装箱"](./../chapter-2-containerizing-frontend/README.md)** (核心：`docker exec`) |
| “对于生产环境，你会用 Node.js 来 serve 静态文件吗？有什么更好的方案？” | **[第三章：优化你的前端镜像](./../chapter-3-optimizing-images/README.md)** (核心：使用 Nginx) |
| “如何实现开发环境下的代码热更新？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** (核心：绑定挂载) |

---

## 第三轮：原理与深度问题

> 面试官的目标：探测你的技术深度，检验你是否理解“为什么”。

| 常见面试问题 | 答案索引 |
| :--- | :--- |
| “容器之间是如何通信的？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** (核心：用户自定义网络) |
| “数据卷 (Volume) 和绑定挂载 (Bind Mount) 有什么区别？分别在什么场景下使用？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** |
| (高阶) “为什么 `Dockerfile` 里推荐用 `CMD ["npm", "start"]` 而不是 `CMD npm start`？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** (核心：PID 1 与信号处理) |
| (高阶) “`docker build` 的缓存是怎么工作的？” | **[第四章：深入原理 - Docker 的“引擎室”](./../chapter-4-internals/README.md)** (核心：镜像层与构建缓存) |

---

## 第四轮：编排与 DevOps 问题

> 面试官的目标：评估你是否具备将 Docker 应用于真实、复杂项目以及自动化流程的能力。

| 常见面试问题 | 答案索引 |
| :--- | :--- |
| “你用过 Docker Compose 吗？它解决了什么问题？” | **[第五章：使用 Docker Compose 编排多容器应用](./../chapter-5-docker-compose/README.md)** |
| “在 `docker-compose.yml` 中，`build` 和 `image` 有什么区别？” | **[第五章：使用 Docker Compose 编排多容器应用](./../chapter-5-docker-compose/README.md)** |
| “`depends_on` 能保证被依赖的服务完全就绪吗？如果不能，有什么方案？” | **[第五章：使用 Docker Compose 编排多容器应用](./../chapter-5-docker-compose/README.md)** (核心：`healthcheck`) |
| “你是如何将 Docker 集成到项目的 CI/CD 流程中的？” | **[第六章：高级 DevOps - 自动化 CI/CD](./../chapter-6-advanced-devops/README.md)** |
| “在 CI/CD 脚本中，你是如何安全地处理 Docker Hub 的登录凭证的？” | **[第六章：高级 DevOps - 自动化 CI/CD](./../chapter-6-advanced-devops/README.md)** (核心：`secrets`) |
| “你了解 Kubernetes (K8s) 吗？它和 Docker Compose 有什么核心区别？” | **[第七章：初探容器编排 - Kubernetes 入门](./../chapter-7-kubernetes-intro/README.md)** |
| (高阶) “请用一个简单的比喻，解释一下 K8s 的 Pod, Service, Deployment 是什么？” | **[第七章：初探容器编排 - Kubernetes 入门](./../chapter-7-kubernetes-intro/README.md)** |
