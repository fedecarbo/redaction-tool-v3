# User Interface & UX Requirements

## Design Framework:
- Simple, modern UI using Next.js, Tailwind CSS, and Shadcn UI.

## Toolbar Requirements:
- Toolbar at the top with: Redact mode toggle, Undo, Clear, Download dropdown.

## PDF Viewer Requirements:
- Displays embedded sample PDF on page load
- Includes multi-page navigation (arrows and page thumbnails)
- Zoom in/out buttons

## Redact Mode Requirements:
- On activation, enables drawing rectangles on any PDF page
- Visual indication (highlight, overlay, or toolbar change) to show when in redact mode
- Redacted areas shown as black rectangles
- Undo last/redraw or clear all before confirming

## Confirmation Flow:
- After confirm, redacted PDF replaces original in viewer
- Dropdown lets user switch between views
- Confirmation toast/snackbar appears after redaction

## Responsiveness:
- Works on desktop and tablet; mobile-optimized as a stretch goal

## Accessibility:
- Keyboard shortcuts for major actions (stretch)
- High-contrast and focus-visible outlines for interactive elements 