'use client'

import dynamic from 'next/dynamic'

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

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            PDF Redaction Tool
          </h1>
          <p className="text-muted-foreground text-lg">
            View and navigate PDF documents with our modern viewer
          </p>
        </div>
        
        <div className="w-full">
          <PDFViewer />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Use the controls above to navigate pages and adjust zoom level
          </p>
        </div>
      </div>
    </main>
  )
} 