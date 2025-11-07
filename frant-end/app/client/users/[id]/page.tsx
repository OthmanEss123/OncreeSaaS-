'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Euro,
  Clock,
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { ConsultantAPI, invalidateCache } from '@/lib/api'
import type { Consultant, WorkSchedule, Project as ProjectType } from '@/lib/type'

// TypeScript Interfaces
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  dailyRate: number
  skills: string[]
  experience: number
  location: string
  availability: 'Available' | 'Busy' | 'Unavailable'
  startDate: string
  notes: string
  currentProject?: string
  totalHours: number
  totalEarnings: number
  rating: number
  avatar?: string
}

interface Project {
  id: string
  name: string
  status: string
  hoursWorked: number
  cost: number
  startDate: string
  endDate?: string
}

// Helper function to transform backend consultant data to frontend User format
const transformConsultantToUser = (consultant: Consultant, workSchedules: WorkSchedule[] = []): User => {
  // Parse skills (stored as string in backend, can be comma-separated or JSON)
  let skillsArray: string[] = []
  if (consultant.skills) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(consultant.skills)
      skillsArray = Array.isArray(parsed) ? parsed : [consultant.skills]
    } catch {
      // If not JSON, split by comma
      skillsArray = consultant.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
  }

  // Calculate total hours from work schedules (days_worked * 8 hours per day)
  const totalHours = workSchedules.reduce((sum, schedule) => sum + (schedule.days_worked || 0) * 8, 0)

  // Calculate total earnings from work schedules
  const dailyRate = consultant.daily_rate || 0
  const totalEarnings = workSchedules.reduce((sum, schedule) => {
    const daysCost = (schedule.days_worked || 0) * dailyRate
    // Add any additional expenses from notes (travel expenses, etc.)
    let expenses = 0
    if (schedule.notes) {
      try {
        const notes = typeof schedule.notes === 'string' ? JSON.parse(schedule.notes) : schedule.notes
        if (notes.travelExpenses) {
          if (Array.isArray(notes.travelExpenses)) {
            expenses = notes.travelExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
          } else {
            expenses = parseFloat(notes.travelExpenses) || 0
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return sum + daysCost + expenses
  }, 0)

  // Determine availability based on status
  const availability: 'Available' | 'Busy' | 'Unavailable' = 
    consultant.status === 'active' ? 'Available' : 
    consultant.status === 'inactive' ? 'Unavailable' : 'Busy'

  // Calculate experience from created_at date
  const startDate = consultant.created_at || new Date().toISOString()

  return {
    id: consultant.id.toString(),
    firstName: consultant.first_name || '',
    lastName: consultant.last_name || '',
    email: consultant.email || '',
    phone: consultant.phone || 'Non renseigné',
    role: consultant.role || 'Consultant',
    dailyRate: dailyRate,
    skills: skillsArray,
    experience: 0, // Will be calculated from startDate
    location: consultant.address || 'Non renseigné',
    availability,
    startDate,
    notes: '', // Can be added later if needed in backend
    currentProject: consultant.project?.name || undefined,
    totalHours: Math.round(totalHours),
    totalEarnings: Math.round(totalEarnings),
    rating: 0 // Can be calculated from ratings if available
  }
}

// Helper function to transform projects
const transformProjects = (consultant: Consultant): Project[] => {
  const projects: Project[] = []
  
  // Add current project if exists
  if (consultant.project) {
    const workSchedules = consultant.workSchedules || []
    const projectSchedules = workSchedules.filter((ws: WorkSchedule) => 
      consultant.project_id && ws.consultant_id === consultant.id
    )
    const hoursWorked = projectSchedules.reduce((sum: number, ws: WorkSchedule) => sum + (ws.days_worked || 0) * 8, 0)
    const dailyRate = consultant.daily_rate || 0
    const cost = projectSchedules.reduce((sum: number, ws: WorkSchedule) => {
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

    const status = consultant.project.end_date 
      ? (new Date(consultant.project.end_date) < new Date() ? 'Completed' : 'Active')
      : 'Active'

    projects.push({
      id: consultant.project.id.toString(),
      name: consultant.project.name,
      status,
      hoursWorked: Math.round(hoursWorked),
      cost: Math.round(cost),
      startDate: consultant.project.start_date || consultant.project.created_at || '',
      endDate: consultant.project.end_date || undefined
    })
  }

  // Add assignments (historical projects)
  if (consultant.assignments) {
    consultant.assignments.forEach((assignment: any) => {
      if (assignment.project && assignment.project.id !== consultant.project_id) {
        const status = assignment.end_date
          ? (new Date(assignment.end_date) < new Date() ? 'Completed' : 'Active')
          : 'Active'
        
        projects.push({
          id: assignment.project.id.toString(),
          name: assignment.project.name,
          status,
          hoursWorked: 0, // Could be calculated from work schedules filtered by date range
          cost: 0,
          startDate: assignment.start_date || '',
          endDate: assignment.end_date || undefined
        })
      }
    })
  }

  return projects
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  // Fetch consultant data from API
  useEffect(() => {
    const fetchConsultantData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const consultantId = parseInt(params.id as string)
        if (isNaN(consultantId)) {
          throw new Error('ID de consultant invalide')
        }

        const consultant = await ConsultantAPI.get(consultantId)
        
        // Transform consultant data to User format
        const workSchedules = consultant.workSchedules || []
        const transformedUser = transformConsultantToUser(consultant, workSchedules)
        setUser(transformedUser)
        
        // Transform projects
        const transformedProjects = transformProjects(consultant)
        setProjects(transformedProjects)
      } catch (err: any) {
        console.error('Erreur lors du chargement du consultant:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchConsultantData()
    }
  }, [params.id])

  // Helper functions
  const getAvailabilityBadgeColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Busy': return 'bg-yellow-100 text-yellow-800'
      case 'Unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'On Hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Action handlers
  const handleEditUser = () => {
    if (user) {
      router.push(`/client/users/${user.id}/edit`)
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return
    
    setIsDeleting(true)
    try {
      const consultantId = parseInt(user.id)
      await ConsultantAPI.delete(consultantId)
      invalidateCache('/consultants')
      setShowDeleteModal(false)
      router.push('/client/dashboard')
    } catch (error: any) {
      console.error('Error deleting consultant:', error)
      setError(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate experience in years and months
  const calculateExperience = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    return { years, months }
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
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Consultant introuvable'}</p>
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

  const experience = calculateExperience(user.startDate)

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
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-600">Détails du consultant</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleEditUser}
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
            {/* User Overview */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-2xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityBadgeColor(user.availability)}`}>
                      {user.availability}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{user.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium text-gray-900">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tarif journalier</p>
                      <p className="font-medium text-gray-900">€{user.dailyRate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expérience</p>
                      <p className="font-medium text-gray-900">{experience.years}a {experience.months}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Localisation</p>
                      <p className="font-medium text-gray-900">{user.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 text-red-600 mr-2" />
                Informations de Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-medium text-gray-900">{user.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium text-gray-900">{new Date(user.startDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Compétences</h2>
              
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            {user.notes && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{user.notes}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
                Statistiques
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Heures totales</span>
                  <span className="font-medium text-gray-900">{user.totalHours}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gains totaux</span>
                  <span className="font-medium text-green-600">€{user.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projet actuel</span>
                  <span className="font-medium text-gray-900">{user.currentProject || 'Aucun'}</span>
                </div>
                {user.rating > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Note moyenne</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900">{user.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Projects */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-5 w-5 text-red-600 mr-2" />
                Projets Récents
              </h2>
              
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Aucun projet assigné</p>
                ) : (
                  projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Heures:</span>
                        <span>{project.hoursWorked}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coût:</span>
                        <span className="font-medium text-red-600">€{project.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Période:</span>
                        <span>{new Date(project.startDate).toLocaleDateString('fr-FR')} - {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : 'En cours'}</span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Delete User Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Consultant</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {user.firstName} {user.lastName} ? Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
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
