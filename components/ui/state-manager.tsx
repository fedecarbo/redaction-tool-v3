'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingState, PageLoadingOverlay, InlineLoading } from './loading-states';
import { FeedbackState, Toast, SuccessToast, ErrorToast, WarningToast, InfoToast } from './feedback-states';
import { MicroInteraction } from './micro-interactions';
import { Button } from "./button";

// State types
export type AppState = 'idle' | 'loading' | 'success' | 'error' | 'warning' | 'info';

// State manager context
interface StateManagerContextType {
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  setLoading: (loading: boolean, message?: string, progress?: number) => void;
  
  // Feedback states
  feedback: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  } | null;
  showFeedback: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, action?: { label: string; onClick: () => void }) => void;
  hideFeedback: () => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  hideToast: (id: string) => void;
  
  // Micro-interactions
  triggerMicroInteraction: (elementId: string, type: string) => void;
}

const StateManagerContext = createContext<StateManagerContextType | undefined>(undefined);

// State manager provider props
interface StateManagerProviderProps {
  children: React.ReactNode;
}

// State manager provider component
export const StateManagerProvider = ({ children }: StateManagerProviderProps) => {
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Feedback state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>>([]);

  // Set loading state
  const setLoading = useCallback((loading: boolean, message: string = '', progress: number = 0) => {
    setIsLoading(loading);
    setLoadingMessage(message);
    setLoadingProgress(progress);
  }, []);

  // Show feedback
  const showFeedback = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    setFeedback({ type, title, message, action });
  }, []);

  // Hide feedback
  const hideFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  // Show toast
  const showToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      hideToast(id);
    }, 5000);
  }, []);

  // Hide toast
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Trigger micro-interaction
  const triggerMicroInteraction = useCallback((elementId: string, type: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add(`animate-${type}`);
      setTimeout(() => {
        element.classList.remove(`animate-${type}`);
      }, 1000);
    }
  }, []);

  const contextValue: StateManagerContextType = {
    isLoading,
    loadingMessage,
    loadingProgress,
    setLoading,
    feedback,
    showFeedback,
    hideFeedback,
    toasts,
    showToast,
    hideToast,
    triggerMicroInteraction,
  };

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
      
      {/* Global loading overlay */}
      {isLoading && (
        <PageLoadingOverlay 
          message={loadingMessage || 'Loading...'} 
        />
      )}
      
      {/* Global feedback */}
      {feedback && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full">
          <FeedbackState
            type={feedback.type}
            title={feedback.title}
            message={feedback.message}
            action={feedback.action}
            autoDismiss={true}
            onDismiss={hideFeedback}
          />
        </div>
      )}
      
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onDismiss={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </StateManagerContext.Provider>
  );
};

// Hook to use state manager
export const useStateManager = () => {
  const context = useContext(StateManagerContext);
  if (context === undefined) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return context;
};

// Convenience hooks for common operations
export const useLoading = () => {
  const { isLoading, loadingMessage, loadingProgress, setLoading } = useStateManager();
  return { isLoading, loadingMessage, loadingProgress, setLoading };
};

export const useFeedback = () => {
  const { feedback, showFeedback, hideFeedback } = useStateManager();
  return { feedback, showFeedback, hideFeedback };
};

export const useToast = () => {
  const { toasts, showToast, hideToast } = useStateManager();
  return { toasts, showToast, hideToast };
};

export const useMicroInteraction = () => {
  const { triggerMicroInteraction } = useStateManager();
  return { triggerMicroInteraction };
};

// Higher-order component for loading states
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingMessage?: string
) => {
  const WrappedComponent = (props: P) => {
    const { isLoading, setLoading } = useLoading();
    
    React.useEffect(() => {
      if (loadingMessage) {
        setLoading(true, loadingMessage);
        return () => setLoading(false);
      }
    }, [loadingMessage, setLoading]);
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Loading wrapper component
export const LoadingWrapper = ({ 
  children, 
  loading, 
  message = 'Loading...',
  progress,
  className 
}: { 
  children: React.ReactNode;
  loading: boolean;
  message?: string;
  progress?: number;
  className?: string;
}) => {
  if (loading) {
    return (
      <div className={className}>
        <LoadingState
          type="spinner"
          message={message}
          progress={progress}
          size="lg"
        />
      </div>
    );
  }
  
  return <>{children}</>;
};

// Error boundary with state management
export const ErrorBoundaryWithState = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => {
  const { showFeedback } = useFeedback();
  
  return (
    <ErrorBoundary
      onError={(error) => {
        showFeedback('error', 'Something went wrong', error.message);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              Please try refreshing the page
            </p>
            <Button
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 