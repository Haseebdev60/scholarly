import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import AlertDialog from '../../components/AlertDialog';
import { PencilSquareIcon, TrashIcon, UserCircleIcon, EyeIcon, } from '@heroicons/react/24/outline';
const AdminStudents = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    // State for modals
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [modalError, setModalError] = useState('');
    const [alertState, setAlertState] = useState({
        open: false, title: '', message: '', type: 'info'
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const usersData = await adminApi.getUsers();
            setUsers(usersData);
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetForms = () => {
        setEditForm({ name: '', email: '', password: '' });
        setModalError('');
        setActiveModal(null);
        setEditingUser(null);
        setViewingStudent(null);
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
            setAlertState({ open: true, title: 'Success', message: 'Student updated successfully', type: 'success' });
        }
        catch (error) {
            setModalError(error.message || 'Failed to update user');
        }
    };
    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this student? This cannot be undone.'))
            return;
        try {
            await adminApi.deleteUser(userId);
            loadData();
            setAlertState({ open: true, title: 'Success', message: 'Student deleted successfully', type: 'success' });
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
    const students = users.filter((u) => u.role === 'student');
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AlertDialog, { open: alertState.open, onClose: () => setAlertState(prev => ({ ...prev, open: false })), title: alertState.title, message: alertState.message, type: alertState.type }), _jsxs(Card, { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Registered Students" }), _jsxs("div", { className: "text-sm text-slate-600", children: ["Total: ", students.length] })] }), _jsx("div", { className: "space-y-2", children: students.length === 0 ? (_jsx("p", { className: "text-slate-500", children: "No students found." })) : (students.map((s) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-slate-900", children: s.name }), _jsx("div", { className: "text-xs text-slate-500", children: s.email })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-brand-600", onClick: () => {
                                                setViewingStudent(s);
                                                setActiveModal('student-details');
                                            }, children: _jsx(EyeIcon, { className: "h-5 w-5" }) }), _jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-brand-600", onClick: () => openEditModal(s), children: _jsx(PencilSquareIcon, { className: "h-5 w-5" }) }), _jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-red-600", onClick: () => handleDeleteUser(s._id), children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] })] }, s._id)))) })] }), _jsx(Modal, { open: activeModal === 'edit', onClose: resetForms, title: "Edit User", children: _jsxs("form", { onSubmit: handleEditUser, className: "space-y-4", children: [_jsx(FormField, { label: "Full Name", value: editForm.name, onChange: (e) => setEditForm({ ...editForm, name: e.target.value }) }), _jsx(FormField, { label: "Email Address", type: "email", value: editForm.email, onChange: (e) => setEditForm({ ...editForm, email: e.target.value }) }), _jsxs("div", { className: "border-t border-slate-100 pt-4 mt-4", children: [_jsx("h4", { className: "text-sm font-medium text-slate-900 mb-3", children: "Reset Password" }), _jsx(FormField, { label: "New Password (Optional)", type: "password", value: editForm.password, onChange: (e) => setEditForm({ ...editForm, password: e.target.value }), placeholder: "Leave empty to keep current password" })] }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Save Changes" })] }) }), _jsx(Modal, { open: activeModal === 'student-details', onClose: resetForms, title: "Student Details", children: viewingStudent && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 border-b border-slate-100 pb-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500", children: _jsx(UserCircleIcon, { className: "h-8 w-8" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: viewingStudent.name }), _jsx("p", { className: "text-sm text-slate-500", children: viewingStudent.email })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-slate-900 mb-2", children: "Enrolled Subjects" }), viewingStudent.enrolledSubjects && viewingStudent.enrolledSubjects.length > 0 ? (_jsx("div", { className: "space-y-2", children: viewingStudent.enrolledSubjects.map((subject) => (_jsx("div", { className: "flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm", children: _jsx("span", { className: "font-medium text-slate-700", children: subject.title || 'Unknown Subject' }) }, subject._id || Math.random()))) })) : (_jsx("p", { className: "text-sm text-slate-500", children: "No enrolled subjects." }))] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { variant: "secondary", className: "w-full", onClick: () => setActiveModal(null), children: "Close" }) })] })) })] }));
};
export default AdminStudents;
