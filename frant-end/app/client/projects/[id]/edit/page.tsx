'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Users, 
  Euro, 
  FileText,
  AlertCircle
} from 'lucide-react'

// TypeScript Interfaces
interface ProjectFormData {
  name: string
  description: string
  status: 'Active' | 'Completed' | 'On Hold' | 'Planning'
  priority: 'Low' | 'Medium' | 'High'
  startDate: string
  endDate: string
  budget: number
  selectedConsultants: string[]
  clientNotes: string
}

interface Consultant {
  id: string
  name: string
  role: string
  dailyRate: number
  available: boolean
}

// Mock data
const availableConsultants: Consultant[] = [
  { id: '1', name: 'Marie Dubois', role: 'Designer', dailyRate: 450, available: true },
  { id: '2', name: 'Jean Martin', role: 'Developer', dailyRate: 550, available: true },
  { id: '3', name: 'Sophie Laurent', role: 'Manager', dailyRate: 600, available: false },
  { id: '4', name: 'Pierre Moreau', role: 'Analyst', dailyRate: 400, available: true },
  { id: '5', name: 'Claire Bernard', role: 'Designer', dailyRate: 420, available: true },
  { id: '6', name: 'Thomas Petit', role: 'Developer', dailyRate: 500, available: true }
]

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // In real app, fetch project data based on params.id
  const [formData, setFormData] = useState<ProjectFormData>({
    name: 'E-commerce Redesign',
    description: 'Refonte complète de la plateforme e-commerce avec nouvelle interface utilisateur, optimisation des performances et intégration de nouvelles fonctionnalités de paiement.',
    status: 'Active',
    priority: 'High',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 50000,
    selectedConsultants: ['1', '2'],
    clientNotes: 'Le client souhaite une interface moderne et intuitive, avec une attention particulière à l\'expérience mobile.'
  })

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est requis'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est requise'
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début'
    }
    
    if (formData.budget <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0'
    }
    
    if (formData.selectedConsultants.length === 0) {
      newErrors.consultants = 'Au moins un consultant doit être sélectionné'
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
      // await fetch(`/api/projects/${params.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to project details after successful update
      router.push(`/client/projects/${params.id}`)
    } catch (error) {
      console.error('Error updating project:', error)
      setErrors({ submit: 'Erreur lors de la mise à jour du projet' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle consultant selection
  const toggleConsultant = (consultantId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedConsultants: prev.selectedConsultants.includes(consultantId)
        ? prev.selectedConsultants.filter(id => id !== consultantId)
        : [...prev.selectedConsultants, consultantId]
    }))
  }

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    const selectedConsultantsData = availableConsultants.filter(c => 
      formData.selectedConsultants.includes(c.id)
    )
    
    if (!formData.startDate || !formData.endDate) return 0
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const totalDailyRate = selectedConsultantsData.reduce((sum, c) => sum + c.dailyRate, 0)
    return totalDailyRate * daysDiff
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-2xl font-bold text-gray-900">Modifier le Projet</h1>
                <p className="text-gray-600">Mettre à jour les informations du projet</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Basic Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 text-red-600 mr-2" />
              Informations du Projet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Projet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: E-commerce Redesign"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Planning">En Planification</option>
                  <option value="Active">Actif</option>
                  <option value="On Hold">En Attente</option>
                  <option value="Completed">Terminé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Low">Faible</option>
                  <option value="Medium">Moyenne</option>
                  <option value="High">Élevée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (€) *
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  min="0"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.budget}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Décrivez les objectifs et les détails du projet..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          </motion.div>

          {/* Project Timeline */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 text-red-600 mr-2" />
              Planning du Projet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Début *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
            
            {/* Estimated Cost Display */}
            {formData.startDate && formData.endDate && formData.selectedConsultants.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Coût Estimé:</span>
                  <span className="text-lg font-bold text-blue-900">
                    €{calculateEstimatedCost().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Basé sur les consultants sélectionnés et la durée du projet
                </p>
              </div>
            )}
          </motion.div>

          {/* Consultant Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 text-red-600 mr-2" />
              Sélection des Consultants
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableConsultants.map((consultant) => (
                <motion.div
                  key={consultant.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.selectedConsultants.includes(consultant.id)
                      ? 'border-red-500 bg-red-50'
                      : consultant.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => consultant.available && toggleConsultant(consultant.id)}
                  whileHover={consultant.available ? { scale: 1.02 } : {}}
                  whileTap={consultant.available ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{consultant.name}</h3>
                      <p className="text-sm text-gray-600">{consultant.role}</p>
                      <p className="text-sm font-medium text-gray-900">€{consultant.dailyRate}/jour</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!consultant.available && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Indisponible
                        </span>
                      )}
                      {formData.selectedConsultants.includes(consultant.id) && (
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {errors.consultants && (
              <p className="mt-4 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.consultants}
              </p>
            )}
          </motion.div>

          {/* Client Notes */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Notes Client (Optionnel)
            </h2>
            
            <textarea
              value={formData.clientNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ajoutez des notes spécifiques ou des exigences particulières..."
            />
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
                  : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
              whileHover={!isSubmitting ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Mettre à jour</span>
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
