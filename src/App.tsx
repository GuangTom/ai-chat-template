import './App.css'

export default function App() {
  return (
    <div className="layout-wrap">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="sidebar-title">AI 对话工作台</div>
        <div>会话列表占位</div>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        <h2>欢迎进入 AI 对话页面</h2>
        <p style={{ marginTop: 16, color: '#666' }}>请输入需要提问的内容</p>
      </main>
    </div>
  )
}
