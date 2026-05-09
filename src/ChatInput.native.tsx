/**
 * akong ChatInput · React Native 实现
 *
 * Metro bundler 默认按 `.native.tsx` 后缀解析 RN 端 · `.tsx` 解析 Web 端
 * 用方 `import { ChatInput } from '@aily-ui/chat-input'` 自动取对应平台
 */

import { useCallback } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native'
import { tokens } from '@aily-ui/tokens'
import type { ChatInputProps } from './ChatInput.types'

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
  } = props

  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark'
  const t = scheme === 'dark' ? tokens.dark : tokens.light

  const canSend = !disabled && value.trim().length > 0

  const fire = useCallback(() => {
    if (disabled) return
    const text = value.trim()
    if (text.length === 0) return
    onSend(text)
  }, [disabled, value, onSend])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        backgroundColor: t.bgElevated,
        borderTopWidth: 1,
        borderTopColor: t.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: tokens.space[2],
          paddingHorizontal: tokens.space[3],
          paddingTop: tokens.space[2],
          paddingBottom: tokens.space[2],
        }}
      >
        {leadingActions ? (
          <View style={{ paddingBottom: tokens.space[2] }}>{leadingActions}</View>
        ) : null}

        <View
          style={{
            flex: 1,
            backgroundColor: t.bgSubtle,
            borderRadius: tokens.radius['2xl'],
            paddingHorizontal: tokens.space[3],
            paddingVertical: tokens.space[2],
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={t.fgSubtle}
            editable={!disabled}
            multiline
            // Android 限行 · iOS 通过下面 maxHeight style 限
            numberOfLines={maxRows}
            returnKeyType="send"
            blurOnSubmit={false}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={fire}
            style={{
              color: t.fg,
              fontSize: tokens.text.base,
              lineHeight: tokens.text.base * 1.4,
              padding: 0,
              margin: 0,
              minHeight: tokens.text.base * 1.4,
              maxHeight: tokens.text.base * 1.4 * maxRows,
            }}
          />
        </View>

        {trailingActions ? (
          <View style={{ paddingBottom: tokens.space[2] }}>{trailingActions}</View>
        ) : null}

        <Pressable
          onPress={fire}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          accessibilityState={{ disabled: !canSend }}
          style={({ pressed }: { pressed: boolean }) => ({
            height: 36,
            paddingHorizontal: tokens.space[4],
            borderRadius: tokens.radius.full,
            backgroundColor: t.fg,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            opacity: !canSend ? 0.4 : pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: t.fgInverse,
              fontSize: tokens.text.sm,
              fontWeight: tokens.weight.medium,
            }}
          >
            {sendLabel}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatInput
