# 附录：实用技巧

## 配置国内镜像加速器

由于网络原因，直接从 Docker Hub (`hub.docker.com`) 拉取镜像可能会非常缓慢。配置国内的镜像加速器是提升 Docker 使用体验的**首要步骤**。

镜像加速器相当于一个位于国内的 Docker Hub 缓存服务器，可以极大地提高镜像下载速度。

### 如何配置

1.  打开 Docker Desktop。
2.  进入设置 (Settings)。
    - **macOS**: 点击屏幕顶部菜单栏的 Docker 图标 -> `Preferences...` -> `Docker Engine`。
    - **Windows**: 右键点击系统托盘中的 Docker 图标 -> `Settings` -> `Docker Engine`。
3.  在右侧的 JSON 配置文件中，找到或添加 `registry-mirrors` 字段，并将下方提供的加速器地址加进去。

    ```json
    {
      "builder": {
        "gc": {
          "defaultKeepStorage": "20GB",
          "enabled": true
        }
      },
      "experimental": false,
      "registry-mirrors": [
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://docker.m.daocloud.io",
        "https://docker.mirrors.ustc.edu.cn"
      ]
    }
    ```
    *注意：请不要修改或删除 JSON 文件中已有的其他配置。以上地址均为国内主流服务商提供的公开镜像，你可以根据自己的网络情况，选择一个或多个进行配置。*

4.  点击 `Apply & Restart` 按钮，Docker 将会重启并应用新的配置。

5.  **验证**：重启后，打开终端运行 `docker info`，在输出信息的最后部分，如果你能看到 `Registry Mirrors` 下列出了你刚才配置的地址，就说明配置成功了。

你可以根据自己的网络情况，选择上述地址中的一个或多个。

---

## 彻底清理 Docker 资源

随着时间的推移，你的 Docker 环境中可能会积累大量无用的镜像层、构建缓存、以及停止的容器，占用大量磁盘空间。定期清理是一种很好的习惯。

- **清理构建缓存**
  ```bash
  # 移除所有未被使用的构建缓存
  docker builder prune
  ```
  这个命令专门清理 BuildKit 产生的构建缓存，可以安全地释放大量空间。

- **终极清理命令**
  ```bash
  # 警告：此命令会删除所有未被使用的容器、网络、镜像（包括悬空镜像）和构建缓存！
  docker system prune -a
  ```
  这是一个非常强大的命令，用于进行全面、彻底的清理。请谨慎使用，确保你没有需要保留的已停止容器或未标记镜像。

---

## 使用“用后即焚”的临时容器

当你想在一个干净的环境里快速测试一个命令，或者进入一个工具镜像（如 `alpine`）进行一些临时操作时，反复地 `docker run` 和 `docker rm` 会很繁琐。

`--rm` 参数是你的好帮手。它会在容器的主进程退出后，自动将容器删除，省去了手动清理的步骤。

```bash
# 启动一个临时的 alpine 容器，执行 `ls -l` 后自动销毁
docker run --rm alpine ls -l

# 以交互模式进入一个临时的 node 环境，测试一段代码后，exit 退出即自动销毁
docker run --rm -it node:20-alpine
```

在日常调试和测试中，请多使用 `--rm` 参数，保持你的容器列表干净整洁。
