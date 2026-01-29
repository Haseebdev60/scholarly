import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
export const Sidebar = ({ items }) => {
    return (_jsx("aside", { className: "sticky top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block", children: _jsx("div", { className: "flex h-full flex-col gap-1 p-4", children: items.map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, onClick: (e) => {
                    if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                    }
                }, className: ({ isActive }) => {
                    const active = item.active !== undefined ? item.active : isActive;
                    return clsx('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200', active
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900');
                }, children: [item.icon, item.label] }, item.label))) }) }));
};
export default Sidebar;
