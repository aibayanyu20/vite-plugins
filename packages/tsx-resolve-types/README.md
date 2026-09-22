# tsx-resolve-types

vue3-tsx type annotation parser plugin based on vite.


## Install

```bash

pnpm add vite-plugin-tsx-resolve-types -D

```

## Usage

In `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
    plugins: [
        tsxResolveTypes(),
        vueJsx(),
    ],
})
```

## Options

```ts
tsxResolveTypes({
  // infer `props` from types (default: true)
  props: true,
  // infer `emits` from types (default: true)
  emits: true,
  // add `default: undefined` to optional props (or only for the listed constructors)
  defaultPropsToUndefined: true,
  // type names that must not become runtime props
  ignoreTypes: [/EmitsProps$/],
})
```

### `ignoreTypes`

Some types must be visible to TypeScript but must not turn into runtime
props: emit-style props interfaces, huge DOM attribute types, and so on.
In source files you can mark them with `/* @vue-ignore */`, but that comment
does not survive `.d.ts` emit, so it is lost for every type consumed from a
published package.

`ignoreTypes` matches the local reference name (the last segment of a
qualified name) with exact strings, regular expressions, or a predicate
`(name, { filename }) => boolean`. A matching type contributes no members in
an `extends`/intersection position and infers to `null` when used as a prop
type. Anchor your patterns, `[/EmitsProps$/]` rather than `[/Emits/]`.

Independently of this option, the identity wrapper `VueIgnore<T>` exported by
`@v-c/util/dist/type` is always recognised, and it survives declaration emit:

```ts
import type { VueIgnore } from '@v-c/util/dist/type'

interface Props extends Base, VueIgnore<Emits> {
  heavy?: VueIgnore<HTMLAttributes>
}
```

## Example

### Props

Supports automatic parsing of props types and generates corresponding props entity objects.

```tsx
import { defineComponent } from "vue";

export interface Props {
    foo: string
    bar?: number
}

const Single = defineComponent<Props>((props) => {
    return () => {
        return <div>{props.foo}</div>
    }
})

const SingleDefault = defineComponent((props:Props = {foo:'1',bar:'2'})=>{
    return ()=>{
        return <div>{props.foo}</div>
    }
})

const SingleDefault2 = defineComponent<Props>((props = {foo:'1',bar:'2'})=>{
    return () =>{
        return <div>{props.foo}</div>
    }
})

const Setup = defineComponent({
    setup(props:Props){
        return ()=>{
            return <div>{props.foo}</div>
        }
    }
})

const SetupDefault = defineComponent({
    setup(props:Props = {foo:'1',bar:'2'}){
        return ()=>{
            return <div>{props.foo}</div>
        }
    }
})

const SetupDefault2 = defineComponent<Props>({
    setup(props = {foo:'1',bar:'2'}){
        return ()=>{
            return <div>{props.foo}</div>
        }
    }
})

```

You can separately define a type file import method to use.

```ts
// typing.ts
export interface Props {
    foo: string
    bar?: number
}

export const defaultProps:Props = {
    foo:'1',
    bar:2
}

```

```tsx
import { defineComponent } from "vue";
import { type Props, defaultProps} from "./typing"

const Single = defineComponent<Props>((props) => {
    return () => {
        return <div>{props.foo}</div>
    }
})

const SingleDefault = defineComponent((props:Props = defaultProps)=>{
    return ()=>{
        return <div>{props.foo}</div>
    }
})

const Setup = defineComponent({
    setup(props:Props){
        return ()=>{
            return <div>{props.foo}</div>
        }
    }
})

const SetupDefault = defineComponent({
    setup(props:Props = defaultProps){
        return ()=>{
            return <div>{props.foo}</div>
        }
    }
})

```


### Emits

Supports automatic parsing of emits types and generates corresponding emits entity objects.

```tsx
import { defineComponent } from "vue";
export interface Props {
    foo: string
    bar?: number
}

interface Emits {
    'click':[string]
}
const Single = defineComponent((props:Props,ctx:SetupContext<{
    'click':[string]
}>)=>{
    return ()=>{
        return <div onClick={()=>ctx.emit('click','1')}>{props.foo}</div>
    }
})

const TypeSingle = defineComponent<Props>((props,ctx:SetupContext<Emits>)=>{
    return ()=>{
        return <div onClick={()=>ctx.emit('click','1')}>{props.foo}</div>
    }
})

const Setup = defineComponent({
    setup(props:Props,ctx:SetupContext<{
        'click':[string]
    }>) {
        return ()=>{
            return <div onClick={()=>ctx.emit('click','1')}>{props.foo}</div>
        }
    }
})



const TypeSetup = defineComponent({
    setup(props:Props,ctx:SetupContext<Emits>) {
        return ()=>{
            return <div onClick={()=>ctx.emit('click','1')}>{props.foo}</div>
        }
    }
})

```


## License

MIT. Made with ❤️ by [aibayanyu20](https://github.com/aibayanyu20)
