
# Tech Stack Documentation

## Frontend

- **Next.js**: React framework for app structure, routing, and fast refresh.
- **TypeScript**: Strongly typed JavaScript for safer and more maintainable code.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn UI**: Modern, accessible component primitives for a polished and consistent UI.

## PDF Rendering & Redaction

- **PDF.js**: Client-side PDF rendering and manipulation.
- **@react-pdf-viewer**: React wrapper for PDF.js, provides ready-made viewer, navigation, and plugins.

## State Management

- **React Context API**: Global app state for things like current PDF, redaction mode, rectangles.
- **React Hooks (useState/useReducer)**: Local and shared state logic.

## Testing

- **Jest**: Unit testing for utilities and business logic.
- **React Testing Library**: Component and integration tests for UI/state.
- **Manual QA**: For PDF output accuracy and redaction trustworthiness.

## Utilities

- **Prettier**: Code formatting for consistency.
- **ESLint**: Linting for code quality and style.
- **shadcn/ui CLI**: Quickly scaffold new components to match design system.

## Deployment

- **Vercel** (recommended): For instant, serverless deployments and previews.
- **Netlify/Static Hosting**: Compatible for basic hosting.

## Design

- **Figma** (optional): For UI mockups and flows, if required.

## Not Included in MVP

- **Backend/server-side components** (MVP is client-only)
- **Redux, MobX, or heavy state libraries** (not needed for MVP)
- **Database, authentication, cloud storage** (future-proofed, not present in MVP)
