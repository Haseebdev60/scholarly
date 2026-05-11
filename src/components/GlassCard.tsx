import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../lib/utils'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  className?: string
  children: React.ReactNode
  glowHover?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glowHover = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card relative overflow-hidden group",
          glowHover && "hover:shadow-glow-hover hover:border-brand-500/50",
          className
        )}
        {...props}
      >
        {glowHover && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-electric-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

GlassCard.displayName = "GlassCard"
