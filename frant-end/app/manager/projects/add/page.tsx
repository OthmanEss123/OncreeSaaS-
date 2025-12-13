'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProjectAPI, ConsultantAPI } from '@/lib/api'
import { Consultant } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText,
  AlertCircle,
  Plus,
  Users,
  Briefcase
} from 'lucide-react'

// TypeScript Interfaces
interface ProjectFormData {
  name: string
  description: string
  start_date: string
  end_date: string
  consultants: number[]
}

export default function AddProjectPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loadingConsultants, setLoadingConsultants] = useState(true)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    consultants: []
  })

  // Charger les consultants du client
  useEffect(() => {
    const fetchConsultants = async () => {
      if (user?.client_id) {
        try {
          setLoadingConsultants(true)
          const response = await ConsultantAPI.all()
          const allConsultants: Consultant[] = Array.isArray(response) ? response : []
          const clientConsultants = allConsultants.filter((c: Consultant) => {
            const consultantClientId = Number(c.client_id)
            const userClientId = Number(user.client_id)
            return consultantClientId === userClientId
          })
          setConsultants(clientConsultants)
        } catch (error) {
          console.error('Erreur lors du chargement des consultants:', error)
        } finally {
          setLoadingConsultants(false)
        }
      }
    }
    fetchConsultants()
  }, [user])

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Si pas authentifié, ne rien afficher pendant la redirection
  if (!authLoading && !isAuthenticated) {
    return null
  }

  // Affichage du loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est requis'
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'La date de fin doit être postérieure à la date de début'
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
    setErrors({})
    
    try {
      // Préparer les données pour l'API
      const projectData: any = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        client_id: user?.client_id, // Utiliser l'ID du client du manager
        consultant_ids: formData.consultants
      }
      
      // Appel à l'API pour créer le projet
      await ProjectAPI.create(projectData)
      
      setSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/manager/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating project:', error)
      setErrors({ 
        submit: error.response?.data?.message || 'Erreur lors de la création du projet' 
      })
    } finally {
      setIsSubmitting(false)
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Projet</h1>
                <p className="text-gray-600">
                  Créer un nouveau projet pour {user?.client?.company_name || 'votre entreprise'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
              Informations du Projet
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Migration Cloud AWS"
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
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Décrivez les objectifs, les fonctionnalités et les livrables du projet..."
                  />
                </div>
              </div>
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
              <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
              Planning du Projet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Consultant Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-5 w-5 text-indigo-600 mr-2" />
                Consultants Assignés
              </span>
              {!loadingConsultants && (
                <span className="text-sm text-gray-500 font-normal">
                  ({consultants.length} disponible{consultants.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
            
            {loadingConsultants ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Chargement des consultants...</span>
              </div>
            ) : consultants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun consultant disponible</p>
                <p className="text-sm text-gray-400 mt-2">
                  Veuillez d'abord créer des consultants depuis le dashboard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez les consultants qui travailleront sur ce projet
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {consultants.map((consultant) => (
                    <label
                      key={consultant.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.consultants.includes(consultant.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.consultants.includes(consultant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              consultants: [...prev.consultants, consultant.id]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              consultants: prev.consultants.filter(id => id !== consultant.id)
                            }))
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                        </p>
                        <p className="text-xs text-gray-500">{consultant.email}</p>
                        {consultant.skills && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{consultant.skills}</p>
                        )}
                      </div>
                      {consultant.daily_rate && (
                        <span className="text-xs text-indigo-600 font-medium">
                          {consultant.daily_rate}€/j
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                {formData.consultants.length > 0 && (
                  <p className="text-sm text-green-600 mt-4">
                    {formData.consultants.length} consultant(s) sélectionné(s)
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Success Message */}
          {success && (
            <motion.div 
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-green-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Projet créé avec succès ! Redirection en cours...
              </p>
            </motion.div>
          )}

          {/* Error Message */}
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

          {/* Submit Button */}
          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
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
              disabled={isSubmitting || success}
              className={`px-6 py-2 rounded-lg text-white flex items-center space-x-2 ${
                isSubmitting || success
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
              whileHover={!isSubmitting && !success ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting && !success ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Création...</span>
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créé avec succès</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Créer le Projet</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </div>
  )
}














