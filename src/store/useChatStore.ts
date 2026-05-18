import { create } from 'zustand'

const createSessionTitle = (content: string) => {
  const title = content.trim()

  if (!title) {
    return 'New Session'
  }

  return title.length > 20 ? `${title.slice(0, 20)}...` : title
}

/** 会话类型 */
type Session = {
  /** 会话 ID */
  id: string
  /** 会话标题 */
  title: string
  /** 会话创建时间 */
  createTime: number
}

/** 聊天消息类型 */
export type ChatMessage = {
  /** 消息 ID */
  id: string
  /** 角色 */
  role: 'user' | 'assistant'
  /** 内容 */
  content: string
}

/** 会话仓库类型 */
type SessionStore = {
  /** 会话列表 */
  sessionList: Session[]
  /** 当前选中会话 ID */
  activeSessionId: string
  /** 当前会话消息列表 */
  messageList: ChatMessage[]

  // 会话操作
  /** 新增会话 */
  addSession: (title?: string) => void
  /** 删除会话 */
  deleteSession: (id: string) => void
  /** 编辑会话标题 */
  editSessionTitle: (id: string, title: string) => void
  /** 切换选中会话 */
  setActiveSession: (id: string) => void

  // 消息操作
  /** 用户发送消息 */
  pushUserMessage: (content: string) => void
  /** 更新 AI 流式消息 */
  updateAiMessage: (content: string) => void
  /** 清空当前会话消息列表 */
  clearCurrentMessage: () => void
}

export const useChatStore = create<SessionStore>((set, get) => ({
  sessionList: [],
  activeSessionId: '',
  messageList: [],

  addSession: (title = 'New Session') => {
    const newSession: Session = {
      id: Date.now().toString(),
      title,
      createTime: Date.now()
    }

    set(state => ({
      sessionList: [newSession, ...state.sessionList],
      activeSessionId: newSession.id, // 选中新建会话
      messageList: [] // 新会话需要清空其他会话残留的消息
    }))
  },

  editSessionTitle: (id: string, title: string) => {
    const state = get()
    const index = state.sessionList.findIndex(item => item.id === id)

    if (index === -1) {
      return
    }

    const target = state.sessionList[index]

    if (target.title === title) {
      return
    }

    const newList = state.sessionList.slice()

    newList[index] = { ...target, title }

    set({ sessionList: newList })
  },

  deleteSession: id => {
    const state = get()
    const index = state.sessionList.findIndex(item => item.id === id)

    if (index === -1) {
      return
    }

    const newList = [
      ...state.sessionList.slice(0, index),
      ...state.sessionList.slice(index + 1)
    ]
    let newActiveId = state.activeSessionId
    let newMsgList = state.messageList

    // 删除当前会话，需要自动切换会话并清空消息列表
    if (state.activeSessionId === id) {
      newActiveId = newList[0]?.id || ''
      newMsgList = []
    }

    set({
      sessionList: newList,
      activeSessionId: newActiveId,
      messageList: newMsgList
    })
  },

  setActiveSession: id => {
    set({ activeSessionId: id, messageList: [] })
  },

  pushUserMessage: content => {
    set(state => {
      const sessionList = state.activeSessionId
        ? state.sessionList
        : [
            {
              id: Date.now().toString(),
              title: createSessionTitle(content),
              createTime: Date.now()
            },
            ...state.sessionList
          ]
      const activeSessionId = state.activeSessionId || sessionList[0].id

      return {
        sessionList,
        activeSessionId,
        messageList: [
          ...state.messageList,
          {
            id: Date.now().toString(),
            role: 'user',
            content
          }
        ]
      }
    })
  },

  updateAiMessage: content => {
    set(state => {
      const list = state.messageList.slice()
      const lastMsg = list.at(-1)

      // 如果最后一条消息是 AI 回复，则更新最后一条消息
      if (lastMsg?.role === 'assistant') {
        lastMsg.content = content
      } else {
        // 如果最后一条消息是用户消息，则添加新的 AI 回复消息
        list.push({
          id: Date.now().toString(),
          role: 'assistant',
          content
        })
      }

      return { messageList: list }
    })
  },

  clearCurrentMessage: () => {
    set({ messageList: [] })
  }
}))
