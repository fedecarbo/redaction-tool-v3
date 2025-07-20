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
}

export interface RedactionContextType {
  state: RedactionState;
  toggleRedactMode: () => void;
  addRectangle: (rectangle: RedactionRectangle) => void;
  removeRectangle: (rectangleId: string, pageNumber: number) => void;
  clearPageRectangles: (pageNumber: number) => void;
  setCurrentDrawing: (rectangle: RedactionRectangle | null) => void;
} 