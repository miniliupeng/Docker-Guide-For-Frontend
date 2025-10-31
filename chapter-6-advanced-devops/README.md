# 第六章：更进一步 - Docker 与前端 DevOps

## 6.1 本章目标

欢迎来到本教程的最后一章！在这里，我们将超越单个镜像和容器的范畴，将 Docker 融入现代前端开发的生命周期，即 DevOps。本章的目标是让您掌握如何利用 Docker 实现开发、测试与部署流程的自动化和标准化，从而大幅提升团队的协作效率和项目的稳定性。

完成本章后，您将能够：

-   **理解 Docker 在 CI/CD 流程中的核心作用。**
-   **实践如何利用 Docker 和 GitHub Actions 自动化构建和推送镜像。**
-   **掌握使用 VS Code Dev Containers 创建统一、可移植的开发环境。**
-   **将 Docker 技能从“个人工具”提升为“团队基建”。**

这一章将是您从 Docker 的使用者向 Docker 的架构者转变的关键一步。让我们开始吧！

## 6.2 自动化CI/CD：使用 GitHub Actions 构建镜像

持续集成/持续部署 (CI/CD) 是自动化软件交付的核心实践。通过将 Docker 集成到 CI/CD 流水线中，我们可以确保每次代码提交都能在一个干净、一致的环境中被构建、测试，并打包成一个可移植的镜像。

我们将以 `GitHub Actions` 为例，学习如何实现代码推送后自动构建并推送 Docker 镜像到 Docker Hub。

### 1. GitHub Actions 工作流配置

GitHub Actions 的工作流 (Workflow) 是通过在项目根目录的 `.github/workflows/` 文件夹下定义 YAML 文件来配置的。我们创建了一个名为 `ci.yml` 的文件，它的内容如下：

```yaml
name: Docker CI

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./chapter-2-containerizing-frontend/app
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/my-frontend-app:latest
```

### 2. 工作流文件解析

-   `name`: 工作流的名称，会显示在 GitHub 的 Actions 标签页中。
-   `on`: 定义触发工作流的事件。这里我们配置为当有代码 `push`到 `main` 分支时触发。
-   `jobs`: 工作流由一个或多个“作业”组成。
    -   `build-and-push`: 我们作业的 ID。
    -   `runs-on: ubuntu-latest`: 指定作业运行在 GitHub 托管的最新版 Ubuntu 虚拟机上。
-   `steps`: 作业由一系列“步骤”组成，按顺序执行。
    -   `uses: actions/checkout@v4`: 这是一个官方的 Action，用于检出你的仓库代码到虚拟机中。
    -   `docker/setup-qemu-action` 和 `docker/setup-buildx-action`: 这两个 Action 设置了 Docker Buildx，它是一个更现代、功能更强大的构建器，支持多平台构建和更优的缓存管理。
    -   `docker/login-action`: 用于登录到 Docker Hub。`with` 关键字用来传递参数。
        -   `username` 和 `password`: 我们使用了 `${{ secrets. ... }}` 语法来安全地引用预先配置好的**加密机密**，避免将敏感信息硬编码在代码中。
    -   `docker/build-push-action`: 这是核心步骤，用于构建和推送镜像。
        -   `context`: 指定 `Dockerfile` 所在的构建上下文目录。
        -   `push: true`: 告诉 Action 在构建成功后将镜像推送到仓库。
        -   `tags`: 为镜像打上标签。我们再次使用了 `secrets` 来引用 Docker Hub 用户名，格式为 `username/repository:tag`。

### 3. 配置 Docker Hub 机密

为了让 GitHub Actions 能够登录您的 Docker Hub 账户，您需要在 GitHub 仓库中进行如下配置：

1.  **生成 Docker Hub 访问令牌 (Access Token)**：
    -   登录 [Docker Hub](https://hub.docker.com/)。
    -   点击右上角头像，进入 "Account Settings"。
    -   在左侧导航栏选择 "Security"。
    -   点击 "New Access Token"，给它一个描述（例如 `github-actions-token`），设置权限为 "Read, Write, Delete"，然后点击 "Generate"。
    -   **立即复制生成的令牌！** 这个令牌只会显示一次，请务必妥善保管。

2.  **在 GitHub 仓库中设置 Secrets**：
    -   进入您的 GitHub 仓库页面。
    -   点击 "Settings" -> "Secrets and variables" -> "Actions"。
    -   点击 "New repository secret"。
    -   创建两个新的 secret：
        -   **Name**: `DOCKERHUB_USERNAME`
            -   **Value**: 你的 Docker Hub 用户名。
        -   **Name**: `DOCKERHUB_TOKEN`
            -   **Value**: 粘贴刚才在 Docker Hub 生成的**访问令牌**。

配置完成后，当您将 `.github/workflows/ci.yml` 文件推送到 `main` 分支时，Actions 就会自动运行。您可以在仓库的 "Actions" 标签页中看到实时日志和结果。如果一切顺利，一个新的镜像 `my-frontend-app:latest` 就会出现在您的 Docker Hub 仓库中！
