# vue-resolve-types

Type-based Vue SFC macro resolver plugin for Vite.

It converts `<script setup lang="ts">` / `<script setup lang="tsx">` macro types into runtime declarations:

- `defineProps<Type>()` -> `defineProps({...})`
- `withDefaults(defineProps<Type>(), defaults)` -> `defineProps(...)`
- `defineEmits<Type>()` -> `defineEmits([...])`

The runtime type resolution is powered by `@v-c/resolve-types`.

## Install

```bash
pnpm add -D vite-plugin-vue-resolve-types
```

## Usage

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueResolveTypes } from 'vite-plugin-vue-resolve-types'

export default defineConfig({
  plugins: [
    vueResolveTypes(),
    vue(),
  ],
})
```

## Plugin Order (Important)

`vueResolveTypes()` must run **before** `@vitejs/plugin-vue`.

Reason:

- this plugin rewrites `<script setup>` macro calls (`defineProps` / `defineEmits`) at the SFC source level
- `@vitejs/plugin-vue` runs Vue SFC compilation (`compileScript`) afterwards
- if `vueResolveTypes()` runs after `vue()`, the macro type information is already consumed and this plugin can no longer transform it

Recommended:

```ts
plugins: [
  vueResolveTypes(),
  vue(),
]
```

Do not use:

```ts
plugins: [
  vue(),
  vueResolveTypes(),
]
```

## Example

### `defineProps<Type>()`

```vue
<script setup lang="ts">
interface Props {
  foo: string
  count?: number
}

const props = defineProps<Props>()
</script>
```

Transformed (simplified):

```ts
const props = defineProps({
  foo: { type: String, required: true },
  count: { type: Number, required: false },
})
```

### `withDefaults(defineProps<Type>(), ...)`

```vue
<script setup lang="ts">
interface Props {
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 12,
})
</script>
```

Transformed (simplified):

```ts
const props = defineProps({
  size: { type: Number, required: false, default: 12 },
})
```

For dynamic defaults (e.g. imported `defaults`), the plugin injects Vue's `mergeDefaults` helper import when needed.

### `defineEmits<Type>()`

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', value: string): void
  (e: 'update:modelValue', value: number): void
}>()
</script>
```

Transformed (simplified):

```ts
const emit = defineEmits(["change", "update:modelValue"])
```

## Options

```ts
vueResolveTypes({
  props: true,
  emits: true,
  isProd: false,
  include: (id) => id.endsWith('.vue'),
})
```

### `props`

- Type: `boolean`
- Default: `true`

Enable/disable `defineProps<Type>()` transform.

### `emits`

- Type: `boolean`
- Default: `true`

Enable/disable `defineEmits<Type>()` transform.

### `include`

- Type: `(id: string) => boolean`

Custom file filter. If provided and returns `false`, the transform is skipped.

### `isProd`

- Type: `boolean`

Pass-through to the underlying Vue SFC type resolution context to align runtime props output with Vue production mode behavior.

### `customElement`

- Type: `boolean | ((filename: string) => boolean)`

Pass-through to align runtime props output with Vue custom element mode behavior.

### `fs`

- Type: `{ fileExists; readFile; realpath? }`

Override file system access used when resolving imported types.

## Scope / Non-goals (current)

- Focuses on **type -> runtime props/emits** conversion only.
- Does **not** implement Vue compiler's full `<script setup>` transform pipeline.
- Does not replace Vue's reactive destructure rewrite logic; destructure defaults are left for Vue `compileScript` to handle after this plugin.

## Status

The package includes tests adapted from Vue `compiler-sfc` macro tests (`defineProps`, `definePropsDestructure`, `defineEmits`) for the type-to-runtime conversion scope.

## License

MIT
