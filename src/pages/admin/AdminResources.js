import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi, publicApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import AlertDialog from '../../components/AlertDialog';
import { TrashIcon, DocumentArrowUpIcon, FilmIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    // Upload Forms
    const [uploadDoc, setUploadDoc] = useState({ title: '', file: null, isPremium: false });
    const [uploadVideo, setUploadVideo] = useState({ title: '', type: 'file', file: null, url: '', isPremium: false });
    const [modalError, setModalError] = useState('');
    const [alertState, setAlertState] = useState({
        open: false, title: '', message: '', type: 'info'
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const data = await publicApi.getDownloads();
            setResources(data);
        }
        catch (error) {
            console.error('Failed to load resources:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteResource = async (resourceId) => {
        if (!confirm('Are you sure you want to delete this resource?'))
            return;
        try {
            await adminApi.deleteResource(resourceId);
            loadData();
            setAlertState({ open: true, title: 'Success', message: 'Resource deleted successfully', type: 'success' });
        }
        catch (error) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete resource', type: 'error' });
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
        if (!uploadDoc.title || !uploadDoc.file)
            return;
        setModalError('');
        try {
            const base64 = await convertToBase64(uploadDoc.file);
            await adminApi.uploadResource({
                title: uploadDoc.title,
                type: uploadDoc.file.name.split('.').pop() || 'doc',
                url: '',
                fileType: uploadDoc.file.type || 'application/octet-stream',
                size: (uploadDoc.file.size / 1024).toFixed(2) + ' KB',
                fileData: base64,
                fileName: uploadDoc.file.name,
                isPremium: uploadDoc.isPremium
            });
            setAlertState({ open: true, title: 'Success', message: 'Document uploaded successfully!', type: 'success' });
            setActiveModal(null);
            setUploadDoc({ title: '', file: null, isPremium: false });
            loadData();
        }
        catch (error) {
            setModalError(error.message || 'Upload failed');
        }
    };
    const generateVideoThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => { video.currentTime = 1; };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
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
        if (!uploadVideo.title)
            return;
        if (uploadVideo.type === 'file' && !uploadVideo.file)
            return;
        if (uploadVideo.type === 'link' && !uploadVideo.url)
            return;
        setModalError('');
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
                catch (e) { }
            }
            else if (uploadVideo.type === 'link') {
                thumb = getYouTubeThumbnail(uploadVideo.url);
            }
            await adminApi.uploadResource({
                title: uploadVideo.title,
                type: uploadVideo.type === 'file' ? 'video' : 'link',
                url: url,
                fileType: uploadVideo.type === 'file' ? uploadVideo.file.type : 'video/link',
                fileData: base64 || undefined,
                fileName: uploadVideo.file?.name,
                isPremium: uploadVideo.isPremium,
                thumbnail: thumb
            });
            setAlertState({ open: true, title: 'Success', message: 'Video resource added successfully!', type: 'success' });
            setActiveModal(null);
            setUploadVideo({ title: '', type: 'file', file: null, url: '', isPremium: false });
            loadData();
        }
        catch (error) {
            setModalError(error.message || 'Upload failed');
        }
    };
    const documents = resources.filter(r => ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(r.type) || r.type === 'pdf');
    const videos = resources.filter(r => ['video', 'mp4', 'mkv', 'avi', 'mov', 'link'].includes(r.type) || r.type === 'video');
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AlertDialog, { open: alertState.open, onClose: () => setAlertState(prev => ({ ...prev, open: false })), title: alertState.title, message: alertState.message, type: alertState.type }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Manage Resources" }), _jsxs(Button, { onClick: () => setActiveModal('upload-select'), className: "flex items-center gap-2", children: [_jsx(ArrowUpTrayIcon, { className: "h-4 w-4" }), "Upload"] })] }), _jsx(Card, { children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h4", { className: "mb-2 font-semibold text-slate-800 border-b pb-2", children: "Documents" }), documents.length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No documents found." })) : (_jsx("div", { className: "space-y-2", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50", children: [_jsxs("div", { className: "flex items-center gap-3 overflow-hidden", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-2 text-blue-600 shrink-0", children: _jsx(DocumentArrowUpIcon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "truncate", children: [_jsx("div", { className: "font-medium text-slate-900 truncate", children: doc.title }), _jsxs("div", { className: "text-xs text-slate-500 uppercase", children: [doc.type, " \u2022 ", doc.uploadedBy ? `By ${doc.uploadedBy}` : 'Unknown'] })] })] }), _jsx(Button, { variant: "ghost", className: "shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50", onClick: () => handleDeleteResource(doc._id), title: "Delete Document", children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] }, doc._id))) }))] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-2 font-semibold text-slate-800 border-b pb-2", children: "Videos" }), videos.length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No videos found." })) : (_jsx("div", { className: "space-y-2", children: videos.map((video) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50", children: [_jsxs("div", { className: "flex items-center gap-3 overflow-hidden", children: [_jsx("div", { className: "rounded-full bg-red-100 p-2 text-red-600 shrink-0", children: _jsx(FilmIcon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "truncate", children: [_jsx("div", { className: "font-medium text-slate-900 truncate", children: video.title }), _jsxs("div", { className: "text-xs text-slate-500 uppercase", children: [video.type, " \u2022 ", video.uploadedBy ? `By ${video.uploadedBy}` : 'Unknown'] })] })] }), _jsx(Button, { variant: "ghost", className: "shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50", onClick: () => handleDeleteResource(video._id), title: "Delete Video", children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] }, video._id))) }))] })] }) }), _jsx(Modal, { open: activeModal === 'upload-select', onClose: () => setActiveModal(null), title: "Select Upload Type", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4", children: [_jsxs("button", { onClick: () => setActiveModal('upload-doc'), className: "flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-4 text-blue-600", children: _jsx(DocumentArrowUpIcon, { className: "h-8 w-8" }) }), _jsx("span", { className: "font-semibold text-slate-900", children: "Document" })] }), _jsxs("button", { onClick: () => setActiveModal('upload-video'), className: "flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50", children: [_jsx("div", { className: "rounded-full bg-red-100 p-4 text-red-600", children: _jsx(FilmIcon, { className: "h-8 w-8" }) }), _jsx("span", { className: "font-semibold text-slate-900", children: "Video" })] })] }) }), _jsx(Modal, { open: activeModal === 'upload-doc', onClose: () => setActiveModal(null), title: "Upload Document", children: _jsxs("form", { onSubmit: handleUploadDoc, className: "space-y-4", children: [_jsx(FormField, { label: "Document Title", value: uploadDoc.title, onChange: (e) => setUploadDoc({ ...uploadDoc, title: e.target.value }), required: true }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Select File" }), _jsx("input", { type: "file", accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt", onChange: (e) => setUploadDoc({ ...uploadDoc, file: e.target.files ? e.target.files[0] : null }), className: "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100", required: true }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("input", { type: "checkbox", checked: uploadDoc.isPremium, onChange: (e) => setUploadDoc({ ...uploadDoc, isPremium: e.target.checked }), className: "rounded border-slate-300 text-brand-600 focus:ring-brand-500" }), _jsx("label", { className: "text-sm text-slate-700", children: "Premium Resource" })] })] }), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: "Upload Document" })] }) }), _jsx(Modal, { open: activeModal === 'upload-video', onClose: () => setActiveModal(null), title: "Upload Video", children: _jsxs("form", { onSubmit: handleUploadVideo, className: "space-y-4", children: [_jsx(FormField, { label: "Video Title", value: uploadVideo.title, onChange: (e) => setUploadVideo({ ...uploadVideo, title: e.target.value }), required: true }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: uploadVideo.type === 'file', onChange: () => setUploadVideo({ ...uploadVideo, type: 'file' }) }), _jsx("span", { children: "Upload File" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: uploadVideo.type === 'link', onChange: () => setUploadVideo({ ...uploadVideo, type: 'link' }) }), _jsx("span", { children: "External Link" })] })] }), uploadVideo.type === 'file' ? (_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "Select Video File" }), _jsx("input", { type: "file", accept: ".mp4,.mkv,.avi,.mov", onChange: (e) => setUploadVideo({ ...uploadVideo, file: e.target.files ? e.target.files[0] : null }), className: "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100", required: true })] })) : (_jsx(FormField, { label: "Video Link", value: uploadVideo.url, onChange: (e) => setUploadVideo({ ...uploadVideo, url: e.target.value }), placeholder: "https://youtube.com/...", required: true })), modalError && _jsx("div", { className: "text-sm text-red-600", children: modalError }), _jsx(Button, { type: "submit", className: "w-full", children: uploadVideo.type === 'file' ? 'Upload Video' : 'Save Video Link' })] }) })] }));
};
export default AdminResources;
