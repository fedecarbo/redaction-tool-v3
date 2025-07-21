'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { RedactionLayer } from '@/components/RedactionLayer'
import { useRedaction } from '@/context/RedactionContext'

// Set up PDF.js worker with local file - use the version that matches react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs'

// Zoom configuration constants
const ZOOM_CONFIG = {
  MIN: 0.5,
  MAX: 3.0,
  STEP: 0.2,
  DEFAULT: 1.2,
} as const

interface PDFViewerProps {
  file?: string
}

interface PDFDocumentProxy {
  numPages: number
}

export default function PDFViewer({ file = '/sample.pdf' }: PDFViewerProps) {
  const { state, showToast, setOriginalPDF } = useRedaction();
  const { currentView, redactedPDF, originalPDF } = state;
  
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.0;
  const ZOOM_STEP = 0.25;
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 })
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>(file)
  
  const pageRef = useRef<HTMLDivElement>(null)

  // Fetch and store the original PDF data
  useEffect(() => {
    const fetchAndStorePDF = async () => {
      try {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        const pdfData = await response.arrayBuffer();
        const uint8Array = new Uint8Array(pdfData);
        
        // Store the original PDF data in context
        setOriginalPDF(uint8Array);
      } catch (error) {
        console.error('Failed to fetch PDF:', error);
        showToast('Failed to load PDF data', 'error');
      }
    };

    // Only fetch if we don't already have the original PDF
    if (!originalPDF) {
      fetchAndStorePDF();
    }
  }, [file, originalPDF, showToast]);

  // Create blob URLs for PDF data and manage them
  useEffect(() => {
    let redactedBlobUrl: string | null = null;
    let originalBlobUrl: string | null = null;

    const createBlobUrl = (pdfData: Uint8Array): string => {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    };

    let newUrl = file;
    if (currentView === 'redacted' && redactedPDF) {
      redactedBlobUrl = createBlobUrl(redactedPDF);
      newUrl = redactedBlobUrl;
    } else if (currentView === 'original' && originalPDF) {
      originalBlobUrl = createBlobUrl(originalPDF);
      newUrl = originalBlobUrl;
    }

    if (currentPdfUrl !== newUrl) {
      setCurrentPdfUrl(newUrl);
    }

    return () => {
      if (redactedBlobUrl) URL.revokeObjectURL(redactedBlobUrl);
      if (originalBlobUrl) URL.revokeObjectURL(originalBlobUrl);
    };
  }, [currentView, redactedPDF, originalPDF, file]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: PDFDocumentProxy) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }, [])

  const onPageLoadSuccess = useCallback((page: any) => {
    // Update page dimensions for RedactionLayer coordinate mapping
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions({
      width: viewport.width,
      height: viewport.height
    });
  }, [])

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Failed to load PDF document. Please check if the file exists.')
    setLoading(false)
    console.error('PDF loading error:', error)
  }, [])

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
  }, [])

  const fitToWidth = useCallback(() => {
    if (pageRef.current && pageRef.current.parentElement) {
      const parentWidth = Math.min(900, pageRef.current.parentElement.offsetWidth || 900);
      setScale(parentWidth / pageDimensions.width);
    }
  }, [pageDimensions.width]);

  const fitToPage = useCallback(() => {
    if (pageRef.current && pageRef.current.parentElement) {
      const parentWidth = Math.min(900, pageRef.current.parentElement.offsetWidth || 900);
      const parentHeight = pageRef.current.parentElement.offsetHeight || 600;
      const scaleW = parentWidth / pageDimensions.width;
      const scaleH = parentHeight / pageDimensions.height;
      setScale(Math.min(scaleW, scaleH));
    }
  }, [pageDimensions.width, pageDimensions.height]);

  const resetZoom = useCallback(() => {
    setScale(1)
  }, [])

  // Get view indicator text and icon
  const getViewIndicator = () => {
    if (currentView === 'redacted' && redactedPDF) {
      return {
        text: 'Redacted Version',
        icon: EyeOff,
        color: 'text-purple-600 bg-purple-50'
      };
    }
    return {
      text: 'Original Version',
      icon: Eye,
      color: 'text-blue-600 bg-blue-50'
    };
  };

  const viewIndicator = getViewIndicator();

  return (
    <Card className="w-full"> {/* Main Card */}
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 w-full px-6 h-14 flex items-center gap-3 bg-blue-100 rounded-t-xl shadow border-b border-gray-200"> {/* Toolbar - BLUE */}
        {/* Left: Tool name/label */}
        <div className="flex items-center min-w-[120px]">
          <span className="text-lg font-semibold tracking-tight">Sample PDF</span>
          <span className={`ml-2 text-sm font-normal px-2 py-1 rounded flex items-center gap-1 ${viewIndicator.color}`}>
            {React.createElement(viewIndicator.icon, { className: "w-4 h-4" })}
            {viewIndicator.text}
          </span>
        </div>
        {/* Center: Controls */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {/* Redact toggle, Undo, Clear, Zoom, Page nav (placeholders for now) */}
          {/* TODO: Add Redact toggle, Undo, Clear, View dropdown, Download as needed */}
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= ZOOM_MIN}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= ZOOM_MAX}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {/* Fit to Width / Fit to Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={fitToWidth}
          >
            Fit to Width
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fitToPage}
          >
            Fit to Page
          </Button>
          {/* Page Navigation */}
          {numPages > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                {pageNumber} / {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {/* Right: View dropdown, Download (placeholders for now) */}
        <div className="flex items-center gap-3 min-w-[120px] justify-end">
          {/* TODO: Add View dropdown, Download button */}
        </div>
      </div>

      <CardContent className="p-0">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading PDF...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500 text-center">
              <p className="font-semibold">Error loading PDF</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        {!error && (
          <div style={{height:'700px', width:'100%'}}>
            <div className="h-full w-full overflow-auto" style={{height:'100%', width:'100%'}}>
              <Document
                file={currentPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div>Loading document...</div>}
                key={currentPdfUrl} // Force re-render when PDF changes
              >
                <div ref={pageRef} className="relative bg-white shadow-2xl rounded-md" style={{display:'block'}}>
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(900, pageRef.current?.parentElement?.offsetWidth || 900) * scale}
                    onLoadSuccess={onPageLoadSuccess}
                    loading={<div>Loading page...</div>}
                    className="max-w-full"
                  />
                  {/* Only show RedactionLayer in original view and redact mode */}
                  {currentView === 'original' && (
                    <RedactionLayer
                      currentPage={pageNumber}
                      pdfDimensions={{
                        width: Math.min(900, pageRef.current?.parentElement?.offsetWidth || 900) * scale,
                        height: (pageDimensions.height / pageDimensions.width) * (Math.min(900, pageRef.current?.parentElement?.offsetWidth || 900) * scale)
                      }}
                      className="absolute inset-0"
                    />
                  )}
                </div>
              </Document>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 