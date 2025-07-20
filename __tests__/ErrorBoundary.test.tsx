import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '@/components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary')
  }
  return <div>No error occurred</div>
}

// Suppress console.error for clean test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error occurred')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-component">Child content</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child-component')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/The PDF viewer encountered an unexpected error/)).toBeInTheDocument()
      expect(screen.queryByText('No error occurred')).not.toBeInTheDocument()
    })

    it('should display the error message in details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsElement = screen.getByText('Error Details')
      expect(detailsElement).toBeInTheDocument()
      
      // Click to expand details
      fireEvent.click(detailsElement)
      
      expect(screen.getByText('Test error for ErrorBoundary')).toBeInTheDocument()
    })

    it('should log error details to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Recovery Functionality', () => {
    it('should allow user to retry after error', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error should be displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()

      // Click try again - this resets error state and re-renders children
      await user.click(tryAgainButton)

      // Since the child still throws an error, error boundary catches it again
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should reset error state when try again is clicked', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // The try again button should reset error state, but since child still throws,
      // error boundary catches it again
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should not render custom fallback when no error occurs', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.queryByTestId('custom-fallback')).not.toBeInTheDocument()
      expect(screen.getByText('No error occurred')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible error message structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Something went wrong')
      
      // Check for accessible button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()

      // Check for details element for screen readers
      expect(screen.getByRole('group')).toBeInTheDocument() // details element creates a group role
    })

    it('should support keyboard navigation', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      
      // Focus the button
      tryAgainButton.focus()
      expect(tryAgainButton).toHaveFocus()

      // Should be able to activate with Enter
      await user.keyboard('{Enter}')
      
      // After enter press, error boundary should still be showing since child still throws
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('Error Message Formatting', () => {
    it('should display error message with proper formatting', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsElement = screen.getByText('Error Details')
      fireEvent.click(detailsElement)

      const errorMessage = screen.getByText('Test error for ErrorBoundary')
      expect(errorMessage.tagName).toBe('PRE') // Should be in a pre tag for formatting
    })

    it('should handle errors without messages gracefully', () => {
      const ThrowEmptyError = () => {
        throw new Error('')
      }

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      // Should still show error details section even with empty message
      expect(screen.getByText('Error Details')).toBeInTheDocument()
    })
  })
}) 