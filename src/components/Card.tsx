import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  padding?: string
  hover?: boolean
  onClick?: () => void
} & HTMLAttributes<HTMLDivElement>

export const Card = ({ children, className, padding = 'p-6', hover, onClick, ...props }: CardProps) => (
  <div
    className={`card-base ${padding} ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
)

export default Card
