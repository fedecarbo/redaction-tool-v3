import React, { useEffect, useRef } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button'
import { OutlineButton, DangerButton } from '@/components/ui/button-system'
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
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={open => { if (!open) onCancel(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <RadixDialog.Content
          className={`bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
          onPointerDownOutside={onCancel}
        >
          {isDestructive && (
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          )}
          <RadixDialog.Title id="dialog-title" className={`text-xl font-semibold mb-3 text-foreground ${isDestructive ? 'text-red-900' : ''}`}>{title}</RadixDialog.Title>
          <RadixDialog.Description id="dialog-description" className={`text-sm mb-6 leading-relaxed ${isDestructive ? 'text-red-700' : 'text-muted-foreground'}`}>{description}</RadixDialog.Description>
          <div className="flex justify-end gap-3">
            <RadixDialog.Close asChild>
              <Button variant="outline" size="sm" onClick={onCancel} data-testid="cancel-btn">{cancelLabel}</Button>
            </RadixDialog.Close>
            <Button variant={isDestructive ? 'destructive' : 'default'} size="sm" onClick={onConfirm} data-testid="confirm-btn">{confirmLabel}</Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}; 