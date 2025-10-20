'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getCurrentDateKey, getFutureDateKey } from '@/lib/date-utils'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Users, 
  Euro, 
  Clock,
  FileText,
  AlertCircle,
  Receipt,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react'

// TypeScript Interfaces
interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface QuoteFormData {
  clientName: string
  clientEmail: string
  clientAddress: string
  quoteNumber: string
  quoteDate: string
  validUntil: string
  projectName: string
  items: QuoteItem[]
  notes: string
  discount: number
  taxRate: number
}

// Mock data for quote items
const defaultItems: QuoteItem[] = [
  {
    id: '1',
    description: 'Développement Frontend React',
    quantity: 40,
    unitPrice: 500,
    total: 20000
  },
  {
    id: '2',
    description: 'Design UI/UX',
    quantity: 20,
    unitPrice: 450,
    total: 9000
  }
]

export default function AddQuotePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<QuoteFormData>({
    clientName: 'Acme Corporation',
    clientEmail: 'contact@acme-corp.com',
    clientAddress: '123 Rue de la Paix, 75001 Paris, France',
    quoteNumber: `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  quoteDate: getCurrentDateKey(),
  validUntil: getFutureDateKey(30),
    projectName: '',
    items: defaultItems,
    notes: '',
    discount: 0,
    taxRate: 20
  })

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis'
    }
    
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email du client est requis'
    }
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Le nom du projet est requis'
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Au moins un article doit être ajouté'
    }
    
    if (!formData.quoteDate) {
      newErrors.quoteDate = 'La date du devis est requise'
    }
    
    if (!formData.validUntil) {
      newErrors.validUntil = 'La date de validité est requise'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/quotes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard after successful creation
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Error creating quote:', error)
      setErrors({ submit: 'Erreur lors de la création du devis' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add new item
  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  // Remove item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  // Update item
  const updateItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  // Calculate totals
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * formData.discount) / 100
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return ((subtotal - discount) * formData.taxRate) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Devis</h1>
                <p className="text-gray-600">Créer un devis pour Acme Corporation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quote Header Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Receipt className="h-5 w-5 text-green-600 mr-2" />
              Informations du Devis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro du Devis
                </label>
                <input
                  type="text"
                  value={formData.quoteNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Projet *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.projectName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: E-commerce Redesign"
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.projectName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date du Devis *
                </label>
                <input
                  type="date"
                  value={formData.quoteDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, quoteDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.quoteDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quoteDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.quoteDate}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valide jusqu'au *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.validUntil ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.validUntil && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.validUntil}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Client Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              Informations Client
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Client *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.clientName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email du Client *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.clientEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.clientEmail}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse du Client
                </label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Quote Items */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                Articles du Devis
              </h2>
              <motion.button
                type="button"
                onClick={addItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Article</span>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Description de l'article"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix Unitaire (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total (€)
                    </label>
                    <input
                      type="number"
                      value={item.total}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <motion.button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Supprimer l'article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.items && (
              <p className="mt-4 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.items}
              </p>
            )}
          </motion.div>

          {/* Quote Summary */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="h-5 w-5 text-green-600 mr-2" />
              Récapitulatif
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Remise (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>€{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {formData.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise ({formData.discount}%)</span>
                    <span>-€{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>TVA ({formData.taxRate}%)</span>
                  <span>€{calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Conditions particulières, modalités de paiement, etc."
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white flex items-center space-x-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors`}
              whileHover={!isSubmitting ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créer le Devis</span>
                </>
              )}
            </motion.button>
          </motion.div>
          
          {errors.submit && (
            <motion.div 
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </motion.div>
          )}
        </form>
      </main>
    </div>
  )
}









