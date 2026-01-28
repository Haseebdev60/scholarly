import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ArrowDownTrayIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { studentApi, subscriptionApi, publicApi } from '../lib/api'

const StudentDashboard = () => {
  const { user, subscriptionStatus, refreshSubscription } = useAuth()
  const navigate = useNavigate()
  const [enrolledSubjects, setEnrolledSubjects] = useState<
    Array<{ _id: string; title: string; description: string; teacherId: string; isPremium: boolean }>
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
    try {
      const [subjects, classes, books] = await Promise.all([
        studentApi.getEnrolledSubjects(),
        studentApi.getAvailableClasses(),
        studentApi.getBookings()
      ])
      setEnrolledSubjects(subjects)
      setUpcomingClasses(classes)
      setBookings(books)
    } catch (error: any) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
              <p className="text-slate-600">No active subscription</p>
            </div>
          </div>
          <Card className="space-y-3 bg-brand-50 border-brand-100">
            <div className="text-lg font-semibold text-brand-900">Unlock Full Access</div>
            <p className="text-sm text-brand-700">
              Purchase a subscription to access student dashboards, teacher collaboration, downloads, and quizzes with
              AI checks.
            </p>
            <div className="flex gap-2 pt-2">
              <Button className="w-fit" variant="primary" onClick={() => handleBuySubscription('weekly')}>
                Buy Weekly (PKR 300)
              </Button>
              <Button className="w-fit" variant="outline" onClick={() => handleBuySubscription('monthly')}>
                Buy Monthly (PKR 1000)
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Overview" description={`Welcome back, ${user.name}`}>
      <div className="space-y-8">
        {/* Quick Actions / Header Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-500">Active Courses</div>
            <div className="text-3xl font-bold text-brand-600">{enrolledSubjects.length}</div>
          </Card>
          <Card className="space-y-2 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-500">Subscription Status</div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-slate-900 capitalize">
                {subscriptionStatus?.status || 'Free'}
              </div>
              <Badge color="green">Active</Badge>
            </div>
            <div className="text-xs text-slate-500 truncate">{subscriptionText}</div>
          </Card>
          <Card className="flex flex-col justify-center gap-2">
            <Button variant="primary" className="w-full justify-center" onClick={async () => {
              setShowChat(true)
              try {
                const convs = await studentApi.getConversations()
                setConversations(convs)
              } catch (e) { console.error(e) }
            }}>
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Messages
            </Button>
            <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/quizzes')}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Downloads
            </Button>
          </Card>
        </div>

        {/* Live Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Live Sessions</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <Card className="bg-slate-50 border-dashed text-center py-8">
              <p className="text-slate-500">No upcoming sessions scheduled.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingClasses.map((cls) => (
                <Card key={cls._id} className="space-y-4 border-l-4 border-l-brand-500" hover>
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-slate-900 line-clamp-1" title={cls.title}>{cls.title}</div>
                    <Badge color="red" className="animate-pulse">Live</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>📅 {new Date(cls.scheduledDate).toLocaleDateString()}</span>
                      <span>⏰ {new Date(cls.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>⏳ {cls.duration} min duration</div>
                  </div>
                  {cls.meetingLink && (
                    <Button className="w-full justify-center" onClick={() => window.open(cls.meetingLink, '_blank')}>
                      Join Class
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Private Classes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">My Private Classes</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500 italic">No private classes booked yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((book) => (
                <Card key={book._id} className="space-y-4" hover>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">vs. {book.teacherId?.name}</div>
                    <Badge color={
                      book.status === 'confirmed' ? 'brand' :
                        book.status === 'pending_payment' ? 'amber' : 'slate'
                    }>{book.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 space-y-1">
                    <div>{new Date(book.date).toLocaleString()}</div>
                    <div>{book.duration} mins • PKR {book.price}</div>
                    {book.meetingLink && book.status === 'confirmed' && (
                      <a href={book.meetingLink} target="_blank" className="text-brand-600 hover:underline font-medium block mt-1">Join Meeting Link</a>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2">
                    {book.status === 'pending_payment' && (
                      <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={async () => {
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
                      <Button size="sm" variant="danger" className="flex-1" onClick={async () => {
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
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Enrolled Subjects</h2>
          {isLoading ? (
            <div className="text-slate-500">Loading subjects...</div>
          ) : enrolledSubjects.length === 0 ? (
            <Card className="bg-slate-50 border-dashed p-8 text-center">
              <BookOpenIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No subjects yet</h3>
              <p className="text-slate-500 mb-4">Start your learning journey today.</p>
              <Button variant="primary" onClick={() => navigate('/courses')}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledSubjects.map((subject) => (
                <Card key={subject._id} className="space-y-3 h-full flex flex-col" hover>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{subject.title}</h3>
                    <Badge color={subject.isPremium ? 'brand' : 'slate'}>{subject.isPremium ? 'Premium' : 'Free'}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 flex-1">{subject.description}</p>
                </Card>
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
        <div className="flex h-[60vh] gap-4">
          {/* Sidebar List */}
          <div className="w-1/3 border-r border-slate-100 pr-2 overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-slate-700 mb-3 px-2">Conversations</h3>
            {conversations.length === 0 ? <p className="text-sm text-slate-400 px-2">No chats yet.</p> : (
              <ul className="space-y-1">
                {conversations.map(c => (
                  <li
                    key={c._id}
                    onClick={async () => {
                      setActiveConversation(c._id)
                      const thread = await studentApi.getThread(c._id)
                      setChatHistory(thread)
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${activeConversation === c._id ? 'bg-brand-50 text-brand-900' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage.content}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 px-2">
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={async () => {
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
          <div className="flex-1 flex flex-col bg-slate-50 rounded-xl overflow-hidden">
            {activeConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatHistory.map((msg, idx) => {
                    const isMe = msg.senderId === user?._id
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                  <Button size="sm" onClick={async () => {
                    if (!chatInput.trim()) return
                    await studentApi.sendMessage(activeConversation, 'Teacher', 'Chat', chatInput)
                    setChatInput('')
                    const thread = await studentApi.getThread(activeConversation)
                    setChatHistory(thread)
                  }}>Send</Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default StudentDashboard
