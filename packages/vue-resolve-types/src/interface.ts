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
}
