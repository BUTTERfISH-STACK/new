import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'CRM Pipeline',
  description: 'Sales Pipeline & CRM System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
