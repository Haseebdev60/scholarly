import { useState } from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { studentApi } from './lib/api'

import AuthModal from './components/AuthModal'
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

type AuthMode = 'login' | 'register'
type Role = 'student' | 'teacher' | 'admin'

const AppContent = () => {
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authRole, setAuthRole] = useState<Role>('student')
  const [notice, setNotice] = useState<string | null>(null)

  // Messaging State
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState<string | null>(null)
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null)

  const openAuth = (mode: AuthMode, role: Role = 'student') => {
    setAuthMode(mode)
    setAuthRole(role) // Default, but user can change in modal
    setAuthOpen(true)
  }

  const openMessage = (id: string, teacherName: string) => {
    if (!user) {
      openAuth('login', 'student')
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar onLogin={() => openAuth('login')} onSignup={() => openAuth('register')} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenAuth={openAuth} onMessage={(id, name) => openMessage(id, name)} />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses onEnroll={() => openAuth('register', 'student')} />} />
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
          <Route path="*" element={<Home onOpenAuth={openAuth} onMessage={(id, name) => openMessage(id, name)} />} />
        </Routes>
      </main>


      <Footer />
      <AIChatBot />



      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
      />

      {notice && (
        <div className="fixed bottom-4 right-4 max-w-xs rounded-xl bg-white p-4 shadow-soft ring-1 ring-slate-200 z-50 animate-fade-in">
          <div className="text-sm font-semibold text-slate-900">Notification</div>
          <div className="text-sm text-slate-600">{notice}</div>
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" className="text-xs" onClick={() => setNotice(null)}>
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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
