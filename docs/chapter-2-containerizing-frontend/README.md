# 第二章：为你的前端应用"装箱"

本章你将学习：

- 准备一个现代前端项目 (例如: Vite/Next.js + TypeScript)
- 编写你的第一个 `Dockerfile`
- 构建 Docker 镜像 (`docker build`)
- 运行你的前端应用容器 (`docker run`)
- 深入理解 `Dockerfile` 常用指令 (`FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`, `EXPOSE`)

---

在第一章中，我们学习了 Docker 的基础知识。现在，是时候将这些理论付诸实践，为我们真实的前端应用构建一个 Docker 镜像了。

## 2.1 准备一个现代前端项目

我们已经使用 `pnpm create vite` 在 `app` 目录下创建了一个标准的 `React + TypeScript` 项目。

这个项目结构清晰，包含了开发和构建所需的所有基本配置，是作为我们容器化目标的完美范例。

```
chapter-2-containerizing-frontend/
└── app/
    ├── node_modules/
    ├── public/
    ├── src/
    ├── .eslintrc.cjs
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.json
    └── vite.config.ts
```

现在，我们的目标是：将这个 Vite 应用打包，并让它运行在一个独立的 Docker 容器里。

## 2.2 编写你的第一个 `Dockerfile`

`Dockerfile` 是一个纯文本文件，它定义了构建一个 Docker 镜像所需的所有步骤。可以把它想象成一个自动化脚本，或者一份“镜像构建菜谱”。

我们将在 `app` 目录下创建这个文件。

> **文件名约定**: 文件名必须是 `Dockerfile`，首字母 `D` 大写，没有文件扩展名。

我们在 `app` 目录下创建 `Dockerfile` 并写入以下内容。这是一个**两阶段构建**的 `Dockerfile`，是生产环境中的最佳实践，我们会在第三章深入讲解其优化的原理。现在，我们先来理解它的工作流程。

```dockerfile
# Stage 1: Build the application
# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN pnpm run build

# Stage 2: Serve the application
# Use a lightweight web server to serve the static files
FROM node:20-alpine

WORKDIR /app

# Globally install a static file server
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# The command to run when the container starts
CMD ["serve", "-s", "dist"]
```

### `Dockerfile` 指令详解

- **`FROM node:20-alpine AS builder`**
  - `FROM`: 每一个 `Dockerfile` 都必须以 `FROM` 开头。它指定了我们将要构建的镜像的**基础镜像**。`node:20-alpine` 是一个官方的、包含了 Node.js v20 的、非常小巧的 Linux 发行版 (Alpine Linux)。
  - `AS builder`: 这里我们为这个构建阶段命名为 `builder`。这个名字在第二阶段拷贝文件时会用到。

- **`WORKDIR /app`**
  - `WORKDIR`: 设置容器内部的工作目录。后续的 `COPY`, `RUN` 等指令都会在这个目录下执行。如果目录不存在，Docker 会自动创建它。

- **`RUN npm install -g pnpm`**
  - `RUN`: 在容器内执行指定的命令。这里我们在全局安装 `pnpm`，因为基础的 `node` 镜像默认不带 `pnpm`。

- **`COPY package.json pnpm-lock.yaml ./`**
  - `COPY`: 将宿主机（你的电脑）的文件或目录，复制到容器内部。这里我们只先复制了 `package.json` 和 `pnpm-lock.yaml`。这是一个重要的缓存优化技巧，我们会在第三章详细解释。

- **`RUN pnpm install`**
  - 利用上一步复制的文件，在容器内安装所有生产依赖。

#### 深入理解：镜像层与构建缓存

你可能已经注意到，我们将 `COPY` 指令分成了两步：先复制 `package.json` 和 `pnpm-lock.yaml`，执行 `pnpm install`，然后再复制其他所有文件。这背后是 Docker 最核心的**构建缓存 (Build Cache)** 机制。

- **镜像层 (Image Layers)**：`Dockerfile` 中的每一条指令（如 `FROM`, `RUN`, `COPY`）都会创建一个新的**镜像层**。每一层都是对前一层状态的变更，并且是只读的。最终的镜像就是由这些层堆叠而成。
- **构建缓存 (Build Cache)**：当 Docker 构建镜像时，它会逐行检查指令。对于每一条指令，Docker 会检查其父层是否存在，以及该指令的内容是否发生了变化。
  - 如果指令没有变化（例如，`COPY` 的源文件内容没有变），Docker 就会**重用**之前构建时生成的缓存层，而不是重新执行该指令。
  - 如果指令发生了变化，Docker 会使该指令及其**之后所有**指令的缓存失效，并重新执行它们。

**这就是为什么指令的顺序至关重要**：

我们的 `package.json` 和 `pnpm-lock.yaml` 文件通常不经常变动，而我们的源代码（如 `src/` 目录下的文件）则会频繁修改。通过将 `pnpm install` 这一步（通常是构建中最耗时的一步）放在复制源代码之前，我们可以确保：只要 `package.json` 没有变化，`pnpm install` 这一层的缓存就**永远不会失效**，即使我们修改了上百次源代码。这将极大地提升我们日常开发的构建速度。

- **`COPY . .`**
  - 复制项目中的所有其他文件（源代码、配置文件等）到容器的工作目录。

- **`RUN pnpm run build`**
  - 执行 `package.json` 中定义的 `build` 脚本，这将把我们的应用打包成静态文件，并输出到 `dist` 目录。

- **`FROM node:20-alpine`**
  - 第二阶段开始。我们再次使用了一个干净的 `node:20-alpine` 镜像作为最终运行环境的基础。

- **`RUN npm install -g serve`**
  - `serve` 是一个非常轻量、简单的静态文件服务器。我们在这里全局安装它，用来托管我们构建好的前端应用。

- **`COPY --from=builder /app/dist ./dist`**
  - 这是多阶段构建的关键。`--from=builder` 指示 Docker 从我们之前命名的 `builder` 阶段进行复制。
  - 这行命令的意思是：只将 `builder` 阶段中 `/app/dist` 目录（也就是 Vite 的构建产物）复制到当前阶段的 `./dist` 目录。源代码、`node_modules` 等所有中间产物都被丢弃了。

- **`EXPOSE 3000`**
  - `EXPOSE`: 声明容器在运行时会监听的端口。这主要是一个文档性质的指令，告诉使用者这个镜像的服务端口是什么。它本身**不会**自动发布端口。

- **`CMD ["serve", "-s", "dist"]`**
  - `CMD`: 指定**启动容器时默认执行的命令**。这里，我们使用 `serve` 来托管 `dist` 目录下的静态文件。`-s` 参数是让 `serve` 以 SPA (Single-Page Application) 模式运行，能正确处理前端路由。
  - 一个 `Dockerfile` 中只能有一个 `CMD` 指令。如果出现多个，只有最后一个会生效。

#### 深入理解：CMD vs. ENTRYPOINT

`Dockerfile` 中有两个指令都可以用来定义容器的启动命令：`CMD` 和 `ENTRYPOINT`。理解它们的区别是编写专业 `Dockerfile` 的关键。

- **`CMD`** (默认命令):
  - **用途**: 为容器提供一个**默认的**执行命令。
  - **特性**: 如果用户在 `docker run` 命令的末尾指定了其他命令，`Dockerfile` 中的 `CMD` 会被**完全覆盖**。
  - **示例**: 我们 `Dockerfile` 中的 `CMD ["serve", "-s", "dist"]`。如果我们运行 `docker run ... vite-react-app:1.0 ls -l`，容器将执行 `ls -l`，而不会执行 `serve` 命令。

- **`ENTRYPOINT`** (入口点):
  - **用途**: 将容器配置成一个**可执行程序**，定义容器的“主”命令。
  - **特性**: `ENTRYPOINT` 指定的命令**不会**被 `docker run` 末尾的参数轻易覆盖。相反，`docker run` 末尾的参数会被当作**参数**传递给 `ENTRYPOINT` 指定的程序。
  - **示例**: 如果 `Dockerfile` 是 `ENTRYPOINT ["serve"]` 和 `CMD ["-s", "dist"]`。
    - `docker run ... vite-react-app:1.0` -> 执行 `serve -s dist`。
    - `docker run ... vite-react-app:1.0 -p 80` -> 执行 `serve -s dist -p 80` (假设 `serve` 支持 `-p` 参数)，`-s dist` 没有被覆盖。

**最佳实践**:
- 当你需要让容器表现得像一个**命令**时，使用 `ENTRYPOINT` (例如，`ENTRYPOINT ["ping"]`)。
- 当你只是想为容器提供一个**默认的、可被覆盖的**启动行为时，使用 `CMD`。我们的前端应用场景就很适合使用 `CMD`。

## 2.3 构建你的第一个前端镜像

现在我们的 `Dockerfile` 已经准备就绪，我们可以使用 `docker build` 命令来构建镜像了。

请打开你的终端，并确保你的当前目录是 `chapter-2-containerizing-frontend/app`，也就是 `Dockerfile` 所在的目录。然后，执行以下命令：

```bash
docker build -t vite-react-app:1.0 .
```

当你按下回车，Docker 就会开始执行 `Dockerfile` 中我们定义的每一个步骤。你会看到终端输出会逐行对应我们写的指令，例如 `=> [builder 2/7] WORKDIR /app`。

这个过程可能会持续几分钟，尤其是第一次构建时，因为它需要下载基础镜像和安装 npm 依赖。

### `docker build` 命令解析

- **`docker build`**: 这是构建命令的本体。
- **`-t vite-react-app:1.0`**: 这是最常用的参数之一。
  - `-t` 是 `--tag` 的缩写，用于给镜像**命名和打标签**。
  - 格式是 `image_name:tag`。在这里，我们将镜像命名为 `vite-react-app`，并给它打上了 `1.0` 的版本标签。如果你不提供标签，Docker 会默认使用 `latest`。一个好的命名和版本管理习惯，对于后续维护至关重要。
- **`.`**: 这个点至关重要，它告诉 Docker **构建上下文 (Build Context)** 的路径。
  - **构建上下文**指的是 Docker 在构建镜像时，可以访问的文件和目录集合。你 `Dockerfile` 中的 `COPY` 等指令，能复制的源文件，都必须位于这个上下文路径之内。
  - 在这里，`.` 表示**当前目录**。Docker 会将当前目录下的所有文件（除了被 `.gitignore` 或 `.dockerignore` 排除的）打包发送给 Docker 守护进程，用于构建。

### 重要：使用 `.dockerignore` 优化构建

你可能会在第一次构建时遇到一个错误，或者发现构建启动得非常缓慢。错误信息可能类似于 `failed to checksum file node_modules/...`。

这通常是因为 Docker 在打包构建上下文时，试图包含本地的 `node_modules` 目录。这个目录体积庞大、文件众多，不仅拖慢了构建速度，还可能因为文件权限等问题导致构建失败。

**最佳实践**是，在 `Dockerfile` 所在的目录下，创建一个 `.dockerignore` 文件，告诉 Docker 忽略这些不需要的文件和目录。它的语法和 `.gitignore` 完全相同。

在我们的项目中，`app` 目录下应该包含一个 `.dockerignore` 文件，内容如下：

```
# Ignore dependencies and build output
node_modules
dist
.env*
.DS_Store
npm-debug.log*
```

这样，Docker 在构建时就不会打包这些目录，既加快了速度，又避免了潜在的错误。我们**总是在容器内部**通过 `RUN pnpm install` 来安装依赖，而不是使用本地的 `node_modules`。

构建完成后，你可以立刻运行 `docker image ls` (或 `docker images`) 来查看我们刚刚创建的镜像。

```bash
$ docker image ls
REPOSITORY         TAG      IMAGE ID       CREATED          SIZE
vite-react-app     1.0      abcdef123456   15 seconds ago   ...
node               20-alpine ...            ...              ...
```

你会看到 `vite-react-app:1.0` 出现在了你的本地镜像列表中。恭喜，你已经成功将你的前端应用“装箱”成了一个标准化的 Docker 镜像！

## 2.4 运行你的前端应用容器

镜像是静态的模板，而容器是它运行起来的实例。现在，我们就用 `docker run` 命令来启动我们的应用容器。

执行以下命令：

```bash
docker run -d -p 8080:3000 --name my-vite-app vite-react-app:1.0
```

如果命令成功执行，它会输出一长串字符，这就是新创建的容器的 ID。

现在，在你的浏览器中访问 `http://localhost:8080`，你应该能看到 Vite + React 的欢迎页面了！

### `docker run` 命令解析

这个命令比第一章的 `docker run hello-world` 要复杂一些，让我们来分解它：

- **`docker run`**: 运行命令的本体。
- **`-d`**: 是 `--detach` 的缩写。这个参数会让容器在**后台模式 (detached mode)** 下运行。这对于需要长时间运行的服务器应用（比如我们的 Web 服务器）是必需的。如果不加这个参数，容器会占据你的终端，一旦你关闭终端，容器也会随之停止。
- **`-p 8080:3000`**: 这是**端口映射 (port mapping)** 参数。
  - 它的格式是 `[host_port]:[container_port]`。
  - `container_port` (`3000`)：是容器内部应用正在监听的端口。在我们的 `Dockerfile` 中，`serve` 默认监听 3000 端口，我们也通过 `EXPOSE 3000` 声明了它。
  - `host_port` (`8080`)：是你本地机器（宿主机）的端口。
  - 整条参数的含义是：“将我本地的 8080 端口收到的所有流量，转发到容器的 3000 端口”。这样，我们就可以通过访问 `localhost:8080` 来访问容器内的应用了。你可以随意改变主机端口，例如，`-p 5000:3000` 会让你可以通过 `http://localhost:5000` 访问，这在同时运行多个需要相同容器端口的应用时非常有用。
- **`--name my-vite-app`**: 为你的容器指定一个**自定义的、易于记忆的名称**。这是一个非常好的习惯，因为后续我们想查看日志、停止或删除容器时，就可以直接使用这个名字，而不用去复制那串又长又难记的容器 ID。
- **`vite-react-app:1.0`**: 命令的最后一部分，指定了我们要使用哪个镜像来创建这个容器。

### 管理正在运行的容器

现在容器已经在后台运行了，我们可以用一些命令来管理它：

- **查看运行中的容器**:
  ```bash
  # 我们在第一章学过的命令
  docker ps
  # 或者现代语法
  docker container ls
  ```
  你会看到名为 `my-vite-app` 的容器正在运行，并且端口映射关系 `0.0.0.0:8080->3000/tcp` 也清晰地列了出来。

- **查看容器日志**:
  如果应用出了问题，或者你想看看服务器的输出，可以使用 `docker logs` 命令。
  ```bash
  # 使用我们自定义的容器名
  docker logs my-vite-app

  # 如果你想持续跟踪日志（像 tail -f），可以加上 -f 参数
  docker logs -f my-vite-app
  ```

- **进入容器内部 (`docker exec`)**:
  这是排查问题的“瑞士军刀”。如果你想进入正在运行的容器，查看其内部文件系统或执行命令，可以使用 `docker exec`。
  ```bash
  # -it 参数让我们能以交互模式进入
  # /bin/sh 是 alpine 镜像中可用的 shell
  docker exec -it my-vite-app /bin/sh

  # 进入后，你就像在操作一个迷你的 Linux 系统
  # ls -l
  # cat /app/dist/index.html
  # exit  (退出容器)
  ```

- **检查底层信息 (`docker inspect`)**:
  如果你需要获取一个容器或镜像的所有底层详细信息，`docker inspect` 是你的“X光机”。它会以一个巨大的 JSON 格式返回该对象的所有元数据。
  ```bash
  # 查看我们容器的所有配置信息
  docker inspect my-vite-app
  ```
  这个命令会输出海量的信息。它最强大的功能是配合 `--format` 参数，使用 [Go 模板](https://pkg.go.dev/text/template) 语法来精确提取你需要的字段。
  ```bash
  # 示例：只获取容器在 Docker 网络中的 IP 地址
  docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-vite-app
  ```
  这在编写自动化脚本或进行网络相关的调试时（例如，当你有多个容器需要互相通信时）非常有用。

- **停止容器**:
  当你不再需要这个应用时，可以停止它。
  ```bash
  docker stop my-vite-app
  ```

- **移除容器**:
  停止后的容器并不会自动删除（你可以用 `docker ps -a` 看到它）。要彻底移除它，需要使用 `docker rm`。
  ```bash
  docker rm my-vite-app
  ```

> **小贴士**: 如果你只是想临时运行一个容器，测试完就丢弃，可以在 `docker run` 时加上 `--rm` 参数。这样，当容器停止后，Docker 会自动帮你把它删除，非常方便。例如: `docker run --rm -p 8080:3000 ...`

至此，我们已经走完了一个完整的“构建镜像 -> 运行容器 -> 访问应用 -> 管理容器”的生命周期。你已经掌握了将前端应用容器化的核心技能！
