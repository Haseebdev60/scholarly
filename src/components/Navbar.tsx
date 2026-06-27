import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from './Button'
import ProfileModal from './ProfileModal'
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

type NavbarProps = {
  onLogin: (role: 'student' | 'teacher' | 'admin') => void
  onSignup: (role: 'student' | 'teacher' | 'admin') => void
}

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/teachers', label: 'Teachers' },
]

const Navbar = ({ onLogin, onSignup }: NavbarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Initialize theme
  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const handleNavLogin = () => navigate('/auth')
  const handleNavSignup = () => navigate('/auth?mode=register')

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 transition-all group">
            <img src="/favicon.png" alt="Scholarly Logo" className="h-12 w-12 rounded-2xl shadow-glow group-hover:shadow-glow-hover group-hover:scale-105 transition-all duration-300 object-cover" />
            <div className="leading-none hidden sm:block">
              <div className="text-xl font-black font-display text-slate-900 dark:text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-600 group-hover:to-electric-blue transition-all duration-300">Scholarly</div>
              <div className="text-[11px] uppercase tracking-widest text-brand-500 dark:text-brand-400 font-bold mt-0.5">Platform</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-inner">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-5 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200 ${isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-electric-blue transition-colors overflow-hidden group border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              <div className="absolute inset-0 bg-brand-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
              {isDark ? <SunIcon className="w-5 h-5 relative z-10" /> : <MoonIcon className="w-5 h-5 relative z-10" />}
            </button>

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              {user ? (
                <>
                  {user.role === 'student' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/student')} className="dark:text-slate-300 dark:hover:text-white font-semibold">
                      Dashboard
                    </Button>
                  )}
                  {user.role === 'teacher' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/teacher')} className="dark:text-slate-300 dark:hover:text-white font-semibold">
                      Dashboard
                    </Button>
                  )}
                  {user.role === 'admin' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/admin')} className="dark:text-slate-300 dark:hover:text-white font-semibold">
                      Admin
                    </Button>
                  )}

                  <button
                    onClick={() => setShowProfile(true)}
                    className="group relative flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-900 shadow-md group-hover:ring-electric-blue dark:group-hover:ring-electric-blue transition-all">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-purple-500 font-bold text-white text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </button>

                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 font-semibold">
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={handleNavLogin} className="hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 font-semibold">
                    Log in
                  </Button>
                  <Button onClick={handleNavSignup} className="shadow-glow hover:shadow-glow-hover bg-gradient-to-r from-brand-600 to-brand-500 border-none text-white font-bold rounded-full px-6 transition-all hover:scale-105">
                    Student Sign Up
                  </Button>
                </div>
              )}
            </div>

            <button
              className="rounded-xl p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 transition hover:text-brand-600 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pb-8 pt-4 lg:hidden shadow-2xl">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-5 py-4 text-lg font-bold rounded-2xl transition-all ${isActive
                      ? 'bg-gradient-to-r from-brand-50 to-electric-blue/10 dark:from-brand-900/20 dark:to-electric-blue/10 text-brand-700 dark:text-electric-blue'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <>
                  <div className="flex items-center gap-4 px-2 mb-4">
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-brand-500 shadow-glow">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-purple-500 font-bold text-white text-xl">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xl text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-brand-600 dark:text-brand-400 font-semibold capitalize tracking-wide">{user.role}</div>
                    </div>
                  </div>
                  <Button variant="secondary" className="h-12 rounded-xl text-base" onClick={() => { setShowProfile(true); setOpen(false); }}>
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="h-12 rounded-xl text-base justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="secondary" onClick={() => { handleNavLogin(); setOpen(false); }} className="h-14 rounded-xl text-lg font-bold w-full justify-center">
                    Log in
                  </Button>
                  <Button onClick={() => { handleNavSignup(); setOpen(false); }} className="h-14 rounded-xl text-lg font-bold w-full justify-center bg-gradient-to-r from-brand-600 to-brand-500 border-none shadow-glow text-white">
                    Student Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}

export default Navbar

