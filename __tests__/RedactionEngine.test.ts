import { applyRedactions } from '@/utils/redactionEngine'
import { PDFDocument } from 'pdf-lib'
import { RedactionRectangle } from '@/types/redaction'

describe('redactionEngine', () => {
  it('should return a new PDF with size > 0', async () => {
    // Create a simple blank PDF with one page
    const pdfDoc = await PDFDocument.create()
    pdfDoc.addPage([600, 800])
    const originalBytes = await pdfDoc.save()

    const rect: RedactionRectangle = {
      id: 'rect-1',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      pageNumber: 1,
    }

    const map = new Map<number, RedactionRectangle[]>()
    map.set(1, [rect])

    const redactedBytes = await applyRedactions(originalBytes, map)

    expect(redactedBytes).toBeInstanceOf(Uint8Array)
    expect(redactedBytes.length).toBeGreaterThan(0)
  })
}) 