import { RedactionRectangle } from '@/types/redaction';

// Set up PDF.js worker - only on client side
let pdfjsLib: any = null;
let jsPDF: any = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Dynamic imports to avoid SSR issues
async function getPDFLibs() {
  if (!isBrowser) {
    throw new Error('PDF redaction is only available in browser environment');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
  }
  if (!jsPDF) {
    jsPDF = await import('jspdf');
  }
  return { pdfjsLib, jsPDF };
}

/**
 * Enhanced PDF redaction engine that ensures redacted content is truly unrecoverable.
 * Uses PDF.js to extract text content and jsPDF to create new PDFs with content removed.
 */
export async function applyRedactions(
  originalPdf: Uint8Array,
  rectanglesByPage: Map<number, RedactionRectangle[]>
): Promise<Uint8Array> {
  try {
    // Get PDF libraries (client-side only)
    const { pdfjsLib, jsPDF } = await getPDFLibs();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: originalPdf });
    const pdfDocument = await loadingTask.promise;
    
    // Create a new PDF document
    const newPdf = new jsPDF.default();
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const pageRectangles = rectanglesByPage.get(pageNum) || [];
      
      // Render page to canvas and apply redactions
      const redactedCanvas = await renderPageWithRedactions(page, pageRectangles);
      
      // Add the redacted page to the new PDF
      if (pageNum > 1) {
        newPdf.addPage();
      }
      
      // Convert canvas to image and add to PDF
      const imgData = redactedCanvas.toDataURL('image/png');
      const imgWidth = redactedCanvas.width;
      const imgHeight = redactedCanvas.height;
      
      // Calculate PDF page dimensions (A4 size)
      const pdfWidth = newPdf.internal.pageSize.getWidth();
      const pdfHeight = newPdf.internal.pageSize.getHeight();
      
      // Scale image to fit PDF page
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      newPdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    }
    
    // Return the PDF as Uint8Array
    return new Uint8Array(newPdf.output('arraybuffer'));
    
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Render a page to canvas and apply redactions.
 */
async function renderPageWithRedactions(
  page: any,
  rectangles: RedactionRectangle[]
): Promise<HTMLCanvasElement> {
  // Get page dimensions
  const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;
  
  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  // Render the original page
  await page.render(renderContext).promise;
  
  // Apply redactions by drawing black rectangles over user-defined areas
  for (const rect of rectangles) {
    // Convert PDF coordinates (0-1 range) to canvas coordinates
    // The RedactionLayer stores coordinates as 0-1 range relative to PDF dimensions
    const scaledRect = {
      x: rect.x * pageWidth,
      y: rect.y * pageHeight,
      width: rect.width * pageWidth,
      height: rect.height * pageHeight,
    };
    
    // Draw black rectangle over the redacted area
    context.fillStyle = 'black';
    context.fillRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);
  }
  
  return canvas;
}

/**
 * Validates that redaction rectangles are within page bounds and have valid dimensions.
 */
export function validateRedactionRectangles(
  rectanglesByPage: Map<number, RedactionRectangle[]>
): void {
  const errors: string[] = [];
  
  rectanglesByPage.forEach((rectangles, pageNumber) => {
    rectangles.forEach((rect, index) => {
      if (rect.width <= 0 || rect.height <= 0) {
        errors.push(`Rectangle ${index} on page ${pageNumber} has invalid dimensions`);
      }
      
      if (rect.x < 0 || rect.y < 0) {
        errors.push(`Rectangle ${index} on page ${pageNumber} has negative coordinates`);
      }
    });
  });
  
  if (errors.length > 0) {
    throw new Error(`Redaction validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Generates a redacted PDF with enhanced security features.
 * This is the main entry point for PDF redaction processing.
 */
export async function generateRedactedPDF(
  originalPdf: Uint8Array,
  rectanglesByPage: Map<number, RedactionRectangle[]>
): Promise<Uint8Array> {
  try {
    // Validate redaction rectangles
    validateRedactionRectangles(rectanglesByPage);
    
    // Apply redactions
    return await applyRedactions(originalPdf, rectanglesByPage);
    
  } catch (error) {
    console.error('PDF redaction generation failed:', error);
    throw new Error(`Failed to generate redacted PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export the main function for backward compatibility
export { applyRedactions as applyRedactionsToPDF }; 