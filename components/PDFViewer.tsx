'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { RedactionLayer } from '@/components/RedactionLayer'
import { useRedaction } from '@/context/RedactionContext'
import { Toolbar } from '@/components/Toolbar'
import { ConfirmationToast } from '@/components/ConfirmationToast'
import { H1, P, Small } from '@/components/ui/typography'

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
  const [customZoom, setCustomZoom] = useState<string>('100%');
  
  const pageRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll sidebar to current page
  useEffect(() => {
    if (sidebarRef.current && numPages > 0) {
      const currentPageElement = sidebarRef.current.querySelector(`[data-page="${pageNumber}"]`);
      if (currentPageElement) {
        currentPageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [pageNumber, numPages]);

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

  const goToPage = useCallback((page: number) => {
    setPageNumber(page)
  }, [])

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

  // Zoom dropdown handler
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCustomZoom(value);
    if (value === 'Fit to Width') {
      fitToWidth();
    } else if (value === 'Fit to Page') {
      fitToPage();
    } else {
      // Parse percentage
      const percent = parseInt(value.replace('%', ''));
      if (!isNaN(percent)) {
        setScale(percent / 100);
      }
    }
  };

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

  // Render page thumbnails for sidebar
  const renderPageThumbnails = () => {
    if (!numPages || loading || error) return null;

    return Array.from({ length: numPages }, (_, index) => {
      const pageNum = index + 1;
      const isCurrentPage = pageNum === pageNumber;
      
      return (
        <div
          key={pageNum}
          data-page={pageNum}
          className={`
            relative cursor-pointer rounded-md overflow-hidden transition-all duration-200 mb-2
            ${isCurrentPage 
              ? 'ring-2 ring-blue-500 shadow-md' 
              : 'hover:ring-1 hover:ring-gray-300 hover:shadow-sm'
            }
          `}
          onClick={() => goToPage(pageNum)}
        >
          <div className="bg-white">
            <Document file={currentPdfUrl}>
              <Page
                pageNumber={pageNum}
                width={120}
                className="pointer-events-none"
                loading={<div className="w-[120px] h-[160px] bg-gray-100 flex items-center justify-center text-xs text-gray-500">Loading...</div>}
              />
            </Document>
          </div>
          <div className={`
            absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium
            ${isCurrentPage 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {pageNum}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="w-full min-h-screen flex flex-col border-none rounded-none"> {/* Main Card, full height, no radius */}
      {/* Combined Header Container */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        {/* Toolbar */}
        <div className="px-0">
          <Toolbar />
        </div>
        {/* Sticky PDFViewer Controls */}
        <div className="px-6 h-14 flex items-center gap-3"> {/* Toolbar - NEUTRAL, no shadow, no radius */}
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
            {/* Zoom Dropdown replaces zoom/fit buttons */}
            <div className="relative">
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                value={customZoom}
                onChange={handleZoomChange}
                style={{ minWidth: 110 }}
              >
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
                <option value="125%">125%</option>
                <option value="150%">150%</option>
                <option value="200%">200%</option>
                <option value="Fit to Width">Fit to Width</option>
                <option value="Fit to Page">Fit to Page</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              <RotateCcw className="h-4 w-4" />
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
      </div>
      <CardContent className="p-0 h-full flex-1">
        <div className="flex h-full">
          {/* Pages Sidebar */}
          <div className="w-40 bg-gray-100 border-r border-gray-200 overflow-y-auto p-3">
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Pages ({numPages})
            </div>
            <div ref={sidebarRef} className="space-y-2">
              {renderPageThumbnails()}
            </div>
          </div>
          {/* Main Content Area */}
          <div className="flex-1 relative bg-gray-300">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading PDF...</div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500 text-center">
                  <p className="font-semibold">Error loading PDF</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
            {!error && (
              <div className="h-full w-full overflow-auto">
                <Document
                  file={currentPdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<div>Loading document...</div>}
                  key={currentPdfUrl}
                >
                  <div ref={pageRef} className="relative bg-white m-4 rounded-lg" style={{display:'block'}}>
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 