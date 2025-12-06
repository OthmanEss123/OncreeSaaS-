'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProjectAPI, invalidateCache } from '@/lib/api'
import type { Project, Consultant } from '@/lib/type'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Briefcase, 
  Calendar,
  FileText,
  AlertTriangle,
  Loader2,
  Users,
  Clock,
  Building
} from 'lucide-react'

export default function ProjetDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch Project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const projectId = parseInt(params.id as string)
        if (isNaN(projectId)) {
          throw new Error('ID de projet invalide')
        }

        const response = await ProjectAPI.get(projectId)
        setProject(response)
      } catch (err: any) {
        console.error('Erreur lors du chargement du projet:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && !authLoading && isAuthenticated) {
      fetchProjectData()
    }
  }, [params.id, authLoading, isAuthenticated])

  // Action handlers
  const handleEditProject = () => {
    if (project) {
      router.push(`/manager/projet/${project.id}/edit`)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    
    setIsDeleting(true)
    try {
      await ProjectAPI.delete(project.id)
      invalidateCache('/projects')
      setShowDeleteModal(false)
      router.push('/manager/dashboard')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setError(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Si pas authentifié, ne rien afficher pendant la redirection
  if (!authLoading && !isAuthenticated) {
    return null
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  // Calculate project status based on dates
  const getProjectStatus = () => {
    const now = new Date()
    const startDate = project.start_date ? new Date(project.start_date) : null
    const endDate = project.end_date ? new Date(project.end_date) : null
    
    if (!startDate) return { status: 'Planification', color: 'bg-gray-100 text-gray-800' }
    if (endDate && now > endDate) return { status: 'Terminé', color: 'bg-green-100 text-green-800' }
    if (now >= startDate) return { status: 'En cours', color: 'bg-blue-100 text-blue-800' }
    return { status: 'À venir', color: 'bg-yellow-100 text-yellow-800' }
  }

  const projectStatus = getProjectStatus()

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
                <p className="text-gray-600">Détails du Projet</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleEditProject}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
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
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-indigo-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${projectStatus.color}`}>
                      {projectStatus.status}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date de début</p>
                      <p className="font-medium text-gray-900">
                        {project.start_date 
                          ? new Date(project.start_date).toLocaleDateString('fr-FR')
                          : 'Non définie'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="font-medium text-gray-900">
                        {project.end_date 
                          ? new Date(project.end_date).toLocaleDateString('fr-FR')
                          : 'Non définie'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Project Details */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                Informations du Projet
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium text-gray-900">
                      {project.start_date 
                        ? new Date(project.start_date).toLocaleDateString('fr-FR')
                        : 'Non définie'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium text-gray-900">
                      {project.end_date 
                        ? new Date(project.end_date).toLocaleDateString('fr-FR')
                        : 'Non définie'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Consultants assignés</p>
                    <p className="font-medium text-gray-900">
                      {project.consultants?.length || 0} consultant(s)
                    </p>
                  </div>
                </div>
              </div>

              {project.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-900">{project.description}</p>
                </div>
              )}
            </motion.div>

            {/* Consultants */}
            {project.consultants && project.consultants.length > 0 && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="h-5 w-5 text-indigo-600 mr-2" />
                  Consultants Assignés ({project.consultants.length})
                </h2>
                
                <div className="space-y-4">
                  {project.consultants.map((consultant: Consultant) => (
                    <div 
                      key={consultant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {consultant.first_name?.[0]}{consultant.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                          </p>
                          <p className="text-sm text-gray-600">{consultant.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consultant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
                Informations
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">#{project.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statut</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${projectStatus.color}`}>
                    {projectStatus.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client ID</span>
                  <span className="font-medium text-gray-900">#{project.client_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultants</span>
                  <span className="font-medium text-indigo-600">
                    {project.consultants?.length || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Client Info */}
            {project.client && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Building className="h-5 w-5 text-indigo-600 mr-2" />
                  Client
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom de l'entreprise</p>
                    <p className="font-medium text-gray-900">{project.client.company_name}</p>
                  </div>
                  {project.client.contact_name && (
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{project.client.contact_name}</p>
                    </div>
                  )}
                  {project.client.contact_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{project.client.contact_email}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

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
              Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ? Cette action est irréversible.
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





