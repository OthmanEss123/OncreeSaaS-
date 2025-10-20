import React from 'react'
import Link from 'next/link'
import { 
  Home,
  ChevronRight
} from 'lucide-react'

interface RHLayoutProps {
  children: React.ReactNode
}

export default function RHLayout({ children }: RHLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <Home className="h-5 w-5" />
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <h1 className="text-xl font-semibold text-gray-900">Ressources Humaines</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">OncreeSaaS RH</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Content */}
        {children}
      </div>
    </div>
  )
}































