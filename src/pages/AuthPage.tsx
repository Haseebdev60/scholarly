import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { XMarkIcon, AcademicCapIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, scaleIn } from '../lib/utils'

type AuthMode = 'login' | 'register'
type LoginRole = 'student' | 'teacher'

type AuthPageProps = {
  onSuccess: (message: string) => void
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const { login, loginWithGoogle, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loginRole, setLoginRole] = useState<LoginRole>('student')
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
        if (loginRole === 'teacher' && user.role !== 'teacher') {
          setErrors({ submit: 'This account is not registered as a teacher. Please contact your administrator.' })
          return
        }
        if (loginRole === 'student' && user.role === 'teacher') {
          setErrors({ submit: 'Please switch to the Teacher tab to sign in with this account.' })
          return
        }
        onSuccess('Successfully logged in!')
        navigate(`/dashboard/${user.role}`)
      } else {
        const user = await register({ ...form, role: 'student' })
        onSuccess('Account created successfully!')
        navigate(`/dashboard/${user.role}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (mode === 'register' || loginRole === 'teacher') {
        setErrors({ submit: loginRole === 'teacher'
          ? 'Google sign-in is not available for teacher accounts. Please use your email and password.'
          : 'Google sign-up is only available for students.' })
        return
      }
      setIsSubmitting(true)
      try {
        const user = await loginWithGoogle(tokenResponse.access_token, 'student')
        onSuccess('Successfully authenticated with Google!')
        navigate(`/dashboard/${user.role}`)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Google authentication failed'
        setErrors({ submit: message })
      } finally {
        setIsSubmitting(false)
      }
    },
    onError: () => setErrors({ submit: 'Google authentication was cancelled or failed' }),
  })

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'))
    setErrors({})
    setForm({ name: '', email: '', password: '' })
    setLoginRole('student')
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-surface-50 dark:bg-surface-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[45%] relative items-center justify-center overflow-hidden bg-surface-950">
        <div className="absolute inset-0 bg-mesh-dark opacity-60" />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeUp}
          className="relative z-10 text-white max-w-md p-12"
        >
          <div className="mb-10 flex items-center gap-4">
            <img src="/favicon.png" alt="Scholarly" className="h-14 w-14 rounded-2xl shadow-glow object-cover" />
            <div>
              <div className="text-2xl font-black font-display tracking-tight">Scholarly</div>
              <div className="text-xs uppercase tracking-widest text-brand-400 font-bold mt-0.5">Education Platform</div>
            </div>
          </div>

          <h1 className="text-4xl font-black font-display tracking-tight mb-5 leading-tight">
            Your journey to<br />
            <span className="text-gradient">excellence</span> starts here.
          </h1>
          <p className="text-slate-400 leading-relaxed mb-10 text-base">
            Access world-class courses, connect with expert instructors, and track your progress — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: AcademicCapIcon, text: '500+ courses across all subjects' },
              { icon: UserIcon, text: 'Expert teachers hired by our team' },
              { icon: ShieldCheckIcon, text: 'Secure, role-based access control' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 border border-brand-500/30">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-14 bg-mesh dark:bg-mesh-dark">
        <motion.div
          className="w-full max-w-[420px]"
          initial="initial"
          animate="animate"
          variants={scaleIn}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-elevated p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login'
                  ? 'Welcome back. Enter your credentials to continue.'
                  : 'Join as a student and start learning today.'}
              </p>
            </div>

            {/* Role selector — login only */}
            {mode === 'login' && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  I am signing in as
                </p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['student', 'teacher'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setLoginRole(r); setErrors({}) }}
                      className={`py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                        loginRole === r
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {loginRole === 'teacher' && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 leading-relaxed"
                    >
                      Teacher accounts are created by an administrator. If you were hired, use the credentials provided to you.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Register notice */}
            {mode === 'register' && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40 px-4 py-3">
                <AcademicCapIcon className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
                  Student registration is open to everyone. Want to teach? Contact us — our admin team will set up your account.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="you@example.com"
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
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30"
                  >
                    <XMarkIcon className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errors.submit}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Student Account'}
              </Button>
            </form>

            {/* Google — students only */}
            {(mode === 'register' || loginRole === 'student') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full gap-3"
                  onClick={() => googleLogin()}
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
              </>
            )}

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {mode === 'login' ? 'Sign up as student' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
