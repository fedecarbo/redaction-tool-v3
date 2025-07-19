
# Product Requirements Document (PRD)
## Web-Based PDF Redaction Tool (MVP)

### 1. Project Overview & Goals

Build a web-based PDF redaction tool as an MVP, enabling users to view a sample PDF, activate “redact mode,” select rectangular areas to redact, confirm the redaction, and view/download either the original or fully redacted PDF—all directly in the browser.

**Goals:**
- Deliver a seamless, trustworthy redaction experience—no file uploads, all in-browser.
- Empower users to test and use core redaction features with zero backend or account setup.
- Ensure permanent, visual redaction that cannot be reversed by typical PDF viewers.
- Provide a polished, modern UI with familiar PDF viewer controls.

---

### 2. Key Features & User Stories

**Key Features:**
- In-browser PDF viewer (multi-page navigation, zoom, page thumbnails)
- “Redact” mode toggle in toolbar
- Rectangle selection for redaction (per page)
- Undo last redaction, clear all redactions before confirm
- Confirm redaction to permanently apply black-box overlays
- Toggle dropdown to view either original or redacted PDF
- Download functionality for both versions
- Confirmation feedback after applying redactions
- Embedded sample PDF (no file upload, no backend, no accounts)

**Primary User Stories:**
1. As a user, I want to see a sample PDF so I can experiment with redaction tools right away.
2. As a user, I want to select areas to redact with rectangles, so I can easily hide sensitive info.
3. As a user, I want to undo/redraw/cancel my redactions before confirming, so mistakes aren’t permanent.
4. As a user, I want to confirm and see a truly redacted version so I trust the tool works.
5. As a user, I want to switch between original and redacted view, so I can compare results.
6. As a user, I want to download either version as a PDF.

---

### 3. User Interface & UX Requirements

- Simple, modern UI using Next.js, Tailwind CSS, and Shadcn UI.
- Toolbar at the top with: Redact mode toggle, Undo, Clear, Download dropdown.
- PDF Viewer:
  - Displays embedded sample PDF on page load
  - Includes multi-page navigation (arrows and page thumbnails)
  - Zoom in/out buttons
- Redact Mode:
  - On activation, enables drawing rectangles on any PDF page
  - Visual indication (highlight, overlay, or toolbar change) to show when in redact mode
  - Redacted areas shown as black rectangles
  - Undo last/redraw or clear all before confirming
- Confirmation:
  - After confirm, redacted PDF replaces original in viewer
  - Dropdown lets user switch between views
  - Confirmation toast/snackbar appears after redaction
- Responsiveness:
  - Works on desktop and tablet; mobile-optimized as a stretch goal
- Accessibility:
  - Keyboard shortcuts for major actions (stretch)
  - High-contrast and focus-visible outlines for interactive elements

---

### 4. Technical Approach & Stack

**Frontend Stack:**
- Next.js for React-based app routing and SSR/SSG flexibility.
- Tailwind CSS for utility-first styling, rapid UI iteration.
- Shadcn UI for clean, accessible component primitives.
- PDF.js (and/or @react-pdf-viewer) for robust, in-browser PDF rendering and manipulation.

**Key Implementation Choices:**
- Single sample PDF embedded in `/public`—no uploads or remote fetch.
- All PDF rendering and redaction is client-side—no backend required.
- Redaction is visually and truly destructive:
  - Draw rectangles, “apply” overlays black boxes to rendered PDF pages.
  - After “Confirm,” use PDF.js to regenerate a redacted PDF file for download.
  - Only in-memory manipulation—nothing written to disk/server.
- Undo/Clear logic tracked per session (state in React context or similar).

**Component Structure:**
- PDFViewer: Multi-page, zoom, thumbnail nav
- Toolbar: Redact mode, Undo, Clear, Download
- RedactionLayer: Manages drawn rectangles, in-memory only
- DownloadMenu: Handles file download logic
- ConfirmationToast: Feedback after redaction

**Testing:**
- Local dev only (MVP), no accounts
- Manual QA by checking PDF output after redaction

---

### 5. Success Metrics & Validation

**MVP Success Metrics:**
- Core redaction flow: User can mark, apply, and download a truly redacted PDF without backend or upload.
- No information leak: Redacted content is visually and technically unrecoverable in output file (not just “covered up”).
- UX smoothness: Users can toggle, undo, and clear redactions with intuitive, discoverable actions.
- Performance: Tool loads and updates PDF within 1–2 seconds on standard hardware (local, sample PDF).
- Zero user confusion: Users can distinguish between original and redacted view, and know which they are downloading.

**Validation Methods:**
- Manual QA: Attempt to “recover” redacted content (should be impossible).
- User testing: Short feedback cycle with non-technical testers.
- Accessibility check: Ensure keyboard navigation works for critical actions (at least as a smoke test).
- Code audit: Confirm no temp or unredacted versions leak beyond browser memory.
