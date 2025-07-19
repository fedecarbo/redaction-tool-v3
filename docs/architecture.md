
# Architecture Document (MVP)
## Web-Based PDF Redaction Tool

### 1. Solution Overview & Architectural Goals

**Solution Overview:**  
The PDF Redaction Tool is a modern, in-browser web application built with Next.js, Tailwind CSS, and Shadcn UI. It renders a sample multi-page PDF, allows users to select rectangular regions for redaction, and generates a new, fully redacted PDF—all client-side, with no server or file uploads required.

**Architectural Goals:**
- Fully client-side: zero backend or storage; maximizes privacy and speeds up iteration.
- Maintain high performance and responsiveness for PDF viewing/redacting.
- Modular, testable, and maintainable component structure.
- Use established open-source libraries for PDF rendering and manipulation (PDF.js).
- Ensure “true” redaction (content in redacted regions is unrecoverable, not just visually hidden).
- Lay groundwork for potential future expansion (uploads, multi-file, backend, mobile, etc.).

---

### 2. Solution Architecture & Key Components

**Component Overview:**  
The architecture is based on modular React components with clear responsibilities. All PDF rendering and redaction logic runs client-side.

**Key Components:**
- **PDFViewer:**  
  - Renders the sample PDF with multi-page navigation, zoom, and thumbnails.
  - Integrates PDF.js (or @react-pdf-viewer) for rendering and event handling.
- **Toolbar:**  
  - Houses controls: Redact mode toggle, Undo, Clear, Download dropdown.
- **RedactionLayer:**  
  - Overlays the PDF with rectangles drawn by the user in redact mode.
  - Tracks rectangles per page.
  - Allows undoing last rectangle, clearing all.
- **RedactionEngine:**  
  - Handles the process of generating a new redacted PDF by truly removing or flattening/redrawing over selected regions using PDF.js APIs.
- **DownloadMenu:**  
  - Allows user to download either the original or redacted PDF.
- **ConfirmationToast:**  
  - Provides feedback after applying redactions.

**State Management:**
- Uses React context/hooks for storing PDF data, redaction rectangles, view state (original vs. redacted), and UI flags (mode, toast).

**Data Flow:**
- All state and processed PDFs live in memory; no persistent storage or backend.

---

### 3. Key Technology Choices & Libraries

**Frontend Framework:**
- **Next.js:** Chosen for its React foundation, developer tooling, routing, and ease of deployment.

**Styling & UI Components:**
- **Tailwind CSS:** Enables rapid styling with utility classes; great for quick prototyping and polish.
- **Shadcn UI:** Offers accessible, elegant primitives (buttons, dropdowns, toasts) to speed up MVP UI.

**PDF Rendering & Manipulation:**
- **PDF.js:** Industry-standard for client-side PDF rendering, supports multi-page navigation, zoom, and event hooks.
- **@react-pdf-viewer:** React wrapper for PDF.js, simplifies integration and provides ready-made viewer features (thumbnails, toolbar, etc.).

**State Management:**
- **React Context + useReducer/useState:** Handles all UI state, redaction rectangles, and toggles.

**Redaction Implementation:**
- **PDF.js custom logic:** For MVP, rectangles are “flattened” onto the PDF pages. True redaction requires rasterizing/redrawing affected regions, then exporting as a new PDF file (using PDF.js canvas API and page cloning).

**Feedback & UX:**
- **Toast notifications** via Shadcn or custom component for confirmations.

---

### 4. Redaction Workflow & Data Flow

**Redaction Workflow:**
1. **PDF Load:**  
   - Sample PDF loads on page load, displayed by PDFViewer.
2. **Enter Redact Mode:**  
   - User clicks “Redact” in toolbar, activating RedactionLayer.
3. **Rectangle Selection:**  
   - User draws rectangles on pages to mark redaction areas; all data stored in React state.
4. **Review & Adjust:**  
   - Undo last rectangle, clear all, or redraw as needed before confirming.
5. **Apply Redactions:**  
   - On confirm, RedactionEngine uses PDF.js to “flatten” black rectangles onto the rendered PDF pages—permanently destroying original content beneath.
6. **Preview & Toggle:**  
   - Viewer updates to show redacted version; user can switch back to original via dropdown (both stored in memory).
7. **Download:**  
   - User downloads currently viewed version (original or redacted) via DownloadMenu.

**Data Flow:**
- All data is in-memory only:
  - No localStorage, no cookies, no backend.
  - Redaction rectangles are only kept for current session until page reload/refresh.
  - PDF binaries (original/redacted) are never uploaded or stored externally.

---

### 5. Future-Proofing & Extension Points

**Designed for Easy Expansion:**
- **Backend Integration:**
  - MVP is fully client-side, but code structure allows future backend for upload, storage, and large file handling.
- **User-Provided PDFs:**
  - File upload components can be added to replace embedded sample PDF.
- **Advanced Redaction:**
  - Text search & highlight, non-rectangle shapes, or partial page redaction.
- **Persistence:**
  - Potential to store user sessions, history, or enable cloud saves with user accounts.
- **Mobile Support:**
  - MVP prioritizes desktop/tablet; responsive design and touch interactions can be enhanced for mobile devices.
- **Accessibility:**
  - Built on accessible primitives, but codebase is ready for deeper ARIA and keyboard navigation features.
- **Internationalization:**
  - UI and notifications can be translated with minimal refactor.

**Rationale / Decisions**
- Separation of concerns: Each core component is focused, making it easy to swap implementations or add new features.
- MVP-first: Avoids unnecessary complexity, but keeps paths open for real-world adoption and scaling.
- Open-source libraries: Keeps future integration simple.
