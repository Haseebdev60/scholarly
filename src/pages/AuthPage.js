import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
const initialState = {
    name: '',
    email: '',
    password: '',
    subject: '',
};
const AuthFormCard = ({ role, onSuccess }) => {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const title = useMemo(() => (mode === 'login' ? `${role === 'student' ? 'Student' : 'Teacher'} Login` : `Register as ${role}`), [mode, role]);
    const validate = () => {
        const nextErrors = {};
        if (!form.email.includes('@'))
            nextErrors.email = 'Enter a valid email';
        if (form.password.length < 6)
            nextErrors.password = 'Use at least 6 characters';
        if (mode === 'register' && !form.name.trim())
            nextErrors.name = 'Name is required';
        if (mode === 'register' && role === 'teacher' && !form.subject.trim())
            nextErrors.subject = 'Subject focus is required';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate())
            return;
        onSuccess(`${title} form submitted for ${form.email}`);
        setForm(initialState);
    };
    return (_jsxs(Card, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-slate-500", children: role === 'student' ? 'Students' : 'Teachers' }), _jsx("div", { className: "text-lg font-semibold text-slate-900", children: title })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("button", { className: `rounded-full px-3 py-1 ${mode === 'login' ? 'bg-brand-50 text-brand-700' : 'text-slate-500'}`, onClick: () => setMode('login'), type: "button", children: "Login" }), _jsx("button", { className: `rounded-full px-3 py-1 ${mode === 'register' ? 'bg-brand-50 text-brand-700' : 'text-slate-500'}`, onClick: () => setMode('register'), type: "button", children: "Register" })] })] }), _jsxs("form", { className: "space-y-3", onSubmit: handleSubmit, children: [mode === 'register' && (_jsx(FormField, { label: "Full name", placeholder: role === 'student' ? 'Student name' : 'Instructor name', value: form.name, error: errors.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })), _jsx(FormField, { label: "Email", placeholder: role === 'student' ? 'student@email.com' : 'teacher@email.com', type: "email", value: form.email, error: errors.email, onChange: (e) => setForm({ ...form, email: e.target.value }) }), _jsx(FormField, { label: "Password", placeholder: "At least 6 characters", type: "password", value: form.password, error: errors.password, onChange: (e) => setForm({ ...form, password: e.target.value }) }), mode === 'register' && role === 'teacher' && (_jsx(FormField, { label: "Subjects you teach", placeholder: "e.g., Mathematics, Physics", value: form.subject, error: errors.subject, onChange: (e) => setForm({ ...form, subject: e.target.value }) })), _jsx(Button, { type: "submit", className: "w-full", children: mode === 'login' ? 'Login' : 'Create account' })] }), _jsx("p", { className: "text-xs text-slate-500", children: "This is a front-end demo. Form validation is client-side only; no data is stored." })] }));
};
const AuthPage = ({ onSuccess }) => {
    return (_jsxs("div", { className: "mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6 lg:px-8", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Badge, { children: "Access" }), _jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Login or register" }), _jsx("p", { className: "text-slate-600", children: "Dedicated forms for students and teachers with quick client-side validation." })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(AuthFormCard, { role: "student", onSuccess: onSuccess }), _jsx(AuthFormCard, { role: "teacher", onSuccess: onSuccess })] })] }));
};
export default AuthPage;
