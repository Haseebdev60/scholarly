import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi, subjectApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import AlertDialog from '../../components/AlertDialog';
import Badge from '../../components/Badge';
import { PencilSquareIcon, TrashIcon, UserCircleIcon, EyeIcon, PlusIcon, } from '@heroicons/react/24/outline';
const AdminTeachers = () => {
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    // State for modals
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });
    const [assignForm, setAssignForm] = useState({ teacherId: '', subjectId: '' });
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [viewingTeacher, setViewingTeacher] = useState(null);
    const [teacherStats, setTeacherStats] = useState(null);
    const [modalError, setModalError] = useState('');
    const [alertState, setAlertState] = useState({
        open: false, title: '', message: '', type: 'info'
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [usersData, subjectsData] = await Promise.all([adminApi.getUsers(), subjectApi.getAll()]);
            setUsers(usersData);
            setSubjects(subjectsData);
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetForms = () => {
        setNewTeacher({ name: '', email: '', password: '' });
        setAssignForm({ teacherId: '', subjectId: '' });
        setEditForm({ name: '', email: '', password: '' });
        setModalError('');
        setActiveModal(null);
        setEditingUser(null);
        setViewingTeacher(null);
        setTeacherStats(null);
    };
    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        setModalError('');
        try {
            await adminApi.createTeacher(newTeacher);
            loadData();
            resetForms();
            setAlertState({ open: true, title: 'Success', message: 'Teacher account created', type: 'success' });
        }
        catch (error) {
            setModalError(error.message || 'Failed to create teacher');
        }
    };
    const handleAssignSubject = async (e) => {
        e.preventDefault();
        if (!assignForm.teacherId || !assignForm.subjectId)
            return;
        setModalError('');
        try {
            await adminApi.assignSubject(assignForm.teacherId, assignForm.subjectId);
            loadData();
            resetForms();
            setAlertState({ open: true, title: 'Success', message: 'Subject assigned successfully', type: 'success' });
        }
        catch (error) {
            setModalError(error.message || 'Failed to assign subject');
        }
    };
    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!editingUser)
            return;
        setModalError('');
        try {
            await adminApi.updateUser(editingUser._id, editForm);
            loadData();
            resetForms();
            setAlertState({ open: true, title: 'Success', message: 'Teacher updated successfully', type: 'success' });
        }
        catch (error) {
            setModalError(error.message || 'Failed to update user');
        }
    };
    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this teacher? This cannot be undone.'))
            return;
        try {
            await adminApi.deleteUser(userId);
            loadData();
            setAlertState({ open: true, title: 'Success', message: 'Teacher deleted successfully', type: 'success' });
        }
        catch (error) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete user', type: 'error' });
        }
    };
    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, password: '' });
        setActiveModal('edit');
    };
    const openTeacherDetails = async (teacher) => {
        setViewingTeacher(teacher);
        setTeacherStats(null);
        setActiveModal('details');
        try {
            const stats = await adminApi.getTeacherStats(teacher._id);
            setTeacherStats(stats);
        }
        catch (error) {
            console.error('Failed to load stats', error);
        }
    };
    const teachers = users.filter((u) => u.role === 'teacher');
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AlertDialog, { open: alertState.open, onClose: () => setAlertState(prev => ({ ...prev, open: false })), title: alertState.title, message: alertState.message, type: alertState.type }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Teacher Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => setActiveModal('assign'), children: "Assign Subject" }), _jsxs(Button, { onClick: () => setActiveModal('hire'), className: "flex items-center gap-2", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), "Add Teacher"] })] })] }), _jsx(Card, { children: _jsx("div", { className: "space-y-2", children: teachers.length === 0 ? (_jsx("p", { className: "text-slate-500", children: "No teachers found." })) : (teachers.map((t) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400", children: _jsx(UserCircleIcon, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-slate-900", children: t.name }), _jsx("div", { className: "text-xs text-slate-500", children: t.email })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-brand-600", onClick: () => openTeacherDetails(t), children: _jsx(EyeIcon, { className: "h-5 w-5" }) }), _jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-brand-600", onClick: () => openEditModal(t), children: _jsx(PencilSquareIcon, { className: "h-5 w-5" }) }), _jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-red-600", onClick: () => handleDeleteUser(t._id), children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] })] }, t._id)))) }) }), _jsx(Modal, { open: activeModal === 'hire', onClose: resetForms, title: "Add Teacher", children: _jsxs("form", { onSubmit: handleCreateTeacher, className: "space-y-4", children: [_jsx(FormField, { label: "Full Name", value: newTeacher.name, onChange: (e) => setNewTeacher({ ...newTeacher, name: e.target.value }) }), _jsx(FormField, { label: "Email Address", type: "email", value: newTeacher.email, onChange: (e) => setNewTeacher({ ...newTeacher, email: e.target.value }) }), _jsx(FormField, { label: "Password", type: "password", value: newTeacher.password, onChange: (e) => setNewTeacher({ ...newTeacher, password: e.target.value }) }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Create Account" })] }) }), _jsx(Modal, { open: activeModal === 'assign', onClose: resetForms, title: "Assign Subject", children: _jsxs("form", { onSubmit: handleAssignSubject, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Teacher" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: assignForm.teacherId, onChange: (e) => setAssignForm({ ...assignForm, teacherId: e.target.value }), children: [_jsx("option", { value: "", children: "Select Teacher..." }), teachers.map(t => _jsx("option", { value: t._id, children: t.name }, t._id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Subject" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: assignForm.subjectId, onChange: (e) => setAssignForm({ ...assignForm, subjectId: e.target.value }), children: [_jsx("option", { value: "", children: "Select Subject..." }), subjects.map(s => _jsx("option", { value: s._id, children: s.title }, s._id))] })] }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Assign Subject" })] }) }), _jsx(Modal, { open: activeModal === 'edit', onClose: resetForms, title: "Edit User", children: _jsxs("form", { onSubmit: handleEditUser, className: "space-y-4", children: [_jsx(FormField, { label: "Full Name", value: editForm.name, onChange: (e) => setEditForm({ ...editForm, name: e.target.value }) }), _jsx(FormField, { label: "Email Address", type: "email", value: editForm.email, onChange: (e) => setEditForm({ ...editForm, email: e.target.value }) }), _jsxs("div", { className: "border-t border-slate-100 pt-4 mt-4", children: [_jsx("h4", { className: "text-sm font-medium text-slate-900 mb-3", children: "Reset Password" }), _jsx(FormField, { label: "New Password (Optional)", type: "password", value: editForm.password, onChange: (e) => setEditForm({ ...editForm, password: e.target.value }), placeholder: "Leave empty to keep current password" })] }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Save Changes" })] }) }), _jsx(Modal, { open: activeModal === 'details', onClose: resetForms, title: "Teacher Details", children: viewingTeacher && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 border-b border-slate-100 pb-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500", children: _jsx(UserCircleIcon, { className: "h-8 w-8" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: viewingTeacher.name }), _jsx("p", { className: "text-sm text-slate-500", children: viewingTeacher.email })] })] }), !teacherStats ? (_jsx("div", { className: "text-center py-4 text-slate-500", children: "Loading stats..." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-lg bg-brand-50 p-4", children: [_jsx("div", { className: "text-sm font-medium text-brand-800", children: "Assigned Students" }), _jsx("div", { className: "mt-1 text-2xl font-bold text-brand-900", children: teacherStats.studentCount }), _jsxs("div", { className: "text-xs text-brand-600", children: ["Across ", teacherStats.assignedSubjects.length, " subjects"] })] }), _jsxs("div", { className: "rounded-lg bg-orange-50 p-4", children: [_jsx("div", { className: "text-sm font-medium text-orange-800", children: "Classes Taught" }), _jsx("div", { className: "mt-1 text-2xl font-bold text-orange-900", children: teacherStats.classCounts.total }), _jsx("div", { className: "text-xs text-orange-600", children: "Total sessions" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-slate-900 mb-2", children: "Detailed Breakdown" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-sm", children: [_jsxs("div", { className: "bg-slate-50 p-2 rounded-lg", children: [_jsx("div", { className: "font-bold text-slate-900", children: teacherStats.classCounts.thisWeek }), _jsx("div", { className: "text-xs text-slate-500", children: "This Week" })] }), _jsxs("div", { className: "bg-slate-50 p-2 rounded-lg", children: [_jsx("div", { className: "font-bold text-slate-900", children: teacherStats.classCounts.thisMonth }), _jsx("div", { className: "text-xs text-slate-500", children: "This Month" })] }), _jsxs("div", { className: "bg-slate-50 p-2 rounded-lg", children: [_jsx("div", { className: "font-bold text-slate-900", children: teacherStats.classCounts.thisYear }), _jsx("div", { className: "text-xs text-slate-500", children: "This Year" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-slate-900 mb-2", children: "Assigned Subjects & Enrolled Students" }), _jsx("div", { className: "flex flex-col gap-2", children: teacherStats.assignedSubjects.length === 0 ? (_jsx("span", { className: "text-xs text-slate-500", children: "No subjects assigned." })) : (teacherStats.assignedSubjects.map(s => (_jsxs("div", { className: "flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm", children: [_jsx("span", { className: "font-medium text-slate-700", children: s.title }), _jsxs(Badge, { children: [s.studentCount, " Students"] })] }, s._id)))) })] })] })), _jsx("div", { className: "pt-2", children: _jsx(Button, { variant: "secondary", className: "w-full", onClick: () => setActiveModal(null), children: "Close" }) })] })) })] }));
};
export default AdminTeachers;
