'use client'

import React from 'react';
import { cn } from '@/lib/utils';

// Micro-interaction variants
export const microInteractionVariants = {
  // Hover effects
  hover: {
    lift: 'transition-all duration-normal hover:scale-105 hover:shadow-md hover:-translate-y-0.5',
    glow: 'transition-all duration-normal hover:shadow-lg hover:shadow-primary/20 hover:brightness-110',
    border: 'transition-all duration-normal hover:border-primary/50 hover:bg-primary/5',
    background: 'transition-all duration-normal hover:bg-accent/50 hover:scale-102',
    slide: 'transition-all duration-normal hover:translate-x-1',
    rotate: 'transition-all duration-normal hover:rotate-3',
  },
  
  // Focus effects
  focus: {
    ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    glow: 'focus-visible:shadow-lg focus-visible:shadow-primary/20 focus-visible:scale-105',
    border: 'focus-visible:border-primary focus-visible:bg-primary/5',
  },
  
  // Active effects
  active: {
    scale: 'active:scale-95 transition-transform duration-fast',
    press: 'active:shadow-inner active:scale-98',
    ripple: 'active:animate-ripple',
  },
  
  // Loading states
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    wave: 'animate-wave',
    shimmer: 'animate-shimmer',
  },
  
  // Success states
  success: {
    checkmark: 'animate-checkmark',
    glow: 'animate-success-glow',
    bounce: 'animate-success-bounce',
    scale: 'animate-success-scale',
  },
  
  // Error states
  error: {
    shake: 'animate-shake',
    pulse: 'animate-error-pulse',
    wiggle: 'animate-wiggle',
  },
  
  // Transition effects
  transition: {
    fade: 'transition-opacity duration-normal',
    slide: 'transition-transform duration-normal',
    scale: 'transition-transform duration-normal',
    color: 'transition-colors duration-normal',
    all: 'transition-all duration-normal',
  },
} as const;

// Micro-interaction component props
export interface MicroInteractionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof microInteractionVariants;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

// Micro-interaction Component
export const MicroInteraction = React.forwardRef<HTMLDivElement, MicroInteractionProps>(
  ({ variant = 'hover', type = 'lift', children, className, ...props }, ref) => {
    const variantStyles = microInteractionVariants[variant];
    const typeStyles = variantStyles[type as keyof typeof variantStyles] || (variantStyles as any).lift;
    
    return (
      <div
        ref={ref}
        className={cn(typeStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MicroInteraction.displayName = 'MicroInteraction';

// Loading spinner with different styles
export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'bars';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  const variantClasses = {
    default: 'animate-spin rounded-full border-2 border-current border-t-transparent',
    dots: 'flex space-x-1',
    bars: 'flex space-x-1',
  };
  
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        <div className={cn('h-2 w-2 bg-current rounded-full animate-bounce', sizeClasses[size])} />
        <div className={cn('h-2 w-2 bg-current rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '0.1s' }} />
        <div className={cn('h-2 w-2 bg-current rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '0.2s' }} />
      </div>
    );
  }
  
  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)}>
        <div className={cn('h-full w-1 bg-current animate-pulse', sizeClasses[size])} />
        <div className={cn('h-full w-1 bg-current animate-pulse', sizeClasses[size])} style={{ animationDelay: '0.1s' }} />
        <div className={cn('h-full w-1 bg-current animate-pulse', sizeClasses[size])} style={{ animationDelay: '0.2s' }} />
      </div>
    );
  }
  
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      className
    )} />
  );
};

// Success checkmark animation
export const SuccessCheckmark = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center', className)}>
    <svg
      className="w-6 h-6 text-green-500 animate-checkmark"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  </div>
);

// Error X animation
export const ErrorX = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center', className)}>
    <svg
      className="w-6 h-6 text-red-500 animate-shake"
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
  </div>
);

// Progress bar with animation
export const ProgressBar = ({ 
  progress, 
  variant = 'default',
  className 
}: { 
  progress: number; // 0-100
  variant?: 'default' | 'gradient' | 'striped';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-primary',
    gradient: 'bg-gradient-to-r from-primary to-primary/80',
    striped: 'bg-gradient-to-r from-primary to-primary/80 bg-stripes',
  };
  
  return (
    <div className={cn('w-full bg-muted rounded-full h-2 overflow-hidden', className)}>
      <div
        className={cn(
          'h-full transition-all duration-normal ease-out',
          variantClasses[variant]
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
};

// Fade in animation wrapper
export const FadeIn = ({ 
  children, 
  delay = 0,
  duration = 'normal',
  className 
}: { 
  children: React.ReactNode;
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}) => {
  const durationClasses = {
    fast: 'duration-fast',
    normal: 'duration-normal',
    slow: 'duration-slow',
  };
  
  return (
    <div
      className={cn(
        'animate-fade-in',
        durationClasses[duration],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// Slide in animation wrapper
export const SlideIn = ({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 'normal',
  className 
}: { 
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}) => {
  const directionClasses = {
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
  };
  
  const durationClasses = {
    fast: 'duration-fast',
    normal: 'duration-normal',
    slow: 'duration-slow',
  };
  
  return (
    <div
      className={cn(
        directionClasses[direction],
        durationClasses[duration],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}; 