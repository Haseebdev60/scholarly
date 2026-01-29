import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { subjectApi, adminSubjectApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import AlertDialog from '../../components/AlertDialog';
import { TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
const AdminCourses = () => {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [modalError, setModalError] = useState('');
    const [alertState, setAlertState] = useState({
        open: false, title: '', message: '', type: 'info'
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const data = await subjectApi.getAll();
            setSubjects(data);
        }
        catch (error) {
            console.error('Failed to load courses:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseTitle.trim())
            return;
        setModalError('');
        try {
            await adminSubjectApi.create(newCourseTitle);
            loadData();
            setNewCourseTitle('');
            setActiveModal(null);
            setAlertState({ open: true, title: 'Success', message: 'Course created successfully', type: 'success' });
        }
        catch (error) {
            setModalError(error.message || 'Failed to create course');
        }
    };
    const handleDeleteCourse = async (courseId) => {
        if (!confirm('Are you sure you want to delete this course? This implies deleting all related resources and classes.'))
            return;
        try {
            await adminSubjectApi.delete(courseId);
            loadData();
            setAlertState({ open: true, title: 'Success', message: 'Course deleted successfully', type: 'success' });
        }
        catch (error) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete course', type: 'error' });
        }
    };
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AlertDialog, { open: alertState.open, onClose: () => setAlertState(prev => ({ ...prev, open: false })), title: alertState.title, message: alertState.message, type: alertState.type }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Course Management" }), _jsxs(Button, { onClick: () => setActiveModal('create'), className: "flex items-center gap-2", children: [_jsx(AcademicCapIcon, { className: "h-4 w-4" }), "Add Course"] })] }), _jsx(Card, { children: _jsx("div", { className: "space-y-2", children: subjects.length === 0 ? (_jsx("p", { className: "text-slate-500", children: "No courses available." })) : (subjects.map((s) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-slate-900", children: s.title }), _jsx("div", { className: "text-xs text-slate-500", children: s.teacherId ? `Teacher: ${s.teacherId.name}` : 'No Assigned Teacher' })] }), _jsx(Button, { variant: "ghost", className: "p-2 text-slate-500 hover:text-red-600", onClick: () => handleDeleteCourse(s._id), children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] }, s._id)))) }) }), _jsx(Modal, { open: activeModal === 'create', onClose: () => setActiveModal(null), title: "Add New Course", children: _jsxs("form", { onSubmit: handleCreateCourse, className: "space-y-4", children: [_jsx(FormField, { label: "Course Name (Subject)", value: newCourseTitle, onChange: (e) => setNewCourseTitle(e.target.value), placeholder: "e.g. Physics, History..." }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Create Course" })] }) })] }));
};
export default AdminCourses;
