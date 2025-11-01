# 第五章：使用 Docker Compose 编排多容器应用

本章你将学习：

- 什么是 Docker Compose？它解决了什么问题？
- 编写你的第一个 `docker-compose.yml` 文件。
- 定义和管理多个服务 (Services)。
- 使用 Docker Compose 管理网络 (Networks) 和数据卷 (Volumes)。
- 通过一个命令 (`docker-compose up`) 启动整个全栈应用。
- 模拟真实的前后端分离 + Nginx 网关的生产环境。

---

## 5.1 告别长命令：为什么需要 Docker Compose？

在之前的章节中，我们使用 `docker run` 命令来启动容器。一个典型的命令可能如下：

```bash
docker run -d -p 8080:3000 --name my-vite-app -v "$(pwd)/src":/app/src --network my-app-network vite-react-app:1.0
```

这条命令虽然功能强大，但存在几个明显的问题：

1.  **太长且难以记忆**：包含了端口映射、命名、数据卷挂载、网络连接等众多参数，非常容易出错。
2.  **难以管理多容器**：一个真实的应用通常包含多个协同工作的服务（前端、后端、数据库、网关等）。如果需要手动管理这 4-5 个容器的启动顺序、依赖关系和网络配置，这将是一场运维灾难。
3.  **不便于团队协作**：这些启动参数无法方便地进行版本控制和团队共享。新成员需要复制粘贴长长的脚本，而不是通过一个清晰的配置文件来理解项目架构。

**Docker Compose** 正是为了解决这些问题而生的。它允许我们使用一个 `YAML` 文件，以**声明式**的方式定义整个应用的服务、网络和数据卷。

你可以将 `docker-compose.yml` 文件想象成整个应用的“架构蓝图”或“启动手册”。它清晰、可读、易于版本控制，并且能让你用一个简单的命令，如 `docker compose up`，来启动、管理和停止整个应用栈。

## 5.2 场景准备：构建一个真实的全栈应用环境

为了学习 Docker Compose，我们将模拟一个非常经典的前后端分离开发环境，它包含三个服务，并搭建如下的项目结构：

```
chapter-5-docker-compose/
└── project/
    ├── frontend/      (Vite App from Chapter 2)
    ├── backend/       (A new Express API)
    ├── nginx/         (Nginx Config)
    └── docker-compose.yml
```

1.  **`frontend` 服务**: 复用之前章节的 Vite + React 应用。
2.  **`backend` 服务**: 创建一个全新的 Node.js + Express 应用，提供 API 接口。
3.  **`nginx` 服务**: 充当**反向代理/网关**，将 `/api` 请求转发给后端，其他请求转发给前端。

### 1. 创建后端服务

在 `project/backend` 目录下，我们创建了三个文件：

- **`package.json`**:
  ```json
  {
    "name": "backend",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": { "start": "node index.js" },
    "dependencies": { "express": "^4.18.2" }
  }
  ```
- **`index.js`**:
  ```javascript
  const express = require('express');
  const app = express();
  const port = 3001;

  app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
  });

  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
  ```
- **`Dockerfile`**:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  RUN npm install -g pnpm
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --prod
  COPY . .
  EXPOSE 3001
  CMD ["node", "index.js"]
  ```

### 2. 配置 Nginx 网关

在 `project/nginx` 目录下，我们创建 `nginx.conf` 文件，这是我们整个应用的流量入口：

```nginx
worker_processes 1;
events { worker_connections 1024; }
http {
  server {
    listen 80;

    location / {
      proxy_pass http://frontend:3000;
      # ... (省略其他 proxy_set_header 配置)
    }

    location /api {
      proxy_pass http://backend:3001;
      # ... (省略其他 proxy_set_header 配置)
    }
  }
}
```
**核心逻辑**：Nginx 监听 80 端口，将根路径 `/` 的请求转发给名为 `frontend` 的服务的 `3000` 端口，将 `/api` 路径的请求转发给名为 `backend` 的服务的 `3001` 端口。服务名 (`frontend`, `backend`) 会被 Docker Compose 自动解析为正确的容器 IP。

### 3. 连接前后端

我们修改了 `frontend/src/App.tsx`，增加了一个按钮和 `fetch` 函数，用于请求 `/api/message` 接口并显示返回的数据。

## 5.3 编写 `docker-compose.yml`

这是本章的核心。在 `project` 根目录下，我们创建 `docker-compose.yml` 文件，将所有服务“编织”在一起：

```yaml
services:
  # 前端服务
  frontend:
    build:
      context: ./frontend

  # 后端服务
  backend:
    build:
      context: ./backend

  # Nginx 网关服务
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"  # 应用的统一入口
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

### `docker-compose.yml` 语法解析

- **`services`**: 这是文件的顶级关键字，下面定义了我们应用的所有服务组件。
- **`frontend`, `backend`, `nginx`**: 我们为三个服务自定义的名称。这些名称非常重要，因为它们将作为**服务名 (hostname)** 在 Docker 的内部网络中使用。
- **`build`**: 指示 Docker Compose 如何构建服务的镜像。它的值可以直接是构建上下文的路径（`build: ./frontend`），这是**快捷写法**。也可以是一个对象，包含 `context` 和其他构建选项（如 `dockerfile`, `args` 等），这是**详细写法**，功能更强大。
- **`image`**: 直接使用一个在 Docker Hub 上已存在的公共镜像。
- **`ports`**: 格式为 `"<HOST_PORT>:<CONTAINER_PORT>"`，将宿主机端口映射到容器端口。这里，`8080:80` 是我们整个应用的**唯一入口**。
- **`volumes`**: 使用**绑定挂载**，将我们本地的 `nginx.conf` 文件挂载到 Nginx 容器内部的相应路径，从而覆盖其默认配置。
- **`depends_on`**: 定义服务间的启动依赖关系。这里表示 `nginx` 服务必须在 `frontend` 和 `backend` 服务**启动之后**才会启动，这确保了当 Nginx 开始转发流量时，上游服务已经准备就绪。

<details>
<summary><b>附录：<code>docker-compose.yml</code> 核心指令详解 (点击展开)</b></summary>

为了让您更深入地掌握 `docker compose`，我们来详细解析一下 `docker-compose.yml` 文件中一些最核心、最常用的指令。

#### 顶级元素 (Top-level Elements)

-   `services`: **必需**。定义了应用的所有服务。每个键名都是一个服务名。
-   `networks`: 定义自定义网络，用于服务间的通信。如果不定义，Compose 会创建一个默认网络。
-   `volumes`: 定义命名卷，用于数据的持久化。

#### 服务级指令 (Per-service Directives)

以下指令位于 `services` 下的每个具体服务中（如 `frontend:`）。

-   **`build`**: 用于从 `Dockerfile` 构建镜像。
    ```yaml
    build:
      context: ./backend      # Dockerfile 所在的目录
      dockerfile: Dockerfile.dev # 可选，指定 Dockerfile 文件名
      args:                   # 可选，构建时传递的参数
        - NODE_ENV=development
      target: builder         # 可选，构建多阶段 Dockerfile 中的特定阶段
    ```

-   **`image`**: 指定服务使用的镜像。如果同时定义了 `build` 和 `image`，Compose 会使用 `build` 构建镜像，并将其命名为 `image` 指定的名称和标签。
    ```yaml
    image: my-backend-app:1.0
    ```

-   **`ports`**: 映射端口。
    ```yaml
    ports:
      - "8080:80" # 短语法: "HOST:CONTAINER"
      - "127.0.0.1:5173:3000" # 更精确的短语法: "HOST_IP:HOST_PORT:CONTAINER_PORT"
    ```

-   **`volumes`**: 挂载数据卷或绑定主机路径。
    -   **绑定挂载 (Bind Mount)**: `HOST_PATH:CONTAINER_PATH`
    -   **命名卷 (Named Volume)**: `VOLUME_NAME:CONTAINER_PATH`
    ```yaml
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf # 绑定挂载
      - db-data:/var/lib/mysql                  # 命名卷 (需要在顶级 volumes 中定义 db-data)
    ```

-   **`environment`**: 设置环境变量。
    ```yaml
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    ```

-   **`env_file`**: 从文件导入环境变量。
    ```yaml
    env_file:
      - ./backend/.env.production
    ```

-   **`depends_on`**: 控制服务启动顺序。
    > **专家提示**: `depends_on` 只保证依赖的服务**先启动**，不保证其**已就绪**。例如，`backend` 依赖 `db`，它只等到 `db` 容器启动，但不等数据库服务本身初始化完成。要实现“就绪”等待，需要配合健康检查 (`healthcheck`)。
    ```yaml
    depends_on:
      backend:
        condition: service_healthy # 等待 backend 服务健康检查通过
    ```

-   **`restart`**: 定义容器的重启策略。
    -   `no`: 默认值，不重启。
    -   `always`: 总是重启，除非手动停止。
    -   `on-failure`: 只在退出码表示错误时重启。
    -   `unless-stopped`: 总是重启，除非手动停止。
    ```yaml
    restart: on-failure
    ```

-   **`command`**: 覆盖容器启动时执行的默认命令 (即 `Dockerfile` 中的 `CMD`)。
    ```yaml
    command: ["npm", "run", "dev"]
    ```

-   **`healthcheck`**: 定义一个健康检查来判断容器是否“就绪”。这对于控制依赖关系至关重要。
    ```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    ```

</details>

## 5.4 启动与管理

万事俱备！现在，我们只需要在 `project` 目录下运行一个命令，即可启动所有服务：

```bash
docker compose up --build
```

- **`docker compose up`**: 启动并运行整个应用。
- **`--build`**: 在启动前强制重新构建镜像，当我们修改了代码或 `Dockerfile` 时使用。

应用启动后，你可以使用以下命令来管理：

- **`docker compose ps`**: 查看所有服务的当前状态。
- **`docker compose logs <service_name>`**: 查看特定服务的日志。
- **`docker compose down`**: 停止并**移除**所有相关的容器和网络。

现在，访问 `http://localhost:8080`，点击按钮，你将看到前后端成功通信的画面！这标志着你已经掌握了现代 Web 应用容器化编排的核心技能。
