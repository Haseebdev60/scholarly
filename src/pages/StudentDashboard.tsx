import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ArrowDownTrayIcon, UserGroupIcon, StarIcon, AcademicCapIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { GlassCard } from '../components/GlassCard'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { studentApi, subscriptionApi, publicApi } from '../lib/api'

const StudentDashboard = () => {
  const { user, subscriptionStatus, refreshSubscription } = useAuth()
  const navigate = useNavigate()
  const [enrolledSubjects, setEnrolledSubjects] = useState<
    Array<{ _id: string; title: string; description: string; teacherId: any; isPremium: boolean }>
  >([])
  const [upcomingClasses, setUpcomingClasses] = useState<Array<{
    _id: string
    title: string
    scheduledDate: string
    duration: number
    meetingLink?: string
  }>>([])

  // Chat State
  const [conversations, setConversations] = useState<{ _id: string, name: string, lastMessage: any }[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [bookings, setBookings] = useState<any[]>([])

  const sidebarItems = [
    { to: '/dashboard/student', icon: <HomeIcon className="h-5 w-5" />, label: 'Overview', end: true },
    { to: '/courses', icon: <BookOpenIcon className="h-5 w-5" />, label: 'Browse Courses' },
    { to: '/quizzes', icon: <ArrowDownTrayIcon className="h-5 w-5" />, label: 'Downloads' },
    { to: '/teachers', icon: <UserGroupIcon className="h-5 w-5" />, label: 'Find Teachers' },
  ]

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/auth')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const subjects = await studentApi.getEnrolledSubjects()
      setEnrolledSubjects(subjects)
    } catch (error: any) {
      console.error('Failed to load enrolled subjects:', error)
    }

    try {
      const classes = await studentApi.getAvailableClasses()
      setUpcomingClasses(classes)
    } catch (error: any) {
      console.error('Failed to load available classes:', error)
    }

    try {
      const books = await studentApi.getBookings()
      setBookings(books)
    } catch (error: any) {
      console.error('Failed to load bookings:', error)
    }
    setIsLoading(false)
  }

  const handleBuySubscription = async (plan: 'weekly' | 'monthly') => {
    try {
      await subscriptionApi.buySubscription(plan)
      await refreshSubscription()
      alert(`Subscription purchased! ${plan === 'weekly' ? 'Weekly' : 'Monthly'} plan activated.`)
    } catch (error: any) {
      alert(`Failed to purchase subscription: ${error.message}`)
    }
  }

  if (!user || user.role !== 'student') {
    return null
  }

  const hasSubscription = subscriptionStatus?.isActive ?? false
  const subscriptionText = subscriptionStatus
    ? subscriptionStatus.isActive
      ? `${subscriptionStatus.status === 'weekly' ? 'Weekly' : 'Monthly'} plan - expires ${new Date(subscriptionStatus.expiryDate || '').toLocaleDateString()}`
      : 'No active subscription'
    : 'Loading...'

  if (!hasSubscription) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} title="Overview">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white">Welcome back, {user.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">No active subscription</p>
            </div>
          </div>
          <GlassCard className="space-y-4 p-8 bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-500/20">
            <div className="text-2xl font-black font-display text-brand-900 dark:text-brand-300">Unlock Full Access</div>
            <p className="text-base text-brand-700 dark:text-brand-400 font-medium">
              Purchase a subscription to access student dashboards, teacher collaboration, downloads, and quizzes with
              AI checks.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="w-fit h-12 px-6 font-bold rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white" onClick={() => handleBuySubscription('weekly')}>
                Buy Weekly (PKR 300)
              </Button>
              <Button className="w-fit h-12 px-6 font-bold rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10" variant="outline" onClick={() => handleBuySubscription('monthly')}>
                Buy Monthly (PKR 1000)
              </Button>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Overview" description={`Welcome back, ${user.name}`}>
      <div className="space-y-10">
        {/* Quick Actions / Header Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard glowHover className="space-y-2 p-6 flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Courses</div>
            <div className="text-5xl font-black font-display text-brand-600 dark:text-brand-400">{enrolledSubjects.length}</div>
          </GlassCard>
          <GlassCard glowHover className="space-y-3 p-6 flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Subscription Status</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black font-display text-slate-900 dark:text-white capitalize">
                {subscriptionStatus?.status || 'Free'}
              </div>
              <Badge color="green" className="animate-pulse">Active</Badge>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{subscriptionText}</div>
          </GlassCard>
          <div className="flex flex-col gap-4">
            <Button className="w-full flex-1 justify-center h-16 rounded-2xl font-bold shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white transition-transform hover:scale-[1.02]" onClick={async () => {
              setShowChat(true)
              try {
                const convs = await studentApi.getConversations()
                setConversations(convs)
              } catch (e) { console.error(e) }
            }}>
              <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3" />
              Messages
            </Button>
            <Button variant="outline" className="w-full flex-1 justify-center h-16 rounded-2xl font-bold bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 transition-transform hover:scale-[1.02]" onClick={() => navigate('/quizzes')}>
              <ArrowDownTrayIcon className="w-6 h-6 mr-3" />
              Downloads
            </Button>
          </div>
        </div>

        {/* Live Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Upcoming Live Sessions</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <GlassCard className="border-dashed text-center py-12">
              <PlayCircleIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400">No upcoming sessions scheduled.</p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingClasses.map((cls) => (
                <GlassCard key={cls._id} glowHover className="space-y-5 p-6 border-l-4 border-l-brand-500 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-black text-lg text-slate-900 dark:text-white line-clamp-2" title={cls.title}>{cls.title}</div>
                    <Badge color="red" className="animate-pulse shrink-0">Live</Badge>
                  </div>
                  <div className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 flex-1">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
                      <span>📅 {new Date(cls.scheduledDate).toLocaleDateString()}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span>⏰ {new Date(cls.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="pl-1">⏳ {cls.duration} min duration</div>
                  </div>
                  {cls.meetingLink && (
                    <Button className="w-full justify-center h-12 font-bold rounded-xl mt-auto shadow-sm hover:shadow-md" onClick={() => window.open(cls.meetingLink, '_blank')}>
                      Join Class
                    </Button>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Private Classes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">My Private Classes</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">No private classes booked yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((book) => (
                <GlassCard key={book._id} glowHover className="space-y-5 p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-amber-500" />
                        {book.teacherId?.name}
                    </div>
                    <Badge color={
                      book.status === 'confirmed' ? 'brand' :
                        book.status === 'pending_payment' ? 'amber' : 'slate'
                    }>{book.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 space-y-2 flex-1">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">{new Date(book.date).toLocaleString()}</div>
                    <div className="pl-1">{book.duration} mins • PKR {book.price}</div>
                    {book.meetingLink && book.status === 'confirmed' && (
                      <a href={book.meetingLink} target="_blank" className="text-brand-600 dark:text-brand-400 hover:underline font-bold block mt-2 bg-brand-50 dark:bg-brand-900/20 p-2 rounded-lg text-center">Join Meeting Link</a>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3 mt-auto">
                    {book.status === 'pending_payment' && (
                      <Button className="flex-1 h-12 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border-none shadow-glow hover:shadow-glow-hover text-white" onClick={async () => {
                        if (!confirm(`Pay PKR ${book.price} for this class?`)) return
                        try {
                          await studentApi.payBooking(book._id)
                          alert('Payment successful! Booking confirmed.')
                          loadData()
                        } catch (e: any) {
                          alert(`Payment failed: ${e.message}`)
                        }
                      }}>
                        Pay Now
                      </Button>
                    )}
                    {(book.status === 'pending_payment' || book.status === 'confirmed') && (
                      <Button variant="danger" className="flex-1 h-12 font-bold rounded-xl" onClick={async () => {
                        if (!confirm('Cancel booking?')) return
                        try {
                          await studentApi.cancelBooking(book._id)
                          loadData()
                        } catch (e) {
                          alert('Failed to cancel')
                        }
                      }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Enrolled Subjects</h2>
          {isLoading ? (
            <div className="text-slate-500 font-bold animate-pulse">Loading subjects...</div>
          ) : enrolledSubjects.length === 0 ? (
            <GlassCard className="border-dashed p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No subjects yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Start your learning journey today.</p>
              <Button className="h-12 px-8 font-bold rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white" onClick={() => navigate('/courses')}>
                Browse Courses
              </Button>
            </GlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledSubjects.map((subject) => (
                <GlassCard key={subject._id} glowHover className="space-y-4 p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                              <AcademicCapIcon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{subject.title}</h3>
                      </div>
                      <Badge color={subject.isPremium ? 'brand' : 'slate'} className="shrink-0">{subject.isPremium ? 'Premium' : 'Free'}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{subject.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 overflow-hidden">
                        {subject.teacherId?.avatar ? (
                          <img src={subject.teacherId.avatar} alt={subject.teacherId.name} className="h-full w-full object-cover" />
                        ) : (
                          subject.teacherId?.name?.charAt(0) || 'S'
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{subject.teacherId?.name || 'No Teacher Assigned'}</div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Instructor</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <Modal
        open={showChat}
        onClose={() => setShowChat(false)}
        title="Messages"
        maxWidth="max-w-4xl"
      >
        <div className="flex h-[70vh] gap-4">
          {/* Sidebar List */}
          <div className="w-1/3 border-r border-slate-100 dark:border-white/10 pr-2 flex flex-col">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 px-2">Conversations</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? <p className="text-sm font-medium text-slate-400 px-2">No chats yet.</p> : (
                <ul className="space-y-2">
                    {conversations.map(c => (
                    <li
                        key={c._id}
                        onClick={async () => {
                        setActiveConversation(c._id)
                        const thread = await studentApi.getThread(c._id)
                        setChatHistory(thread)
                        }}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${activeConversation === c._id ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-500/30 text-brand-900 dark:text-brand-300 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300'}`}
                    >
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-1">{c.lastMessage.content}</div>
                    </li>
                    ))}
                </ul>
                )}
            </div>
            <div className="mt-4 px-2 pt-4 border-t border-slate-100 dark:border-white/10">
              <Button size="sm" className="w-full text-xs font-bold h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100" onClick={async () => {
                try {
                  const admin = await publicApi.getAdminContact()
                  if (admin) {
                    setActiveConversation(admin._id)
                    const thread = await studentApi.getThread(admin._id)
                    setChatHistory(thread)
                    // refresh convs
                    const convs = await studentApi.getConversations()
                    setConversations(convs)
                  }
                } catch (e) { alert('Could not contact admin') }
              }}>Contact Admin</Button>
            </div>
          </div>

          {/* Chat Box */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10">
            {activeConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {chatHistory.map((msg, idx) => {
                    const isMe = msg.senderId === user?._id
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-bl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-white/10 flex gap-3">
                  <input
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white transition-all"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        await studentApi.sendMessage(activeConversation, 'Teacher', 'Chat', chatInput)
                        setChatInput('')
                        const thread = await studentApi.getThread(activeConversation)
                        setChatHistory(thread)
                      }
                    }}
                  />
                  <Button className="font-bold px-6 rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white" onClick={async () => {
                    if (!chatInput.trim()) return
                    await studentApi.sendMessage(activeConversation, 'Teacher', 'Chat', chatInput)
                    setChatInput('')
                    const thread = await studentApi.getThread(activeConversation)
                    setChatHistory(thread)
                  }}>Send</Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <ChatBubbleLeftRightIcon className="w-10 h-10" />
                </div>
                <p className="font-bold">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default StudentDashboard
