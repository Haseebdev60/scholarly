import type { InputHTMLAttributes } from 'react'

type FormFieldProps = {
  label?: string
  error?: string
  helper?: string
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export const FormField = ({ label, error, helper, className, ...props }: FormFieldProps) => (
  <div className={`flex flex-col gap-2 ${className ?? ''}`}>
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
    )}
    <input
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-input focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-400/10 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-200"
      {...props}
    />
    {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
  </div>
)

export default FormField
