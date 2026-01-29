import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-4 m-4 bg-red-50 border border-red-200 rounded text-red-700", children: [_jsx("h2", { className: "font-bold", children: "Something went wrong." }), _jsx("details", { className: "mt-2 text-sm whitespace-pre-wrap", children: this.state.error?.toString() })] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
