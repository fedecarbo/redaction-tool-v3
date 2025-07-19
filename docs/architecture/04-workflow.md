# Redaction Workflow & Data Flow

## Redaction Workflow

### 1. PDF Load
- Sample PDF loads on page load, displayed by PDFViewer.

### 2. Enter Redact Mode
- User clicks "Redact" in toolbar, activating RedactionLayer.

### 3. Rectangle Selection
- User draws rectangles on pages to mark redaction areas; all data stored in React state.

### 4. Review & Adjust
- Undo last rectangle, clear all, or redraw as needed before confirming.

### 5. Apply Redactions
- On confirm, RedactionEngine uses PDF.js to "flatten" black rectangles onto the rendered PDF pages—permanently destroying original content beneath.

### 6. Preview & Toggle
- Viewer updates to show redacted version; user can switch back to original via dropdown (both stored in memory).

### 7. Download
- User downloads currently viewed version (original or redacted) via DownloadMenu.

## Data Flow
- All data is in-memory only:
  - No localStorage, no cookies, no backend.
  - Redaction rectangles are only kept for current session until page reload/refresh.
  - PDF binaries (original/redacted) are never uploaded or stored externally. 