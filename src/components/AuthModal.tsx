import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Modal from './Modal'
import Button from './Button'
import FormField from './FormField'
import { XMarkIcon } from '@heroicons/react/24/outline'

type AuthMode = 'login' | 'register'
type Role = 'student' | 'teacher' | 'admin'

type AuthModalProps = {
    open: boolean
    onClose: () => void
    initialMode?: AuthMode
    initialRole?: Role
}

const AuthModal = ({ open, onClose, initialMode = 'login', initialRole = 'student' }: AuthModalProps) => {
    const { login, register } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState<AuthMode>(initialMode)
    const [role, setRole] = useState<Role>(initialRole)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)


    // Reset state when opening/closing could be handled by parent or useEffect, 
    // but for simplicity we'll just let it persist until submit or refresh for now, 
    // or added a useEffect if needed.

    const validate = () => {
        const next: Record<string, string> = {}
        if (mode === 'register' && !form.name.trim()) next.name = 'Name required'
        if (!form.email.includes('@')) next.email = 'Valid email required'
        if (form.password.length < 6) next.password = 'Min 6 characters'
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        setErrors({})

        try {
            if (mode === 'login') {
                await login(form.email, form.password)
                // Redirect logic based on role (which we might not know until login, but assuming simplified flow or check user object after)
                // actually useAuth login updates 'user'. We can check 'role' state if we want to guess, or wait for user update.
                // For simplicity, we just close. The App's useEffect or user state change will handle nav if needed, 
                // OR we can't easily start navigation here without knowing the user's role from the backend *response*.
                // But the previous App.tsx logic used the *selected* role for redirect, which is a bit flawed if the user logs in as a different role than selected.
                // Let's stick to closing modal. Navigation can happen if user clicks dashboard from navbar.
                // OR we can try to guess.
                onClose()
            } else {
                // Register
                const roleToRegister = role === 'admin' ? 'student' : role
                await register({ ...form, role: roleToRegister })
                onClose()
                if (roleToRegister === 'teacher') navigate('/dashboard/teacher')
                else navigate('/dashboard/student')
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'Authentication failed' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleMode = () => {
        setMode(prev => (prev === 'login' ? 'register' : 'login'))
        setErrors({})
    }

    return (
        <Modal open={open} onClose={onClose} title={mode === 'login' ? 'Welcome Back' : 'Create Account'}>
            <div className="space-y-6">
                {/* Role Selection Tabs */}
                {mode === 'login' && (
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {(['student', 'teacher', 'admin'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                )}

                {/* Header Visual */}
                <div className="text-center space-y-2">
                    <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${mode === 'login' ? 'bg-brand-100 text-brand-600' : 'bg-purple-100 text-purple-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                        {mode === 'login' ? 'Log in to your account' : `Join as a ${role}`}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {mode === 'login'
                            ? 'Enter your details to access your dashboard'
                            : 'Start your learning journey today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <FormField
                            label="Full Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                            placeholder="e.g. John Doe"
                        />
                    )}
                    <FormField
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        error={errors.email}
                        placeholder="john@example.com"
                    />
                    <FormField
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        error={errors.password}
                        placeholder="••••••••"
                    />

                    {errors.submit && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                            <XMarkIcon className="h-4 w-4" /> {errors.submit}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={toggleMode} className="ml-1 text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                        {mode === 'login' ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default AuthModal
