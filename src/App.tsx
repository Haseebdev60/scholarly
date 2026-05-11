import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { studentApi } from './lib/api'
import Lenis from 'lenis'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Button from './components/Button'
import About from './pages/About'
import AuthPage from './pages/AuthPage'
import Courses from './pages/Courses'
import Home from './pages/Home'
import Downloads from './pages/Downloads'
import Quizzes from './pages/Quizzes'
import AIChatBot from './components/AIChatBot'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import Teachers from './pages/Teachers'
import MessageModal from './components/MessageModal'
import AdminDashboard from './pages/AdminDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import AnimatedCursor from './components/AnimatedCursor'

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

  // Messaging State
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState<string | null>(null)
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null)

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
    } catch (err: any) {
      setNotice(`Failed to send message: ${err.message}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-slate-900 dark:text-slate-100">
      <ScrollToTop />
      <AnimatedCursor />
      <Navbar onLogin={() => handleOpenAuth('login')} onSignup={() => handleOpenAuth('register')} />

      <main className="flex-1 flex flex-col pt-16"> {/* Added pt-16 for sticky navbar */}
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
      </main>

      <Footer />
      <AIChatBot />

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

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
