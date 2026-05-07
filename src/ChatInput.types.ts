import type { ReactNode } from 'react'

export interface ChatInputProps {
  /** 受控值 */
  value: string
  /** 内容变化 */
  onChange: (v: string) => void
  /** 回车 / 点击发送 触发 · 自动 trim · 空不触发 */
  onSend: (text: string) => void
  /** 占位文案 · default '输入消息...' */
  placeholder?: string
  /** 整体禁用 · textarea 不可输入 + send 不触发 */
  disabled?: boolean
  /** textarea 自动换行 ≤ N 行 · 超过滚动 · default 5 */
  maxRows?: number
  /** 左侧 slot · 比如 + 附件按钮 · 多个 button */
  leadingActions?: ReactNode
  /** 右侧紧贴发送之前 · 比如 emoji 按钮 */
  trailingActions?: ReactNode
  /** 发送按钮文案 · default '发送' */
  sendLabel?: string
  /** Web 输入模式 hint */
  inputMode?: 'text' | 'search'
}
