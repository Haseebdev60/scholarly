import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
export const Badge = ({ children, color = 'brand', className }) => (_jsx("span", { className: clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', color === 'brand' && 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100', color === 'slate' && 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', color === 'blue' && 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200', color === 'amber' && 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', color === 'red' && 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200', color === 'green' && 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200', className), children: children }));
export default Badge;
