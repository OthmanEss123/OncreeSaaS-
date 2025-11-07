'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle,
  Calendar, 
  Users, 
  Euro, 
  Clock,
  FileText,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react'
import { ProjectAPI, invalidateCache } from '@/lib/api'
import type { Project as ProjectType, Consultant as ConsultantType, WorkSchedule } from '@/lib/type'

// TypeScript Interfaces for frontend
interface Project {
  id: string
  name: string
  description: string
  status: 'Active' | 'Completed' | 'On Hold' | 'Planning'
  priority: 'Low' | 'Medium' | 'High'
  startDate: string
  endDate?: string
  budget: number
  totalCost: number
  totalDays: number
  assignedConsultants: ConsultantInfo[]
  clientNotes: string
  createdAt: string
  updatedAt: string
}

interface ConsultantInfo {
  id: string
  name: string
  role: string
  dailyRate: number
  daysWorked: number
  cost: number
  email: string
  phone: string
}

// Helper function to transform backend project data to frontend Project format
const transformProjectToFrontend = (project: ProjectType): Project => {
  const consultants = project.consultants || []
  
  // Calculate statistics from work schedules
  const assignedConsultants: ConsultantInfo[] = consultants.map(consultant => {
    const workSchedules = consultant.workSchedules || []
    
    // Calculate days worked (sum of days_worked)
    const daysWorked = workSchedules.reduce((sum, ws) => sum + (ws.days_worked || 0), 0)
    
    // Calculate cost (days_worked * daily_rate + expenses)
    const dailyRate = consultant.daily_rate || 0
    const cost = workSchedules.reduce((sum, ws) => {
      const daysCost = (ws.days_worked || 0) * dailyRate
      let expenses = 0
      if (ws.notes) {
        try {
          const notes = typeof ws.notes === 'string' ? JSON.parse(ws.notes) : ws.notes
          if (notes.travelExpenses) {
            if (Array.isArray(notes.travelExpenses)) {
              expenses = notes.travelExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
            } else {
              expenses = parseFloat(notes.travelExpenses) || 0
            }
          }
        } catch {}
      }
      return sum + daysCost + expenses
    }, 0)

    return {
      id: consultant.id.toString(),
      name: consultant.name || `${consultant.first_name} ${consultant.last_name}`,
      role: consultant.role || 'Consultant',
      dailyRate,
      daysWorked: Math.round(daysWorked),
      cost: Math.round(cost),
      email: consultant.email || '',
      phone: consultant.phone || 'Non renseigné'
    }
  })

  // Calculate total cost and days
  const totalCost = assignedConsultants.reduce((sum, c) => sum + c.cost, 0)
  const totalDays = assignedConsultants.reduce((sum, c) => sum + c.daysWorked, 0)

  // Determine status based on dates
  let status: 'Active' | 'Completed' | 'On Hold' | 'Planning' = 'Planning'
  if (project.start_date) {
    const startDate = new Date(project.start_date)
    const endDate = project.end_date ? new Date(project.end_date) : null
    const now = new Date()
    
    if (endDate && endDate < now) {
      status = 'Completed'
    } else if (startDate <= now) {
      status = 'Active'
    } else {
      status = 'Planning'
    }
  }

  // Priority is not stored in backend, default to Medium
  const priority: 'Low' | 'Medium' | 'High' = 'Medium'

  // Budget is not stored in backend, calculate from total cost with a margin
  const budget = Math.max(totalCost * 1.2, 10000) // Add 20% margin or minimum 10k

  return {
    id: project.id.toString(),
    name: project.name,
    description: project.description || '',
    status,
    priority,
    startDate: project.start_date || project.created_at || '',
    endDate: project.end_date || undefined,
    budget: Math.round(budget),
    totalCost: Math.round(totalCost),
    totalDays,
    assignedConsultants,
    clientNotes: '', // Not stored in backend currently
    createdAt: project.created_at,
    updatedAt: project.updated_at
  }
}

export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)

  // Fetch project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const projectId = parseInt(params.id as string)
        if (isNaN(projectId)) {
          throw new Error('ID de projet invalide')
        }

        const projectData = await ProjectAPI.get(projectId)
        
        // Debug: log the data structure
        console.log('📦 Project data received:', projectData)
        console.log('👥 Consultants:', projectData.consultants)
        
        // Transform backend data to frontend format
        const transformedProject = transformProjectToFrontend(projectData)
        setProject(transformedProject)
      } catch (err: any) {
        console.error('❌ Erreur lors du chargement du projet:', err)
        console.error('Response data:', err.response?.data)
        console.error('Response status:', err.response?.status)
        
        // Provide more detailed error message
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || 'Erreur lors du chargement des données'
        
        setError(`Erreur ${err.response?.status || 'inconnue'}: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProjectData()
    }
  }, [params.id])

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'On Hold': return 'bg-yellow-100 text-yellow-800'
      case 'Planning': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Action handlers
  const handleAcceptProject = async () => {
    if (!project) return
    
    setIsLoading(true)
    try {
      const projectId = parseInt(project.id)
      // Update project to set start_date if not set
      const updateData: Partial<ProjectType> = {}
      if (!project.startDate) {
        updateData.start_date = new Date().toISOString().split('T')[0]
      }
      
      if (Object.keys(updateData).length > 0) {
        await ProjectAPI.update(projectId, updateData)
        invalidateCache(`/projects/${projectId}`)
        invalidateCache('/projects')
      }
      
      setShowAcceptModal(false)
      // Refresh project data
      const updatedProject = await ProjectAPI.get(projectId)
      setProject(transformProjectToFrontend(updatedProject))
    } catch (error: any) {
      console.error('Error accepting project:', error)
      setError(error.response?.data?.message || 'Erreur lors de l\'acceptation du projet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProject = () => {
    if (project) {
      router.push(`/client/projects/${project.id}/edit`)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    
    setIsDeleting(true)
    try {
      const projectId = parseInt(project.id)
      await ProjectAPI.delete(projectId)
      invalidateCache('/projects')
      setShowDeleteModal(false)
      router.push('/client/dashboard')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setError(error.response?.data?.message || 'Erreur lors de la suppression du projet')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate project progress
  const calculateProgress = () => {
    if (!project || !project.endDate || !project.startDate) return 0
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)
    const now = new Date()
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  // Show loading state
  if (isLoading) {
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
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Projet introuvable'}</p>
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

  const progress = calculateProgress()

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
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600">Détails du projet</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              {project.status === 'Planning' && (
                <motion.button
                  onClick={() => setShowAcceptModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accepter</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={handleEditProject}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 text-red-600 mr-2" />
                  Aperçu du Projet
                </h2>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">{project.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.totalDays}j</div>
                  <div className="text-sm text-gray-600">Jours totaux</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">€{project.totalCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Coût actuel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">€{project.budget.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Budget total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.assignedConsultants.length}</div>
                  <div className="text-sm text-gray-600">Consultants</div>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 text-red-600 mr-2" />
                Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Début du projet</p>
                    <p className="text-sm text-gray-600">{new Date(project.startDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                
                {project.endDate && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Fin prévue</p>
                      <p className="text-sm text-gray-600">{new Date(project.endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Créé le</p>
                    <p className="text-sm text-gray-600">{new Date(project.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Client Notes */}
            {project.clientNotes && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes Client</h2>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{project.clientNotes}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Consultants */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 text-red-600 mr-2" />
                Consultants Assignés
              </h2>
              
              <div className="space-y-4">
                {project.assignedConsultants.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Aucun consultant assigné</p>
                ) : (
                  project.assignedConsultants.map((consultant) => (
                  <div key={consultant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium">
                          {consultant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{consultant.name}</h3>
                        <p className="text-sm text-gray-600">{consultant.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarif:</span>
                        <span className="font-medium">€{consultant.dailyRate}/jour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jours:</span>
                        <span className="font-medium">{consultant.daysWorked}j</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coût:</span>
                        <span className="font-medium text-red-600">€{consultant.cost.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{consultant.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{consultant.phone}</span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Budget Overview */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Euro className="h-5 w-5 text-red-600 mr-2" />
                Budget
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Budget total</span>
                  <span className="font-medium">€{project.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coût actuel</span>
                  <span className="font-medium text-red-600">€{project.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reste</span>
                  <span className="font-medium text-green-600">€{(project.budget - project.totalCost).toLocaleString()}</span>
                </div>
                
                {/* Budget Progress */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Utilisation</span>
                    <span className="text-sm text-gray-600">{((project.totalCost / project.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (project.totalCost / project.budget) > 0.8 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((project.totalCost / project.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Accept Project Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Accepter le Projet</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir accepter ce projet ? Cette action confirmera le démarrage du projet.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAcceptProject}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Acceptation...' : 'Accepter'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Projet</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
