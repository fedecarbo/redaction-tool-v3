'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { RedactionState, RedactionContextType, RedactionRectangle } from '@/types/redaction';

// Action types for reducer
type RedactionAction = 
  | { type: 'TOGGLE_REDACT_MODE' }
  | { type: 'ADD_RECTANGLE'; rectangle: RedactionRectangle }
  | { type: 'REMOVE_RECTANGLE'; rectangleId: string; pageNumber: number }
  | { type: 'CLEAR_PAGE_RECTANGLES'; pageNumber: number }
  | { type: 'SET_CURRENT_DRAWING'; rectangle: RedactionRectangle | null };

// Initial state
const initialState: RedactionState = {
  isRedactMode: false,
  rectanglesByPage: new Map(),
  currentDrawing: null,
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
      };
    }

    case 'CLEAR_PAGE_RECTANGLES': {
      const newRectanglesByPage = new Map(state.rectanglesByPage);
      newRectanglesByPage.delete(action.pageNumber);
      
      return {
        ...state,
        rectanglesByPage: newRectanglesByPage,
      };
    }

    case 'SET_CURRENT_DRAWING':
      return {
        ...state,
        currentDrawing: action.rectangle,
      };

    default:
      return state;
  }
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

  const value: RedactionContextType = {
    state,
    toggleRedactMode,
    addRectangle,
    removeRectangle,
    clearPageRectangles,
    setCurrentDrawing,
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