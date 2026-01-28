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
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar items={sidebarItems} />
            <div className="flex-1">
                <div className="container mx-auto max-w-7xl p-6 lg:p-8">
                    {(title || description) && (
                        <div className="mb-8">
                            {title && <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>}
                            {description && <p className="mt-2 text-lg text-slate-600">{description}</p>}
                        </div>
                    )}
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
