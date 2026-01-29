import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className, padding = 'p-6', hover, onClick, ...props }) => (_jsx("div", { className: `card-base ${padding} ${hover ? 'card-hover cursor-pointer' : ''} ${className}`, onClick: onClick, ...props, children: children }));
export default Card;
