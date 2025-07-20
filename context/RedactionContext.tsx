'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { RedactionState, RedactionContextType, RedactionRectangle } from '@/types/redaction';
import { applyRedactions as applyRedactionsToPDF } from '@/utils/redactionEngine';

// Action types for reducer
type RedactionAction = 
  | { type: 'TOGGLE_REDACT_MODE' }
  | { type: 'ADD_RECTANGLE'; rectangle: RedactionRectangle }
  | { type: 'REMOVE_RECTANGLE'; rectangleId: string; pageNumber: number }
  | { type: 'CLEAR_PAGE_RECTANGLES'; pageNumber: number }
  | { type: 'SET_CURRENT_DRAWING'; rectangle: RedactionRectangle | null }
  | { type: 'UNDO_LAST_RECTANGLE' }
  | { type: 'CLEAR_ALL_RECTANGLES' }
  | { type: 'SET_REDACTED_PDF'; pdf: Uint8Array }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'SET_CAN_UNDO'; canUndo: boolean }
  | { type: 'SHOW_TOAST'; message: string; toastType: 'success' | 'error' }
  | { type: 'HIDE_TOAST' };

// Initial state
const initialState: RedactionState = {
  isRedactMode: false,
  rectanglesByPage: new Map(),
  currentDrawing: null,
  redactedPDF: null,
  currentView: 'original',
  canUndo: false,
  toast: {
    isVisible: false,
    message: '',
    type: 'success',
  },
};

// Reducer function
function redactionReducer(state: RedactionState, action: RedactionAction): RedactionState {
  switch (action.type) {
    case 'TOGGLE_REDACT_MODE':
      return {
        ...state,
        isRedactMode: !state.isRedactMode,
        currentDrawing: null, // Clear any drawing in progress when toggling mode
      };

    case 'ADD_RECTANGLE': {
      const newRectanglesByPage = new Map(state.rectanglesByPage);
      const pageRectangles = newRectanglesByPage.get(action.rectangle.pageNumber) || [];
      newRectanglesByPage.set(action.rectangle.pageNumber, [...pageRectangles, action.rectangle]);
      
      return {
        ...state,
        rectanglesByPage: newRectanglesByPage,
        currentDrawing: null,
        canUndo: true, // Enable undo after adding a rectangle
      };
    }

    case 'REMOVE_RECTANGLE': {
      const newRectanglesByPage = new Map(state.rectanglesByPage);
      const pageRectangles = newRectanglesByPage.get(action.pageNumber) || [];
      const filteredRectangles = pageRectangles.filter(rect => rect.id !== action.rectangleId);
      
      if (filteredRectangles.length === 0) {
        newRectanglesByPage.delete(action.pageNumber);
      } else {
        newRectanglesByPage.set(action.pageNumber, filteredRectangles);
      }
      
      return {
        ...state,
        rectanglesByPage: newRectanglesByPage,
        canUndo: hasAnyRectangles(newRectanglesByPage),
      };
    }

    case 'CLEAR_PAGE_RECTANGLES': {
      const newRectanglesByPage = new Map(state.rectanglesByPage);
      newRectanglesByPage.delete(action.pageNumber);
      
      return {
        ...state,
        rectanglesByPage: newRectanglesByPage,
        canUndo: hasAnyRectangles(newRectanglesByPage),
      };
    }

    case 'SET_CURRENT_DRAWING':
      return {
        ...state,
        currentDrawing: action.rectangle,
      };

    case 'UNDO_LAST_RECTANGLE': {
      const newRectanglesByPage = new Map(state.rectanglesByPage);
      let lastRectangleRemoved = false;
      
      // Find the last added rectangle across all pages
      const allPages = Array.from(newRectanglesByPage.entries());
      for (let i = allPages.length - 1; i >= 0; i--) {
        const [pageNumber, rectangles] = allPages[i];
        if (rectangles.length > 0) {
          // Remove the last rectangle from this page
          const updatedRectangles = rectangles.slice(0, -1);
          if (updatedRectangles.length === 0) {
            newRectanglesByPage.delete(pageNumber);
          } else {
            newRectanglesByPage.set(pageNumber, updatedRectangles);
          }
          lastRectangleRemoved = true;
          break;
        }
      }
      
      return {
        ...state,
        rectanglesByPage: newRectanglesByPage,
        canUndo: hasAnyRectangles(newRectanglesByPage),
      };
    }

    case 'CLEAR_ALL_RECTANGLES':
      return {
        ...state,
        rectanglesByPage: new Map(),
        canUndo: false,
      };

    case 'SET_REDACTED_PDF':
      return {
        ...state,
        redactedPDF: action.pdf,
      };

    case 'TOGGLE_VIEW':
      return {
        ...state,
        currentView: state.currentView === 'original' ? 'redacted' : 'original',
      };

    case 'SET_CAN_UNDO':
      return {
        ...state,
        canUndo: action.canUndo,
      };

    case 'SHOW_TOAST':
      return {
        ...state,
        toast: {
          isVisible: true,
          message: action.message,
          type: action.toastType,
        },
      };

    case 'HIDE_TOAST':
      return {
        ...state,
        toast: {
          ...state.toast,
          isVisible: false,
        },
      };

    default:
      return state;
  }
}

// Helper function to check if there are any rectangles
function hasAnyRectangles(rectanglesByPage: Map<number, RedactionRectangle[]>): boolean {
  for (const rectangles of Array.from(rectanglesByPage.values())) {
    if (rectangles.length > 0) {
      return true;
    }
  }
  return false;
}

// Create context
const RedactionContext = createContext<RedactionContextType | undefined>(undefined);

// Provider component
interface RedactionProviderProps {
  children: ReactNode;
}

export function RedactionProvider({ children }: RedactionProviderProps) {
  const [state, dispatch] = useReducer(redactionReducer, initialState);

  const toggleRedactMode = () => {
    dispatch({ type: 'TOGGLE_REDACT_MODE' });
  };

  const addRectangle = (rectangle: RedactionRectangle) => {
    dispatch({ type: 'ADD_RECTANGLE', rectangle });
  };

  const removeRectangle = (rectangleId: string, pageNumber: number) => {
    dispatch({ type: 'REMOVE_RECTANGLE', rectangleId, pageNumber });
  };

  const clearPageRectangles = (pageNumber: number) => {
    dispatch({ type: 'CLEAR_PAGE_RECTANGLES', pageNumber });
  };

  const setCurrentDrawing = (rectangle: RedactionRectangle | null) => {
    dispatch({ type: 'SET_CURRENT_DRAWING', rectangle });
  };

  const undo = () => {
    dispatch({ type: 'UNDO_LAST_RECTANGLE' });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL_RECTANGLES' });
  };

  const applyRedactions = async (): Promise<void> => {
    try {
      // For MVP, since we don't have access to the original PDF data from PDFViewer,
      // we'll create a minimal valid PDF document instead of using mock data
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      // Create a new PDF document with a single page
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Standard letter size
      
      // Add some sample content to the page
      page.drawText('Sample PDF Document', {
        x: 50,
        y: 750,
        size: 20,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('This is a mock PDF for demonstration purposes.', {
        x: 50,
        y: 720,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      // Apply redactions using the RedactionEngine
      const redactedPdfData = await applyRedactionsToPDF(await pdfDoc.save(), state.rectanglesByPage);
      
      // Store the redacted PDF in state
      dispatch({ type: 'SET_REDACTED_PDF', pdf: redactedPdfData });
      
      // Switch to redacted view
      dispatch({ type: 'TOGGLE_VIEW' });
      
      // Disable undo/clear after applying redactions
      dispatch({ type: 'SET_CAN_UNDO', canUndo: false });
      
      // Show success toast
      dispatch({ type: 'SHOW_TOAST', message: 'Redactions applied successfully!', toastType: 'success' });
      
    } catch (error) {
      console.error('Failed to apply redactions:', error);
      // Show error toast
      dispatch({ type: 'SHOW_TOAST', message: 'Failed to apply redactions. Please try again.', toastType: 'error' });
      throw error;
    }
  };

  const toggleView = () => {
    dispatch({ type: 'TOGGLE_VIEW' });
  };

  const showToast = (message: string, toastType: 'success' | 'error') => {
    dispatch({ type: 'SHOW_TOAST', message, toastType });
  };

  const hideToast = () => {
    dispatch({ type: 'HIDE_TOAST' });
  };

  const value: RedactionContextType = {
    state,
    toggleRedactMode,
    addRectangle,
    removeRectangle,
    clearPageRectangles,
    setCurrentDrawing,
    undo,
    clearAll,
    applyRedactions,
    toggleView,
    showToast,
    hideToast,
  };

  return (
    <RedactionContext.Provider value={value}>
      {children}
    </RedactionContext.Provider>
  );
}

// Custom hook to use redaction context
export function useRedaction() {
  const context = useContext(RedactionContext);
  if (context === undefined) {
    throw new Error('useRedaction must be used within a RedactionProvider');
  }
  return context;
} 