import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Sidebar from './Sidebar';
const DashboardLayout = ({ children, sidebarItems, title, description }) => {
    return (_jsxs("div", { className: "flex min-h-[calc(100vh-4rem)]", children: [_jsx(Sidebar, { items: sidebarItems }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "container mx-auto max-w-7xl p-6 lg:p-8", children: [(title || description) && (_jsxs("div", { className: "mb-8", children: [title && _jsx("h1", { className: "text-3xl font-bold text-slate-900 tracking-tight", children: title }), description && _jsx("p", { className: "mt-2 text-lg text-slate-600", children: description })] })), _jsx("div", { className: "animate-fade-in", children: children })] }) })] }));
};
export default DashboardLayout;
