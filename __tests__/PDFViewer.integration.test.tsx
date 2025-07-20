import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PDFViewer from '@/components/PDFViewer'
import ErrorBoundary from '@/components/ErrorBoundary'

// Mock for successful PDF loading scenarios
const mockSuccessfulPDF = {
  Document: ({ children, onLoadSuccess }: any) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onLoadSuccess?.({ numPages: 3 })
      }, 50)
      return () => clearTimeout(timer)
    }, [onLoadSuccess])
    return <div data-testid="pdf-document">{children}</div>
  },
  Page: ({ pageNumber, scale }: any) => (
    <div data-testid={`pdf-page-${pageNumber}`} data-scale={scale}>
      Page {pageNumber} (Scale: {scale})
    </div>
  ),
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}

// Mock for failed PDF loading scenarios
const mockFailedPDF = {
  Document: ({ children, onLoadError }: any) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onLoadError?.(new Error('Network error: Failed to fetch PDF'))
      }, 50)
      return () => clearTimeout(timer)
    }, [onLoadError])
    return <div data-testid="pdf-document-error">{children}</div>
  },
  Page: () => <div>Should not render</div>,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
  ZoomIn: () => <span data-testid="zoom-in">ZoomIn</span>,
  ZoomOut: () => <span data-testid="zoom-out">ZoomOut</span>,
  RotateCcw: () => <span data-testid="rotate-ccw">RotateCcw</span>,
}))

describe('PDFViewer Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete PDF Loading Flow', () => {
    beforeEach(() => {
      jest.doMock('react-pdf', () => mockSuccessfulPDF)
    })

    it('should complete full PDF loading and navigation flow', async () => {
      render(<PDFViewer />)

      // 1. Initial loading state
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument()

      // 2. PDF loads successfully
      await waitFor(() => {
        expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
      })

      // 3. Navigation controls appear
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // 4. Page thumbnails are available
      expect(screen.getByText('Page Navigation')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()

      // 5. Zoom controls are functional
      expect(screen.getByText('120%')).toBeInTheDocument()

      // 6. Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      })

      // 7. Zoom functionality works
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')
      await user.click(zoomInButton!)

      await waitFor(() => {
        expect(screen.getByText('140%')).toBeInTheDocument()
      })
    })

    it('should handle navigation between all pages seamlessly', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Navigate through all pages using thumbnails
      for (let page = 1; page <= 3; page++) {
        const thumbnailButton = screen.getByRole('button', { name: page.toString() })
        await user.click(thumbnailButton)

        await waitFor(() => {
          expect(screen.getByText(`Page ${page} of 3`)).toBeInTheDocument()
          expect(screen.getByTestId(`pdf-page-${page}`)).toBeInTheDocument()
        })
      }

      // Test edge cases - first and last page button states
      const prevButton = screen.getByRole('button', { name: /previous/i })
      const nextButton = screen.getByRole('button', { name: /next/i })

      // Go to first page and verify previous is disabled
      const firstPageButton = screen.getByRole('button', { name: '1' })
      await user.click(firstPageButton)
      await waitFor(() => {
        expect(prevButton).toBeDisabled()
      })

      // Go to last page and verify next is disabled
      const lastPageButton = screen.getByRole('button', { name: '3' })
      await user.click(lastPageButton)
      await waitFor(() => {
        expect(nextButton).toBeDisabled()
      })
    })

    it('should maintain zoom level across page navigation', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Set zoom level
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')
      await user.click(zoomInButton!)
      await user.click(zoomInButton!)

      await waitFor(() => {
        expect(screen.getByText('160%')).toBeInTheDocument() // 1.2 + 0.2 + 0.2 = 1.6
      })

      // Navigate to different page
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      })

      // Zoom level should be maintained
      expect(screen.getByText('160%')).toBeInTheDocument()

      // PDF page should render with correct scale
      const pdfPage = screen.getByTestId('pdf-page-2')
      expect(pdfPage).toHaveAttribute('data-scale', '1.6')
    })
  })

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      jest.doMock('react-pdf', () => mockFailedPDF)
    })

    it('should handle PDF loading failures gracefully', async () => {
      render(<PDFViewer />)

      // Initial loading
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument()

      // Error state appears
      await waitFor(() => {
        expect(screen.getByText('Error loading PDF')).toBeInTheDocument()
      })

      expect(screen.getByText('Failed to load PDF document. Please check if the file exists.')).toBeInTheDocument()

      // Navigation controls should not be present
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
      expect(screen.queryByText('Page Navigation')).not.toBeInTheDocument()

      // Zoom controls should still be present (they don't depend on PDF loading)
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument()
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument()
    })

    it('should work with ErrorBoundary for component-level errors', async () => {
      const ThrowError = () => {
        throw new Error('Component render error')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/The PDF viewer encountered an unexpected error/)).toBeInTheDocument()

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
    })
  })

  describe('User Experience Flows', () => {
    beforeEach(() => {
      jest.doMock('react-pdf', () => mockSuccessfulPDF)
    })

    it('should support complete keyboard navigation workflow', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Tab through controls and use keyboard
      const nextButton = screen.getByRole('button', { name: /next/i })
      nextButton.focus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      })

      // Use keyboard for zoom
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')
      zoomInButton?.focus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText('140%')).toBeInTheDocument()
      })
    })

    it('should handle rapid user interactions gracefully', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Rapid clicking on navigation
      const nextButton = screen.getByRole('button', { name: /next/i })
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')

      // Multiple rapid clicks
      await user.click(nextButton)
      await user.click(zoomInButton!)
      await user.click(nextButton)
      await user.click(zoomInButton!)

      // Should end up on page 3 with 160% zoom
      await waitFor(() => {
        expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
        expect(screen.getByText('160%')).toBeInTheDocument()
      })
    })

    it('should maintain state consistency during complex interactions', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Complex interaction flow
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')
      const zoomOutButton = screen.getByTestId('zoom-out').closest('button')
      const resetButton = screen.getByTestId('rotate-ccw').closest('button')
      const page2Button = screen.getByRole('button', { name: '2' })

      // Zoom in multiple times
      await user.click(zoomInButton!)
      await user.click(zoomInButton!)
      await user.click(zoomInButton!)

      // Navigate to page 2
      await user.click(page2Button)

      // Zoom out once
      await user.click(zoomOutButton!)

      // Reset zoom
      await user.click(resetButton!)

      // Final state verification
      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
        expect(screen.getByText('120%')).toBeInTheDocument() // Back to default
      })
    })
  })

  describe('Performance Considerations', () => {
    beforeEach(() => {
      jest.doMock('react-pdf', () => mockSuccessfulPDF)
    })

    it('should load and render within reasonable time', async () => {
      const startTime = performance.now()
      
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      }, { timeout: 1000 }) // Should load within 1 second

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Should load reasonably quickly (this is a basic check)
      expect(loadTime).toBeLessThan(1000)
    })

    it('should not cause memory leaks with multiple re-renders', async () => {
      const { rerender } = render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Multiple re-renders with different files
      for (let i = 0; i < 5; i++) {
        rerender(<PDFViewer file={`/test-${i}.pdf`} />)
        
        await waitFor(() => {
          expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
        })
      }

      // Should still be functional after multiple re-renders
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument()
    })
  })
}) 