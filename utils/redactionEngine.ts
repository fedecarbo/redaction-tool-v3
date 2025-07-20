import { PDFDocument, rgb } from 'pdf-lib'
import { RedactionRectangle } from '@/types/redaction'

/**
 * Applies redaction rectangles (solid black) onto each page of the PDF.
 * Coordinates are assumed to be in the PDF coordinate space used for drawing –
 * i.e. origin bottom-left, measured in points. If your rectangles are based on
 * the viewport with origin at top-left you may need to flip the y-axis before
 * passing them in – upstream conversion handles this.
 */
export async function applyRedactions(
  originalPdf: Uint8Array,
  rectanglesByPage: Map<number, RedactionRectangle[]>
): Promise<Uint8Array> {
  // Load original PDF (or create new one if empty)
  const pdfDoc = await PDFDocument.load(originalPdf)

  rectanglesByPage.forEach((rectangles, pageNumber) => {
    const page = pdfDoc.getPage(pageNumber - 1)
    const pageHeight = page.getHeight()

    rectangles.forEach(({ x, y, width, height }) => {
      // pdf-lib uses bottom-left origin. Our stored y coordinate is from top-left
      // of PDF canvas (RedactionLayer converted accordingly). To be safe, flip y.
      const drawY = pageHeight - y - height
      page.drawRectangle({
        x,
        y: drawY,
        width,
        height,
        color: rgb(0, 0, 0),
        borderWidth: 0,
      })
    })
  })

  return pdfDoc.save()
}

export const generateRedactedPDF = applyRedactions 