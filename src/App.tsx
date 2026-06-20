import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { studentApi } from './lib/api'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Button from './components/Button'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import MessageModal from './components/MessageModal'
import ErrorBoundary from './components/ErrorBoundary'

const About = lazy(() => import('./pages/About'))
const Courses = lazy(() => import('./pages/Courses'))
const Downloads = lazy(() => import('./pages/Downloads'))
const Quizzes = lazy(() => import('./pages/Quizzes'))
const Teachers = lazy(() => import('./pages/Teachers'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AIChatBot = lazy(() => import('./components/AIChatBot'))

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
  </div>
)

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const AppContent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  const [messageOpen, setMessageOpen] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState<string | null>(null)
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowChat(true), 2000)
    return () => window.clearTimeout(timer)
  }, [])

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    navigate(`/auth?mode=${mode}`)
  }

  const openMessage = (id: string, teacherName: string) => {
    if (!user) {
      handleOpenAuth('login')
      return
    }
    setMessageRecipient(teacherName)
    setMessageRecipientId(id)
    setMessageOpen(true)
  }

  const handleMessageSubmit = async ({ subject, message }: { subject: string; message: string }) => {
    if (!messageRecipient || !messageRecipientId) return
    try {
      await studentApi.sendMessage(messageRecipientId, messageRecipient, subject, message)
      setNotice('Message sent successfully! The teacher will reply soon.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setNotice(`Failed to send message: ${msg}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <ScrollToTop />
      <Navbar onLogin={() => handleOpenAuth('login')} onSignup={() => handleOpenAuth('register')} />

      <main className="flex-1 flex flex-col pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home onOpenAuth={handleOpenAuth} onMessage={(id, name) => openMessage(id, name)} />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses onEnroll={() => handleOpenAuth('register')} />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route
              path="/teachers"
              element={
                <ErrorBoundary>
                  <Teachers onContact={openMessage} />
                </ErrorBoundary>
              }
            />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/auth" element={<AuthPage onSuccess={(message) => setNotice(message)} />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/teacher/*" element={<TeacherDashboard />} />
            <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<Home onOpenAuth={handleOpenAuth} onMessage={(id, name) => openMessage(id, name)} />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {showChat && (
        <Suspense fallback={null}>
          <AIChatBot />
        </Suspense>
      )}

      {notice && (
        <div className="fixed bottom-4 right-4 max-w-xs rounded-xl bg-white dark:bg-slate-900 p-4 shadow-soft ring-1 ring-slate-200 dark:ring-slate-800 z-50 animate-fade-in-up">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Notification</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{notice}</div>
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" className="text-xs dark:text-slate-300" onClick={() => setNotice(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={messageOpen}
        onClose={() => setMessageOpen(false)}
        recipientName={messageRecipient || 'Teacher'}
        onSubmit={handleMessageSubmit}
      />
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
)

export default App
