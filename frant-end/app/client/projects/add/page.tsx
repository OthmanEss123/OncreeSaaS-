'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProjectAPI, ConsultantAPI, ManagerAPI, RhAPI, ComptableAPI } from '@/lib/api'
import { Consultant, Manager, Rh, Comptable } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText,
  AlertCircle,
  Plus,
  Users,
  UserCog,
  Calculator,
  Briefcase
} from 'lucide-react'

// TypeScript Interfaces
interface ProjectFormData {
  name: string
  description: string
  start_date: string
  end_date: string
  consultants: number[]
  id_manager: number | null
  id_comptable: number | null
  id_rh: number | null
}

export default function AddProjectPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [consultants, setConsultants] = useState<Consultant[]>([])
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
    start_date: '',
    end_date: '',
    consultants: [],
    id_manager: null,
    id_comptable: null,
    id_rh: null
  })

  // Charger les consultants du client
  useEffect(() => {
    const fetchConsultants = async () => {
      if (user?.id) {
        try {
          setLoadingConsultants(true)
          const response = await ConsultantAPI.all()
          console.log('📊 Response complète:', response)
          // La response est directement un tableau de consultants (pas response.data)
          const allConsultants: Consultant[] = Array.isArray(response) ? response : []
          console.log('📋 Tous les consultants:', allConsultants)
          console.log('🔑 ID du client connecté:', user.id)
          const clientConsultants = allConsultants.filter((c: Consultant) => {
            const consultantClientId = Number(c.client_id)
            const userClientId = Number(user.id)
            console.log(`👤 Consultant ${c.id}: client_id=${c.client_id} (${consultantClientId}), user.id=${user.id} (${userClientId}), match=${consultantClientId === userClientId}`)
            return consultantClientId === userClientId
          })
          console.log('✅ Consultants filtrés pour ce client:', clientConsultants)
          setConsultants(clientConsultants)
        } catch (error) {
          console.error('❌ Erreur lors du chargement des consultants:', error)
        } finally {
          setLoadingConsultants(false)
        }
      }
    }
    fetchConsultants()
  }, [user])

  // Charger les managers du client
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

  // Charger les RH du client
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

  // Charger les comptables du client
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

  // Redirection si pas authentifié - utiliser useEffect pour éviter l'erreur de rendu
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est requise'
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'La date de fin est requise'
    } else if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
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
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        client_id: user?.id, // Utiliser l'ID du client connecté
        consultants: formData.consultants, // Tableau d'IDs
        id_manager: formData.id_manager || null,
        id_comptable: formData.id_comptable || null,
        id_rh: formData.id_rh || null
      }
      
      // Appel à l'API pour créer le projet
      await ProjectAPI.create(projectData)
      
      setSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/client/dashboard')
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
                  Créer un nouveau projet pour {user?.company_name}
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
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Développement Application Mobile"
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
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Décrivez les objectifs, les fonctionnalités et les livrables du projet..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
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
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Planning du Projet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.start_date}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                <Users className="h-5 w-5 text-blue-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement des consultants...</span>
              </div>
            ) : consultants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun consultant disponible pour ce client</p>
                <p className="text-sm text-gray-400 mt-2">
                  Veuillez d'abord créer des consultants pour votre entreprise depuis le dashboard
                </p>
                {user && (
                  <p className="text-xs text-gray-400 mt-1">
                    {user.company_name || user.contact_email}
                  </p>
                )}
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
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                        </p>
                        <p className="text-xs text-gray-500">{consultant.email}</p>
                        {consultant.skills && (
                          <p className="text-xs text-gray-400 mt-1">{consultant.skills}</p>
                        )}
                      </div>
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

          {/* Manager Selection */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                <UserCog className="h-5 w-5 text-blue-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                <Calculator className="h-5 w-5 text-blue-600 mr-2" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                Projet créé avec succès ! Redirection en cours...
              </p>
            </motion.div>
          )}

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
              disabled={isSubmitting || success}
              className={`px-6 py-2 rounded-lg text-white flex items-center space-x-2 ${
                isSubmitting || success
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
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