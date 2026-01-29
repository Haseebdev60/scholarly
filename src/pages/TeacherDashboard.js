import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { HomeIcon, InboxIcon, CalendarIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import TeacherOverview from './teacher/TeacherOverview';
import TeacherInbox from './teacher/TeacherInbox';
import TeacherAvailability from './teacher/TeacherAvailability';
import TeacherClasses from './teacher/TeacherClasses';
const TeacherDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sidebarItems = [
        { to: '/dashboard/teacher', icon: _jsx(HomeIcon, { className: "h-5 w-5" }), label: 'Overview', end: true },
        { to: '/dashboard/teacher/inbox', icon: _jsx(InboxIcon, { className: "h-5 w-5" }), label: 'Inbox' },
        { to: '/dashboard/teacher/availability', icon: _jsx(CalendarIcon, { className: "h-5 w-5" }), label: 'Availability' },
        { to: '/dashboard/teacher/classes', icon: _jsx(VideoCameraIcon, { className: "h-5 w-5" }), label: 'Classes' },
    ];
    // Helper to determine active state. The DashboardLayout might need updating if it doesn't handle full paths correctly for 'end' prop.
    // Actually standard NavLink in Sidebar usually handles this.
    // Update Title based on Route
    let title = "Overview";
    let description = `Welcome back, ${user?.name}`;
    if (location.pathname.includes('/inbox')) {
        title = "Inbox";
        description = "Manage your messages";
    }
    else if (location.pathname.includes('/availability')) {
        title = "My Availability";
        description = "Manage your weekly schedule";
    }
    else if (location.pathname.includes('/classes')) {
        title = "My Classes";
        description = "Manage your upcoming sessions";
    }
    return (_jsx(DashboardLayout, { sidebarItems: sidebarItems, title: title, description: description, children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(TeacherOverview, {}) }), _jsx(Route, { path: "inbox", element: _jsx(TeacherInbox, {}) }), _jsx(Route, { path: "availability", element: _jsx(TeacherAvailability, {}) }), _jsx(Route, { path: "classes", element: _jsx(TeacherClasses, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard/teacher", replace: true }) })] }) }));
};
export default TeacherDashboard;
