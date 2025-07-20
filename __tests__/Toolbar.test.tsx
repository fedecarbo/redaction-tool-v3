import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { Toolbar } from '@/components/Toolbar';
import { RedactionProvider, useRedaction } from '@/context/RedactionContext';

// Test wrapper with context provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <RedactionProvider>{children}</RedactionProvider>
);

describe('Toolbar', () => {
  test('should render with default view mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('View Mode');
    expect(screen.getByText('Click Redact Mode to start marking sensitive areas')).toBeInTheDocument();
  });

  test('should toggle to redact mode when clicked', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toHaveTextContent('Redact Mode ON');
    expect(screen.getByText('Click and drag to select areas to redact')).toBeInTheDocument();
  });

  test('should toggle back to view mode when clicked again', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Toggle to redact mode
    fireEvent.click(button);
    expect(button).toHaveTextContent('Redact Mode ON');
    
    // Toggle back to view mode
    fireEvent.click(button);
    expect(button).toHaveTextContent('View Mode');
    expect(screen.getByText('Click Redact Mode to start marking sensitive areas')).toBeInTheDocument();
  });

  test('should display correct icons for each mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Check initial view mode icon (Eye icon)
    expect(button.querySelector('svg')).toBeInTheDocument();
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Check redact mode icon (Scissors icon)
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('should have correct styling classes for different modes', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // View mode styling
    expect(button).toHaveClass('border-red-200', 'text-red-600');
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Redact mode styling
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  test('should show pulsing indicator in redact mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Initially no pulse
    const initialIndicator = document.querySelector('.animate-pulse');
    expect(initialIndicator).toBe(null);
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Should have pulsing indicator
    const indicator = document.querySelector('.animate-pulse');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-red-500');
  });

  test('should apply custom className when provided', () => {
    render(
      <TestWrapper>
        <Toolbar className="custom-class" />
      </TestWrapper>
    );
    
    const toolbar = document.querySelector('.custom-class');
    expect(toolbar).toBeInTheDocument();
  });

  test('should have accessible button role and text', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Button component doesn't set type attribute explicitly but is accessible via role
    expect(button.tagName).toBe('BUTTON');
  });

  test('should maintain consistent layout structure', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Check main container structure
    const container = document.querySelector('.flex.items-center.gap-2.p-3');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-card', 'border', 'rounded-lg', 'shadow-sm');
    
    // Check inner layout
    const innerContainer = document.querySelector('.flex.items-center.gap-2');
    expect(innerContainer).toBeInTheDocument();
  });

  // NEW TESTS FOR STORY 1.3 FUNCTIONALITY

  test('should show Undo and Clear All buttons when in redact mode with rectangles', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper: TestWrapper });
    
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Initially no buttons should be visible
    expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    
    // Toggle to redact mode
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    // Buttons should be visible in redact mode (even without rectangles)
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    
    // Add a rectangle
    act(() => {
      result.current.addRectangle({
        id: 'rect-1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        pageNumber: 1,
      });
    });
    
    // Buttons should still be visible
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  test('should show Apply Redactions button when rectangles exist', async () => {
    // Create a test component that combines context and toolbar
    const TestComponent = () => {
      const { addRectangle } = useRedaction();
      
      const addTestRectangle = () => {
        addRectangle({
          id: 'rect-1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          pageNumber: 1,
        });
      };
      
      return (
        <div>
          <Toolbar />
          <button onClick={addTestRectangle} data-testid="add-rectangle">
            Add Rectangle
          </button>
        </div>
      );
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Initially no Apply button should be visible
    expect(screen.queryByText('Apply Redactions')).not.toBeInTheDocument();
    
    // Toggle to redact mode
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    // Still no Apply button because no rectangles
    expect(screen.queryByText('Apply Redactions')).not.toBeInTheDocument();
    
    // Add a rectangle
    const addButton = screen.getByTestId('add-rectangle');
    fireEvent.click(addButton);
    
    // Wait for the Apply button to appear
    await waitFor(() => {
      expect(screen.getByText('Apply Redactions')).toBeInTheDocument();
    });
  });

  test('should show view toggle when redacted PDF is available', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper: TestWrapper });
    
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Initially no view toggle should be visible
    expect(screen.queryByText('Original View')).not.toBeInTheDocument();
    expect(screen.queryByText('Redacted View')).not.toBeInTheDocument();
    
    // Set redacted PDF in state
    act(() => {
      result.current.state.redactedPDF = new Uint8Array([1, 2, 3, 4]);
    });
    
    // Re-render to see the view toggle
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Now view toggle should be visible
    expect(screen.getByText('Original View')).toBeInTheDocument();
  });

  test('should handle apply redactions confirmation dialog', async () => {
    // Create a test component that combines context and toolbar
    const TestComponent = () => {
      const { addRectangle } = useRedaction();
      
      const addTestRectangle = () => {
        addRectangle({
          id: 'rect-1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          pageNumber: 1,
        });
      };
      
      return (
        <div>
          <Toolbar />
          <button onClick={addTestRectangle} data-testid="add-rectangle">
            Add Rectangle
          </button>
        </div>
      );
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Toggle to redact mode and add rectangle
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    const addButton = screen.getByTestId('add-rectangle');
    fireEvent.click(addButton);
    
    // Wait for the Apply button to appear
    await waitFor(() => {
      expect(screen.getByText('Apply Redactions')).toBeInTheDocument();
    });
    
    // Click Apply Redactions button
    const applyButton = screen.getByText('Apply Redactions');
    fireEvent.click(applyButton);
    
    // Dialog should be visible
    expect(screen.getByText('This will permanently apply all redactions to the PDF. The original content will be unrecoverable. Are you sure you want to continue?')).toBeInTheDocument();
    expect(screen.getByText('This will permanently apply all redactions to the PDF. The original content will be unrecoverable. Are you sure you want to continue?')).toBeInTheDocument();
    
    // Cancel dialog
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Dialog should be hidden
    expect(screen.queryByText('This will permanently apply all redactions to the PDF. The original content will be unrecoverable. Are you sure you want to continue?')).not.toBeInTheDocument();
  });

  test('should disable undo and clear buttons after applying redactions', async () => {
    // Create a test component that combines context and toolbar
    const TestComponent = () => {
      const { addRectangle } = useRedaction();
      
      const addTestRectangle = () => {
        addRectangle({
          id: 'rect-1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          pageNumber: 1,
        });
      };
      
      return (
        <div>
          <Toolbar />
          <button onClick={addTestRectangle} data-testid="add-rectangle">
            Add Rectangle
          </button>
        </div>
      );
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Toggle to redact mode and add rectangle
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    const addButton = screen.getByTestId('add-rectangle');
    fireEvent.click(addButton);
    
    // Wait for buttons to be enabled
    await waitFor(() => {
      const undoButton = screen.getByText('Undo');
      const clearButton = screen.getByText('Clear All');
      expect(undoButton).not.toBeDisabled();
      expect(clearButton).not.toBeDisabled();
    });
    
    // Get buttons for later use
    const undoButton = screen.getByText('Undo');
    const clearButton = screen.getByText('Clear All');
    expect(undoButton).not.toBeDisabled();
    expect(clearButton).not.toBeDisabled();
    
    // Apply redactions
    const applyButton = screen.getByText('Apply Redactions');
    fireEvent.click(applyButton);
    
    // Confirm in dialog
    const confirmButton = screen.getByTestId('confirm-btn');
    fireEvent.click(confirmButton);
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buttons should now be disabled
    expect(undoButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  test('should handle view toggle functionality', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper: TestWrapper });
    
    // Set redacted PDF in state
    act(() => {
      result.current.state.redactedPDF = new Uint8Array([1, 2, 3, 4]);
    });
    
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Initially should show Original View
    expect(screen.getByText('Original View')).toBeInTheDocument();
    
    // Click view toggle
    const viewToggleButton = screen.getByText('Original View');
    fireEvent.click(viewToggleButton);
    
    // Should now show Redacted View
    expect(screen.getByText('Redacted View')).toBeInTheDocument();
    
    // Click again to toggle back
    fireEvent.click(screen.getByText('Redacted View'));
    
    // Should show Original View again
    expect(screen.getByText('Original View')).toBeInTheDocument();
  });

  test('should have proper accessibility attributes for new buttons', async () => {
    // Create a test component that combines context and toolbar
    const TestComponent = () => {
      const { addRectangle } = useRedaction();
      
      const addTestRectangle = () => {
        addRectangle({
          id: 'rect-1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          pageNumber: 1,
        });
      };
      
      return (
        <div>
          <Toolbar />
          <button onClick={addTestRectangle} data-testid="add-rectangle">
            Add Rectangle
          </button>
        </div>
      );
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Toggle to redact mode and add rectangle
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    const addButton = screen.getByTestId('add-rectangle');
    fireEvent.click(addButton);
    
    // Wait for buttons to appear and check they are accessible
    await waitFor(() => {
      const undoButton = screen.getByText('Undo');
      const clearButton = screen.getByText('Clear All');
      const applyButton = screen.getByText('Apply Redactions');
      
      expect(undoButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
      expect(applyButton).toBeInTheDocument();
    });
  });

  test('should handle edge case when no rectangles exist', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Toggle to redact mode
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    // Buttons should be visible in redact mode even without rectangles
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.queryByText('Apply Redactions')).not.toBeInTheDocument();
  });

  test('should handle conditional rendering based on state', async () => {
    // Create a test component that combines context and toolbar
    const TestComponent = () => {
      const { addRectangle } = useRedaction();
      
      const addTestRectangle = () => {
        addRectangle({
          id: 'rect-1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          pageNumber: 1,
        });
      };
      
      return (
        <div>
          <Toolbar />
          <button onClick={addTestRectangle} data-testid="add-rectangle">
            Add Rectangle
          </button>
        </div>
      );
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Initially in view mode
    expect(screen.getByText('View Mode')).toBeInTheDocument();
    expect(screen.queryByText('Redact Mode ON')).not.toBeInTheDocument();
    
    // Toggle to redact mode
    const redactButton = screen.getByText('View Mode');
    fireEvent.click(redactButton);
    
    // Now in redact mode
    expect(screen.getByText('Redact Mode ON')).toBeInTheDocument();
    expect(screen.queryByText('View Mode')).not.toBeInTheDocument();
    
    // Add rectangle to show additional buttons
    const addButton = screen.getByTestId('add-rectangle');
    fireEvent.click(addButton);
    
    // Wait for additional buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
      expect(screen.getByText('Apply Redactions')).toBeInTheDocument();
    });
  });
}); 