import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { studentApi } from './lib/api';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Button from './components/Button';
import About from './pages/About';
import AuthPage from './pages/AuthPage';
import Courses from './pages/Courses';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Teachers from './pages/Teachers';
import MessageModal from './components/MessageModal';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
const AppContent = () => {
    const { user } = useAuth();
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [authRole, setAuthRole] = useState('student');
    const [notice, setNotice] = useState(null);
    // Messaging State
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageRecipient, setMessageRecipient] = useState(null);
    const [messageRecipientId, setMessageRecipientId] = useState(null);
    const openAuth = (mode, role = 'student') => {
        setAuthMode(mode);
        setAuthRole(role); // Default, but user can change in modal
        setAuthOpen(true);
    };
    const openMessage = (id, teacherName) => {
        if (!user) {
            openAuth('login', 'student');
            return;
        }
        setMessageRecipient(teacherName);
        setMessageRecipientId(id);
        setMessageOpen(true);
    };
    const handleMessageSubmit = async ({ subject, message }) => {
        if (!messageRecipient || !messageRecipientId)
            return;
        try {
            await studentApi.sendMessage(messageRecipientId, messageRecipient, subject, message);
            setNotice('Message sent successfully! The teacher will reply soon.');
        }
        catch (err) {
            setNotice(`Failed to send message: ${err.message}`);
        }
    };
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-slate-50", children: [_jsx(Navbar, { onLogin: () => openAuth('login'), onSignup: () => openAuth('register') }), _jsx("main", { className: "flex-1", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, { onOpenAuth: openAuth, onMessage: (id, name) => openMessage(id, name) }) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/courses", element: _jsx(Courses, { onEnroll: () => openAuth('register', 'student') }) }), _jsx(Route, { path: "/teachers", element: _jsx(ErrorBoundary, { children: _jsx(Teachers, { onContact: openMessage }) }) }), _jsx(Route, { path: "/quizzes", element: _jsx(Quizzes, {}) }), _jsx(Route, { path: "/auth", element: _jsx(AuthPage, { onSuccess: (message) => setNotice(message) }) }), _jsx(Route, { path: "/dashboard/student", element: _jsx(StudentDashboard, {}) }), _jsx(Route, { path: "/dashboard/teacher/*", element: _jsx(TeacherDashboard, {}) }), _jsx(Route, { path: "/dashboard/admin/*", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Home, { onOpenAuth: openAuth, onMessage: (id, name) => openMessage(id, name) }) })] }) }), _jsx(Footer, {}), _jsx(AuthModal, { open: authOpen, onClose: () => setAuthOpen(false), initialMode: authMode, initialRole: authRole }), notice && (_jsxs("div", { className: "fixed bottom-4 right-4 max-w-xs rounded-xl bg-white p-4 shadow-soft ring-1 ring-slate-200 z-50 animate-fade-in", children: [_jsx("div", { className: "text-sm font-semibold text-slate-900", children: "Notification" }), _jsx("div", { className: "text-sm text-slate-600", children: notice }), _jsx("div", { className: "mt-2 flex justify-end", children: _jsx(Button, { variant: "ghost", className: "text-xs", onClick: () => setNotice(null), children: "Dismiss" }) })] })), _jsx(MessageModal, { isOpen: messageOpen, onClose: () => setMessageOpen(false), recipientName: messageRecipient || 'Teacher', onSubmit: handleMessageSubmit })] }));
};
const App = () => {
    return (_jsx(BrowserRouter, { children: _jsx(AppContent, {}) }));
};
export default App;
