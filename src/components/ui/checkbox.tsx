import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  circular?: boolean
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  circular = false,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onCheckedChange?.(!checked)
      }}
      className={cn(
        'peer flex h-5 w-5 shrink-0 items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border border-input',
        circular ? 'rounded-full' : 'rounded-sm',
        checked
          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
          : 'bg-transparent hover:border-primary',
        className
      )}
      {...props}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </button>
  )
}
