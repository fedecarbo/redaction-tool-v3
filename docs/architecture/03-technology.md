# Key Technology Choices & Libraries

## Frontend Framework
- **Next.js:** Chosen for its React foundation, developer tooling, routing, and ease of deployment.

## Styling & UI Components
- **Tailwind CSS:** Enables rapid styling with utility classes; great for quick prototyping and polish.
- **Shadcn UI:** Offers accessible, elegant primitives (buttons, dropdowns, toasts) to speed up MVP UI.

## PDF Rendering & Manipulation
- **PDF.js:** Industry-standard for client-side PDF rendering, supports multi-page navigation, zoom, and event hooks.
- **@react-pdf-viewer:** React wrapper for PDF.js, simplifies integration and provides ready-made viewer features (thumbnails, toolbar, etc.).

## State Management
- **React Context + useReducer/useState:** Handles all UI state, redaction rectangles, and toggles.

## Redaction Implementation
- **PDF.js custom logic:** For MVP, rectangles are "flattened" onto the PDF pages. True redaction requires rasterizing/redrawing affected regions, then exporting as a new PDF file (using PDF.js canvas API and page cloning).

## Feedback & UX
- **Toast notifications** via Shadcn or custom component for confirmations. 