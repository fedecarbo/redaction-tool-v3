'use client'

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SuccessCheckmark, ErrorX } from './micro-interactions';

// Feedback state types
export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

// Feedback state component props
export interface FeedbackStateProps {
  type: FeedbackType;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: boolean;
  dismissDelay?: number;
  onDismiss?: () => void;
  className?: string;
}

// Main Feedback State Component
export const FeedbackState = React.forwardRef<HTMLDivElement, FeedbackStateProps>(
  ({ 
    type, 
    title, 
    message, 
    action,
    autoDismiss = false,
    dismissDelay = 5000,
    onDismiss,
    className 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (autoDismiss) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onDismiss?.();
        }, dismissDelay);
        return () => clearTimeout(timer);
      }
    }, [autoDismiss, dismissDelay, onDismiss]);

    const typeConfig = {
      success: {
        icon: <SuccessCheckmark className="text-green-500" />,
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        titleColor: 'text-green-900 dark:text-green-100',
      },
      error: {
        icon: <ErrorX className="text-red-500" />,
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        titleColor: 'text-red-900 dark:text-red-100',
      },
      warning: {
        icon: <WarningIcon className="text-yellow-500" />,
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        titleColor: 'text-yellow-900 dark:text-yellow-100',
      },
      info: {
        icon: <InfoIcon className="text-blue-500" />,
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200',
        titleColor: 'text-blue-900 dark:text-blue-100',
      },
    };

    const config = typeConfig[type];

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ease-out',
          config.bgColor,
          config.borderColor,
          'animate-fade-in',
          className
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(
              'text-sm font-medium mb-1',
              config.titleColor
            )}>
              {title}
            </h3>
          )}
          {message && (
            <p className={cn(
              'text-sm',
              config.textColor
            )}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-2 text-sm font-medium underline hover:no-underline transition-all',
                config.textColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {autoDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className={cn(
              'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
              config.textColor
            )}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

FeedbackState.displayName = 'FeedbackState';

// Warning icon component
const WarningIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('w-6 h-6', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

// Info icon component
const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('w-6 h-6', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// X icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('w-4 h-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Toast notification component
export const Toast = ({ 
  type, 
  title, 
  message, 
  onDismiss,
  className 
}: { 
  type: FeedbackType;
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}) => (
  <div className={cn(
    'fixed top-4 right-4 z-50 max-w-sm w-full',
    'animate-slide-in-right',
    className
  )}>
    <FeedbackState
      type={type}
      title={title}
      message={message}
      autoDismiss={true}
      onDismiss={onDismiss}
    />
  </div>
);

// Success toast
export const SuccessToast = ({ 
  title = 'Success!', 
  message, 
  onDismiss,
  className 
}: { 
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}) => (
  <Toast
    type="success"
    title={title}
    message={message}
    onDismiss={onDismiss}
    className={className}
  />
);

// Error toast
export const ErrorToast = ({ 
  title = 'Error', 
  message, 
  onDismiss,
  className 
}: { 
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}) => (
  <Toast
    type="error"
    title={title}
    message={message}
    onDismiss={onDismiss}
    className={className}
  />
);

// Warning toast
export const WarningToast = ({ 
  title = 'Warning', 
  message, 
  onDismiss,
  className 
}: { 
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}) => (
  <Toast
    type="warning"
    title={title}
    message={message}
    onDismiss={onDismiss}
    className={className}
  />
);

// Info toast
export const InfoToast = ({ 
  title = 'Info', 
  message, 
  onDismiss,
  className 
}: { 
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}) => (
  <Toast
    type="info"
    title={title}
    message={message}
    onDismiss={onDismiss}
    className={className}
  />
); 