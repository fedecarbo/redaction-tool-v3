import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PDFViewer from '@/components/PDFViewer'

// Mock react-pdf for responsive tests
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: any) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onLoadSuccess?.({ numPages: 5 })
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
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
  ZoomIn: () => <span data-testid="zoom-in">ZoomIn</span>,
  ZoomOut: () => <span data-testid="zoom-out">ZoomOut</span>,
  RotateCcw: () => <span data-testid="rotate-ccw">RotateCcw</span>,
}))

// Utility to mock window size
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

// Mock matchMedia with different viewport sizes
const mockMatchMedia = (queries: Record<string, boolean>) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => {
      const matches = queries[query] || false
      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    }),
  })
}

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Desktop Viewport (1024px+)', () => {
    beforeEach(() => {
      mockWindowSize(1200, 800)
      mockMatchMedia({
        '(min-width: 1024px)': true,
        '(min-width: 768px)': true,
        '(max-width: 767px)': false,
      })
    })

    it('should render properly on desktop layout', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Card should have appropriate styling for desktop
      const pdfCard = screen.getByText('PDF Viewer').closest('.rounded-lg')
      expect(pdfCard).toHaveClass('w-full', 'max-w-5xl', 'mx-auto')

      // All controls should be visible
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument()
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()

      // Page thumbnails should be visible
      expect(screen.getByText('Page Navigation')).toBeInTheDocument()
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument()
      }
    })

    it('should handle zoom controls appropriately on desktop', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Zoom controls should be in a horizontal layout
      const zoomControls = screen.getByText('120%').closest('.flex')
      expect(zoomControls).toHaveClass('items-center', 'gap-2')

      // All zoom buttons should be easily accessible
      expect(screen.getByTestId('zoom-out').closest('button')).toBeVisible()
      expect(screen.getByTestId('zoom-in').closest('button')).toBeVisible()
      expect(screen.getByTestId('rotate-ccw').closest('button')).toBeVisible()
    })

    it('should display page thumbnails in horizontal layout on desktop', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page Navigation')).toBeInTheDocument()
      })

      const thumbnailContainer = screen.getByText('Page Navigation').nextElementSibling
      expect(thumbnailContainer).toHaveClass('flex', 'flex-wrap', 'justify-center', 'gap-2')

      // All thumbnail buttons should be visible
      for (let i = 1; i <= 5; i++) {
        const button = screen.getByRole('button', { name: i.toString() })
        expect(button).toHaveClass('w-12', 'h-8', 'text-xs')
      }
    })
  })

  describe('Tablet Viewport (768px - 1023px)', () => {
    beforeEach(() => {
      mockWindowSize(768, 1024)
      mockMatchMedia({
        '(min-width: 1024px)': false,
        '(min-width: 768px)': true,
        '(max-width: 767px)': false,
      })
    })

    it('should render properly on tablet layout', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Card should still maintain proper layout on tablet
      const pdfCard = screen.getByText('PDF Viewer').closest('.rounded-lg')
      expect(pdfCard).toHaveClass('w-full', 'max-w-5xl', 'mx-auto')

      // All essential controls should remain visible
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument()
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should maintain usable touch targets on tablet', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Buttons should have appropriate sizes for touch interaction
      const nextButton = screen.getByRole('button', { name: /next/i })
      const zoomInButton = screen.getByTestId('zoom-in').closest('button')
      const thumbnail1 = screen.getByRole('button', { name: '1' })

      // Check that buttons have minimum touch target sizes (at least h-9 for main buttons)
      expect(nextButton).toHaveClass('h-9')
      expect(zoomInButton).toHaveClass('h-9')
      expect(thumbnail1).toHaveClass('h-8') // Smaller for thumbnails is acceptable
    })

    it('should handle orientation changes gracefully', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Simulate orientation change to landscape tablet
      mockWindowSize(1024, 768)
      window.dispatchEvent(new Event('resize'))

      // Component should still function properly
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('Page Navigation')).toBeInTheDocument()
    })
  })

  describe('Small Tablet/Large Mobile (600px - 767px)', () => {
    beforeEach(() => {
      mockWindowSize(600, 800)
      mockMatchMedia({
        '(min-width: 1024px)': false,
        '(min-width: 768px)': false,
        '(max-width: 767px)': true,
      })
    })

    it('should adapt layout for smaller screens', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Essential functionality should remain
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()

      // Page thumbnails should still be accessible
      expect(screen.getByText('Page Navigation')).toBeInTheDocument()
    })

    it('should maintain proper spacing on smaller screens', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page Navigation')).toBeInTheDocument()
      })

      // Thumbnail container should handle overflow properly
      const thumbnailContainer = screen.getByText('Page Navigation').nextElementSibling
      expect(thumbnailContainer).toHaveClass('max-h-32', 'overflow-y-auto')

      // Flex gap should be appropriate for smaller screens
      expect(thumbnailContainer).toHaveClass('gap-2')
    })
  })

  describe('Cross-Device Consistency', () => {
    it('should maintain functional consistency across viewport sizes', async () => {
      const viewports = [
        { width: 1200, height: 800, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet Portrait' },
        { width: 1024, height: 768, name: 'Tablet Landscape' },
        { width: 600, height: 800, name: 'Small Tablet' },
      ]

      for (const viewport of viewports) {
        mockWindowSize(viewport.width, viewport.height)
        
        const { unmount } = render(<PDFViewer />)

        await waitFor(() => {
          expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
        })

        // Core functionality should work on all viewports
        expect(screen.getByText('PDF Viewer')).toBeInTheDocument()
        expect(screen.getByText('120%')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
        expect(screen.getByText('Page Navigation')).toBeInTheDocument()

        unmount()
      }
    })

    it('should handle zoom appropriately across devices', async () => {
      const { rerender } = render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // Test zoom on desktop
      mockWindowSize(1200, 800)
      rerender(<PDFViewer />)
      expect(screen.getByText('120%')).toBeInTheDocument()

      // Test zoom on tablet
      mockWindowSize(768, 1024)
      rerender(<PDFViewer />)
      expect(screen.getByText('120%')).toBeInTheDocument()

      // Zoom controls should be accessible on all devices
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument()
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument()
    })
  })

  describe('Content Overflow Handling', () => {
    it('should handle PDF content overflow properly', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // PDF container should handle overflow
      const pdfContainer = screen.getByTestId('pdf-document').parentElement
      expect(pdfContainer).toHaveClass('max-w-full', 'overflow-auto')
    })

    it('should handle thumbnail overflow on small screens', async () => {
      mockWindowSize(400, 600) // Very small screen
      
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page Navigation')).toBeInTheDocument()
      })

      // Thumbnail container should handle many pages gracefully
      const thumbnailContainer = screen.getByText('Page Navigation').nextElementSibling
      expect(thumbnailContainer).toHaveClass('max-h-32', 'overflow-y-auto')

      // All thumbnail buttons should still be present
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility Across Devices', () => {
    it('should maintain touch target accessibility on touch devices', async () => {
      mockWindowSize(768, 1024) // Tablet size
      
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // All interactive elements should be accessible
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5) // Navigation + zoom + thumbnails

      // Main navigation buttons should have adequate size
      const nextButton = screen.getByRole('button', { name: /next/i })
      const prevButton = screen.getByRole('button', { name: /previous/i })
      
      expect(nextButton).toHaveClass('h-9') // Minimum 36px height
      expect(prevButton).toHaveClass('h-9')
    })

    it('should support keyboard navigation on all devices', async () => {
      render(<PDFViewer />)

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      })

      // All interactive elements should be focusable
      const nextButton = screen.getByRole('button', { name: /next/i })
      const zoomButton = screen.getByTestId('zoom-in').closest('button')
      const thumbnailButton = screen.getByRole('button', { name: '2' })

      // Focus should work
      nextButton.focus()
      expect(nextButton).toHaveFocus()

      zoomButton?.focus()
      expect(zoomButton).toHaveFocus()

      thumbnailButton.focus()
      expect(thumbnailButton).toHaveFocus()
    })
  })
}) 