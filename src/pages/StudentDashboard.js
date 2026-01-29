import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ArrowDownTrayIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { studentApi, subscriptionApi, publicApi } from '../lib/api';
const StudentDashboard = () => {
    const { user, subscriptionStatus, refreshSubscription } = useAuth();
    const navigate = useNavigate();
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    // Chat State
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const sidebarItems = [
        { to: '/dashboard/student', icon: _jsx(HomeIcon, { className: "h-5 w-5" }), label: 'Overview', end: true },
        { to: '/courses', icon: _jsx(BookOpenIcon, { className: "h-5 w-5" }), label: 'Browse Courses' },
        { to: '/quizzes', icon: _jsx(ArrowDownTrayIcon, { className: "h-5 w-5" }), label: 'Downloads' },
        { to: '/teachers', icon: _jsx(UserGroupIcon, { className: "h-5 w-5" }), label: 'Find Teachers' },
    ];
    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/auth');
            return;
        }
        loadData();
    }, [user]);
    const loadData = async () => {
        try {
            const [subjects, classes, books] = await Promise.all([
                studentApi.getEnrolledSubjects(),
                studentApi.getAvailableClasses(),
                studentApi.getBookings()
            ]);
            setEnrolledSubjects(subjects);
            setUpcomingClasses(classes);
            setBookings(books);
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleBuySubscription = async (plan) => {
        try {
            await subscriptionApi.buySubscription(plan);
            await refreshSubscription();
            alert(`Subscription purchased! ${plan === 'weekly' ? 'Weekly' : 'Monthly'} plan activated.`);
        }
        catch (error) {
            alert(`Failed to purchase subscription: ${error.message}`);
        }
    };
    if (!user || user.role !== 'student') {
        return null;
    }
    const hasSubscription = subscriptionStatus?.isActive ?? false;
    const subscriptionText = subscriptionStatus
        ? subscriptionStatus.isActive
            ? `${subscriptionStatus.status === 'weekly' ? 'Weekly' : 'Monthly'} plan - expires ${new Date(subscriptionStatus.expiryDate || '').toLocaleDateString()}`
            : 'No active subscription'
        : 'Loading...';
    if (!hasSubscription) {
        return (_jsx(DashboardLayout, { sidebarItems: sidebarItems, title: "Overview", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-slate-900", children: ["Welcome back, ", user.name] }), _jsx("p", { className: "text-slate-600", children: "No active subscription" })] }) }), _jsxs(Card, { className: "space-y-3 bg-brand-50 border-brand-100", children: [_jsx("div", { className: "text-lg font-semibold text-brand-900", children: "Unlock Full Access" }), _jsx("p", { className: "text-sm text-brand-700", children: "Purchase a subscription to access student dashboards, teacher collaboration, downloads, and quizzes with AI checks." }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { className: "w-fit", variant: "primary", onClick: () => handleBuySubscription('weekly'), children: "Buy Weekly (PKR 300)" }), _jsx(Button, { className: "w-fit", variant: "outline", onClick: () => handleBuySubscription('monthly'), children: "Buy Monthly (PKR 1000)" })] })] })] }) }));
    }
    return (_jsxs(DashboardLayout, { sidebarItems: sidebarItems, title: "Overview", description: `Welcome back, ${user.name}`, children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs(Card, { className: "space-y-2 hover:shadow-md transition-shadow", children: [_jsx("div", { className: "text-sm font-medium text-slate-500", children: "Active Courses" }), _jsx("div", { className: "text-3xl font-bold text-brand-600", children: enrolledSubjects.length })] }), _jsxs(Card, { className: "space-y-2 hover:shadow-md transition-shadow", children: [_jsx("div", { className: "text-sm font-medium text-slate-500", children: "Subscription Status" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-xl font-bold text-slate-900 capitalize", children: subscriptionStatus?.status || 'Free' }), _jsx(Badge, { color: "green", children: "Active" })] }), _jsx("div", { className: "text-xs text-slate-500 truncate", children: subscriptionText })] }), _jsxs(Card, { className: "flex flex-col justify-center gap-2", children: [_jsxs(Button, { variant: "primary", className: "w-full justify-center", onClick: async () => {
                                            setShowChat(true);
                                            try {
                                                const convs = await studentApi.getConversations();
                                                setConversations(convs);
                                            }
                                            catch (e) {
                                                console.error(e);
                                            }
                                        }, children: [_jsx(ChatBubbleLeftRightIcon, { className: "w-5 h-5 mr-2" }), "Messages"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-center", onClick: () => navigate('/quizzes'), children: [_jsx(ArrowDownTrayIcon, { className: "w-5 h-5 mr-2" }), "Downloads"] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Upcoming Live Sessions" }) }), isLoading ? (_jsx("div", { className: "animate-pulse space-y-4", children: [1, 2].map(i => _jsx("div", { className: "h-32 bg-slate-100 rounded-xl" }, i)) })) : upcomingClasses.length === 0 ? (_jsx(Card, { className: "bg-slate-50 border-dashed text-center py-8", children: _jsx("p", { className: "text-slate-500", children: "No upcoming sessions scheduled." }) })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: upcomingClasses.map((cls) => (_jsxs(Card, { className: "space-y-4 border-l-4 border-l-brand-500", hover: true, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "font-semibold text-slate-900 line-clamp-1", title: cls.title, children: cls.title }), _jsx(Badge, { color: "red", className: "animate-pulse", children: "Live" })] }), _jsxs("div", { className: "space-y-2 text-sm text-slate-600", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: ["\uD83D\uDCC5 ", new Date(cls.scheduledDate).toLocaleDateString()] }), _jsxs("span", { children: ["\u23F0 ", new Date(cls.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] })] }), _jsxs("div", { children: ["\u23F3 ", cls.duration, " min duration"] })] }), cls.meetingLink && (_jsx(Button, { className: "w-full justify-center", onClick: () => window.open(cls.meetingLink, '_blank'), children: "Join Class" }))] }, cls._id))) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "My Private Classes" }), bookings.length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No private classes booked yet." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: bookings.map((book) => (_jsxs(Card, { className: "space-y-4", hover: true, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "font-semibold text-slate-900", children: ["vs. ", book.teacherId?.name] }), _jsx(Badge, { color: book.status === 'confirmed' ? 'brand' :
                                                        book.status === 'pending_payment' ? 'amber' : 'slate', children: book.status.replace('_', ' ') })] }), _jsxs("div", { className: "text-sm text-slate-500 space-y-1", children: [_jsx("div", { children: new Date(book.date).toLocaleString() }), _jsxs("div", { children: [book.duration, " mins \u2022 PKR ", book.price] }), book.meetingLink && book.status === 'confirmed' && (_jsx("a", { href: book.meetingLink, target: "_blank", className: "text-brand-600 hover:underline font-medium block mt-1", children: "Join Meeting Link" }))] }), _jsxs("div", { className: "pt-2 flex gap-2", children: [book.status === 'pending_payment' && (_jsx(Button, { size: "sm", className: "flex-1 bg-amber-600 hover:bg-amber-700", onClick: async () => {
                                                        if (!confirm(`Pay PKR ${book.price} for this class?`))
                                                            return;
                                                        try {
                                                            await studentApi.payBooking(book._id);
                                                            alert('Payment successful! Booking confirmed.');
                                                            loadData();
                                                        }
                                                        catch (e) {
                                                            alert(`Payment failed: ${e.message}`);
                                                        }
                                                    }, children: "Pay Now" })), (book.status === 'pending_payment' || book.status === 'confirmed') && (_jsx(Button, { size: "sm", variant: "danger", className: "flex-1", onClick: async () => {
                                                        if (!confirm('Cancel booking?'))
                                                            return;
                                                        try {
                                                            await studentApi.cancelBooking(book._id);
                                                            loadData();
                                                        }
                                                        catch (e) {
                                                            alert('Failed to cancel');
                                                        }
                                                    }, children: "Cancel" }))] })] }, book._id))) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Enrolled Subjects" }), isLoading ? (_jsx("div", { className: "text-slate-500", children: "Loading subjects..." })) : enrolledSubjects.length === 0 ? (_jsxs(Card, { className: "bg-slate-50 border-dashed p-8 text-center", children: [_jsx(BookOpenIcon, { className: "h-12 w-12 text-slate-300 mx-auto mb-3" }), _jsx("h3", { className: "text-lg font-medium text-slate-900", children: "No subjects yet" }), _jsx("p", { className: "text-slate-500 mb-4", children: "Start your learning journey today." }), _jsx(Button, { variant: "primary", onClick: () => navigate('/courses'), children: "Browse Courses" })] })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: enrolledSubjects.map((subject) => (_jsxs(Card, { className: "space-y-3 h-full flex flex-col", hover: true, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 line-clamp-1", children: subject.title }), _jsx(Badge, { color: subject.isPremium ? 'brand' : 'slate', children: subject.isPremium ? 'Premium' : 'Free' })] }), _jsx("p", { className: "text-sm text-slate-600 line-clamp-2 flex-1", children: subject.description })] }, subject._id))) }))] })] }), _jsx(Modal, { open: showChat, onClose: () => setShowChat(false), title: "Messages", maxWidth: "max-w-4xl", children: _jsxs("div", { className: "flex h-[60vh] gap-4", children: [_jsxs("div", { className: "w-1/3 border-r border-slate-100 pr-2 overflow-y-auto custom-scrollbar", children: [_jsx("h3", { className: "font-bold text-slate-700 mb-3 px-2", children: "Conversations" }), conversations.length === 0 ? _jsx("p", { className: "text-sm text-slate-400 px-2", children: "No chats yet." }) : (_jsx("ul", { className: "space-y-1", children: conversations.map(c => (_jsxs("li", { onClick: async () => {
                                            setActiveConversation(c._id);
                                            const thread = await studentApi.getThread(c._id);
                                            setChatHistory(thread);
                                        }, className: `p-3 rounded-lg cursor-pointer transition-colors ${activeConversation === c._id ? 'bg-brand-50 text-brand-900' : 'hover:bg-slate-50 text-slate-700'}`, children: [_jsx("div", { className: "font-semibold text-sm", children: c.name }), _jsx("div", { className: "text-xs text-slate-500 truncate mt-0.5", children: c.lastMessage.content })] }, c._id))) })), _jsx("div", { className: "mt-4 px-2", children: _jsx(Button, { size: "sm", variant: "outline", className: "w-full text-xs", onClick: async () => {
                                            try {
                                                const admin = await publicApi.getAdminContact();
                                                if (admin) {
                                                    setActiveConversation(admin._id);
                                                    const thread = await studentApi.getThread(admin._id);
                                                    setChatHistory(thread);
                                                    // refresh convs
                                                    const convs = await studentApi.getConversations();
                                                    setConversations(convs);
                                                }
                                            }
                                            catch (e) {
                                                alert('Could not contact admin');
                                            }
                                        }, children: "Contact Admin" }) })] }), _jsx("div", { className: "flex-1 flex flex-col bg-slate-50 rounded-xl overflow-hidden", children: activeConversation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar", children: chatHistory.map((msg, idx) => {
                                            const isMe = msg.senderId === user?._id;
                                            return (_jsx("div", { className: `flex ${isMe ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`, children: msg.content }) }, idx));
                                        }) }), _jsxs("div", { className: "p-3 bg-white border-t border-slate-200 flex gap-2", children: [_jsx("input", { className: "flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500", placeholder: "Type a message...", value: chatInput, onChange: e => setChatInput(e.target.value), onKeyDown: async (e) => {
                                                    if (e.key === 'Enter' && chatInput.trim()) {
                                                        await studentApi.sendMessage(activeConversation, 'Teacher', 'Chat', chatInput);
                                                        setChatInput('');
                                                        const thread = await studentApi.getThread(activeConversation);
                                                        setChatHistory(thread);
                                                    }
                                                } }), _jsx(Button, { size: "sm", onClick: async () => {
                                                    if (!chatInput.trim())
                                                        return;
                                                    await studentApi.sendMessage(activeConversation, 'Teacher', 'Chat', chatInput);
                                                    setChatInput('');
                                                    const thread = await studentApi.getThread(activeConversation);
                                                    setChatHistory(thread);
                                                }, children: "Send" })] })] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-slate-400", children: [_jsx(ChatBubbleLeftRightIcon, { className: "w-12 h-12 mb-2 opacity-50" }), _jsx("p", { children: "Select a conversation to start chatting" })] })) })] }) })] }));
};
export default StudentDashboard;
