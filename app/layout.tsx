import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://healwithmahima.in'),
  title: {
    default: 'Heal with Mahima | Sound Healing & Breathwork',
    template: '%s | Heal with Mahima',
  },
  description: 'Transformative Sound Healing, Breathwork, and Meditative Journeys in Delhi-NCR. Find your inner sanctuary with Mahima Arora.',
  alternates: {
    canonical: '/',
  },
  generator: 'Heal with Mahima',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://healwithmahima.in',
    title: 'Heal with Mahima | Sound Healing & Breathwork',
    description: 'Transformative Sound Healing, Breathwork, and Meditative Journeys in Delhi-NCR.',
    siteName: 'Heal with Mahima',
    images: [
      {
        url: '/asset/hero-poster.webp',
        width: 1200,
        height: 630,
        alt: 'Heal with Mahima',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heal with Mahima | Sound Healing & Breathwork',
    description: 'Transformative Sound Healing, Breathwork, and Meditative Journeys in Delhi-NCR.',
    images: ['/asset/hero-poster.webp'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
