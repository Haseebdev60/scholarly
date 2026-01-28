import type { InputHTMLAttributes } from 'react'

type FormFieldProps = {
  label?: string
  error?: string
  helper?: string
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export const FormField = ({ label, error, helper, className, ...props }: FormFieldProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-slate-50 disabled:text-slate-500 transition-all shadow-sm"
      {...props}
    />
    {helper && <p className="text-xs text-slate-500">{helper}</p>}
    {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
  </div>
)

export default FormField
