/**
 * AI 流式 SSE 请求封装
 * @param question 用户问题
 * @param onMessage 消息回调
 * @param onEnd 结束回调
 * @param onError 错误回调
 */

export const aiStreamChat = (
  question: string,
  onMessage: (text: string) => void,
  onEnd: () => void,
  onError: (error: any) => void
) => {
  // Wikimedia 免费公共 SSE 测试接口，返回实时编辑事件。
  const url = 'https://stream.wikimedia.org/v2/stream/recentchange'
  const maxMessageCount = 8
  let messageCount = 0
  let fullText = `你刚刚输入：${question}\n\n以下是 Wikimedia 的实时变更流：\n`

  const eventSource = new EventSource(url)

  eventSource.onmessage = (e: MessageEvent) => {
    if (!e.data || e.data === '[DONE]') {
      return
    }

    try {
      const data = JSON.parse(e.data)
      const title = data.title || '未知页面'
      const wiki = data.wiki || '未知站点'
      const user = data.user || '匿名用户'
      const type = data.type || 'change'

      messageCount++
      fullText += `\n${messageCount}. [${wiki}] ${type}: ${title}，编辑者：${user}`
      onMessage(fullText)

      if (messageCount >= maxMessageCount) {
        eventSource.close()
        onEnd()
      }
    } catch (error) {
      eventSource.close()
      console.error('解析 Wikimedia 流式消息失败', error)
      onError(error)
    }
  }

  eventSource.onerror = err => {
    eventSource.close()
    console.error('AI 流式消息请求失败', err)
    onError(err)
  }

  eventSource.addEventListener('close', () => {
    eventSource.close()
    onEnd()
  })

  return { close: () => eventSource.close() }
}
