import React from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

/**
 * Lightweight confirmation dialog using conditional rendering.
 * A future improvement could swap this out for Radix/HeadlessUI Dialog
 * but this keeps dependencies minimal for now.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  className = ''
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm
        p-4 ${className}
      `}
    >
      <div className="bg-card border rounded-lg shadow-lg max-w-sm w-full p-6 animate-fade-in">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-2 text-foreground">{title}</h2>
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">{description}</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} data-testid="cancel-btn">
            {cancelLabel}
          </Button>
          <Button size="sm" onClick={onConfirm} data-testid="confirm-btn">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
} 