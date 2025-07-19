# Future-Proofing & Extension Points

## Designed for Easy Expansion

### Backend Integration
- MVP is fully client-side, but code structure allows future backend for upload, storage, and large file handling.

### User-Provided PDFs
- File upload components can be added to replace embedded sample PDF.

### Advanced Redaction
- Text search & highlight, non-rectangle shapes, or partial page redaction.

### Persistence
- Potential to store user sessions, history, or enable cloud saves with user accounts.

### Mobile Support
- MVP prioritizes desktop/tablet; responsive design and touch interactions can be enhanced for mobile devices.

### Accessibility
- Built on accessible primitives, but codebase is ready for deeper ARIA and keyboard navigation features.

### Internationalization
- UI and notifications can be translated with minimal refactor.

## Rationale / Decisions
- **Separation of concerns:** Each core component is focused, making it easy to swap implementations or add new features.
- **MVP-first:** Avoids unnecessary complexity, but keeps paths open for real-world adoption and scaling.
- **Open-source libraries:** Keeps future integration simple. 