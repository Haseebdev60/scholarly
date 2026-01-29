import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import AlertDialog from './AlertDialog';
const ProfileModal = ({ open, onClose }) => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info'
    });
    useEffect(() => {
        if (user) {
            setName(user.name);
            setPreview(user.avatar || '');
            setFile(null);
            setError('');
        }
    }, [user, open]);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            if (f.size > 2 * 1024 * 1024) {
                setError('File too large (max 2MB)');
                return;
            }
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setError('');
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let avatar = user?.avatar;
            if (file) {
                avatar = await convertToBase64(file);
            }
            const res = await authApi.updateProfile({ name, avatar });
            if (res.success) {
                if (user) {
                    updateUser({ ...user, ...res.user });
                }
                setAlertState({ open: true, title: 'Success', message: 'Profile updated successfully', type: 'success' });
            }
        }
        catch (err) {
            setError(err.message || 'Failed to update profile');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Modal, { open: open, onClose: onClose, title: "Edit Profile", children: [_jsx(AlertDialog, { open: alertState.open, onClose: () => {
                    setAlertState(prev => ({ ...prev, open: false }));
                    if (alertState.type === 'success') {
                        onClose();
                    }
                }, title: alertState.title, message: alertState.message, type: alertState.type }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "relative h-24 w-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center", children: preview ? (_jsx("img", { src: preview, alt: "Avatar", className: "h-full w-full object-cover" })) : (_jsx("span", { className: "text-4xl text-slate-300", children: "?" })) }), _jsxs("label", { className: "cursor-pointer rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200", children: ["Change Photo", _jsx("input", { type: "file", className: "hidden", accept: "image/*", onChange: handleFileChange })] })] }), _jsx(FormField, { label: "Full Name", value: name, onChange: e => setName(e.target.value), required: true }), error && _jsx("p", { className: "text-sm text-red-600 text-center", children: error }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: loading, children: loading ? 'Saving...' : 'Save Changes' })] })] })] }));
};
export default ProfileModal;
