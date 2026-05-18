import { NavLink, Outlet } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/useChatStore'

export default function MainLayout() {
  const {
    sessionList,
    activeSessionId,
    addSession,
    deleteSession,
    editSessionTitle,
    setActiveSession
  } = useChatStore()
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
    <div className="main-layout flex h-screen">
      {/* 侧边栏 */}
      <aside className="sidebar w-60 bg-gray-800 text-white p-5">
        <h1 className="sidebar-title text-3xl! font-bold mb-7 text-white!">
          AI 对话工作台
        </h1>

        {/* 新建会话按钮 */}
        <button
          onClick={() => addSession()}
          className="new-session-btn w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 transition rounded-md cursor-pointer mb-4"
        >
          新建会话
        </button>

        {/* 路由导航 */}
        <nav className="session-nav mb-6 flex flex-col gap-2">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              isActive
                ? 'session-link session-link-active bg-gray-600 p-2 rounded-md'
                : 'session-link hover:bg-gray-700 p-2 rounded-md'
            }
          >
            对话大厅
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? 'session-link session-link-active bg-gray-600 p-2 rounded-md'
                : 'session-link hover:bg-gray-700 p-2 rounded-md'
            }
          >
            历史记录
          </NavLink>
        </nav>

        <div className="session-list flex flex-col gap-2">
          {sessionList.map(item => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={item.id}
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition
      ${activeSessionId === item.id ? 'bg-gray-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveSession(item.id)}
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
                  className="flex-1 min-w-0 px-2 py-1 rounded-md text-sm text-gray-900 bg-white outline-none"
                />
              ) : (
                <span className="flex-1 min-w-0 truncate">{item.title}</span>
              )}

              {editingId === item.id ? null : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    startEditTitle(item.id, item.title)
                  }}
                  className="shrink-0 text-blue-400 hover:text-blue-300"
                >
                  编辑
                </button>
              )}

              <button
                onClick={e => {
                  e.stopPropagation()
                  deleteSession(item.id)
                }}
                className="shrink-0 text-red-400 hover:text-red-300"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* 主内容区，Outlet = 嵌套路由插槽 */}
      <main className="main-content flex-1 bg-gray-50 w-full max-w-200 p-8">
        <Outlet />
      </main>
    </div>
  )
}
