'use client'

import dynamic from 'next/dynamic'
import { RedactionProvider } from '@/context/RedactionContext'
import { ConfirmationToast } from '@/components/ConfirmationToast'
import { useRedaction } from '@/context/RedactionContext'

// Import PDFViewer with no SSR to avoid server-side rendering issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="bg-card border rounded-lg shadow-sm p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
        <p className="text-muted-foreground mt-4">Loading PDF Viewer...</p>
      </div>
    </div>
  )
})

function AppContent() {
  const { state, hideToast } = useRedaction();
  const { toast } = state;

  return (
    <main className="min-h-screen bg-background">
      <PDFViewer />
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