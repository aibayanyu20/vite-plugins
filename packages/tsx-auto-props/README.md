# vite-plugin-tsx-auto-props

Vue does not provide a way to automatically specify props for functional components written in TSX. This plugin solves this problem.


## Install

```bash
pnpm add vite-plugin-tsx-auto-props -D
```
## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tsxAutoProps } from 'vite-plugin-tsx-auto-props'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
    plugins: [
        tsxAutoProps(),
        vueJsx(),
    ],
})
```


## Example


### Single File

```tsx
export interface Props {
    foo: string
    bar: number
}

export const Single = defineComponent<Props>(() => {
    return () => {
        return <div></div>
    }
})
```

### Multiple Files

```ts
// typing.ts
export interface Props {
    foo: string
    bar: number
}

```


```tsx
// component.tsx
export const Single = defineComponent<Props>(() => {
    return () => {
        return <div></div>
    }
})
```

### Support Demos

```tsx
import { defineComponent } from 'vue'
import type { Props } from './typing'

export interface Props1 {
  foo1: string
  bar1: number
}

export type Props2 = Props & Props1
export type Props3 = Pick<Props2, 'foo1' | 'foo'>

export const Single = defineComponent<Props>(() => {
  return () => {
    return <div></div>
  }
})

export const Single2 = defineComponent((_props: Props2) => {
  return () => {
    return <div></div>
  }
})

export const Single3 = defineComponent({
  setup(_props: Props3) {
    return () => {
      return <div></div>
    }
  },
})

```

## Acknowledgements

- Thanks to [unplugin-vue-tsx-auto-props](https://github.com/unplugin/unplugin-vue-tsx-auto-props) for inspiration/code snippet/etc.


## License

MIT. Made with ❤️ by [aibayanyu20](https://github.com/aibayanyu20)

