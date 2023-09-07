import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grammer Checker',
  description: 'ChatGpt Grammer Checker',
}

//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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
