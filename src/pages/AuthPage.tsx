import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, scaleIn } from '../lib/utils'

type AuthMode = 'login' | 'register'
type Role = 'student' | 'teacher' | 'admin'

type AuthPageProps = {
  onSuccess: (message: string) => void
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const { login, loginWithGoogle, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [role, setRole] = useState<Role>('student')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const qMode = searchParams.get('mode') as AuthMode
    if (qMode === 'login' || qMode === 'register') {
      setMode(qMode)
    }
  }, [searchParams])

  const validate = () => {
    const next: Record<string, string> = {}
    if (mode === 'register' && !form.name.trim()) next.name = 'Name is required'
    if (!form.email.includes('@')) next.email = 'Valid email is required'
    if (form.password.length < 6) next.password = 'Minimum 6 characters required'
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
        const user = await login(form.email, form.password)
        onSuccess('Successfully logged in!')
        navigate(`/dashboard/${user.role}`) 
      } else {
        const roleToRegister = role === 'admin' ? 'student' : role
        const user = await register({ ...form, role: roleToRegister })
        onSuccess(`Account created as ${user.role}`)
        navigate(`/dashboard/${user.role}`)
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Authentication failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true)
      try {
        const roleToUse = mode === 'register' && role === 'admin' ? 'student' : role
        const user = await loginWithGoogle(tokenResponse.access_token, roleToUse)
        onSuccess('Successfully authenticated with Google!')
        navigate(`/dashboard/${user.role}`)
      } catch (error: any) {
        setErrors({ submit: error.message || 'Google authentication failed' })
      } finally {
        setIsSubmitting(false)
      }
    },
    onError: () => setErrors({ submit: 'Google authentication was cancelled or failed' })
  })

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'))
    setErrors({})
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      {/* Left side: Branding / Illustration */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-slate-900 to-purple-900 opacity-90 z-0"></div>
        {/* Abstract shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeUp}
          className="relative z-10 text-white max-w-lg p-12"
        >
          <div className="mb-8">
             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/30">
                <span className="text-3xl font-bold">Ed</span>
             </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Unlock your <br/> learning potential.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-12">
            Join thousands of ambitious students and expert teachers on the world's most advanced educational platform.
          </p>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
             <div className="flex -space-x-4">
                <img className="h-10 w-10 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="" />
                <img className="h-10 w-10 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="" />
                <img className="h-10 w-10 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="" />
             </div>
             <div className="text-sm font-medium">Over 10k+ active users</div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950 transition-colors">
        <motion.div 
          className="w-full max-w-md space-y-8"
          initial="initial"
          animate="animate"
          variants={scaleIn}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {mode === 'login' ? 'Please enter your details to sign in.' : 'Start your educational journey today.'}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {(['student', 'teacher'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                  role === r 
                    ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormField
                    label="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                    placeholder="John Doe"
                  />
                </motion.div>
              )}
            </AnimatePresence>

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

            <AnimatePresence>
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2"
                >
                  <XMarkIcon className="h-5 w-5 flex-shrink-0" /> 
                  <span>{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full py-2.5 text-base shadow-button" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-950 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3 py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            onClick={() => googleLogin()}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
            </span>
          </Button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
