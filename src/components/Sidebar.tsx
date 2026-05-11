import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type SidebarItem = {
    to: string
    icon: ReactNode
    label: string
    end?: boolean
    onClick?: () => void
    active?: boolean
}

type SidebarProps = {
    items: SidebarItem[]
}

export const Sidebar = ({ items }: SidebarProps) => {
    return (
        <aside className="sticky top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl lg:block">
            <div className="flex h-full flex-col gap-2 p-5">
                <div className="mb-8 px-4 flex items-center gap-3 mt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-electric-blue text-white shadow-glow">
                        <span className="text-base font-black">S</span>
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-black font-display text-slate-900 dark:text-white tracking-tight">Scholarly</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Dashboard</div>
                    </div>
                </div>
                {items.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.end}
                        onClick={(e) => {
                            if (item.onClick) {
                                e.preventDefault()
                                item.onClick()
                            }
                        }}
                        className={({ isActive }) => {
                            const active = item.active !== undefined ? item.active : isActive
                            return clsx(
                                'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 relative overflow-hidden group',
                                active
                                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 shadow-sm border border-brand-200 dark:border-brand-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                            )
                        }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-500 to-electric-blue rounded-r-full" />}
                                <div className={clsx("transition-transform duration-300 group-hover:scale-110", isActive ? "text-brand-600 dark:text-brand-400" : "")}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar
