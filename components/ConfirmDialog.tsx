import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  className?: string
  isDestructive?: boolean
}

/**
 * Enhanced confirmation dialog with proper accessibility features and focus management.
 * Includes warning styling for destructive actions like redaction application.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  className = '',
  isDestructive = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the confirm button when dialog opens
      confirmButtonRef.current?.focus()
      
      // Trap focus within dialog
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onCancel()
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm
        p-4 ${className}
      `}
      onClick={(e) => {
        // Close dialog when clicking backdrop
        if (e.target === e.currentTarget) {
          onCancel()
        }
      }}
    >
      <div 
        ref={dialogRef}
        className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon for destructive actions */}
        {isDestructive && (
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        )}

        {/* Title */}
        <h2 
          id="dialog-title"
          className={`text-lg font-semibold mb-2 text-foreground ${
            isDestructive ? 'text-red-900' : ''
          }`}
        >
          {title}
        </h2>
        
        {/* Description */}
        <p 
          id="dialog-description"
          className={`text-sm mb-6 ${
            isDestructive ? 'text-red-700' : 'text-muted-foreground'
          }`}
        >
          {description}
        </p>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel} 
            data-testid="cancel-btn"
            className={isDestructive ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}
          >
            {cancelLabel}
          </Button>
          <Button 
            size="sm" 
            onClick={onConfirm} 
            data-testid="confirm-btn"
            ref={confirmButtonRef}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
} 