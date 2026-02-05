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
        <aside className="sticky top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
            <div className="flex h-full flex-col gap-1 p-4">
                <div className="mb-6 px-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md">
                        <span className="text-sm font-bold">Ed</span>
                    </div>
                    <div className="leading-none">
                        <div className="text-sm font-bold text-slate-900 tracking-tight">Scholarly</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Dashboard</div>
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
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                active
                                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar
