import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
        {
          'border-transparent bg-primary text-primary-foreground shadow': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-destructive text-destructive-foreground shadow': variant === 'destructive',
          'text-foreground border-border': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}
