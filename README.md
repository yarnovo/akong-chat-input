# @akong/chat-input

akong ChatInput · 类微信 / iMessage / WhatsApp 聊天输入框 · 跨端 (Web + React Native)

## Demo

[GitHub Pages 演示](https://yarnovo.github.io/akong-chat-input/)

## 安装

```bash
npm i github:yarnovo/akong-chat-input github:yarnovo/akong-tokens
```

## Web

```tsx
import { useState } from 'react'
import { ChatInput } from '@akong/chat-input'
import '@akong/chat-input/style.css'
import '@akong/tokens/style.css'  // 顶层引一次 token

function Demo() {
  const [v, setV] = useState('')
  return (
    <ChatInput
      value={v}
      onChange={setV}
      onSend={(text) => {
        console.log('send:', text)
        setV('')
      }}
      leadingActions={<button aria-label="附件">+</button>}
      trailingActions={<button aria-label="emoji">😀</button>}
    />
  )
}
```

## React Native

```tsx
import { ChatInput } from '@akong/chat-input'

<ChatInput value={v} onChange={setV} onSend={(text) => send(text)} />
```

Metro bundler 自动按 `.native.tsx` 后缀解析 · 同 `import` 路径两端通用。

## API

| Prop | Type | Default | 说明 |
|---|---|---|---|
| value | string | — | 受控 |
| onChange | (v: string) => void | — | 内容变化 |
| onSend | (text: string) => void | — | Enter / 点发送 触发 · 自动 trim · 空不发 |
| placeholder | string | `'输入消息...'` | |
| disabled | boolean | false | 整体禁用 |
| maxRows | number | 5 | textarea 自动换行 ≤ N 行 · 超过滚动 |
| leadingActions | ReactNode | — | 左侧 slot · 比如附件按钮 |
| trailingActions | ReactNode | — | 右侧紧贴发送之前 · 比如 emoji |
| sendLabel | string | `'发送'` | 发送按钮文案 |
| inputMode | `'text'` / `'search'` | `'text'` | Web 输入模式 hint |

## 行为

- **Enter 发送** · `enterKeyHint='send'` 移动键盘显"发送"
- **Shift+Enter 换行** · 不发送
- **IME 拼音守卫** · `compositionstart/End` + `isComposing` · 拼音过程 Enter 不发
- **空白 trim** · 全空白当空 · 不发
- **auto-resize** · 跟内容增高 · 到 `maxRows` 行后内部滚动
- **iOS 软键盘补偿** · `visualViewport` 监听 · 弹起时 transform 上移
- **safe-area** · 底部 `env(safe-area-inset-bottom)` 留刘海

## 设计原则

- **一份 props**：Web 跟 RN 共享 `ChatInput.types.ts`
- **两端实现**：`ChatInput.tsx` (Web · DOM `<textarea>` + `<button>`) + `ChatInput.native.tsx` (RN · `KeyboardAvoidingView` + `TextInput` + `Pressable`)
- **token 100% 接 @akong/tokens**：改一处 token 自动 update
- **共享行为契约**：`ChatInput.behavior.ts` 跨端 spec · 测试都跑同一份

## 视觉

- sticky bottom · `bg var(--ak-bg-elevated)` · `border-top 1px var(--ak-border)`
- textarea: `bg var(--ak-bg-subtle)` · `radius 2xl` · padding 8/12
- send button: `bg var(--ak-fg)` · `color var(--ak-fg-inverse)` · `radius full`
- disabled / 空内容时 send 按钮 opacity 0.4

## 测试

```bash
npm test
npm run typecheck
```

≥ 20 cases · 覆盖：受控 / send 触发 / IME / Shift+Enter / maxRows / slot / disabled / placeholder / sendLabel / inputMode / 共享 spec。
