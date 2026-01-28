
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import {
  HomeIcon,
  InboxIcon,
  CalendarIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

import TeacherOverview from './teacher/TeacherOverview'
import TeacherInbox from './teacher/TeacherInbox'
import TeacherAvailability from './teacher/TeacherAvailability'
import TeacherClasses from './teacher/TeacherClasses'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()

  const sidebarItems = [
    { to: '/dashboard/teacher', icon: <HomeIcon className="h-5 w-5" />, label: 'Overview', end: true },
    { to: '/dashboard/teacher/inbox', icon: <InboxIcon className="h-5 w-5" />, label: 'Inbox' },
    { to: '/dashboard/teacher/availability', icon: <CalendarIcon className="h-5 w-5" />, label: 'Availability' },
    { to: '/dashboard/teacher/classes', icon: <VideoCameraIcon className="h-5 w-5" />, label: 'Classes' },
  ]

  // Helper to determine active state. The DashboardLayout might need updating if it doesn't handle full paths correctly for 'end' prop.
  // Actually standard NavLink in Sidebar usually handles this.

  // Update Title based on Route
  let title = "Overview"
  let description = `Welcome back, ${user?.name}`

  if (location.pathname.includes('/inbox')) {
    title = "Inbox"
    description = "Manage your messages"
  } else if (location.pathname.includes('/availability')) {
    title = "My Availability"
    description = "Manage your weekly schedule"
  } else if (location.pathname.includes('/classes')) {
    title = "My Classes"
    description = "Manage your upcoming sessions"
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={title} description={description}>
      <Routes>
        <Route index element={<TeacherOverview />} />
        <Route path="inbox" element={<TeacherInbox />} />
        <Route path="availability" element={<TeacherAvailability />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="*" element={<Navigate to="/dashboard/teacher" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default TeacherDashboard
