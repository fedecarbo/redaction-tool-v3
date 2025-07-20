import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RedactionProvider, useRedaction } from '@/context/RedactionContext';
import { RedactionRectangle } from '@/types/redaction';

// Wrapper component for testing context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RedactionProvider>{children}</RedactionProvider>
);

describe('RedactionContext', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    expect(result.current.state.isRedactMode).toBe(false);
    expect(result.current.state.rectanglesByPage.size).toBe(0);
    expect(result.current.state.currentDrawing).toBe(null);
  });

  test('should toggle redact mode', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    act(() => {
      result.current.toggleRedactMode();
    });
    
    expect(result.current.state.isRedactMode).toBe(true);
    
    act(() => {
      result.current.toggleRedactMode();
    });
    
    expect(result.current.state.isRedactMode).toBe(false);
  });

  test('should add rectangle to correct page', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    act(() => {
      result.current.addRectangle(rectangle);
    });
    
    const pageRectangles = result.current.state.rectanglesByPage.get(1);
    expect(pageRectangles).toHaveLength(1);
    expect(pageRectangles![0]).toEqual(rectangle);
  });

  test('should handle multiple rectangles on same page', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 1,
    };
    
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    const pageRectangles = result.current.state.rectanglesByPage.get(1);
    expect(pageRectangles).toHaveLength(2);
    expect(pageRectangles).toContain(rectangle1);
    expect(pageRectangles).toContain(rectangle2);
  });

  test('should remove specific rectangle from page', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 1,
    };
    
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    act(() => {
      result.current.removeRectangle('rect-1', 1);
    });
    
    const pageRectangles = result.current.state.rectanglesByPage.get(1);
    expect(pageRectangles).toHaveLength(1);
    expect(pageRectangles![0].id).toBe('rect-2');
  });

  test('should clear all rectangles from page', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 2,
    };
    
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    act(() => {
      result.current.clearPageRectangles(1);
    });
    
    expect(result.current.state.rectanglesByPage.has(1)).toBe(false);
    expect(result.current.state.rectanglesByPage.has(2)).toBe(true);
  });

  test('should set and clear current drawing', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle: RedactionRectangle = {
      id: 'temp-rect',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    act(() => {
      result.current.setCurrentDrawing(rectangle);
    });
    
    expect(result.current.state.currentDrawing).toEqual(rectangle);
    
    act(() => {
      result.current.setCurrentDrawing(null);
    });
    
    expect(result.current.state.currentDrawing).toBe(null);
  });

  test('should clear current drawing when toggling mode', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle: RedactionRectangle = {
      id: 'temp-rect',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    act(() => {
      result.current.setCurrentDrawing(rectangle);
    });
    
    expect(result.current.state.currentDrawing).toEqual(rectangle);
    
    act(() => {
      result.current.toggleRedactMode();
    });
    
    expect(result.current.state.currentDrawing).toBe(null);
  });

  test('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useRedaction());
    }).toThrow('useRedaction must be used within a RedactionProvider');
    
    consoleSpy.mockRestore();
  });

  // NEW TESTS FOR STORY 1.3 FUNCTIONALITY

  test('should undo last rectangle correctly', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 1,
    };
    
    // Add two rectangles
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    expect(result.current.state.rectanglesByPage.get(1)).toHaveLength(2);
    expect(result.current.state.canUndo).toBe(true);
    
    // Undo last rectangle
    act(() => {
      result.current.undo();
    });
    
    const pageRectangles = result.current.state.rectanglesByPage.get(1);
    expect(pageRectangles).toHaveLength(1);
    expect(pageRectangles![0]).toEqual(rectangle1);
    expect(result.current.state.canUndo).toBe(true);
    
    // Undo again
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.state.rectanglesByPage.has(1)).toBe(false);
    expect(result.current.state.canUndo).toBe(false);
  });

  test('should clear all rectangles correctly', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 2,
    };
    
    // Add rectangles to multiple pages
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    expect(result.current.state.rectanglesByPage.size).toBe(2);
    expect(result.current.state.canUndo).toBe(true);
    
    // Clear all rectangles
    act(() => {
      result.current.clearAll();
    });
    
    expect(result.current.state.rectanglesByPage.size).toBe(0);
    expect(result.current.state.canUndo).toBe(false);
  });

  test('should apply redactions successfully', async () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    // Add a rectangle
    act(() => {
      result.current.addRectangle(rectangle);
    });
    
    expect(result.current.state.rectanglesByPage.get(1)).toHaveLength(1);
    
    // Apply redactions
    await act(async () => {
      await result.current.applyRedactions();
    });
    
    // Check that redacted PDF is stored
    expect(result.current.state.redactedPDF).toBeDefined();
    expect(result.current.state.redactedPDF).toBeInstanceOf(Uint8Array);
    
    // Check that view switched to redacted
    expect(result.current.state.currentView).toBe('redacted');
    
    // Check that undo is disabled after applying
    expect(result.current.state.canUndo).toBe(false);
    
    // Check that toast is shown
    expect(result.current.state.toast.isVisible).toBe(true);
    expect(result.current.state.toast.message).toBe('Redactions applied successfully!');
    expect(result.current.state.toast.type).toBe('success');
  });



  test('should toggle view correctly', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    // Initially should be original view
    expect(result.current.state.currentView).toBe('original');
    
    // Toggle to redacted view
    act(() => {
      result.current.toggleView();
    });
    
    expect(result.current.state.currentView).toBe('redacted');
    
    // Toggle back to original view
    act(() => {
      result.current.toggleView();
    });
    
    expect(result.current.state.currentView).toBe('original');
  });

  test('should show and hide toast correctly', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    // Initially toast should be hidden
    expect(result.current.state.toast.isVisible).toBe(false);
    
    // Show success toast
    act(() => {
      result.current.showToast('Operation successful!', 'success');
    });
    
    expect(result.current.state.toast.isVisible).toBe(true);
    expect(result.current.state.toast.message).toBe('Operation successful!');
    expect(result.current.state.toast.type).toBe('success');
    
    // Hide toast
    act(() => {
      result.current.hideToast();
    });
    
    expect(result.current.state.toast.isVisible).toBe(false);
    
    // Show error toast
    act(() => {
      result.current.showToast('Operation failed!', 'error');
    });
    
    expect(result.current.state.toast.isVisible).toBe(true);
    expect(result.current.state.toast.message).toBe('Operation failed!');
    expect(result.current.state.toast.type).toBe('error');
  });

  test('should handle undo across multiple pages', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    const rectangle1: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    const rectangle2: RedactionRectangle = {
      id: 'rect-2',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      pageNumber: 2,
    };
    
    // Add rectangles to different pages
    act(() => {
      result.current.addRectangle(rectangle1);
      result.current.addRectangle(rectangle2);
    });
    
    expect(result.current.state.rectanglesByPage.get(1)).toHaveLength(1);
    expect(result.current.state.rectanglesByPage.get(2)).toHaveLength(1);
    
    // Undo should remove from page 2 first (LIFO)
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.state.rectanglesByPage.get(1)).toHaveLength(1);
    expect(result.current.state.rectanglesByPage.has(2)).toBe(false);
    
    // Undo again should remove from page 1
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.state.rectanglesByPage.has(1)).toBe(false);
    expect(result.current.state.canUndo).toBe(false);
  });

  test('should maintain canUndo state correctly', () => {
    const { result } = renderHook(() => useRedaction(), { wrapper });
    
    // Initially no rectangles, so canUndo should be false
    expect(result.current.state.canUndo).toBe(false);
    
    const rectangle: RedactionRectangle = {
      id: 'rect-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      pageNumber: 1,
    };
    
    // Add rectangle
    act(() => {
      result.current.addRectangle(rectangle);
    });
    
    expect(result.current.state.canUndo).toBe(true);
    
    // Remove rectangle
    act(() => {
      result.current.removeRectangle('rect-1', 1);
    });
    
    expect(result.current.state.canUndo).toBe(false);
    
    // Add rectangle again
    act(() => {
      result.current.addRectangle(rectangle);
    });
    
    expect(result.current.state.canUndo).toBe(true);
    
    // Clear all
    act(() => {
      result.current.clearAll();
    });
    
    expect(result.current.state.canUndo).toBe(false);
  });
}); 