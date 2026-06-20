import React from 'react'
import { cn } from '../lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  glowHover?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glowHover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card-base relative overflow-hidden",
          glowHover && "card-hover",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = "GlassCard"
