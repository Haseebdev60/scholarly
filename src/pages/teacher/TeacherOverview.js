import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import { BookOpenIcon, DocumentArrowUpIcon, FilmIcon, TrashIcon, } from '@heroicons/react/24/outline';
const TeacherOverview = () => {
    const [classes, setClasses] = useState([]);
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [classForm, setClassForm] = useState({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' });
    const [uploadDoc, setUploadDoc] = useState({ title: '', subjectId: '', file: null, isPremium: false });
    const [uploadVideo, setUploadVideo] = useState({ title: '', subjectId: '', type: 'file', file: null, url: '', isPremium: false });
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
            setResources(dash.resources);
            setSubjects(subs);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
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
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };
    const handleUploadDoc = async (e) => {
        e.preventDefault();
        if (!uploadDoc.title || !uploadDoc.file || !uploadDoc.subjectId)
            return;
        try {
            const base64 = await convertToBase64(uploadDoc.file);
            await teacherApi.createResource({
                title: uploadDoc.title,
                subjectId: uploadDoc.subjectId,
                type: uploadDoc.file.name.split('.').pop() || 'doc',
                url: '',
                fileType: uploadDoc.file.type || 'application/octet-stream',
                size: (uploadDoc.file.size / 1024).toFixed(2) + ' KB',
                fileData: base64,
                fileName: uploadDoc.file.name,
                format: uploadDoc.file.name.split('.').pop()?.toUpperCase(),
                isPremium: uploadDoc.isPremium
            });
            alert('Document uploaded successfully!');
            setActiveModal(null);
            setUploadDoc({ title: '', subjectId: '', file: null, isPremium: false });
            loadData();
        }
        catch (err) {
            alert(`Failed to upload document: ${err.message || err}`);
        }
    };
    const generateVideoThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.currentTime = 1;
            video.onloadeddata = () => { };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            video.currentTime = 1;
        });
    };
    const getYouTubeThumbnail = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
        }
        return '';
    };
    const handleUploadVideo = async (e) => {
        e.preventDefault();
        if (!uploadVideo.title || !uploadVideo.subjectId)
            return;
        if (uploadVideo.type === 'file' && !uploadVideo.file)
            return;
        if (uploadVideo.type === 'link' && !uploadVideo.url)
            return;
        try {
            let base64 = '';
            let url = uploadVideo.url;
            let thumb = '';
            if (uploadVideo.type === 'file' && uploadVideo.file) {
                base64 = await convertToBase64(uploadVideo.file);
                url = '';
                try {
                    thumb = await generateVideoThumbnail(uploadVideo.file);
                }
                catch (e) {
                    console.error('Thumb gen failed', e);
                }
            }
            else if (uploadVideo.type === 'link') {
                thumb = getYouTubeThumbnail(uploadVideo.url);
            }
            await teacherApi.createResource({
                title: uploadVideo.title,
                subjectId: uploadVideo.subjectId,
                type: uploadVideo.type === 'file' ? 'video' : 'link',
                url: url,
                fileType: uploadVideo.type === 'file' ? uploadVideo.file.type : 'video/link',
                fileData: base64 || undefined,
                fileName: uploadVideo.file?.name,
                isPremium: uploadVideo.isPremium,
                thumbnail: thumb
            });
            alert('Video resource added successfully!');
            setActiveModal(null);
            setUploadVideo({ title: '', subjectId: '', type: 'file', file: null, url: '', isPremium: false });
            loadData();
        }
        catch (err) {
            console.error(err);
            alert(`Failed to upload video: ${err.message || err}`);
        }
    };
    const handleDeleteResource = async (id) => {
        if (!confirm('Are you sure you want to delete this resource?'))
            return;
        try {
            await teacherApi.deleteResource(id);
            loadData();
        }
        catch (err) {
            alert('Failed to delete resource');
        }
    };
    const filteredClasses = selectedSubjectId
        ? classes.filter(c => c.subjectId?._id === selectedSubjectId)
        : classes;
    const filteredResources = selectedSubjectId
        ? resources.filter(r => r.subjectId?._id === selectedSubjectId)
        : resources;
    if (isLoading)
        return _jsx("div", { className: "p-8", children: "Loading..." });
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex gap-2 pb-4 border-b border-slate-100", children: [_jsx(Button, { variant: "secondary", onClick: () => setActiveModal('upload-select'), children: "+ New Upload" }), _jsx(Button, { onClick: () => {
                            setActiveModal('createClass');
                            setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' });
                        }, children: "+ New Class" }), _jsx(Link, { to: "/dashboard/teacher/inbox", className: "ml-auto", children: _jsx(Button, { variant: "outline", children: "Messages" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Assigned Subjects" }), subjects.length === 0 ? (_jsx(Card, { className: "text-center text-slate-500 py-6", children: "You have not been assigned any subjects yet." })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: subjects.map((subject) => {
                            const isSelected = selectedSubjectId === subject._id;
                            return (_jsxs(Card, { onClick: () => setSelectedSubjectId(isSelected ? null : subject._id), className: `flex items-center gap-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${isSelected ? 'border-l-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-l-brand-500'}`, children: [_jsx("div", { className: `rounded-full p-3 ${isSelected ? 'bg-brand-200 text-brand-700' : 'bg-brand-100 text-brand-600'}`, children: _jsx(BookOpenIcon, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-slate-900", children: subject.title }), _jsx("p", { className: "text-xs text-slate-500", children: isSelected ? 'Selected' : 'Subject Coordinator' })] })] }, subject._id));
                        }) }))] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { className: "space-y-4 h-full", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Upcoming Sessions" }), selectedSubjectId && _jsx(Button, { variant: "ghost", className: "text-xs px-2 py-1", onClick: () => setSelectedSubjectId(null), children: "Clear Filter" })] }), filteredClasses.length === 0 ? (_jsxs("p", { className: "text-sm text-slate-500", children: ["No upcoming classes ", selectedSubjectId ? 'for this subject' : '', "."] })) : (_jsxs("ul", { className: "space-y-3", children: [filteredClasses.slice(0, 5).map((cls) => (_jsx("li", { className: "flex items-center justify-between rounded-lg bg-slate-50 p-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-900", children: cls.title }), _jsxs("div", { className: "text-xs text-slate-500", children: [new Date(cls.scheduledDate).toLocaleString(), " \u2022 ", cls.subjectId?.title || 'Unknown Subject'] })] }) }, cls._id))), filteredClasses.length > 5 && (_jsx("div", { className: "text-center pt-2", children: _jsx(Link, { to: "/dashboard/teacher/classes", className: "text-sm text-brand-600 hover:underline", children: "View all sessions" }) }))] }))] }), _jsxs(Card, { className: "space-y-4 h-full", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Recent Uploads" }) }), filteredResources.length === 0 ? (_jsxs("p", { className: "text-sm text-slate-500", children: ["No resources uploaded ", selectedSubjectId ? 'for this subject' : '', "."] })) : (_jsx("ul", { className: "space-y-3", children: filteredResources.map((res) => (_jsxs("li", { className: "flex items-center justify-between rounded-lg bg-slate-50 p-3", children: [_jsxs("div", { className: "overflow-hidden", children: [_jsx("div", { className: "font-semibold text-slate-900 truncate", children: res.title }), _jsxs("div", { className: "text-xs text-slate-500 uppercase", children: [res.type, " \u2022 ", res.subjectId?.title || 'General'] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("a", { href: res.url, target: "_blank", rel: "noreferrer", className: "p-1 text-slate-400 hover:text-brand-600", children: _jsx(DocumentArrowUpIcon, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleDeleteResource(res._id), className: "p-1 text-slate-400 hover:text-red-600", title: "Delete", children: _jsx(TrashIcon, { className: "h-4 w-4" }) })] })] }, res._id))) }))] })] }), _jsx(Modal, { open: activeModal === 'createClass', onClose: () => setActiveModal(null), title: "Create New Class", children: _jsxs("form", { onSubmit: handleCreateClass, className: "space-y-4", children: [_jsx(FormField, { label: "Title", value: classForm.title, onChange: e => setClassForm({ ...classForm, title: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Subject" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: classForm.subjectId, onChange: e => setClassForm({ ...classForm, subjectId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Subject" }), subjects.map(s => _jsx("option", { value: s._id, children: s.title }, s._id))] })] }), _jsx(FormField, { label: "Date & Time", type: "datetime-local", value: classForm.scheduledDate, onChange: e => setClassForm({ ...classForm, scheduledDate: e.target.value }) }), _jsx(FormField, { label: "Duration (minutes)", type: "number", value: String(classForm.duration), onChange: e => setClassForm({ ...classForm, duration: Number(e.target.value) }) }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Type" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: classForm.classType, onChange: e => setClassForm({ ...classForm, classType: e.target.value }), children: [_jsx("option", { value: "live", children: "Live" }), _jsx("option", { value: "recorded", children: "Recorded" })] })] }), classForm.classType === 'live' && (_jsx(FormField, { label: "Meeting Link (e.g. Zoom/Meet)", value: classForm.meetingLink, onChange: e => setClassForm({ ...classForm, meetingLink: e.target.value }), placeholder: "https://..." })), _jsx(Button, { type: "submit", className: "w-full", children: "Create Class" })] }) }), _jsx(Modal, { open: activeModal === 'upload-select', onClose: () => setActiveModal(null), title: "Select Upload Type", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4", children: [_jsxs("button", { onClick: () => setActiveModal('upload-doc'), className: "flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-4 text-blue-600", children: _jsx(DocumentArrowUpIcon, { className: "h-8 w-8" }) }), _jsx("span", { className: "font-semibold text-slate-900", children: "Document" })] }), _jsxs("button", { onClick: () => setActiveModal('upload-video'), className: "flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50", children: [_jsx("div", { className: "rounded-full bg-red-100 p-4 text-red-600", children: _jsx(FilmIcon, { className: "h-8 w-8" }) }), _jsx("span", { className: "font-semibold text-slate-900", children: "Video" })] })] }) }), _jsx(Modal, { open: activeModal === 'upload-doc', onClose: () => setActiveModal(null), title: "Upload Document", children: _jsxs("form", { onSubmit: handleUploadDoc, className: "space-y-4", children: [_jsx(FormField, { label: "Document Title", value: uploadDoc.title, onChange: (e) => setUploadDoc({ ...uploadDoc, title: e.target.value }), required: true }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Subject" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: uploadDoc.subjectId, onChange: e => setUploadDoc({ ...uploadDoc, subjectId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Subject" }), subjects.map(s => _jsx("option", { value: s._id, children: s.title }, s._id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Select File (PDF, DOC, etc)" }), _jsx("input", { type: "file", accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt", onChange: (e) => setUploadDoc({ ...uploadDoc, file: e.target.files ? e.target.files[0] : null }), className: "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100", required: true }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("input", { type: "checkbox", checked: uploadDoc.isPremium, onChange: (e) => setUploadDoc({ ...uploadDoc, isPremium: e.target.checked }), className: "rounded border-slate-300 text-brand-600 focus:ring-brand-500" }), _jsx("label", { className: "text-sm text-slate-700", children: "Premium Resource" })] })] }), _jsx(Button, { type: "submit", className: "w-full", children: "Upload Document" })] }) }), _jsx(Modal, { open: activeModal === 'upload-video', onClose: () => setActiveModal(null), title: "Upload Video", children: _jsxs("form", { onSubmit: handleUploadVideo, className: "space-y-4", children: [_jsx(FormField, { label: "Video Title", value: uploadVideo.title, onChange: (e) => setUploadVideo({ ...uploadVideo, title: e.target.value }), required: true }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Subject" }), _jsxs("select", { className: "w-full rounded-md border border-slate-300 p-2 text-sm", value: uploadVideo.subjectId, onChange: e => setUploadVideo({ ...uploadVideo, subjectId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Subject" }), subjects.map(s => _jsx("option", { value: s._id, children: s.title }, s._id))] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: uploadVideo.type === 'file', onChange: () => setUploadVideo({ ...uploadVideo, type: 'file' }) }), _jsx("span", { children: "Upload File" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: uploadVideo.type === 'link', onChange: () => setUploadVideo({ ...uploadVideo, type: 'link' }) }), _jsx("span", { children: "External Link" })] })] }), uploadVideo.type === 'file' ? (_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Select Video File" }), _jsx("input", { type: "file", accept: ".mp4,.mkv,.avi,.mov", onChange: (e) => setUploadVideo({ ...uploadVideo, file: e.target.files ? e.target.files[0] : null }), className: "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100", required: true })] })) : (_jsx(FormField, { label: "Video Link", value: uploadVideo.url, onChange: (e) => setUploadVideo({ ...uploadVideo, url: e.target.value }), placeholder: "https://youtube.com/...", required: true })), _jsx(Button, { type: "submit", className: "w-full", children: uploadVideo.type === 'file' ? 'Upload Video' : 'Save Video Link' })] }) })] }));
};
export default TeacherOverview;
