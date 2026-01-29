import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { UserGroupIcon, UserCircleIcon, ServerIcon, ChatBubbleLeftRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import AdminTeachers from './admin/AdminTeachers';
import AdminStudents from './admin/AdminStudents';
import AdminCourses from './admin/AdminCourses';
import AdminResources from './admin/AdminResources';
import AdminMessages from './admin/AdminMessages';
const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sidebarItems = [
        { to: '/dashboard/admin/teachers', icon: _jsx(UserGroupIcon, { className: "h-5 w-5" }), label: 'Teachers' },
        { to: '/dashboard/admin/students', icon: _jsx(UserCircleIcon, { className: "h-5 w-5" }), label: 'Students' },
        { to: '/dashboard/admin/courses', icon: _jsx(AcademicCapIcon, { className: "h-5 w-5" }), label: 'Courses' },
        { to: '/dashboard/admin/resources', icon: _jsx(ServerIcon, { className: "h-5 w-5" }), label: 'Resources' },
        { to: '/dashboard/admin/messages', icon: _jsx(ChatBubbleLeftRightIcon, { className: "h-5 w-5" }), label: 'Messages' },
    ];
    let title = "Administration";
    let description = `Welcome back, ${user?.name}`;
    if (location.pathname.includes('/students')) {
        title = "Student Management";
        description = "Manage registered students";
    }
    else if (location.pathname.includes('/courses')) {
        title = "Course Management";
        description = "Manage subjects and courses";
    }
    else if (location.pathname.includes('/resources')) {
        title = "Resource Library";
        description = "Manage downloads and videos";
    }
    else if (location.pathname.includes('/messages')) {
        title = "Messages";
        description = "Admin inbox";
    }
    else if (location.pathname.includes('/teachers')) {
        // Default
        title = "Teacher Management";
        description = "Manage faculties and assignments";
    }
    return (_jsx(DashboardLayout, { sidebarItems: sidebarItems, title: title, description: description, children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard/admin/teachers", replace: true }) }), _jsx(Route, { path: "teachers", element: _jsx(AdminTeachers, {}) }), _jsx(Route, { path: "students", element: _jsx(AdminStudents, {}) }), _jsx(Route, { path: "courses", element: _jsx(AdminCourses, {}) }), _jsx(Route, { path: "resources", element: _jsx(AdminResources, {}) }), _jsx(Route, { path: "messages", element: _jsx(AdminMessages, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard/admin/teachers", replace: true }) })] }) }));
};
export default AdminDashboard;
