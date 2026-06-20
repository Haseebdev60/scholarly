import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

type DashboardLayoutProps = {
    children: ReactNode
    sidebarItems: Array<{ to: string; icon: ReactNode; label: string; end?: boolean; onClick?: () => void; active?: boolean }>
    title?: string
    description?: string
}

const DashboardLayout = ({ children, sidebarItems, title, description }: DashboardLayoutProps) => {
    return (
        <div className="flex min-h-[calc(100vh-5rem)] bg-surface-50 dark:bg-surface-950 relative">
            <Sidebar items={sidebarItems} />
            <div className="flex-1 relative z-10 h-[calc(100vh-5rem)] overflow-y-auto">
                <div className="container mx-auto max-w-7xl p-6 lg:p-10">
                    {(title || description) && (
                        <div className="mb-10">
                            {title && <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">{title}</h1>}
                            {description && <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-400">{description}</p>}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
