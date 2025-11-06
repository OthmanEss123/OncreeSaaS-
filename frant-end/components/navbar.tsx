"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary">OncreeSaaS</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors duration-200">
                Home
              </Link>
              <Link href="/features" className="text-foreground hover:text-primary transition-colors duration-200">
                Features
              </Link>
              <Link href="/pricing" className="text-foreground hover:text-primary transition-colors duration-200">
                Pricing
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors duration-200">
                About
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground ">
                Login
              </Button>
            </Link>
            
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2">
              <Link
                href="/"
                className="block px-3 py-2 text-card-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/features"
                className="block px-3 py-2 text-card-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-card-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-card-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-card-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <Link href="/login">
                  <Button variant="ghost" className="justify-start text-card-foreground  w-full">
                    Login
                  </Button>
                </Link>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
