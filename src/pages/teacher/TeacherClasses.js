import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { teacherApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
const TeacherClasses = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [editingClassId, setEditingClassId] = useState(null);
    const [classForm, setClassForm] = useState({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [dash, subs] = await Promise.all([
                teacherApi.getDashboard(),
                teacherApi.getAssignedSubjects()
            ]);
            setClasses(dash.classes);
            setSubjects(subs);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await teacherApi.createClass({
                ...classForm,
                duration: Number(classForm.duration),
            });
            setActiveModal(null);
            setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' });
            loadData();
        }
        catch (err) {
            alert('Failed to create class');
        }
    };
    const handleUpdateClass = async (e) => {
        e.preventDefault();
        if (!editingClassId)
            return;
        try {
            await teacherApi.updateClass(editingClassId, {
                title: classForm.title,
                scheduledDate: classForm.scheduledDate,
                duration: Number(classForm.duration),
                meetingLink: classForm.meetingLink
            });
            setActiveModal(null);
            setEditingClassId(null);
            loadData();
        }
        catch (err) {
            alert('Failed to update class');
        }
    };
    const openEditClass = (cls) => {
        const date = new Date(cls.scheduledDate);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        const dateStr = date.toISOString().slice(0, 16);
        setClassForm({
            title: cls.title,
            subjectId: cls.subjectId._id,
            scheduledDate: dateStr,
            duration: cls.duration,
            classType: cls.classType,
            meetingLink: cls.meetingLink || ''
        });
        setEditingClassId(cls._id);
        setActiveModal('edit');
    };
    if (loading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Manage Classes" }), _jsx(Button, { onClick: () => {
                            setActiveModal('create');
                            setEditingClassId(null);
                            setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' });
                        }, children: "+ New Class" })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: classes.length === 0 ? (_jsxs("div", { className: "col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300", children: [_jsx("p", { className: "text-slate-500", children: "No classes scheduled yet." }), _jsx(Button, { variant: "ghost", className: "mt-2", onClick: () => setActiveModal('create'), children: "Schedule your first class" })] })) : (classes.map(cls => (_jsxs(Card, { className: "flex flex-col h-full hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("h3", { className: "font-bold text-slate-900 text-lg leading-tight", children: cls.title }), _jsx("span", { className: `text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${cls.classType === 'live' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`, children: cls.classType })] }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: cls.subjectId?.title })] }), _jsxs("div", { className: "mt-auto space-y-4", children: [_jsxs("div", { className: "text-sm text-slate-600", children: [_jsxs("div", { children: [new Date(cls.scheduledDate).toLocaleDateString(), " at ", new Date(cls.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] }), _jsxs("div", { children: ["Duration: ", cls.duration, " mins"] })] }), _jsxs("div", { className: "pt-4 border-t border-slate-100 flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => openEditClass(cls), children: "Edit" }), cls.meetingLink && _jsx(Button, { variant: "secondary", size: "sm", className: "flex-1", onClick: () => window.open(cls.meetingLink, '_blank'), children: "Join" })] })] })] }, cls._id)))) }), _jsx(Modal, { open: activeModal === 'create', onClose: () => setActiveModal(null), title: "Create New Class", children: _jsxs("form", { onSubmit: handleCreateClass, className: "space-y-4", children: [_jsx(FormField, { label: "Title", value: classForm.title, onChange: e => setClassForm({ ...classForm, title: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Subject" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: classForm.subjectId, onChange: e => setClassForm({ ...classForm, subjectId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Subject" }), subjects.map(s => _jsx("option", { value: s._id, children: s.title }, s._id))] })] }), _jsx(FormField, { label: "Date & Time", type: "datetime-local", value: classForm.scheduledDate, onChange: e => setClassForm({ ...classForm, scheduledDate: e.target.value }) }), _jsx(FormField, { label: "Duration (minutes)", type: "number", value: String(classForm.duration), onChange: e => setClassForm({ ...classForm, duration: Number(e.target.value) }) }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Type" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: classForm.classType, onChange: e => setClassForm({ ...classForm, classType: e.target.value }), children: [_jsx("option", { value: "live", children: "Live" }), _jsx("option", { value: "recorded", children: "Recorded" })] })] }), classForm.classType === 'live' && (_jsx(FormField, { label: "Meeting Link (e.g. Zoom/Meet)", value: classForm.meetingLink, onChange: e => setClassForm({ ...classForm, meetingLink: e.target.value }), placeholder: "https://..." })), _jsx(Button, { type: "submit", className: "w-full", children: "Create Class" })] }) }), _jsx(Modal, { open: activeModal === 'edit', onClose: () => setActiveModal(null), title: "Edit Class Session", children: _jsxs("form", { onSubmit: handleUpdateClass, className: "space-y-4", children: [_jsx(FormField, { label: "Title", value: classForm.title, onChange: e => setClassForm({ ...classForm, title: e.target.value }) }), _jsx(FormField, { label: "Date & Time", type: "datetime-local", value: classForm.scheduledDate, onChange: e => setClassForm({ ...classForm, scheduledDate: e.target.value }) }), _jsx(FormField, { label: "Duration (minutes)", type: "number", value: String(classForm.duration), onChange: e => setClassForm({ ...classForm, duration: Number(e.target.value) }) }), classForm.classType === 'live' && (_jsx(FormField, { label: "Meeting Link", value: classForm.meetingLink, onChange: e => setClassForm({ ...classForm, meetingLink: e.target.value }), placeholder: "https://..." })), _jsx(Button, { type: "submit", className: "w-full", children: "Update Session" })] }) })] }));
};
export default TeacherClasses;
