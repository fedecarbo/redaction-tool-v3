'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FeedbackState } from '@/components/ui/feedback-states'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full max-w-3xl mx-auto p-6">
          <FeedbackState
            type="error"
            title="Something went wrong"
            message="The PDF viewer encountered an unexpected error. Please try refreshing the page or contact support if the problem persists."
            className="mb-4"
          />
          {this.state.error && (
            <details className="text-left bg-muted p-4 rounded-md mt-4">
              <summary className="cursor-pointer font-medium">
                Error Details
              </summary>
              <pre className="mt-2 text-sm text-destructive whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 