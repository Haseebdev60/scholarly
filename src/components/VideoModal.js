import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
export default function VideoModal({ isOpen, onClose, url, title, type }) {
    const getEmbedUrl = (rawUrl) => {
        // Handle YouTube
        const ytMatch = rawUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        if (ytMatch && ytMatch[2].length === 11) {
            return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1`;
        }
        return rawUrl; // Fallback or direct link
    };
    const isVideoFile = type === 'video' || url.startsWith('/uploads');
    return (_jsx(Transition, { appear: true, show: isOpen, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-50", onClose: onClose, children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black/90" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4 text-center", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-4xl transform overflow-hidden rounded-2xl bg-black p-1 shadow-2xl transition-all", children: [_jsxs("div", { className: "relative aspect-video w-full bg-black", children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) }), isVideoFile ? (_jsx("video", { src: url, controls: true, autoPlay: true, className: "w-full h-full object-contain" })) : (_jsx("iframe", { src: getEmbedUrl(url), className: "w-full h-full border-0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }))] }), _jsx("div", { className: "p-4 bg-slate-900 text-left", children: _jsx("h3", { className: "text-lg font-bold text-white", children: title }) })] }) }) }) })] }) }));
}
