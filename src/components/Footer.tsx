import { Link } from 'react-router-dom'
import Button from './Button'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const links = [
  { label: 'About Us', to: '/about' },
  { label: 'All Courses', to: '/courses' },
  { label: 'Our Teachers', to: '/teachers' },
  { label: 'App & Downloads', to: '/downloads' },
]

const legalLinks = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Cookie Policy', to: '#' },
]

export const Footer = () => (
  <footer className="relative bg-slate-950 text-slate-400 border-t border-white/5 overflow-hidden pt-20 pb-10">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-600/10 blur-3xl rounded-full pointer-events-none" />

    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 relative z-10">
      <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-12 mb-16">
        
        {/* Brand Section */}
        <div className="lg:col-span-6 space-y-8">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <img src="/favicon.png" alt="Scholarly Logo" className="h-12 w-12 rounded-2xl shadow-glow group-hover:shadow-glow-hover group-hover:scale-105 transition-all duration-300 object-cover" />
            <span className="text-3xl font-black font-display text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-electric-blue transition-all duration-300">Scholarly</span>
          </Link>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            A modern learning platform designed to bridge the gap between students and teachers.
            Learn smarter, faster, and more effectively with AI-powered tools.
          </p>
          <div className="flex gap-4">
            <a href="#" className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white transition-all duration-300 border border-white/10 group">
              <span className="font-bold group-hover:scale-110 transition-transform">in</span>
            </a>
            <a href="#" className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white transition-all duration-300 border border-white/10 group">
              <span className="font-bold group-hover:scale-110 transition-transform">tw</span>
            </a>
            <a href="#" className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white transition-all duration-300 border border-white/10 group">
              <span className="font-bold group-hover:scale-110 transition-transform">yt</span>
            </a>
          </div>
        </div>

        {/* Links Sections */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Platform</h3>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-base text-slate-400 hover:text-brand-400 transition-colors font-medium relative group flex items-center w-fit">
                    <span>{link.label}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-base text-slate-400 hover:text-white transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 font-medium">
          © {new Date().getFullYear()} Scholarly Learning. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Designed with</span>
          <span className="text-red-500 animate-pulse">❤️</span>
          <span>for the future of education.</span>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
