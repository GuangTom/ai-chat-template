import ChatPage from '@/pages/ChatPage'
import HistoryPage from '@/pages/HistoryPage'
import MainLayout from '@/layout/MainLayout'
import { createBrowserRouter } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    // 嵌套子路由
    children: [
      {
        index: true, // 默认路由
        element: <ChatPage />
      },
      {
        path: 'chat',
        element: <ChatPage />
      },
      {
        path: 'history',
        element: <HistoryPage />
      }
    ]
  }
])

export default router
