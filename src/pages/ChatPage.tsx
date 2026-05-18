import { useRef, useState } from 'react'
import TypeWriter from '@/components/TypeWriter'
import { aiStreamChat } from '@/utils/sseRequest'
import { useChatStore } from '@/store/useChatStore'

export default function ChatPage() {
  const [inputText, setInputText] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)
  const answerLockRef = useRef(false)
  const streamFinishedRef = useRef(true)
  const typingFinishedRef = useRef(true)
  const latestAssistantContentRef = useRef('')

  const { messageList, pushUserMessage, updateAiMessage } = useChatStore()
  const latestAssistantId = messageList.reduce(
    (id, item) => (item.role === 'assistant' ? item.id : id),
    ''
  )

  const finishAnswerIfReady = () => {
    if (!streamFinishedRef.current || !typingFinishedRef.current) {
      return
    }

    answerLockRef.current = false
    setIsAnswering(false)
  }

  const finishStream = () => {
    streamFinishedRef.current = true

    if (!latestAssistantContentRef.current) {
      typingFinishedRef.current = true
    }

    finishAnswerIfReady()
  }

  const handleTypingComplete = (content: string) => {
    if (content !== latestAssistantContentRef.current) {
      return
    }

    typingFinishedRef.current = true
    finishAnswerIfReady()
  }

  // 发送对话
  const handleSend = async () => {
    const text = inputText.trim()

    if (!text || isAnswering || answerLockRef.current) {
      return
    }

    answerLockRef.current = true
    streamFinishedRef.current = false
    typingFinishedRef.current = false
    latestAssistantContentRef.current = ''
    setInputText('')
    pushUserMessage(text)
    setIsAnswering(true)

    try {
      aiStreamChat(
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
    } catch {
      finishStream()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800">AI 实时对话</h2>

      {/* 聊天消息区域 */}
      <div className="flex-1 mt-4 overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow-sm">
        {messageList.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            输入内容开始和AI对话吧
          </div>
        )}
        {messageList.map(item => (
          <div
            key={item.id}
            className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg p-3 rounded-xl whitespace-pre-wrap ${
                item.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {/* 用户消息直接原样显示，AI 消息需要通过打字机组件显示 */}
              {item.role === 'user' ? (
                item.content
              ) : (
                <TypeWriter
                  content={item.content}
                  onComplete={
                    item.id === latestAssistantId
                      ? handleTypingComplete
                      : undefined
                  }
                  speed={20}
                />
              )}
            </div>
          </div>
        ))}
        {isAnswering && <div className="text-gray-400">AI正在回复中...</div>}
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
          发送
        </button>
      </div>
    </div>
  )
}
