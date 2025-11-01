# 附录：常用命令速查表

这份速查表汇总了本教程中涉及的核心 Docker 与 Docker Compose 命令。

### 镜像管理 (Image)

| 命令 (现代语法) | 旧版命令 | 描述 |
| :--- | :--- | :--- |
| `docker image ls` | `docker images` | 列出本地所有镜像 |
| `docker image pull <image>` | `docker pull <image>` | 从仓库拉取镜像 |
| `docker image build -t <tag> .` | `docker build -t <tag> .` | 从 `Dockerfile` 构建镜像 |
| `docker image rm <image>` | `docker rmi <image>` | 删除一个或多个镜像 |
| `docker image inspect <image>` | `docker inspect <image>` | 显示镜像的底层详细信息 |

<details>
<summary><b>常用语法 (点击展开)</b></summary>

-   `docker image pull [OPTIONS] NAME[:TAG|@DIGEST]`
-   `docker image build [OPTIONS] PATH | URL | -`
    -   常用选项: `-t, --tag` (设置标签), `--no-cache` (禁用缓存)
-   `docker image rm [OPTIONS] IMAGE [IMAGE...]`
    -   常用选项: `-f, --force` (强制删除)
</details>

### 容器管理 (Container)

| 命令 (现代语法) | 旧版命令 | 描述 |
| :--- | :--- | :--- |
| `docker container run <image>` | `docker run <image>` | 从镜像创建并启动一个新容器 |
| `docker container ls` | `docker ps` | 列出**运行中**的容器 |
| `docker container ls -a` | `docker ps -a` | 列出**所有**容器（包括已停止的） |
| `docker container stop <container>` | `docker stop <container>` | 停止一个或多个运行中的容器 |
| `docker container start <container>` | `docker start <container>` | 启动一个或多个已停止的容器 |
| `docker container rm <container>` | `docker rm <container>` | 删除一个或多个已停止的容器 |
| `docker container logs [-f] <container>` | `docker logs [-f] <container>` | 查看容器的日志 (`-f` 持续跟踪) |
| `docker container exec -it <container> <cmd>` | `docker exec -it <container> <cmd>` | 在运行的容器内执行一个命令 |
| `docker container inspect <container>` | `docker inspect <container>` | 显示容器的底层详细信息 |

<details>
<summary><b>常用语法 (点击展开)</b></summary>

-   `docker container run [OPTIONS] IMAGE [COMMAND] [ARG...]`
    -   **注意顺序**: 所有 `[OPTIONS]` 必须在 `IMAGE` 之前。
    -   常用选项:
        -   `-d`: 后台运行
        -   `-p, --publish hostPort:containerPort`: 端口映射
        -   `--rm`: 容器停止后自动删除
        -   `-v, --volume hostPath:containerPath`: 挂载卷
        -   `-it`: 交互模式 (`-i` + `-t`)
-   `docker container exec [OPTIONS] CONTAINER COMMAND [ARG...]`
    -   常用选项: `-it` (交互模式)
-   `docker container logs [OPTIONS] CONTAINER`
    -   常用选项: `-f, --follow` (持续跟踪日志)
</details>

### 网络管理 (Network)

| 命令 | 描述 |
| :--- | :--- |
| `docker network ls` | 列出所有网络 |
| `docker network create <name>` | 创建一个用户自定义网络 |
| `docker network rm <name>` | 删除一个或多个网络 |
| `docker network inspect <name>` | 显示网络的详细信息 |

<details>
<summary><b>常用语法 (点击展开)</b></summary>

-   `docker network create [OPTIONS] NETWORK`
    -   常用选项: `--driver bridge` (指定网络驱动)
</details>

### 数据卷管理 (Volume)

| 命令 | 描述 |
| :--- | :--- |
| `docker volume ls` | 列出所有数据卷 |
| `docker volume create <name>` | 创建一个数据卷 |
| `docker volume rm <name>` | 删除一个或多个数据卷 |
| `docker volume inspect <name>` | 显示数据卷的详细信息 |

<details>
<summary><b>常用语法 (点击展开)</b></summary>

-   `docker volume create [OPTIONS] [VOLUME]`
</details>

### 系统管理 (System)

| 命令 | 描述 |
| :--- | :--- |
| `docker info` | 显示 Docker 系统范围的信息 |
| `docker builder prune` | 清理构建缓存 |
| `docker system prune -a` | **(危险)** 清理所有未使用的容器、镜像、网络和数据卷 |

### Docker Compose

| 命令 | 描述 |
| :--- | :--- |
| `docker compose up` | 创建并启动 `docker-compose.yml` 中定义的所有服务 |
| `docker compose down` | 停止并移除容器、网络 |
| `docker compose ps` | 列出 Compose 应用中的所有容器 |
| `docker compose logs [-f] [service]` | 查看一个或所有服务的日志 (`-f` 持续跟踪) |
| `docker compose exec <service> <cmd>` | 在指定服务容器内执行命令 |
| `docker compose build [service]` | 构建或重新构建一个或所有服务 |
| `docker compose pull [service]` | 拉取一个或所有服务的镜像 |
| `docker compose start [service]` | 启动一个或所有服务 |
| `docker compose stop [service]` | 停止一个或所有服务 |
| `docker compose restart [service]` | 重启一个或所有服务 |

<details>
<summary><b>常用语法 (点击展开)</b></summary>

-   `docker compose up [OPTIONS] [SERVICE...]`
    -   常用选项: `-d` (后台运行), `--build` (启动前构建镜像), `--force-recreate` (强制重新创建容器)
-   `docker compose down [OPTIONS]`
    -   常用选项: `-v, --volumes` (同时移除数据卷), `--rmi 'all'` (移除所有镜像)
</details>
