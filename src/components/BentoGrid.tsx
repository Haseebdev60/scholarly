import React from 'react'
import { cn } from '../lib/utils'

export const BentoGrid = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn("grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  )
}

interface BentoGridItemProps {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: BentoGridItemProps) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-card-hover transition-shadow duration-200 p-4 dark:bg-slate-900/50 bg-white border border-slate-100 dark:border-white/10 justify-between flex flex-col space-y-4 overflow-hidden relative",
        className
      )}
    >
      {header}
      <div className="relative z-10">
        {icon}
        <div className="font-display font-bold text-slate-900 dark:text-white mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-slate-600 dark:text-slate-400 text-sm">
          {description}
        </div>
      </div>
    </div>
  )
}
