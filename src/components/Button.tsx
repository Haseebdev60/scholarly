import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const variants = {
  primary: 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-glow-hover hover:-translate-y-0.5 active:translate-y-[1px] transition-all duration-300 ease-out',
  secondary: 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-[1px] transition-all duration-300 ease-out',
  outline: 'border-2 border-brand-600 text-brand-700 hover:bg-brand-50 hover:-translate-y-0.5 active:translate-y-[1px] transition-all duration-300 ease-out',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-300 ease-out',
  danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-[1px] transition-all duration-300 ease-out',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
}

export const Button = ({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
