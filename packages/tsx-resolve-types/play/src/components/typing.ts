import type { Test2Props } from './typing2.ts'

export interface TableProps {
  test?: string
  test2?: string
  test4?: string
}

export const tablePropsDef: TableProps = {
  test: 'test111',
}

export type TestProps = Test2Props & TableProps
