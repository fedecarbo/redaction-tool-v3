# Technical Approach & Stack

## Frontend Stack:
- Next.js for React-based app routing and SSR/SSG flexibility.
- Tailwind CSS for utility-first styling, rapid UI iteration.
- Shadcn UI for clean, accessible component primitives.
- PDF.js (and/or @react-pdf-viewer) for robust, in-browser PDF rendering and manipulation.

## Key Implementation Choices:
- Single sample PDF embedded in `/public`—no uploads or remote fetch.
- All PDF rendering and redaction is client-side—no backend required.
- Redaction is visually and truly destructive:
  - Draw rectangles, "apply" overlays black boxes to rendered PDF pages.
  - After "Confirm," use PDF.js to regenerate a redacted PDF file for download.
  - Only in-memory manipulation—nothing written to disk/server.
- Undo/Clear logic tracked per session (state in React context or similar).

## Component Structure:
- PDFViewer: Multi-page, zoom, thumbnail nav
- Toolbar: Redact mode, Undo, Clear, Download
- RedactionLayer: Manages drawn rectangles, in-memory only
- DownloadMenu: Handles file download logic
- ConfirmationToast: Feedback after redaction

## Testing:
- Local dev only (MVP), no accounts
- Manual QA by checking PDF output after redaction 