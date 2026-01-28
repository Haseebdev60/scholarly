import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import FormField from '../components/FormField'

type Role = 'student' | 'teacher'
type Mode = 'login' | 'register'

type FormState = {
  name: string
  email: string
  password: string
  subject: string
}

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  subject: '',
}

type AuthFormCardProps = {
  role: Role
  onSuccess: (message: string) => void
}

const AuthFormCard = ({ role, onSuccess }: AuthFormCardProps) => {
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const title = useMemo(
    () => (mode === 'login' ? `${role === 'student' ? 'Student' : 'Teacher'} Login` : `Register as ${role}`),
    [mode, role],
  )

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email'
    if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters'
    if (mode === 'register' && !form.name.trim()) nextErrors.name = 'Name is required'
    if (mode === 'register' && role === 'teacher' && !form.subject.trim())
      nextErrors.subject = 'Subject focus is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    onSuccess(`${title} form submitted for ${form.email}`)
    setForm(initialState)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-500">{role === 'student' ? 'Students' : 'Teachers'}</div>
          <div className="text-lg font-semibold text-slate-900">{title}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            className={`rounded-full px-3 py-1 ${mode === 'login' ? 'bg-brand-50 text-brand-700' : 'text-slate-500'}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`rounded-full px-3 py-1 ${mode === 'register' ? 'bg-brand-50 text-brand-700' : 'text-slate-500'}`}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <FormField
            label="Full name"
            placeholder={role === 'student' ? 'Student name' : 'Instructor name'}
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <FormField
          label="Email"
          placeholder={role === 'student' ? 'student@email.com' : 'teacher@email.com'}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <FormField
          label="Password"
          placeholder="At least 6 characters"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {mode === 'register' && role === 'teacher' && (
          <FormField
            label="Subjects you teach"
            placeholder="e.g., Mathematics, Physics"
            value={form.subject}
            error={errors.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        )}
        <Button type="submit" className="w-full">
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </form>
      <p className="text-xs text-slate-500">
        This is a front-end demo. Form validation is client-side only; no data is stored.
      </p>
    </Card>
  )
}

type AuthPageProps = {
  onSuccess: (message: string) => void
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6 lg:px-8">
      <div className="space-y-2">
        <Badge>Access</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Login or register</h1>
        <p className="text-slate-600">
          Dedicated forms for students and teachers with quick client-side validation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AuthFormCard role="student" onSuccess={onSuccess} />
        <AuthFormCard role="teacher" onSuccess={onSuccess} />
      </div>
    </div>
  )
}

export default AuthPage
