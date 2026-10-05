import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'right' | 'left'
  className?: string
}

export function Sheet({ open, onOpenChange, children, side = 'right', className }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-card text-card-foreground shadow-xl transition ease-in-out duration-200 border-border',
          side === 'right' && 'inset-y-0 right-0 h-full w-full max-w-lg border-l animate-in slide-in-from-right',
          side === 'left' && 'inset-y-0 left-0 h-full w-full max-w-xs border-r animate-in slide-in-from-left',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 p-6 border-b border-border', className)} {...props}>{children}</div>
}

export function SheetTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props}>{children}</h2>
}

export function SheetClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-sm p-1.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-accent text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      aria-label="Fechar"
    >
      <X className="h-4 w-4" />
    </button>
  )
}
