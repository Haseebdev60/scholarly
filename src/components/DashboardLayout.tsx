import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { motion } from 'framer-motion'

type DashboardLayoutProps = {
    children: ReactNode
    sidebarItems: Array<{ to: string; icon: ReactNode; label: string; end?: boolean; onClick?: () => void; active?: boolean }>
    title?: string
    description?: string
}

const DashboardLayout = ({ children, sidebarItems, title, description }: DashboardLayoutProps) => {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-blue/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

            <Sidebar items={sidebarItems} />
            <div className="flex-1 relative z-10 custom-scrollbar h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="container mx-auto max-w-7xl p-6 lg:p-10">
                    {(title || description) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                            {title && <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">{title}</h1>}
                            {description && <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-400">{description}</p>}
                        </motion.div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
