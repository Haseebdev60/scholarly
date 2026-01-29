import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Modal from './Modal';
import Button from './Button';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
const AlertDialog = ({ open, onClose, title, message, type, onConfirm }) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircleIcon, { className: "h-12 w-12 text-green-500" });
            case 'error':
                return _jsx(ExclamationCircleIcon, { className: "h-12 w-12 text-red-500" });
            case 'confirm':
                return _jsx(ExclamationCircleIcon, { className: "h-12 w-12 text-amber-500" });
            default:
                return _jsx(InformationCircleIcon, { className: "h-12 w-12 text-blue-500" });
        }
    };
    return (_jsx(Modal, { open: open, onClose: onClose, title: "", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: getIcon() }), _jsx("h3", { className: "text-lg font-bold text-slate-900 mb-2", children: title }), _jsx("p", { className: "text-slate-600 mb-6", children: message }), _jsx("div", { className: "flex justify-center gap-3", children: type === 'confirm' ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", onClick: onClose, children: "Cancel" }), _jsx(Button, { onClick: () => {
                                    if (onConfirm)
                                        onConfirm();
                                    onClose();
                                }, children: "Confirm" })] })) : (_jsx(Button, { onClick: onClose, className: "min-w-[100px]", children: "OK" })) })] }) }));
};
export default AlertDialog;
