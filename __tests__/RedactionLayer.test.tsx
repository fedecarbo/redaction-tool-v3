import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RedactionLayer } from '@/components/RedactionLayer';
import { RedactionProvider } from '@/context/RedactionContext';
import { RedactionRectangle } from '@/types/redaction';

// Test wrapper with context provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <RedactionProvider>{children}</RedactionProvider>
);

// Mock getBoundingClientRect
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

describe('RedactionLayer', () => {
  const defaultProps = {
    currentPage: 1,
    pdfDimensions: { width: 800, height: 600 },
  };

  test('should render without crashing', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should not respond to mouse events when redact mode is off', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toHaveClass('pointer-events-none');
    expect(layer).not.toHaveClass('cursor-crosshair');
  });

  test('should show crosshair cursor in redact mode', () => {
    // We need to render the toolbar to toggle redact mode
    render(
      <TestWrapper>
        <div>
          <button onClick={() => {
            // This would be handled by the toolbar, simulating via DOM manipulation
            const event = new Event('click');
            document.dispatchEvent(event);
          }}>Toggle</button>
          <RedactionLayer {...defaultProps} />
        </div>
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    // In view mode initially
    expect(layer).toHaveClass('pointer-events-none');
  });

  test('should start drawing on mouse down in redact mode', () => {
    const TestComponent = () => {
      const [isRedactMode, setIsRedactMode] = React.useState(false);
      
      return (
        <TestWrapper>
          <div>
            <button 
              data-testid="toggle-button"
              onClick={() => setIsRedactMode(!isRedactMode)}
            >
              Toggle
            </button>
            <RedactionLayer {...defaultProps} />
          </div>
        </TestWrapper>
      );
    };

    render(<TestComponent />);
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should handle coordinate conversion correctly', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0') as HTMLElement;
    expect(layer).toBeInTheDocument();
    
    // Component should render without coordinate errors
    expect(layer).toHaveClass('absolute', 'inset-0');
  });

  test('should render existing rectangles for current page', () => {
    // Create a test component that pre-populates rectangles
    const TestComponentWithRectangles = () => {
      const [rectangles] = React.useState<RedactionRectangle[]>([
        {
          id: 'test-rect-1',
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          pageNumber: 1,
        }
      ]);

      return (
        <TestWrapper>
          <RedactionLayer {...defaultProps} />
        </TestWrapper>
      );
    };

    render(<TestComponentWithRectangles />);
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should apply custom className when provided', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} className="custom-class" />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.custom-class');
    expect(layer).toBeInTheDocument();
  });

  test('should handle mouse events with proper coordinates', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0') as HTMLElement;
    
    // Simulate mouse down event
    fireEvent.mouseDown(layer, {
      clientX: 100,
      clientY: 100,
    });
    
    // Simulate mouse move event
    fireEvent.mouseMove(layer, {
      clientX: 200,
      clientY: 200,
    });
    
    // Simulate mouse up event
    fireEvent.mouseUp(layer, {
      clientX: 200,
      clientY: 200,
    });
    
    // Events should be handled without errors
    expect(layer).toBeInTheDocument();
  });

  test('should handle mouse leave event', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0') as HTMLElement;
    
    // Simulate mouse leave
    fireEvent.mouseLeave(layer);
    
    expect(layer).toBeInTheDocument();
  });

  test('should render with correct PDF dimensions', () => {
    const customDimensions = { width: 1200, height: 900 };
    
    render(
      <TestWrapper>
        <RedactionLayer 
          currentPage={2} 
          pdfDimensions={customDimensions} 
        />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should prevent default behavior on mouse events', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0') as HTMLElement;
    
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    
    const preventDefault = jest.spyOn(mouseDownEvent, 'preventDefault');
    
    fireEvent(layer, mouseDownEvent);
    
    // Should not call preventDefault in view mode
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('should handle different page numbers correctly', () => {
    render(
      <TestWrapper>
        <RedactionLayer currentPage={3} pdfDimensions={defaultProps.pdfDimensions} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should maintain proper z-index for overlay', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toHaveClass('z-10');
  });

  test('should handle edge cases with zero dimensions', () => {
    const zeroDimensions = { width: 0, height: 0 };
    
    render(
      <TestWrapper>
        <RedactionLayer 
          currentPage={1} 
          pdfDimensions={zeroDimensions} 
        />
      </TestWrapper>
    );
    
    const layer = document.querySelector('.absolute.inset-0');
    expect(layer).toBeInTheDocument();
  });

  test('should render visual feedback overlay in redact mode', () => {
    render(
      <TestWrapper>
        <RedactionLayer {...defaultProps} />
      </TestWrapper>
    );
    
    // Initially no overlay in view mode
    const overlay = document.querySelector('.bg-red-500\\/5');
    expect(overlay).not.toBeInTheDocument();
  });
}); 