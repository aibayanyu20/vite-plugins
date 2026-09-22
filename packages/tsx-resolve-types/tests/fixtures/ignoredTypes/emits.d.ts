export type VueIgnore<T> = T
export interface TabsEmitsProps {
  onChange?: (key: string) => void
}
export interface ButtonEmitsProps {
  onClick?: (e: MouseEvent) => void
}
export interface Base {
  activeKey?: string
}
export interface TabsProps extends Base, TabsEmitsProps {
  centered?: boolean
}
export interface ButtonProps extends Base, VueIgnore<ButtonEmitsProps> {
  loading?: boolean
}
