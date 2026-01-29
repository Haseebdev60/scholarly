import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
/**
 * Global Container component to enforce consistent max-width and horizontal padding across the app.
 * Use this wrapper for page content to ensure it doesn't touch the screen edges.
 */
export const Container = ({ children, className, noPadding = false }) => {
    return (_jsx("div", { className: clsx('mx-auto max-w-7xl', !noPadding && 'px-4 sm:px-6 lg:px-8', className), children: children }));
};
export default Container;
