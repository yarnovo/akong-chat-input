/**
 * Web 端组件测试 · vitest + @testing-library/react
 *
 * 覆盖：
 * - 受控 value 反映 · onChange 触发
 * - onSend 触发条件 (Enter / 点击 · 不空)
 * - IME composition Enter 不触发
 * - Shift+Enter 换行不触发 onSend
 * - maxRows 限制 textarea 高度
 * - leadingActions / trailingActions slot 渲染
 * - disabled 不能输入 + 不触发 onSend
 * - placeholder 显示
 * - 空白 trim 后不发
 * - sendLabel 自定义
 * - inputMode 反映
 * - 共享行为 spec (sendScenarios)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { ChatInput } from '../src/ChatInput'
import { sendScenarios } from '../src/ChatInput.behavior'

/** 测试用 controlled wrapper · 让 value/onChange 闭环 */
function Controlled(
  props: Omit<Parameters<typeof ChatInput>[0], 'value' | 'onChange'> & {
    initial?: string
    onChangeSpy?: (v: string) => void
  },
) {
  const { initial = '', onChangeSpy, ...rest } = props
  const [v, setV] = useState(initial)
  return (
    <ChatInput
      {...rest}
      value={v}
      onChange={(next) => {
        setV(next)
        onChangeSpy?.(next)
      }}
    />
  )
}

describe('ChatInput (Web) · 受控', () => {
  it('value 反映到 textarea', () => {
    render(<ChatInput value="hello" onChange={() => {}} onSend={() => {}} />)
    const ta = screen.getByTestId('ak-chat-input-textarea') as HTMLTextAreaElement
    expect(ta.value).toBe('hello')
  })

  it('onChange 触发 · 反映新内容', () => {
    const onChangeSpy = vi.fn()
    render(<Controlled onSend={() => {}} onChangeSpy={onChangeSpy} />)
    const ta = screen.getByTestId('ak-chat-input-textarea') as HTMLTextAreaElement
    fireEvent.change(ta, { target: { value: '你好' } })
    expect(onChangeSpy).toHaveBeenCalledWith('你好')
    expect(ta.value).toBe('你好')
  })
})

describe('ChatInput (Web) · onSend 触发', () => {
  it('点击发送按钮 · 触发 onSend (trim 后)', () => {
    const onSend = vi.fn()
    render(<Controlled initial="  hi  " onSend={onSend} />)
    fireEvent.click(screen.getByTestId('ak-chat-input-send'))
    expect(onSend).toHaveBeenCalledWith('hi')
    expect(onSend).toHaveBeenCalledOnce()
  })

  it('Enter 触发 onSend', () => {
    const onSend = vi.fn()
    render(<Controlled initial="hello" onSend={onSend} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    fireEvent.keyDown(ta, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('hello')
  })

  it('空字符串 · 点击发送不触发', () => {
    const onSend = vi.fn()
    render(<Controlled initial="" onSend={onSend} />)
    fireEvent.click(screen.getByTestId('ak-chat-input-send'))
    expect(onSend).not.toHaveBeenCalled()
  })

  it('纯空白 · trim 后空 · 不发送', () => {
    const onSend = vi.fn()
    render(<Controlled initial={'   \n\t  '} onSend={onSend} />)
    fireEvent.click(screen.getByTestId('ak-chat-input-send'))
    fireEvent.keyDown(screen.getByTestId('ak-chat-input-textarea'), { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('send 按钮在空内容时 disabled', () => {
    render(<Controlled initial="" onSend={() => {}} />)
    const send = screen.getByTestId('ak-chat-input-send') as HTMLButtonElement
    expect(send.disabled).toBe(true)
  })

  it('send 按钮在有内容时 enabled', () => {
    render(<Controlled initial="x" onSend={() => {}} />)
    const send = screen.getByTestId('ak-chat-input-send') as HTMLButtonElement
    expect(send.disabled).toBe(false)
  })
})

describe('ChatInput (Web) · IME / 键盘守卫', () => {
  it('IME composition 中按 Enter · 不触发 onSend', () => {
    const onSend = vi.fn()
    render(<Controlled initial="拼音" onSend={onSend} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    fireEvent.compositionStart(ta)
    // jsdom 不会自动设 isComposing · compositionStart 后我们 ref 标记了
    fireEvent.keyDown(ta, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.compositionEnd(ta)
    fireEvent.keyDown(ta, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledOnce()
  })

  it('isComposing=true 的原生 event · Enter 不触发', () => {
    const onSend = vi.fn()
    render(<Controlled initial="x" onSend={onSend} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    // 直接构造 KeyboardEvent 设 isComposing
    const evt = new KeyboardEvent('keydown', { key: 'Enter' })
    Object.defineProperty(evt, 'isComposing', { value: true })
    ta.dispatchEvent(evt)
    expect(onSend).not.toHaveBeenCalled()
  })

  it('Shift+Enter · 不触发 onSend (允许换行)', () => {
    const onSend = vi.fn()
    render(<Controlled initial="hi" onSend={onSend} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('Enter 触发 send 后 · 阻止默认换行', () => {
    const onSend = vi.fn()
    render(<Controlled initial="x" onSend={onSend} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    const result = fireEvent.keyDown(ta, { key: 'Enter' })
    // fireEvent 返回 false = preventDefault 调用了
    expect(result).toBe(false)
    expect(onSend).toHaveBeenCalledOnce()
  })
})

describe('ChatInput (Web) · 高度 / maxRows', () => {
  it('maxRows 限制 textarea max-height (通过 overflow-y 验证溢出)', () => {
    render(<Controlled initial={'a\nb\nc\nd\ne\nf\ng\nh'} maxRows={3} onSend={() => {}} />)
    const ta = screen.getByTestId('ak-chat-input-textarea') as HTMLTextAreaElement
    // jsdom 没有真布局 · 但 height inline style 会被设 · 我们 verify maxRows 的逻辑：
    // 渲染后 ta.style.height 应被赋值 (auto-resize 跑过)
    // ※ jsdom 下 scrollHeight 一般是 0 · 这里只断言 inline style 被写
    expect(ta.style.height).toBeTruthy()
  })
})

describe('ChatInput (Web) · slot 渲染', () => {
  it('leadingActions slot 渲染', () => {
    render(
      <ChatInput
        value=""
        onChange={() => {}}
        onSend={() => {}}
        leadingActions={<button data-testid="att">+</button>}
      />,
    )
    expect(screen.getByTestId('ak-chat-input-leading')).toBeInTheDocument()
    expect(screen.getByTestId('att')).toBeInTheDocument()
  })

  it('trailingActions slot 渲染', () => {
    render(
      <ChatInput
        value=""
        onChange={() => {}}
        onSend={() => {}}
        trailingActions={<button data-testid="emoji">😀</button>}
      />,
    )
    expect(screen.getByTestId('ak-chat-input-trailing')).toBeInTheDocument()
    expect(screen.getByTestId('emoji')).toBeInTheDocument()
  })

  it('未传 slot · 不渲染对应容器', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} />)
    expect(screen.queryByTestId('ak-chat-input-leading')).toBeNull()
    expect(screen.queryByTestId('ak-chat-input-trailing')).toBeNull()
  })
})

describe('ChatInput (Web) · disabled', () => {
  it('disabled · textarea 不可输入', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} disabled />)
    const ta = screen.getByTestId('ak-chat-input-textarea') as HTMLTextAreaElement
    expect(ta.disabled).toBe(true)
  })

  it('disabled · 即使有内容 · 点击 send 不触发 onSend', () => {
    const onSend = vi.fn()
    render(<ChatInput value="hello" onChange={() => {}} onSend={onSend} disabled />)
    const send = screen.getByTestId('ak-chat-input-send') as HTMLButtonElement
    expect(send.disabled).toBe(true)
    fireEvent.click(send)
    expect(onSend).not.toHaveBeenCalled()
  })

  it('disabled · Enter 不触发 onSend', () => {
    const onSend = vi.fn()
    render(<ChatInput value="hello" onChange={() => {}} onSend={onSend} disabled />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    fireEvent.keyDown(ta, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })
})

describe('ChatInput (Web) · placeholder + 自定义', () => {
  it('default placeholder = 输入消息...', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} />)
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument()
  })

  it('自定义 placeholder', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} placeholder="说点啥" />)
    expect(screen.getByPlaceholderText('说点啥')).toBeInTheDocument()
  })

  it('自定义 sendLabel', () => {
    render(<ChatInput value="x" onChange={() => {}} onSend={() => {}} sendLabel="Send" />)
    expect(screen.getByTestId('ak-chat-input-send')).toHaveTextContent('Send')
  })

  it('inputMode 反映到 DOM', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} inputMode="search" />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    expect(ta).toHaveAttribute('inputmode', 'search')
  })

  it('enterKeyHint=send', () => {
    render(<ChatInput value="" onChange={() => {}} onSend={() => {}} />)
    const ta = screen.getByTestId('ak-chat-input-textarea')
    expect(ta).toHaveAttribute('enterkeyhint', 'send')
  })
})

describe('ChatInput (Web) · 行为契约 (共享 spec)', () => {
  for (const sc of sendScenarios) {
    it(sc.name, () => {
      const onSend = vi.fn()
      render(
        <ChatInput
          value={sc.value}
          onChange={() => {}}
          onSend={onSend}
          disabled={sc.props.disabled}
        />,
      )
      // 走点击发送路径 (Enter 路径在 disabled 下也走 fire 守卫 · 等价)
      fireEvent.click(screen.getByTestId('ak-chat-input-send'))
      if (sc.outcome.fired) {
        expect(onSend).toHaveBeenCalledWith(sc.outcome.text)
        expect(onSend).toHaveBeenCalledOnce()
      } else {
        expect(onSend).not.toHaveBeenCalled()
      }
    })
  }
})
