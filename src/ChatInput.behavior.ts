/**
 * 跨端行为契约 · Web + RN 都遵循
 *
 * 写法是"给定 props + 输入 · 期望 onSend 是否触发 / 触发文本"的纯描述
 * 各端测试 import 这份 spec 跑 · 行为强一致
 */

export type SendOutcome =
  | { fired: false }
  | { fired: true; text: string }

export interface SendScenario {
  name: string
  /** 用户键入的原始内容 (保留首尾空白用于测试 trim) */
  value: string
  props: { disabled?: boolean }
  /** 模拟一次 "tap 发送" / "Enter 发送" 的期望 */
  outcome: SendOutcome
}

/** 共享场景 · Web + RN 都跑 */
export const sendScenarios: SendScenario[] = [
  {
    name: 'default · 有内容 · 发送触发 · trim',
    value: '  hi  ',
    props: {},
    outcome: { fired: true, text: 'hi' },
  },
  {
    name: '空字符串 · 不触发',
    value: '',
    props: {},
    outcome: { fired: false },
  },
  {
    name: '纯空白 · 不触发',
    value: '   \n\t  ',
    props: {},
    outcome: { fired: false },
  },
  {
    name: 'disabled · 即使有内容也不触发',
    value: 'hello',
    props: { disabled: true },
    outcome: { fired: false },
  },
]
