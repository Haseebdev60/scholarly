import { Link } from 'react-router-dom'
import Button from './Button'

const links = [
  { label: 'About', to: '/about' },
  { label: 'Courses', to: '/courses' },
  { label: 'Teachers', to: '/teachers' },
  { label: 'Downloads', to: '/quizzes' },
]

export const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-4 lg:gap-8">
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
              <span className="text-xl font-bold">Ed</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Scholarly</span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            A modern learning platform designed to bridge the gap between students and teachers.
            Access past papers, recorded lectures, and interactive quizzes in one premium workspace.
          </p>
          <div className="flex gap-4">
            <Button size="sm" onClick={() => window.scrollTo(0, 0)}>Get Started</Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Platform</h3>
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h3>
          <ul className="mt-4 space-y-3">
            <li className="text-sm">hello@scholarly.app</li>
            <li className="text-sm">+1 (800) 555-0199</li>
            <li className="flex gap-4 mt-6">
              {/* Social placeholders using text for now, could use icons */}
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-brand-600 hover:text-white transition-all">in</a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-brand-600 hover:text-white transition-all">tw</a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-brand-600 hover:text-white transition-all">yt</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Scholarly Learning. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-slate-500">
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
