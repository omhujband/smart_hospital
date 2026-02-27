import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hospital Queue OS - Smart Appointment System',
  description: 'AI-powered hospital queue and appointment optimization system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
