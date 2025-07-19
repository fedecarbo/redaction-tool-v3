# Solution Architecture & Key Components

## Component Overview
The architecture is based on modular React components with clear responsibilities. All PDF rendering and redaction logic runs client-side.

## Key Components:

### PDFViewer
- Renders the sample PDF with multi-page navigation, zoom, and thumbnails.
- Integrates PDF.js (or @react-pdf-viewer) for rendering and event handling.

### Toolbar
- Houses controls: Redact mode toggle, Undo, Clear, Download dropdown.

### RedactionLayer
- Overlays the PDF with rectangles drawn by the user in redact mode.
- Tracks rectangles per page.
- Allows undoing last rectangle, clearing all.

### RedactionEngine
- Handles the process of generating a new redacted PDF by truly removing or flattening/redrawing over selected regions using PDF.js APIs.

### DownloadMenu
- Allows user to download either the original or redacted PDF.

### ConfirmationToast
- Provides feedback after applying redactions.

## State Management
- Uses React context/hooks for storing PDF data, redaction rectangles, view state (original vs. redacted), and UI flags (mode, toast).

## Data Flow
- All state and processed PDFs live in memory; no persistent storage or backend. 