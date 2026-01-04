'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProjectAPI, ConsultantAPI, ManagerAPI, RhAPI, ComptableAPI, invalidateCache } from '@/lib/api'
import type { Project as ProjectType, Consultant, Manager, Rh, Comptable } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Users, 
  Euro, 
  FileText,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Briefcase,
  UserCog,
  Calculator
} from 'lucide-react'

// TypeScript Interfaces
interface ProjectFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  selectedConsultants: number[]
  id_manager: number | null
  id_comptable: number | null
  id_rh: number | null
}

interface ConsultantInfo {
  id: number
  name: string
  role: string
  dailyRate: number
  available: boolean
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [consultants, setConsultants] = useState<ConsultantInfo[]>([])
  const [loadingConsultants, setLoadingConsultants] = useState(true)
  const [managers, setManagers] = useState<Manager[]>([])
  const [loadingManagers, setLoadingManagers] = useState(true)
  const [rhList, setRhList] = useState<Rh[]>([])
  const [loadingRh, setLoadingRh] = useState(true)
  const [comptables, setComptables] = useState<Comptable[]>([])
  const [loadingComptables, setLoadingComptables] = useState(true)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedConsultants: [],
    id_manager: null,
    id_comptable: null,
    id_rh: null
  })

  // Load project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const projectId = parseInt(params.id as string)
        if (isNaN(projectId)) {
          throw new Error('ID de projet invalide')
        }

        const project = await ProjectAPI.get(projectId)
        
        // Transform backend data to form format
        setFormData({
          name: project.name || '',
          description: project.description || '',
          startDate: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
          endDate: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
          selectedConsultants: project.consultants?.map(c => c.id) || [],
          id_manager: project.id_manager || null,
          id_comptable: project.id_comptable || null,
          id_rh: project.id_rh || null
        })
      } catch (err: any) {
        console.error('Erreur lors du chargement du projet:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProjectData()
    }
  }, [params.id])

  // Load available consultants
  useEffect(() => {
    const fetchConsultants = async () => {
      if (user?.id) {
        try {
          setLoadingConsultants(true)
          const response = await ConsultantAPI.all()
          const allConsultants: Consultant[] = Array.isArray(response) ? response : []
          
          // Filter consultants by client_id and transform to ConsultantInfo
          const clientConsultants = allConsultants
            .filter((c: Consultant) => Number(c.client_id) === Number(user.id))
            .map((c: Consultant): ConsultantInfo => ({
              id: c.id,
              name: c.name || `${c.first_name} ${c.last_name}`,
              role: c.role || 'Consultant',
              dailyRate: c.daily_rate || 0,
              available: c.status === 'active'
            }))
          
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

  // Load available managers
  useEffect(() => {
    const fetchManagers = async () => {
      if (user?.id) {
        try {
          setLoadingManagers(true)
          const response = await ManagerAPI.all()
          const allManagers: Manager[] = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
          const clientManagers = allManagers.filter((m: Manager) => Number(m.client_id) === Number(user.id))
          setManagers(clientManagers)
        } catch (error) {
          console.error('Erreur lors du chargement des managers:', error)
        } finally {
          setLoadingManagers(false)
        }
      }
    }
    fetchManagers()
  }, [user])

  // Load available RH
  useEffect(() => {
    const fetchRh = async () => {
      if (user?.id) {
        try {
          setLoadingRh(true)
          const response = await RhAPI.all()
          const allRh: Rh[] = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
          const clientRh = allRh.filter((r: Rh) => Number(r.client_id) === Number(user.id))
          setRhList(clientRh)
        } catch (error) {
          console.error('Erreur lors du chargement des RH:', error)
        } finally {
          setLoadingRh(false)
        }
      }
    }
    fetchRh()
  }, [user])

  // Load available comptables
  useEffect(() => {
    const fetchComptables = async () => {
      if (user?.id) {
        try {
          setLoadingComptables(true)
          const response = await ComptableAPI.all()
          const allComptables: Comptable[] = Array.isArray(response) ? response : []
          const clientComptables = allComptables.filter((c: Comptable) => Number(c.client_id) === Number(user.id))
          setComptables(clientComptables)
        } catch (error) {
          console.error('Erreur lors du chargement des comptables:', error)
        } finally {
          setLoadingComptables(false)
        }
      }
    }
    fetchComptables()
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est requis'
    }
    
    if (!formData.startDate && formData.endDate) {
      newErrors.startDate = 'La date de début est requise si une date de fin est définie'
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début'
    }
    
    // Note: Consultants selection is optional in backend
    // Budget, status, priority are not stored in backend, so we don't validate them
    
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
    setError(null)
    setErrors({})
    
    try {
      const projectId = parseInt(params.id as string)
      if (isNaN(projectId)) {
        throw new Error('ID de projet invalide')
      }

      // Transform form data to backend format
      const updateData: any = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        consultants: formData.selectedConsultants, // Backend expects array of consultant IDs (not Consultant objects)
        id_manager: formData.id_manager || null,
        id_comptable: formData.id_comptable || null,
        id_rh: formData.id_rh || null
      }

      await ProjectAPI.update(projectId, updateData)
      invalidateCache(`/projects/${projectId}`)
      invalidateCache('/projects')
      
      // Redirect to project details after successful update
      router.push(`/client/projects/${params.id}`)
    } catch (err: any) {
      console.error('Error updating project:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du projet'
      setError(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle consultant selection
  const toggleConsultant = (consultantId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedConsultants: prev.selectedConsultants.includes(consultantId)
        ? prev.selectedConsultants.filter(id => id !== consultantId)
        : [...prev.selectedConsultants, consultantId]
    }))
  }

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    const selectedConsultantsData = consultants.filter(c => 
      formData.selectedConsultants.includes(c.id)
    )
    
    if (!formData.startDate || !formData.endDate) return 0
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const totalDailyRate = selectedConsultantsData.reduce((sum, c) => sum + c.dailyRate, 0)
    return totalDailyRate * daysDiff
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render
  if (!authLoading && !isAuthenticated) {
    return null
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
              
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
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
            
            {loadingConsultants ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-red-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Chargement des consultants...</p>
              </div>
            ) : consultants.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Aucun consultant disponible</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultants.map((consultant) => (
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
            )}
            
            {errors.consultants && (
              <p className="mt-4 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.consultants}
              </p>
            )}
          </motion.div>

          {/* Manager Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Briefcase className="h-5 w-5 text-red-600 mr-2" />
                Manager Assigné
              </span>
              {!loadingManagers && (
                <span className="text-sm text-gray-500 font-normal">
                  ({managers.length} disponible{managers.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
            
            {loadingManagers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Chargement des managers...</span>
              </div>
            ) : managers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun manager disponible pour ce client</p>
                <p className="text-sm text-gray-400 mt-2">
                  Veuillez d'abord créer des managers pour votre entreprise depuis le dashboard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez le manager responsable de ce projet (optionnel)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="manager"
                      checked={formData.id_manager === null}
                      onChange={() => setFormData(prev => ({ ...prev, id_manager: null }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Aucun manager</p>
                      <p className="text-xs text-gray-400">Ne pas assigner de manager</p>
                    </div>
                  </label>
                  {managers.map((manager) => (
                    <label
                      key={manager.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="manager"
                        checked={formData.id_manager === manager.id}
                        onChange={() => setFormData(prev => ({ ...prev, id_manager: manager.id }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {manager.name}
                        </p>
                        <p className="text-xs text-gray-500">{manager.email}</p>
                        {manager.phone && (
                          <p className="text-xs text-gray-400 mt-1">{manager.phone}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {formData.id_manager !== null && (
                  <p className="text-sm text-green-600 mt-4">
                    Manager sélectionné
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* RH Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <UserCog className="h-5 w-5 text-red-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
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
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
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
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Calculator className="h-5 w-5 text-red-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
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
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
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
          
          {(errors.submit || error) && (
            <motion.div 
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit || error}
              </p>
            </motion.div>
          )}
        </form>
      </main>
    </div>
  )
}
