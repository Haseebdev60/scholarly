import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../lib/utils'

export const BentoGrid = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn("grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  )
}

interface BentoGridItemProps extends HTMLMotionProps<"div"> {
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
  ...props
}: BentoGridItemProps) => {
  return (
    <motion.div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-glow transition duration-300 shadow-input dark:shadow-none p-4 dark:bg-slate-900/50 bg-white border border-slate-100 dark:border-white/10 justify-between flex flex-col space-y-4 backdrop-blur-sm overflow-hidden relative",
        className
      )}
      whileHover={{ y: -5 }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
        {icon}
        <div className="font-display font-bold text-slate-900 dark:text-white mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-slate-600 dark:text-slate-400 text-sm">
          {description}
        </div>
      </div>
    </motion.div>
  )
}
