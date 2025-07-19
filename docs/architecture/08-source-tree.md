
# Source Code Tree & Structure

## Suggested Directory Layout

```
/pdf-redactor
├── /components
│   ├── Toolbar.tsx
│   ├── PDFViewer.tsx
│   ├── RedactionLayer.tsx
│   ├── DownloadMenu.tsx
│   ├── PageThumbnails.tsx
│   ├── ConfirmationToast.tsx
├── /context
│   ├── RedactionContext.tsx
├── /hooks
│   ├── useRedactions.ts
│   ├── usePDF.ts
├── /public
│   └── sample.pdf
├── /pages
│   └── index.tsx
├── /styles
│   └── globals.css
├── /utils
│   ├── pdfUtils.ts
│   └── fileUtils.ts
├── tailwind.config.js
├── shadcn.config.js
├── tsconfig.json
├── README.md
├── coding-standards.md
├── tech-stack.md
├── source-tree.md
└── ...
```

## Directory Descriptions

- **/components**: All React UI components, organized by function.
- **/context**: React context providers (global state, e.g. for redactions or mode).
- **/hooks**: Custom React hooks for business/UI logic.
- **/public**: Static files (sample PDF, images, etc).
- **/pages**: Next.js routing; main entry (`index.tsx`) as app root.
- **/styles**: Global CSS or Tailwind customizations.
- **/utils**: Utility/helper functions (PDF manipulation, file handling, etc).
- **Root config files**: Tooling and documentation (config, README, standards, etc).

## Best Practices

- **Group by feature** as app grows (not just by type).
- **Keep components focused**—one per file, single responsibility.
- **Public assets only** in `/public`; never in code or `/src`.
- **Docs and config** always in root for dev onboarding.

