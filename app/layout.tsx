// Voice Assistant Dashboard - Version 1.0.0
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vocacity Dashboard - AI Analytics',
  description: 'Advanced real estate call analytics powered by Ultravox AI. Track outbound calls, lead quality, and property interest with comprehensive insights.',
  keywords: ['real estate', 'call analytics', 'AI', 'Ultravox', 'lead management', 'dashboard'],
  authors: [{ name: 'Real Estate Analytics Team' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
