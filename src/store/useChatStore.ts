import { create } from 'zustand'

/** 会话类型 */
type Session = {
  /** 会话 ID */
  id: string
  /** 会话标题 */
  title: string
  /** 会话创建时间 */
  createTime: number
}

/** 会话仓库类型 */
type SessionStore = {
  /** 会话列表 */
  sessionList: Session[]
  /** 新增会话 */
  addSession: (title?: string) => void
  /** 删除会话 */
  deleteSession: (id: string) => void
  /** 编辑会话标题 */
  editSessionTitle: (id: string, title: string) => void
}

export const useChatStore = create<SessionStore>(set => ({
  sessionList: [],

  addSession: (title = 'New Session') => {
    set(state => ({
      sessionList: [
        {
          id: Date.now().toString(),
          title,
          createTime: Date.now()
        },
        ...state.sessionList
      ]
    }))
  },

  editSessionTitle: (id: string, title: string) => {
    set(state => {
      const index = state.sessionList.findIndex(item => item.id === id)

      if (index === -1) {
        return state
      }

      const target = state.sessionList[index]

      if (target.title === title) {
        return state
      }

      const nextList = state.sessionList.slice()

      nextList[index] = { ...target, title }

      return { sessionList: nextList }
    })
  },

  deleteSession: id => {
    set(state => {
      const index = state.sessionList.findIndex(item => item.id === id)

      if (index === -1) {
        return state
      }

      return {
        sessionList: [
          ...state.sessionList.slice(0, index),
          ...state.sessionList.slice(index + 1)
        ]
      }
    })
  }
}))
