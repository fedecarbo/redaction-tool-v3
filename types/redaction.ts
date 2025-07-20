export interface RedactionRectangle {
  id: string;
  x: number;      // X coordinate relative to PDF page
  y: number;      // Y coordinate relative to PDF page  
  width: number;  // Rectangle width
  height: number; // Rectangle height
  pageNumber: number; // Which PDF page this rectangle belongs to
}

export interface RedactionState {
  isRedactMode: boolean;
  rectanglesByPage: Map<number, RedactionRectangle[]>;
  currentDrawing: RedactionRectangle | null;
  originalPDF: Uint8Array | null;  // Store original PDF binary
  redactedPDF: Uint8Array | null;  // Store redacted PDF binary
  currentView: 'original' | 'redacted';
  canUndo: boolean;
  isProcessing: boolean;  // For PDF processing state
  redactionsApplied: boolean;  // Track if redactions have been applied
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  };
}

export interface RedactionContextType {
  state: RedactionState;
  toggleRedactMode: () => void;
  addRectangle: (rectangle: RedactionRectangle) => void;
  removeRectangle: (rectangleId: string, pageNumber: number) => void;
  clearPageRectangles: (pageNumber: number) => void;
  setCurrentDrawing: (rectangle: RedactionRectangle | null) => void;
  undo: () => void;
  clearAll: () => void;
  applyRedactions: () => Promise<void>;
  toggleView: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;
  clearPDFs: () => void;
  setOriginalPDF: (pdf: Uint8Array) => void;
} 