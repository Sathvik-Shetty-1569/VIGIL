import { ClerkProvider } from '@clerk/nextjs'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata = {
  title: 'VIGIL',
  description: "It doesn't push you. It watches.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${syne.variable} ${dmSans.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}