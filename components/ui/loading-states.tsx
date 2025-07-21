'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './micro-interactions';

// Loading state types
export type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'dots' | 'bars';

// Loading state component props
export interface LoadingStateProps {
  type?: LoadingType;
  message?: string;
  progress?: number; // 0-100 for progress type
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay' | 'inline';
  className?: string;
}

// Main Loading State Component
export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ 
    type = 'spinner', 
    message, 
    progress, 
    size = 'md', 
    variant = 'default',
    className 
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const variantClasses = {
      default: 'flex flex-col items-center justify-center p-6',
      overlay: 'fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50',
      inline: 'flex items-center gap-2',
    };

    const renderLoadingContent = () => {
      switch (type) {
        case 'skeleton':
          return <SkeletonLoader size={size} />;
        case 'progress':
          return <ProgressLoader progress={progress || 0} size={size} />;
        case 'dots':
          return <LoadingSpinner size={size} variant="dots" />;
        case 'bars':
          return <LoadingSpinner size={size} variant="bars" />;
        default:
          return <LoadingSpinner size={size} />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
      >
        {renderLoadingContent()}
        {message && (
          <div className={cn(
            'mt-3 text-muted-foreground text-center',
            variant === 'inline' && 'ml-2'
          )}>
            {message}
          </div>
        )}
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn(
        'animate-pulse bg-muted rounded',
        sizeClasses[size]
      )} />
      <div className={cn(
        'animate-pulse bg-muted rounded w-3/4',
        sizeClasses[size]
      )} />
      <div className={cn(
        'animate-pulse bg-muted rounded w-1/2',
        sizeClasses[size]
      )} />
    </div>
  );
};

// Progress loader with animated progress bar
export const ProgressLoader = ({ 
  progress, 
  size = 'md',
  className 
}: { 
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full max-w-md', className)}>
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full bg-primary transition-all duration-500 ease-out',
            sizeClasses[size]
          )}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// Page loading overlay
export const PageLoadingOverlay = ({ 
  message = 'Loading...',
  className 
}: { 
  message?: string;
  className?: string;
}) => (
  <LoadingState
    type="spinner"
    message={message}
    variant="overlay"
    size="lg"
    className={className}
  />
);

// Inline loading indicator
export const InlineLoading = ({ 
  message,
  size = 'sm',
  className 
}: { 
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => (
  <LoadingState
    type="spinner"
    message={message}
    variant="inline"
    size={size}
    className={className}
  />
);

// Content skeleton for page loading
export const ContentSkeleton = ({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
); 