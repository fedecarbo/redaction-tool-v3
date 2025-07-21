'use client'

import React, { useState, useRef, useCallback } from 'react';
import { useRedaction } from '@/context/RedactionContext';
import { RedactionRectangle } from '@/types/redaction';

interface RedactionLayerProps {
  currentPage: number;
  pdfDimensions: {
    width: number;
    height: number;
  };
  className?: string;
}

export function RedactionLayer({ 
  currentPage, 
  pdfDimensions, 
  className = '' 
}: RedactionLayerProps) {
  const { state, addRectangle, setCurrentDrawing } = useRedaction();
  const { isRedactMode, rectanglesByPage, currentDrawing } = state;
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Get rectangles for current page
  const currentPageRectangles = rectanglesByPage.get(currentPage) || [];

  // Convert screen coordinates to PDF coordinates
  const screenToPdfCoords = useCallback((screenX: number, screenY: number) => {
    if (!layerRef.current) return { x: 0, y: 0 };
    
    const rect = layerRef.current.getBoundingClientRect();
    const relativeX = screenX - rect.left;
    const relativeY = screenY - rect.top;
    
    // Convert to PDF coordinate system (0-1 range relative to PDF dimensions)
    const pdfX = relativeX / rect.width;
    const pdfY = relativeY / rect.height;
    
    return { x: pdfX, y: pdfY };
  }, []);

  // Convert PDF coordinates to screen coordinates for rendering
  const pdfToScreenCoords = useCallback((pdfX: number, pdfY: number) => {
    if (!layerRef.current) return { x: 0, y: 0 };
    
    const rect = layerRef.current.getBoundingClientRect();
    const screenX = pdfX * rect.width;
    const screenY = pdfY * rect.height;
    
    return { x: screenX, y: screenY };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isRedactMode) return;
    
    event.preventDefault();
    const { x, y } = screenToPdfCoords(event.clientX, event.clientY);
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    
    // Create initial rectangle for drawing preview
    const initialRect: RedactionRectangle = {
      id: `temp-${Date.now()}`,
      x,
      y,
      width: 0,
      height: 0,
      pageNumber: currentPage,
    };
    
    setCurrentDrawing(initialRect);
  }, [isRedactMode, currentPage, screenToPdfCoords, setCurrentDrawing]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isRedactMode || !isDrawing || !startPoint) return;
    
    event.preventDefault();
    const { x: currentX, y: currentY } = screenToPdfCoords(event.clientX, event.clientY);
    
    // Calculate rectangle dimensions
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    
    // Update current drawing rectangle
    const rect: RedactionRectangle = {
      id: `temp-${Date.now()}`,
      x,
      y,
      width,
      height,
      pageNumber: currentPage,
    };
    
    setCurrentDrawing(rect);
  }, [isRedactMode, isDrawing, startPoint, currentPage, screenToPdfCoords, setCurrentDrawing]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isRedactMode || !isDrawing || !startPoint) return;
    
    event.preventDefault();
    const { x: currentX, y: currentY } = screenToPdfCoords(event.clientX, event.clientY);
    
    // Calculate final rectangle dimensions
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    
    // Only add rectangle if it has meaningful size (at least 0.01 or 1% of page size)
    if (width > 0.01 && height > 0.01) {
      const finalRect: RedactionRectangle = {
        id: `rect-${currentPage}-${Date.now()}`,
        x,
        y,
        width,
        height,
        pageNumber: currentPage,
      };
      
      addRectangle(finalRect);
    }
    
    // Clean up drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentDrawing(null);
  }, [isRedactMode, isDrawing, startPoint, currentPage, screenToPdfCoords, addRectangle, setCurrentDrawing]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      // Cancel drawing if mouse leaves the area
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentDrawing(null);
    }
  }, [isDrawing, setCurrentDrawing]);

  // Render a single rectangle
  const renderRectangle = (rect: RedactionRectangle, isPreview = false) => {
    if (!layerRef.current) return null;
    
    const containerRect = layerRef.current.getBoundingClientRect();
    // Convert 0-1 range coordinates to screen coordinates
    const screenX = rect.x * containerRect.width;
    const screenY = rect.y * containerRect.height;
    const screenWidth = rect.width * containerRect.width;
    const screenHeight = rect.height * containerRect.height;
    
    return (
      <div
        key={rect.id}
        className={`
          absolute pointer-events-none
          ${isPreview 
            ? 'bg-black/30 border-2 border-dashed border-black' 
            : 'bg-black/60 border-2 border-black'
          }
        `}
        style={{
          left: `${screenX}px`,
          top: `${screenY}px`,
          width: `${screenWidth}px`,
          height: `${screenHeight}px`,
        }}
      />
    );
  };

  return (
    <div
      ref={layerRef}
      className={`
        absolute inset-0 z-10
        ${isRedactMode ? 'cursor-crosshair' : 'pointer-events-none'}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Render existing rectangles for current page */}
      {currentPageRectangles.map(rect => renderRectangle(rect, false))}
      
      {/* Render current drawing rectangle (preview) */}
      {currentDrawing && currentDrawing.pageNumber === currentPage && (
        renderRectangle(currentDrawing, true)
      )}
      
      {/* Visual feedback overlay when in redact mode */}
      {isRedactMode && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      )}
    </div>
  );
} 