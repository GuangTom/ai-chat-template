import { useEffect, useState, useTransition } from 'react'

// 流式打字机组件
type Props = {
  /** 显示内容 */
  content: string
  /** 显示速度 */
  speed?: number
}

export default function TypeWriter({ content, speed = 10 }: Props) {
  const [_isPending, startTransition] = useTransition()
  const [typingStatus, setTypingStatus] = useState(() => ({
    content,
    showText: ''
  }))

  if (typingStatus.content !== content) {
    setTypingStatus({
      content,
      showText: ''
    })
  }

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      startTransition(() => {
        setTypingStatus(() => ({
          content,
          showText: content.slice(0, i + 1)
        }))
      })

      i++
      if (i >= content.length) {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [content, speed])

  return (
    <div className="type-writer whitespace-pre-wrap leading-6">
      {typingStatus.showText}
    </div>
  )
}
