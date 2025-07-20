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
  const [scale, setScale] = useState<number>(ZOOM_CONFIG.DEFAULT)
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

    // Create blob URLs for both PDFs
    if (redactedPDF) {
      redactedBlobUrl = createBlobUrl(redactedPDF);
    }
    if (originalPDF) {
      originalBlobUrl = createBlobUrl(originalPDF);
    }

    // Set the current PDF URL based on view state
    if (currentView === 'redacted' && redactedBlobUrl) {
      setCurrentPdfUrl(redactedBlobUrl);
    } else if (currentView === 'original' && originalBlobUrl) {
      setCurrentPdfUrl(originalBlobUrl);
    } else {
      // Fallback to the original file
      setCurrentPdfUrl(file);
    }

    // Cleanup function to revoke blob URLs
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
    setScale(prev => Math.min(prev + ZOOM_CONFIG.STEP, ZOOM_CONFIG.MAX))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - ZOOM_CONFIG.STEP, ZOOM_CONFIG.MIN))
  }, [])

  const resetZoom = useCallback(() => {
    setScale(ZOOM_CONFIG.DEFAULT)
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
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            PDF Viewer
            <span className={`ml-2 text-sm font-normal px-2 py-1 rounded flex items-center gap-1 ${viewIndicator.color}`}>
              {React.createElement(viewIndicator.icon, { className: "w-4 h-4" })}
              {viewIndicator.text}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= ZOOM_CONFIG.MIN}
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
              disabled={scale >= ZOOM_CONFIG.MAX}
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
          </div>
        </div>
        
        {/* Page Navigation */}
        {numPages > 0 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageNumber} of {numPages}
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
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center">
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
            <div className="border rounded-lg shadow-sm bg-white p-4 max-w-full overflow-auto">
              <Document
                file={currentPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div>Loading document...</div>}
                key={currentPdfUrl} // Force re-render when PDF changes
              >
                <div ref={pageRef} className="relative inline-block">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    onLoadSuccess={onPageLoadSuccess}
                    loading={<div>Loading page...</div>}
                    className="max-w-full"
                  />
                  
                  {/* Only show RedactionLayer in original view and redact mode */}
                  {currentView === 'original' && (
                    <RedactionLayer
                      currentPage={pageNumber}
                      pdfDimensions={{
                        width: pageDimensions.width * scale,
                        height: pageDimensions.height * scale
                      }}
                      className="absolute inset-0"
                    />
                  )}
                </div>
              </Document>
            </div>
          )}

          {/* Page Thumbnails Navigation */}
          {numPages > 1 && (
            <div className="mt-6 w-full">
              <h3 className="text-sm font-medium mb-3 text-center">Page Navigation</h3>
              <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto">
                {Array.from({ length: numPages }, (_, index) => (
                  <Button
                    key={index + 1}
                    variant={pageNumber === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPageNumber(index + 1)}
                    className="w-12 h-8 text-xs"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 