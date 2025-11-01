import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "前端 Docker 实战",
  description: "一份专为前端专家设计的 Docker 实战教程",
  base: '/Docker-Guide-For-Frontend/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/miniliupeng/Docker-Guide-For-Frontend' }
    ],
    sidebar: [
      {
        text: '教程介绍',
        items: [
          { text: '为什么前端要学 Docker', link: '/introduction/README' },
        ]
      },
      {
        text: '第一部分：Docker 基础',
        items: [
          { text: '第一章：基础入门', link: '/chapter-1-basics/README' },
          { text: '第二章：容器化你的应用', link: '/chapter-2-containerizing-frontend/README' },
          { text: '第三章：优化镜像', link: '/chapter-3-optimizing-images/README' },
          { text: '第四章：深入原理', link: '/chapter-4-internals/README' }
        ]
      },
      {
        text: '第二部分：进阶实战',
        items: [
          { text: '第五章：Docker Compose', link: '/chapter-5-docker-compose/README' },
          { text: '第六章：自动化 CI/CD', link: '/chapter-6-advanced-devops/README' },
          { text: '第七章：初探 Kubernetes', link: '/chapter-7-kubernetes-intro/README' }
        ]
      },
      {
        text: '附录',
        items: [
          { text: '常用命令速查表', link: '/appendix/cheatsheet' },
          { text: '实用技巧', link: '/appendix/practical-tips' },
          { text: '面试问题索引', link: '/appendix/interview-q-a' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/miniliupeng/Docker-Guide-For-Frontend' }
    ]
  }
})
