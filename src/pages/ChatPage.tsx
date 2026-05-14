import TypeWriter from '@/components/TypeWriter'

const content =
  '已完成 React Router v7 嵌套路由搭建，全站样式切换为 TailwindCSS，后续所有开发统一使用原子化样式。'

export default function ChatPage() {
  return (
    <div className="chat-page max-w-3xl">
      <h2 className="chat-page-title text-2xl font-bold text-gray-800">
        AI 对话页面
      </h2>

      <p className="mt-2 text-gray-500">React Router 示例</p>

      <div className="mt-5 p-5 bg-white rounded-lg shadow-sm">
        <TypeWriter content={content} />
      </div>
    </div>
  )
}
