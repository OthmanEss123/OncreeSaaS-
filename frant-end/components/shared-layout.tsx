import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface SharedLayoutProps {
  children: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
