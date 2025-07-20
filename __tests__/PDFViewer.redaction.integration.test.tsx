import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RedactionProvider } from '@/context/RedactionContext';
import { Toolbar } from '@/components/Toolbar';
import { RedactionLayer } from '@/components/RedactionLayer';

// Mock PDF.js Document and Page components
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: any) => {
    React.useEffect(() => {
      // Simulate successful PDF load
      setTimeout(() => {
        onLoadSuccess({ numPages: 3 });
      }, 100);
    }, [onLoadSuccess]);
    
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, onLoadSuccess }: any) => {
    React.useEffect(() => {
      // Simulate page load success with mock viewport
      if (onLoadSuccess) {
        setTimeout(() => {
          onLoadSuccess({
            getViewport: () => ({ width: 800, height: 600 })
          });
        }, 50);
      }
    }, [onLoadSuccess]);
    
    return (
      <div 
        data-testid={`pdf-page-${pageNumber}`}
        style={{ width: '800px', height: '600px', backgroundColor: '#f0f0f0' }}
      >
        PDF Page {pageNumber}
      </div>
    );
  },
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: ''
    }
  }
}));

// Test component that combines PDFViewer integration
const PDFRedactionIntegration = () => {
  return (
    <RedactionProvider>
      <div>
        <Toolbar />
        <div className="relative" style={{ width: '800px', height: '600px' }}>
          <div data-testid="pdf-page-mock" style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}>
            Mock PDF Page
          </div>
          <RedactionLayer
            currentPage={1}
            pdfDimensions={{ width: 800, height: 600 }}
          />
        </div>
      </div>
    </RedactionProvider>
  );
};

// Mock getBoundingClientRect for coordinate testing
const mockGetBoundingClientRect = jest.fn(() => ({
  left: 0,
  top: 0,
  width: 800,
  height: 600,
  right: 800,
  bottom: 600,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

beforeEach(() => {
  Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
});

describe('PDFViewer RedactionLayer Integration', () => {
  test('should render toolbar and redaction layer together', () => {
    render(<PDFRedactionIntegration />);
    
    // Check that both components are present
    const toolbar = screen.getByRole('button');
    expect(toolbar).toBeInTheDocument();
    
    const mockPage = screen.getByTestId('pdf-page-mock');
    expect(mockPage).toBeInTheDocument();
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10');
    expect(redactionLayer).toBeInTheDocument();
  });

  test('should toggle redaction mode and update layer behavior', () => {
    render(<PDFRedactionIntegration />);
    
    const toggleButton = screen.getByRole('button');
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10') as HTMLElement;
    
    // Initially in view mode
    expect(redactionLayer).toHaveClass('pointer-events-none');
    expect(toggleButton).toHaveTextContent('View Mode');
    
    // Toggle to redact mode
    fireEvent.click(toggleButton);
    
    expect(redactionLayer).toHaveClass('cursor-crosshair');
    expect(toggleButton).toHaveTextContent('Redact Mode ON');
  });

  test('should handle rectangle drawing in redact mode', () => {
    render(<PDFRedactionIntegration />);
    
    const toggleButton = screen.getByRole('button');
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10') as HTMLElement;
    
    // Enable redact mode
    fireEvent.click(toggleButton);
    
    // Simulate drawing a rectangle
    fireEvent.mouseDown(redactionLayer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(redactionLayer, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(redactionLayer, { clientX: 200, clientY: 200 });
    
    // Should not throw errors and layer should still be present
    expect(redactionLayer).toBeInTheDocument();
  });

  test('should maintain layer positioning over PDF page', () => {
    render(<PDFRedactionIntegration />);
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10');
    const mockPage = screen.getByTestId('pdf-page-mock');
    
    // Both should be present and layer should have absolute positioning
    expect(redactionLayer).toBeInTheDocument();
    expect(mockPage).toBeInTheDocument();
    expect(redactionLayer).toHaveClass('absolute', 'inset-0', 'z-10');
  });

  test('should handle coordinate mapping correctly', () => {
    render(<PDFRedactionIntegration />);
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10') as HTMLElement;
    
    // Verify the layer can handle coordinate events
    fireEvent.mouseMove(redactionLayer, { clientX: 400, clientY: 300 });
    
    expect(redactionLayer).toBeInTheDocument();
    expect(mockGetBoundingClientRect).toHaveBeenCalled();
  });

  test('should show visual feedback when redaction mode is active', () => {
    render(<PDFRedactionIntegration />);
    
    const toggleButton = screen.getByRole('button');
    
    // Enable redact mode
    fireEvent.click(toggleButton);
    
    // Should show visual indicators
    expect(toggleButton).toHaveTextContent('Redact Mode ON');
    expect(screen.getByText('Click and drag to select areas to redact')).toBeInTheDocument();
    
    // Check for redaction mode visual feedback
    const pulseDot = document.querySelector('.animate-pulse');
    expect(pulseDot).toBeInTheDocument();
  });

  test('should handle page dimensions correctly', () => {
    const customDimensions = { width: 1200, height: 900 };
    
    render(
      <RedactionProvider>
        <RedactionLayer
          currentPage={1}
          pdfDimensions={customDimensions}
        />
      </RedactionProvider>
    );
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10');
    expect(redactionLayer).toBeInTheDocument();
  });

  test('should support multiple pages', () => {
    render(
      <RedactionProvider>
        <div>
          <RedactionLayer currentPage={1} pdfDimensions={{ width: 800, height: 600 }} />
          <RedactionLayer currentPage={2} pdfDimensions={{ width: 800, height: 600 }} />
        </div>
      </RedactionProvider>
    );
    
    const layers = document.querySelectorAll('.absolute.inset-0.z-10');
    expect(layers).toHaveLength(2);
  });

  test('should handle zoom changes correctly', () => {
    const scaledDimensions = { width: 800 * 1.5, height: 600 * 1.5 };
    
    render(
      <RedactionProvider>
        <RedactionLayer
          currentPage={1}
          pdfDimensions={scaledDimensions}
        />
      </RedactionProvider>
    );
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10');
    expect(redactionLayer).toBeInTheDocument();
  });

  test('should maintain proper z-index layering', () => {
    render(<PDFRedactionIntegration />);
    
    const redactionLayer = document.querySelector('.absolute.inset-0.z-10');
    const mockPage = screen.getByTestId('pdf-page-mock');
    
    // RedactionLayer should have higher z-index to appear on top
    expect(redactionLayer).toHaveClass('z-10');
    expect(redactionLayer).toBeInTheDocument();
    expect(mockPage).toBeInTheDocument();
  });
}); 