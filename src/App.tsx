import { useEffect, useRef, useState } from 'react'
import { useChatStore } from './store/useChatStore'

export default function App() {
  const { sessionList, addSession, deleteSession, editSessionTitle } =
    useChatStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editingId) {
      return
    }
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editingId])

  const startEditTitle = (id: string, currentTitle: string) => {
    setEditingId(id)
    setDraftTitle(currentTitle)
  }

  const cancelEditTitle = () => {
    setEditingId(null)
    setDraftTitle('')
  }

  const commitEditTitle = (id: string) => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      cancelEditTitle()
      return
    }

    editSessionTitle(id, nextTitle)
    cancelEditTitle()
  }

  return (
    <div className="layout-wrap flex h-screen">
      {/* 侧边栏 */}
      <aside className="sidebar w-60 bg-[#1f2937] text-white px-3 py-5">
        <div className="sidebar-title text-lg font-bold mb-8">
          AI 对话工作台
        </div>

        <button
          onClick={() => addSession()}
          className="new-session-btn w-full px-2 py-3 bg-[#3b82f6] text-white rounded-md cursor-pointer mb-4"
        >
          新建会话
        </button>

        {/* 会话列表 */}
        <div className="session-list flex flex-col gap-2">
          {sessionList.map(item => (
            <div
              key={item.id}
              className="session-item p-2.5 bg-[#374151] rounded-md flex items-center gap-2"
            >
              {editingId === item.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  onBlur={() => commitEditTitle(item.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      commitEditTitle(item.id)
                    }
                    if (e.key === 'Escape') {
                      cancelEditTitle()
                    }
                  }}
                  className="session-title-input flex-1 min-w-0 px-2 py-1 rounded-md text-sm text-[#111827] bg-white outline-none"
                />
              ) : (
                <span className="session-title text-sm flex-1 min-w-0 truncate">
                  {item.title}
                </span>
              )}

              {editingId === item.id ? null : (
                <button
                  onClick={() => startEditTitle(item.id, item.title)}
                  className="edit-btn bg-transparent border-0 text-[#3b82f6] cursor-pointer shrink-0"
                >
                  编辑
                </button>
              )}

              {/* 删除会话 */}
              <button
                onClick={() => deleteSession(item.id)}
                className="delete-btn bg-transparent border-0 text-[#ef4444] cursor-pointer shrink-0"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main-content flex-1 bg-[#f9fafb] p-8">
        <h2>欢迎进入 AI 对话页面</h2>

        <p className="mt-2 text-[#666]">当前会话数量：{sessionList.length}</p>
      </main>
    </div>
  )
}
