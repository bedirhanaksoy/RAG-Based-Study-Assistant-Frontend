import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { ConnectionGuard } from "@/components/common/ConnectionGuard"
import { themeScript } from "@/lib/theme-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RAG Study Assistant",
  description: "Local PDF-based RAG assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <ConnectionGuard>
              {children}
              <Toaster />
            </ConnectionGuard>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
