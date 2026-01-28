
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import {
    UserGroupIcon,
    UserCircleIcon,
    ServerIcon,
    ChatBubbleLeftRightIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline'

import AdminTeachers from './admin/AdminTeachers'
import AdminStudents from './admin/AdminStudents'
import AdminCourses from './admin/AdminCourses'
import AdminResources from './admin/AdminResources'
import AdminMessages from './admin/AdminMessages'

const AdminDashboard = () => {
    const { user } = useAuth()
    const location = useLocation()

    const sidebarItems = [
        { to: '/dashboard/admin/teachers', icon: <UserGroupIcon className="h-5 w-5" />, label: 'Teachers' },
        { to: '/dashboard/admin/students', icon: <UserCircleIcon className="h-5 w-5" />, label: 'Students' },
        { to: '/dashboard/admin/courses', icon: <AcademicCapIcon className="h-5 w-5" />, label: 'Courses' },
        { to: '/dashboard/admin/resources', icon: <ServerIcon className="h-5 w-5" />, label: 'Resources' },
        { to: '/dashboard/admin/messages', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, label: 'Messages' },
    ]

    let title = "Administration"
    let description = `Welcome back, ${user?.name}`

    if (location.pathname.includes('/students')) {
        title = "Student Management"
        description = "Manage registered students"
    } else if (location.pathname.includes('/courses')) {
        title = "Course Management"
        description = "Manage subjects and courses"
    } else if (location.pathname.includes('/resources')) {
        title = "Resource Library"
        description = "Manage downloads and videos"
    } else if (location.pathname.includes('/messages')) {
        title = "Messages"
        description = "Admin inbox"
    } else if (location.pathname.includes('/teachers')) {
        // Default
        title = "Teacher Management"
        description = "Manage faculties and assignments"
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} title={title} description={description}>
            <Routes>
                <Route index element={<Navigate to="/dashboard/admin/teachers" replace />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="*" element={<Navigate to="/dashboard/admin/teachers" replace />} />
            </Routes>
        </DashboardLayout>
    )
}

export default AdminDashboard
