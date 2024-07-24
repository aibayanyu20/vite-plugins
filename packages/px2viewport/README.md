# px2viewport

This is a Vite-based plugin used to convert inline px units to vw units.

## Installation

```bash
pnpm add @mistjs/vite-plugin-px2viewport
```

## Usage

In `vite.config.ts`:

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


## Options

- `viewportWidth` (number): The width of the viewport. Default: 750.
- `include` (string | RegExp | (string | RegExp)[]): The file path to be processed. Default: `/\.(vue|jsx|tsx)$/`.


## Example

### inline usage

**Input**

```vue
<template>
    <div style="width: 100px;height: 100px;"></div>
</template>
```

**Output**

```vue
<template>
    <div style="width: 13.33334vw;height: 13.33334vw;"></div>
</template>
```

### dynamic style

**Input**

```vue
<template>
    <div :style="{width: '100px', height: '100px'}"></div>
</template>
```

**Output**

```vue
<template>
    <div :style="{width: '13.33334vw', height: '13.33334vw'}"></div>
</template>
```


### dynamic by setup params

**Input**

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

Runtime compiled code auto resolve px to vw
