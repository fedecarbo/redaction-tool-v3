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
}); 