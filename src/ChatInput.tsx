import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ChangeEvent } from 'react'
import type { ChatInputProps } from './ChatInput.types'
import './ChatInput.css'

/** akong ChatInput · Web · 类微信 / iMessage / WhatsApp */
export function ChatInput(props: ChatInputProps) {
  const {
    value,
    onChange,
    onSend,
    placeholder = '输入消息...',
    disabled = false,
    maxRows = 5,
    leadingActions,
    trailingActions,
    sendLabel = '发送',
    inputMode = 'text',
  } = props

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const composingRef = useRef(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  /** trim 后是否可发送 */
  const canSend = !disabled && value.trim().length > 0

  /** 真发送 · trim · 空守卫 · 一处出 */
  const fire = useCallback(() => {
    if (disabled) return
    const text = value.trim()
    if (text.length === 0) return
    onSend(text)
  }, [disabled, value, onSend])

  /** auto-resize · 跟内容 + maxRows · 超出滚动 */
  useLayoutEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    // 重置高度让 scrollHeight 反映真内容
    ta.style.height = 'auto'
    // 读 line-height (px) · 没有显式则按 font-size * 1.4 兜底
    const cs = window.getComputedStyle(ta)
    const lineHeight = parseFloat(cs.lineHeight)
    const padTop = parseFloat(cs.paddingTop) || 0
    const padBottom = parseFloat(cs.paddingBottom) || 0
    const lh = Number.isFinite(lineHeight) ? lineHeight : parseFloat(cs.fontSize) * 1.4
    const maxHeight = lh * maxRows + padTop + padBottom
    const next = Math.min(ta.scrollHeight, maxHeight)
    ta.style.height = `${next}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value, maxRows])

  /** iOS 软键盘弹起 · visualViewport 监听 · transform 补偿 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      // window.innerHeight - visualViewport.height ≈ 软键盘占用高
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOffset(offset)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return
    // IME 拼音过程中 Enter 不发送 (中日韩输入法守卫)
    if (composingRef.current || e.nativeEvent.isComposing) return
    // Shift+Enter 允许换行 · 不发送
    if (e.shiftKey) return
    e.preventDefault()
    fire()
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleSendClick = () => {
    fire()
  }

  const rootStyle: CSSProperties = {
    // 把键盘高度作为 CSS var · CSS 用 transform 应用
    ['--ak-kb-offset' as string]: `${keyboardOffset}px`,
  }

  return (
    <div className="ak-chat-input" style={rootStyle} data-testid="ak-chat-input">
      {leadingActions !== undefined && (
        <div className="ak-chat-input__slot" data-testid="ak-chat-input-leading">
          {leadingActions}
        </div>
      )}
      <div className="ak-chat-input__field">
        <textarea
          ref={textareaRef}
          className="ak-chat-input__textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={() => {
            composingRef.current = false
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          enterKeyHint="send"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode={inputMode}
          data-testid="ak-chat-input-textarea"
        />
      </div>
      {trailingActions !== undefined && (
        <div className="ak-chat-input__slot" data-testid="ak-chat-input-trailing">
          {trailingActions}
        </div>
      )}
      <button
        type="button"
        className="ak-chat-input__send"
        onClick={handleSendClick}
        disabled={!canSend}
        aria-disabled={!canSend || undefined}
        data-testid="ak-chat-input-send"
      >
        {sendLabel}
      </button>
    </div>
  )
}

export default ChatInput
