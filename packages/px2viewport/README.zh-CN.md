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
## 参数

- `viewportWidth` (number): 视口的宽度。默认值: 750.
- `include` (string | RegExp | (string | RegExp)[]): 要处理的文件路径。默认值: `/\.(vue|jsx|tsx)$/`.
- `unitToConvert` (string): 要转换的单位。默认值: `px`.
- `unitPrecision` (number): 允许的小数位数。默认值: 5.
- `viewportUnit` (string): 要转换为的单位。默认值: `vw`.
- `minPixelValue` (number): 要转换的最小像素值。
- `cssOptions` (object): 与 (https://github.com/lkxian888/postcss-px-to-viewport-8-plugin#api-%E8%AF%B4%E6%98%8E) 相同

> [!WARNING]
> `cssOptions` 仅支持 `postcss` 插件，不支持行内样式和动态样式。


## 例子

### 行内样式处理

你可以通过我们的插件实现基础静态行内样式的处理：
**输入**

```vue
<template>
    <div style="width: 100px;height: 100px;"></div>
</template>
```

**输出**

```vue
<template>
    <div style="width: 13.33334vw;height: 13.33334vw;"></div>
</template>
```

### 动态样处理

**输入**

```vue
<template>
    <div :style="{width: '100px', height: '100px'}"></div>
</template>
```

**输出**

```vue
<template>
    <div :style="{width: '13.33334vw', height: '13.33334vw'}"></div>
</template>
```


### 动态自定义处理

**输入**

```vue
<script lang="ts" setup>
  import { computed } from "vue"
  const styles = computed(()=>{
    return {
      width: '100px',
      height: '100px'
    }
  })
</script>
<template>
    <div style="font-size: 18px" :style="styles"></div>
</template>
```

在运行时会自动处理px到vw的转换。
