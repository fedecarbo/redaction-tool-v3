import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StateManagerProvider } from '@/components/ui/state-manager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Redaction Tool - PDF Viewer',
  description: 'A tool for viewing and redacting PDF documents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StateManagerProvider>
          {children}
        </StateManagerProvider>
      </body>
    </html>
  )
} 