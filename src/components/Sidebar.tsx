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
