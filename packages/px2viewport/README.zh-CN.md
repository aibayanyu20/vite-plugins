# px2viewport

这是一个基于vite的插件，用于将写在行内的px单位转换为vw单位。

## 安装

```bash
pnpm add @mistjs/vite-plugin-px2viewport
```

## 使用

在 `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import {px2viewport} from '@mistjs/vite-plugin-px2viewport'

export default defineConfig({
    plugins: [
        px2viewport({
            viewportWidth: 750
        })
    ],
})
```
