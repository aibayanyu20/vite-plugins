export interface UserOptions {
  include?: (id: string) => boolean
  /**
   * enable type-based defineProps transform
   * @default true
   */
  props?: boolean
  /**
   * enable type-based defineEmits transform
   * @default true
   */
  emits?: boolean
  /**
   * align runtime props inference with vue compiler-sfc production mode
   */
  isProd?: boolean
  /**
   * align custom element runtime props generation behavior
   */
  customElement?: boolean | ((filename: string) => boolean)
  /**
   * override fs for imported type resolution
   */
  fs?: {
    fileExists: (file: string) => boolean
    readFile: (file: string) => string | undefined
    realpath?: (file: string) => string
  }
}
