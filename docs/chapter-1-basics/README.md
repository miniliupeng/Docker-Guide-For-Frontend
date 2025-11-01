# 第一章：Docker 基础入门

本章你将学习：

- 什么是 Docker？(容器 vs 虚拟机)
- 核心概念：镜像 (Image), 容器 (Container), 仓库 (Repository)
- 安装 Docker Desktop
- 第一个 Docker 命令：`docker run hello-world`

---

## 1.1 什么是 Docker？它如何解决前端开发的痛点？

想象一下这个场景：

> 新同事入职第一天，你发给他一份长长的 `README.md`，上面写着：“请安装 Node.js v18.17.0, pnpm v8.6.12, yarn v1.22.19, oh, 还有 Python 用于 node-gyp 编译，以及全局安装的 linter, a...”。半天过去了，他还在为某个依赖的本地编译错误而焦头烂额，而你也不得不放下手头的工作去帮他调试。

或者这个场景：

> 测试环境突然出现了一个 bug，但在你的本地开发环境里却无法复现。经过一整天的排查，最终发现是服务器上的 Node.js 版本比你本地的低了一个小版本，导致某个依赖表现不一致。

这些问题，归根结底都是 **环境不一致** 造成的。

**Docker** 就是为了彻底解决这个问题而生的。它是一种 **容器化** 技术，可以将你的 **应用代码**、**运行时环境** (如 Node.js)、**系统工具**、**库** —— 总之，是应用运行所需的一切 —— 全部打包到一个轻量、可移植的 **容器 (Container)** 中。

这个容器就像一个标准化的“集装箱”，里面装好了你的前端应用和它需要的一切。然后，这个“集装箱”可以在任何安装了 Docker 的机器上运行，无论是你同事的 Mac、测试服务器的 Linux，还是云端的生产环境，其内部环境都表现得 **完全一致**。

对于前端专家来说，Docker 带来的价值是：

- **告别环境依赖地狱**：新项目 `git clone` 下来，一个 `docker-compose up` 命令就能启动，无需任何本地配置。
- **保障交付质量**：从开发到生产，应用始终运行在同一个可控的环境中，最大程度地避免了“在我这儿是好的”问题。
- **简化 CI/CD 流程**：构建流程变成了构建一个标准的 Docker 镜像，部署流程变成了在服务器上运行这个镜像。
- **赋能微服务架构**：当你的应用变得复杂，需要拆分成多个服务时（如前端、BFF、Node.js 服务），Docker 能轻松地管理和编排它们。

## 1.2 容器 vs. 虚拟机：一个更清晰的类比

为了更好地理解 Docker，我们经常将它与传统的 **虚拟机 (Virtual Machine, VM)** 进行比较。

- **虚拟机 (VM)**：它会在你的物理机（Host OS）之上，完整地虚拟化出一套硬件（CPU, RAM, 硬盘），然后再安装一个完整的客户机操作系统（Guest OS）。你可以在这个 Guest OS 里运行你的应用。它很重，启动很慢（想象一下开一台新电脑），但隔离性极好。
- **容器 (Container)**：它不虚拟化硬件，而是直接运行在你的物理机操作系统之上，共享同一个操作系统内核。容器之间通过 Docker Engine 实现资源和进程的隔离。它非常轻量，启动速度是秒级的，资源占用也小得多。

一个更形象的类比：

> **虚拟机** 就像是盖了一栋栋独立的房子，每栋房子都有自己全套的基础设施（地基、水电煤气）。
>
> **容器** 则像是在一栋已经建好的公寓楼里，租用一个个独立的房间。所有房间共享大楼的基础设施，但每个房间内部是隔离的。

对于绝大多数前端应用场景，我们不需要虚拟机级别的硬件隔离，容器提供的轻量级隔离已经绰绰有余，并且能带来巨大的性能和效率优势。

## 1.3 核心概念：镜像、容器与仓库

要真正理解 Docker，我们需要搞清楚这三个核心概念的关系。我们可以用一个编程中的类比来理解：

- **镜像 (Image)**：可以理解为一个 **类 (Class)**。
- **容器 (Container)**：可以理解为这个类的一个 **实例 (Instance)**。
- **仓库 (Repository)**：可以理解为存放代码的地方，比如 **NPM** 或 **GitHub**。

---

### 镜像 (Image)

**镜像是静态的、只读的模板**。它包含了运行一个应用所需的所有内容：代码、运行时环境、库、环境变量和配置文件。

你可以把镜像想象成一个应用的“安装包”，但它比传统的安装包更强大，因为它包含了完整的操作系统环境（除了内核）。

镜像是分层的，每一层都是一组文件系统的变更。这种分层结构使得镜像的构建、存储和分发非常高效。我们将在第四章深入探讨这一点。

**关键特性**：

- **只读 (Read-only)**：一旦创建，就不会被改变。
- **可移植 (Portable)**：可以在任何 Docker 主机上运行。
- **分层 (Layered)**：可以复用和缓存，节省空间和构建时间。

### 容器 (Container)

**容器是镜像的运行时实例**。当我们使用 `docker run` 命令时，Docker Engine 会根据指定的镜像创建一个可读写的容器层，然后启动一个进程（你的应用）。

你可以同时运行一个镜像的多个容器实例，它们之间是相互隔离的。每个容器都有自己的文件系统、网络和进程空间。

**关键特性**：

- **可运行 (Runnable)**：是真正跑应用的地方。
- **可写 (Writable)**：应用在容器内产生的数据、日志等都保存在容器的可写层中。
- **隔离 (Isolated)**：容器之间互不影响。
- **短暂 (Ephemeral)**：默认情况下，容器被删除后，其内部产生的所有数据都会丢失。数据的持久化需要用到 **数据卷 (Volumes)**，我们后续会讲到。

### 仓库 (Repository)

**仓库是集中存放和分发镜像的地方**。这和我们用 npm/yarn 来管理 node 包非常相似。

仓库分为两种：

- **公共仓库 (Public Registry)**：最著名的就是 **Docker Hub**，它就像是 npmjs.com，你可以在上面找到几乎所有常用软件的官方镜像（如 `node`, `nginx`, `mongo` 等）。
- **私有仓库 (Private Registry)**：你可以搭建自己的私有仓库（比如使用 Harbor），或者使用云服务商提供的私有仓库服务（如 AWS ECR, Google GCR, GitHub Packages）。这在公司内部用来管理私有项目镜像时非常有用。

**总结一下这个流程**：

1.  你从 **仓库 (Repository)** 中拉取 (`pull`) 一个基础镜像 (比如 `node:18-alpine`)。
2.  你在该镜像的基础上，加入你的代码，构建 (`build`) 出一个新的 **镜像 (Image)**。
3.  你运行 (`run`) 这个新的镜像，得到一个正在运行的 **容器 (Container)**。
4.  （可选）你可以将你构建的新镜像推送 (`push`) 到一个 **仓库 (Repository)**，分享给团队或用于部署。

下面是一个简化的生命周期图，展示了从 `Dockerfile` (我们将在第二章学习) 到最终运行容器的流程：

```mermaid
graph TD
    A[Dockerfile] -- docker build --> B(Image);
    B -- docker run --> C{Container};
    B -- docker push --> D[Registry];
    D -- "docker pull" -- > B;
```

### 专家贴士：选择你的基础镜像

我们在后续章节会使用 `node:20-alpine` 这样的基础镜像。在这里，我们提前探讨两个关于选择基础镜像的专家级实践，这对于构建稳定、可复现的生产环境至关重要。

**1. 镜像标签 (Tag) 的艺术**

镜像标签（如 `20-alpine`, `latest`）是镜像的版本标识。但并非所有标签都是平等的。

- **避免使用 `latest`**：`latest` 标签是一个“浮动”的标签，它总是指向该镜像仓库中最新推送的版本。今天它可能是 `v1.0`，明天维护者发布了新版，它可能就指向了 `v2.0`。在 `Dockerfile` 中使用 `FROM node:latest` 会导致你的构建变得**不可复现**，今天构建成功的镜像，下周可能因为基础镜像的重大更新而构建失败。这是生产环境中的大忌。

- **选择明确的标签，而非宽泛的标签**：像 `node:20` 这样的标签，虽然比 `latest` 好，但它仍然是浮动的（它会指向 Node.js 20 的最新一个子版本）。更推荐的做法是使用更具体的标签，如 `node:20.11.0`。

- **最佳实践：不可变标签**：最稳妥的生产实践是使用不可变的标签。
    - **带-alpine, -slim 的版本号**：例如 `node:20.11.0-alpine`，这种标签通常是不可变的。
    - **使用 SHA256 摘要**：最极致的做法是使用镜像的 `sha256` 摘要来指定基础镜像，例如 `FROM node@sha256:6178e7...`。这个摘要是镜像内容的唯一标识，确保了每次构建都使用完全相同的字节级基础镜像。

**2. `alpine` 镜像的权衡**

- **优点 (Pros)**：我们推荐使用 `-alpine` 后缀的镜像，是因为它基于 [Alpine Linux](https://www.alpinelinux.org/)。这是一个极度轻量化的 Linux 发行版，因此基于它构建的最终镜像体积会小非常多（通常只有几十 MB，而基于 Debian/Ubuntu 的 `-slim` 镜像可能是上百 MB）。更小的体积意味着更快的拉取速度、更少的存储占用。

- **潜在风险 (Cons)**：你需要知道 `alpine` 使用的是 `musl libc` 作为其 C 标准库，而大多数其他 Linux 发行版（如 Debian, Ubuntu, CentOS）使用的是 `glibc`。在极少数情况下，如果你的项目依赖了某个需要特定 `glibc` 功能的 Node.js C++ 原生模块，那么它在 `alpine` 环境下可能会编译或运行失败。虽然这种情况对于纯前端项目很少见，但作为一个专家，你应该了解这个潜在的风险点，以便在遇到疑难杂症时能够进行正确的排查。

从一开始就建立起对“构建可复现性”和“基础镜像选型”的认知，是专业 Docker 使用者的标志。

## 1.5 安装 Docker Desktop

Docker Desktop 是在 Windows 和 macOS 上使用 Docker 最简单的方式。它是一个包含了 Docker 引擎 (Engine)、Docker 命令行工具 (CLI)、Docker Compose 以及一个图形化管理界面的集成应用。

1.  **访问官网下载**：请根据你的操作系统，访问 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载并安装。

2.  **系统要求**：请注意，Docker Desktop 在底层使用了操作系统的虚拟化技术。
    - **Windows**: 需要开启 WSL 2 (Windows Subsystem for Linux 2) 功能。安装程序通常会自动引导你完成此操作。
    - **macOS**: 需要使用比 11 (Big Sur) 更新的系统版本。

3.  **验证安装**：安装完成后，打开你的终端（Terminal, PowerShell, or Git Bash），运行以下命令：

    ```bash
    docker --version
    ```

    如果你能看到 Docker 的版本号，说明 Docker CLI 已经可以正常工作。接着运行：

    ```bash
    docker info
    ```

    这个命令会输出大量关于 Docker 引擎状态的信息。如果命令能成功执行，说明 Docker 引擎（后台守护进程）也已成功启动。

## 1.5 第一个容器与核心命令

现在，让我们运行经典的 `hello-world` 容器，并深入理解这个简单的命令背后发生了什么。

```bash
docker run hello-world
```

当你敲下回车后，你会看到类似这样的输出：

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Digest: sha256:...
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

这个命令背后，Docker 帮你自动完成了以下所有步骤：

1.  **客户端到守护进程**：Docker CLI (你的终端) 将 `run` 命令发送给了在本机后台运行的 Docker 守护进程 (Docker Daemon)。
2.  **检查本地镜像**：Docker 守护进程在本地查找名为 `hello-world:latest` 的镜像。
3.  **拉取镜像**：因为它在本地找不到（`Unable to find image...locally`），所以它会去默认的公共仓库 Docker Hub 查找并拉取 (`pull`) 这个镜像。
4.  **创建并运行容器**：镜像下载完成后，Docker 使用这个镜像创建了一个新的容器，并运行了容器内的程序。
5.  **输出与退出**：容器内的程序输出了 "Hello from Docker!" 这段信息，然后程序执行完毕，容器停止运行。**这一点至关重要**：容器的生命周期与其主进程的生命周期是绑定的。当 `hello-world` 容器的主进程（即打印信息的那个程序）执行完毕并退出后，容器的使命就完成了，因此它也随之停止。这与我们后面需要**持续运行**的前端 Web 服务形成了鲜明对比。

### 核心管理命令

刚刚的 `hello-world` 容器运行完就退出了，我们该如何查看它呢？下面是每个 Docker 使用者都必须掌握的“三板斧”：

- **拉取镜像 `docker pull`**

  虽然 `docker run` 会在本地镜像不存在时自动拉取，但 `docker pull` 是一个可以独立使用的重要命令，用于从仓库提前下载镜像到本地。

  ```bash
  # 拉取官方的 Node.js 20-alpine 镜像
  docker pull node:20-alpine
  ```
  > **小贴士**: 现代等价命令是 `docker image pull node:20-alpine`。提前 `pull` 镜像是部署流程中的一个好习惯。

- **查看镜像 `docker images`**

  运行 `docker images`，你会看到我们刚刚从 Docker Hub 拉取下来的 `hello-world` 镜像。

  ```bash
  $ docker images
  REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
  hello-world   latest    ...            ...             ...
  ```
  > **小贴士**: Docker 近年来引入了更符合语义的命令语法。`docker image ls` 是 `docker images` 的现代等价命令，功能完全相同，更推荐使用。

- **查看运行中的容器 `docker ps`**

  运行 `docker ps` (ps 是 process status 的缩写)。你会发现列表是空的，因为 `hello-world` 容器运行完就自动退出了。
  
  > **小贴士**: 同样，`docker container ls` 是 `docker ps` 的现代等价命令。

- **查看所有容器 `docker ps -a`**

  要查看包括已停止在内的所有容器，需要加上 `-a` (all) 参数。

  ```bash
  $ docker ps -a
  CONTAINER ID   IMAGE         COMMAND    CREATED          STATUS                      PORTS     NAMES
  ...            hello-world   "/hello"   2 minutes ago    Exited (0) 2 minutes ago              ...
  ```
  看，我们刚才运行的容器就在这里，它的 `STATUS` 是 `Exited`。
  
  > **小贴士**: 现代语法是 `docker container ls -a`。

- **清理容器和镜像**

  既然容器和镜像都可以被查看，那它们自然也可以被删除。

  ```bash
  # 删除指定的容器 (使用 CONTAINER ID 的前几位即可)
  # 现代语法: docker container rm <container_id>
  docker rm <container_id>

  # 删除指定的镜像 (必须先删除所有基于此镜像的容器)
  # 现代语法: docker image rm hello-world
  docker rmi hello-world
  ```

现在，你不仅运行了第一个容器，还学会了如何查看和清理它们。这是我们后续所有操作的基础。
