import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from './Button'
import ProfileModal from './ProfileModal'

type NavbarProps = {
  onLogin: (role: 'student' | 'teacher' | 'admin') => void
  onSignup: (role: 'student' | 'teacher' | 'admin') => void
}

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/quizzes', label: 'Downloads' },
]



const Navbar = ({ onLogin, onSignup }: NavbarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/20">
              <span className="text-xl font-bold">Ed</span>
            </div>
            <div className="leading-none">
              <div className="text-lg font-bold text-slate-900 tracking-tight">Scholarly</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Learning Platform</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  {user.role === 'student' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/student')}>
                      Dashboard
                    </Button>
                  )}
                  {user.role === 'teacher' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/teacher')}>
                      Dashboard
                    </Button>
                  )}
                  {user.role === 'admin' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/admin')}>
                      Admin
                    </Button>
                  )}

                  <button
                    onClick={() => setShowProfile(true)}
                    className="group relative flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm group-hover:ring-brand-100 transition-all">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-100 font-bold text-brand-600 text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">{user.name}</div>
                    </div>
                  </button>

                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onLogin('student')}>
                  Log in
                </Button>
                <Button onClick={() => onSignup('student')} className="shadow-brand-500/20 shadow-lg">Get Started</Button>
              </div>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-100 bg-white/95 backdrop-blur px-4 pb-6 pt-2 md:hidden animate-slide-up shadow-lg">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 text-base font-medium rounded-xl transition-colors ${isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-slate-100">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-100 font-bold text-brand-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => { setShowProfile(true); setOpen(false); }}>
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="secondary" onClick={() => onLogin('student')} className="w-full justify-center">
                    Log in
                  </Button>
                  <Button onClick={() => onSignup('student')} className="w-full justify-center">
                    Create Account
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
