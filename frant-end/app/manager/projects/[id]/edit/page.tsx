'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProjectAPI, ConsultantAPI, RhAPI, ComptableAPI, invalidateCache } from '@/lib/api'
import type { Project, Consultant, Rh, Comptable } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  Briefcase, 
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Users,
  X,
  UserCog,
  Calculator
} from 'lucide-react'

interface ProjectFormData {
  name: string
  description: string
  start_date: string
  end_date: string
  selectedConsultants: number[]
  id_rh: number | null
  id_comptable: number | null
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [availableConsultants, setAvailableConsultants] = useState<Consultant[]>([])
  const [rhList, setRhList] = useState<Rh[]>([])
  const [loadingRh, setLoadingRh] = useState(true)
  const [comptables, setComptables] = useState<Comptable[]>([])
  const [loadingComptables, setLoadingComptables] = useState(true)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    selectedConsultants: [],
    id_rh: null,
    id_comptable: null
  })

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch Project data and consultants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const projectId = parseInt(params.id as string)
        if (isNaN(projectId)) {
          throw new Error('ID de projet invalide')
        }

        // Fetch project and consultants in parallel
        const [projectData, consultantsData] = await Promise.all([
          ProjectAPI.get(projectId),
          ConsultantAPI.all()
        ])

        setProject(projectData)

        // Filter consultants for the same client
        const clientConsultants = Array.isArray(consultantsData) 
          ? consultantsData.filter((c: Consultant) => c.client_id === projectData.client_id)
          : []
        setAvailableConsultants(clientConsultants)

        // Populate form
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          start_date: projectData.start_date ? new Date(projectData.start_date).toISOString().split('T')[0] : '',
          end_date: projectData.end_date ? new Date(projectData.end_date).toISOString().split('T')[0] : '',
          selectedConsultants: projectData.consultants?.map((c: Consultant) => c.id) || [],
          id_rh: projectData.id_rh || null,
          id_comptable: projectData.id_comptable || null
        })
      } catch (err: any) {
        console.error('Erreur lors du chargement du projet:', err)
        setErrors({ fetch: err.response?.data?.message || err.message || 'Erreur lors du chargement des données' })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && !authLoading && isAuthenticated) {
      fetchData()
    }
  }, [params.id, authLoading, isAuthenticated])

  // Load available RH
  useEffect(() => {
    const fetchRh = async () => {
      if (user?.client_id && project) {
        try {
          setLoadingRh(true)
          const response = await RhAPI.all()
          const allRh: Rh[] = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
          const clientRh = allRh.filter((r: Rh) => Number(r.client_id) === Number(project.client_id))
          setRhList(clientRh)
        } catch (error) {
          console.error('Erreur lors du chargement des RH:', error)
        } finally {
          setLoadingRh(false)
        }
      }
    }
    fetchRh()
  }, [user, project])

  // Load available comptables
  useEffect(() => {
    const fetchComptables = async () => {
      if (user?.client_id && project) {
        try {
          setLoadingComptables(true)
          const response = await ComptableAPI.all()
          const allComptables: Comptable[] = Array.isArray(response) ? response : []
          const clientComptables = allComptables.filter((c: Comptable) => Number(c.client_id) === Number(project.client_id))
          setComptables(clientComptables)
        } catch (error) {
          console.error('Erreur lors du chargement des comptables:', error)
        } finally {
          setLoadingComptables(false)
        }
      }
    }
    fetchComptables()
  }, [user, project])

  // Si pas authentifié, ne rien afficher pendant la redirection
  if (!authLoading && !isAuthenticated) {
    return null
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est requis'
    }
    
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        newErrors.end_date = 'La date de fin doit être après la date de début'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Toggle consultant selection
  const toggleConsultant = (consultantId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedConsultants: prev.selectedConsultants.includes(consultantId)
        ? prev.selectedConsultants.filter(id => id !== consultantId)
        : [...prev.selectedConsultants, consultantId]
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !project) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        consultants: formData.selectedConsultants,
        id_rh: formData.id_rh || null,
        id_comptable: formData.id_comptable || null
      }
      
      await ProjectAPI.update(project.id, updateData)
      invalidateCache(`/projects/${project.id}`)
      invalidateCache('/projects')
      
      setSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/manager/projects/${project.id}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error updating project:', error)
      setErrors({ 
        submit: error.response?.data?.message || 'Erreur lors de la mise à jour du projet' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Show fetch error
  if (errors.fetch || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{errors.fetch || 'Projet introuvable'}</p>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
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
                <p className="text-gray-600">{project.name}</p>
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
                    rows={4}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Description du projet..."
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dates */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
              Dates du Projet
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

          {/* Consultants */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 text-indigo-600 mr-2" />
              Consultants Assignés
            </h2>
            
            {/* Selected Consultants */}
            {formData.selectedConsultants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {formData.selectedConsultants.length} consultant(s) sélectionné(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedConsultants.map(consultantId => {
                    const consultant = availableConsultants.find(c => c.id === consultantId)
                    if (!consultant) return null
                    return (
                      <span 
                        key={consultantId}
                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                        <button
                          type="button"
                          onClick={() => toggleConsultant(consultantId)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Available Consultants */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Cliquez pour ajouter/retirer des consultants</p>
              {availableConsultants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableConsultants.map(consultant => (
                    <button
                      key={consultant.id}
                      type="button"
                      onClick={() => toggleConsultant(consultant.id)}
                      className={`flex items-center p-3 rounded-lg border transition-colors text-left ${
                        formData.selectedConsultants.includes(consultant.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-600 font-medium text-xs">
                          {consultant.first_name?.[0]}{consultant.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{consultant.email}</p>
                      </div>
                      {formData.selectedConsultants.includes(consultant.id) && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center ml-2">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun consultant disponible
                </p>
              )}
            </div>
          </motion.div>

          {/* RH Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <UserCog className="h-5 w-5 text-indigo-600 mr-2" />
                RH Assigné(e)
              </span>
              {!loadingRh && (
                <span className="text-sm text-gray-500 font-normal">
                  ({rhList.length} disponible{rhList.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
            
            {loadingRh ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Chargement des RH...</span>
              </div>
            ) : rhList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCog className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun RH disponible pour ce client</p>
                <p className="text-sm text-gray-400 mt-2">
                  Veuillez d'abord créer des RH pour votre entreprise depuis le dashboard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez le/la RH responsable de ce projet (optionnel)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="rh"
                      checked={formData.id_rh === null}
                      onChange={() => setFormData(prev => ({ ...prev, id_rh: null }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Aucun RH</p>
                      <p className="text-xs text-gray-400">Ne pas assigner de RH</p>
                    </div>
                  </label>
                  {rhList.map((rh) => (
                    <label
                      key={rh.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="rh"
                        checked={formData.id_rh === rh.id}
                        onChange={() => setFormData(prev => ({ ...prev, id_rh: rh.id }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {rh.name}
                        </p>
                        <p className="text-xs text-gray-500">{rh.email}</p>
                        {rh.phone && (
                          <p className="text-xs text-gray-400 mt-1">{rh.phone}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {formData.id_rh !== null && (
                  <p className="text-sm text-green-600 mt-4">
                    RH sélectionné(e)
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Comptable Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
                Comptable Assigné(e)
              </span>
              {!loadingComptables && (
                <span className="text-sm text-gray-500 font-normal">
                  ({comptables.length} disponible{comptables.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
            
            {loadingComptables ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Chargement des comptables...</span>
              </div>
            ) : comptables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun comptable disponible pour ce client</p>
                <p className="text-sm text-gray-400 mt-2">
                  Veuillez d'abord créer des comptables pour votre entreprise depuis le dashboard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez le/la comptable responsable de ce projet (optionnel)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="comptable"
                      checked={formData.id_comptable === null}
                      onChange={() => setFormData(prev => ({ ...prev, id_comptable: null }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Aucun comptable</p>
                      <p className="text-xs text-gray-400">Ne pas assigner de comptable</p>
                    </div>
                  </label>
                  {comptables.map((comptable) => (
                    <label
                      key={comptable.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="comptable"
                        checked={formData.id_comptable === comptable.id}
                        onChange={() => setFormData(prev => ({ ...prev, id_comptable: comptable.id }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {comptable.name}
                        </p>
                        <p className="text-xs text-gray-500">{comptable.email}</p>
                        {comptable.phone && (
                          <p className="text-xs text-gray-400 mt-1">{comptable.phone}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {formData.id_comptable !== null && (
                  <p className="text-sm text-green-600 mt-4">
                    Comptable sélectionné(e)
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
                Projet mis à jour avec succès ! Redirection en cours...
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Mis à jour</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Enregistrer</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </div>
  )
}














































