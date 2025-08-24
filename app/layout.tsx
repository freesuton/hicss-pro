import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Nenki - Creative Portfolio",
  description: "A modern creative portfolio and social platform",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/nenki-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/nenki-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ResponsiveNavbar />

          {/* Main Content with responsive padding */}
          <main className=" md:pb-0 md:pl-64">{children}</main>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
