'use client'

import dynamic from 'next/dynamic'
import { RedactionProvider } from '@/context/RedactionContext'
import { Toolbar } from '@/components/Toolbar'
import { ConfirmationToast } from '@/components/ConfirmationToast'
import { useRedaction } from '@/context/RedactionContext'
import { H1, P, Small } from '@/components/ui/typography'

// Import PDFViewer with no SSR to avoid server-side rendering issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading PDF Viewer...</p>
        </div>
      </div>
    </div>
  )
})

function AppContent() {
  const { state, hideToast } = useRedaction();
  const { toast } = state;

  return (
    <main className="min-h-screen bg-background p-6 lg:p-8">
      <div className="text-center mb-8">
        <H1 className="text-foreground mb-3">
          PDF Redaction Tool
        </H1>
        <P className="text-muted-foreground text-lg">
          View and redact sensitive information in PDF documents
        </P>
      </div>
      <div className="mb-8">
        <Toolbar />
      </div>
      <div>
        <PDFViewer />
      </div>
      <div className="mt-8 text-center">
        <Small className="text-muted-foreground">
          Use the toolbar above to toggle redaction mode and the page controls to navigate
        </Small>
      </div>
      <ConfirmationToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </main>
  )
}

export default function Home() {
  return (
    <RedactionProvider>
      <AppContent />
    </RedactionProvider>
  )
} 