import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { List as VirtualList, useListRef } from 'react-window'
import TypeWriter from '@/components/TypeWriter'
import { aiStreamChat } from '@/utils/sseRequest'
import { useChatStore } from '@/store/useChatStore'

type ChatRowProps = {
  ariaAttributes?: {
    'aria-posinset': number
    'aria-setsize': number
    role: 'listitem'
  }
  index?: number
  latestAssistantId: string
  messageList: Array<{
    content: string
    id: string
    role: 'assistant' | 'user'
  }>
  onTypingComplete: (content: string) => void
  style?: CSSProperties
}

function ChatRow({
  ariaAttributes,
  index,
  latestAssistantId,
  messageList,
  onTypingComplete,
  style
}: ChatRowProps) {
  if (index === undefined) {
    return null
  }

  const item = messageList[index]

  if (!item) {
    return null
  }

  return (
    <div
      {...ariaAttributes}
      className="px-2 py-1"
      style={style}
    >
      <div
        className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-lg p-3 mb-2 rounded-xl whitespace-pre-wrap ${
            item.role === 'user'
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {item.role === 'user' ? (
            item.content
          ) : (
            <TypeWriter
              content={item.content}
              onComplete={
                item.id === latestAssistantId ? onTypingComplete : undefined
              }
              speed={20}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [inputText, setInputText] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)
  const answerLockRef = useRef(false)
  const streamFinishedRef = useRef(true)
  const typingFinishedRef = useRef(true)
  const latestAssistantContentRef = useRef('')

  const sseInstanceRef = useRef<{ close: () => void } | null>(null)
  const vListRef = useListRef(null)
  const previousActiveSessionIdRef = useRef('')

  const { activeSessionId, messageList, pushUserMessage, updateAiMessage } =
    useChatStore()
  const latestAssistantId = messageList.reduce(
    (id, item) => (item.role === 'assistant' ? item.id : id),
    ''
  )

  const finishAnswerIfReady = useCallback(() => {
    if (!streamFinishedRef.current || !typingFinishedRef.current) {
      return
    }

    answerLockRef.current = false
    setIsAnswering(false)
  }, [])

  const finishStream = useCallback(() => {
    streamFinishedRef.current = true

    if (!latestAssistantContentRef.current) {
      typingFinishedRef.current = true
    }

    finishAnswerIfReady()
    sseInstanceRef.current = null
  }, [finishAnswerIfReady])

  const handleTypingComplete = useCallback(
    (content: string) => {
      if (content !== latestAssistantContentRef.current) {
        return
      }

      typingFinishedRef.current = true
      finishAnswerIfReady()
    },
    [finishAnswerIfReady]
  )
  const rowProps = useMemo(
    () => ({
      latestAssistantId,
      messageList,
      onTypingComplete: handleTypingComplete
    }),
    [handleTypingComplete, latestAssistantId, messageList]
  )
  const virtualRowCount = messageList.length

  // 监听会话 ID 变化，终止上一次对话流式请求
  useEffect(() => {
    const previousActiveSessionId = previousActiveSessionIdRef.current

    previousActiveSessionIdRef.current = activeSessionId

    if (
      !previousActiveSessionId ||
      previousActiveSessionId === activeSessionId
    ) {
      return
    }

    if (sseInstanceRef.current) {
      sseInstanceRef.current.close()
      sseInstanceRef.current = null
      // 完成回答
      streamFinishedRef.current = true
      typingFinishedRef.current = true
      finishAnswerIfReady()
    }
  }, [activeSessionId, finishAnswerIfReady])

  // 消息变化自动滚动到底部
  useEffect(() => {
    if (vListRef.current && virtualRowCount > 0) {
      vListRef.current.scrollToRow({
        align: 'end',
        index: virtualRowCount - 1
      })
    }
  }, [virtualRowCount, vListRef])

  // 发送对话
  const handleSend = async () => {
    const text = inputText.trim()

    if (!text || isAnswering || answerLockRef.current) {
      return
    }

    // 先终止上一次对话流式请求
    if (sseInstanceRef.current) {
      sseInstanceRef.current.close()
    }

    answerLockRef.current = true
    streamFinishedRef.current = false
    typingFinishedRef.current = false
    latestAssistantContentRef.current = ''
    setInputText('')
    pushUserMessage(text)
    setIsAnswering(true)

    try {
      const sse = aiStreamChat(
        text,
        content => {
          // 低优先级更新，不阻塞UI
          typingFinishedRef.current = false
          latestAssistantContentRef.current = content
          updateAiMessage(content)
        },
        finishStream,
        finishStream
      )

      sseInstanceRef.current = sse
    } catch (err) {
      console.error('AI 流式消息请求失败', err)
      finishStream()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800">AI 实时对话</h2>

      {/* 聊天消息区域 */}
      <div className="flex-1 min-h-0 mt-4 bg-white rounded-lg shadow-sm">
        {messageList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            输入内容开始和AI对话吧
          </div>
        ) : (
          <VirtualList
            listRef={vListRef}
            rowComponent={ChatRow}
            rowCount={messageList.length}
            rowHeight={88}
            rowProps={rowProps}
            defaultHeight={520}
            style={{ height: '100%', width: '100%', padding: '12px' }}
          />
        )}
      </div>

      {/* 输入区域 */}
      <div className="mt-4 flex gap-3">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="请输入你的问题..."
          className="flex-1 border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 resize-none h-20"
          onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={isAnswering || !inputText.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isAnswering ? '回复中...' : '发送'}
        </button>
      </div>
    </div>
  )
}
