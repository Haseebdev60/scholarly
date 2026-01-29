import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import Button from './Button';
const MessageModal = ({ isOpen, onClose, recipientName, onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setIsSending(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onSubmit({ subject, message });
        setSubject('');
        setMessage('');
        setError('');
        setIsSending(false);
        onClose();
    };
    return (_jsx(Modal, { open: isOpen, onClose: onClose, title: `Message ${recipientName}`, children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(FormField, { label: "Subject", value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "What is this about?" }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Message" }), _jsx("textarea", { className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100", rows: 4, value: message, onChange: (e) => setMessage(e.target.value), placeholder: `Write your message to ${recipientName}...` })] }), error && _jsx("div", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSending, children: isSending ? 'Sending...' : 'Send Message' })] })] }) }));
};
export default MessageModal;
