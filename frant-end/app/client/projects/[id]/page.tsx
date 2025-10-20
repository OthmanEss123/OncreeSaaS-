'use client'

import React, { useState } from 'react'
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
  Mail
} from 'lucide-react'

// TypeScript Interfaces
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
  assignedConsultants: Consultant[]
  clientNotes: string
  createdAt: string
  updatedAt: string
}

interface Consultant {
  id: string
  name: string
  role: string
  dailyRate: number
  daysWorked: number
  cost: number
  email: string
  phone: string
}

// Mock data - In real app, this would come from API
const mockProject: Project = {
  id: '1',
  name: 'E-commerce Redesign',
  description: 'Refonte complète de la plateforme e-commerce avec nouvelle interface utilisateur, optimisation des performances et intégration de nouvelles fonctionnalités de paiement.',
  status: 'Active',
  priority: 'High',
  startDate: '2024-01-15',
  endDate: '2024-03-15',
  budget: 50000,
  totalCost: 14400,
  totalDays: 40,
  assignedConsultants: [
    {
      id: '1',
      name: 'Marie Dubois',
      role: 'Designer',
      dailyRate: 450,
      daysWorked: 15,
      cost: 5400,
      email: 'marie.dubois@email.com',
      phone: '+33 6 12 34 56 78'
    },
    {
      id: '2',
      name: 'Jean Martin',
      role: 'Developer',
      dailyRate: 550,
      daysWorked: 25,
      cost: 9000,
      email: 'jean.martin@email.com',
      phone: '+33 6 23 45 67 89'
    }
  ],
  clientNotes: 'Le client souhaite une interface moderne et intuitive, avec une attention particulière à l\'expérience mobile.',
  createdAt: '2024-01-10',
  updatedAt: '2024-01-20'
}

export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)

  // In real app, fetch project data based on params.id
  const project = mockProject

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
    setIsLoading(true)
    try {
      // TODO: API call to accept project
      // await fetch(`/api/projects/${project.id}/accept`, { method: 'POST' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowAcceptModal(false)
      // Refresh project data or redirect
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Error accepting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProject = () => {
    router.push(`/client/projects/${project.id}/edit`)
  }

  const handleDeleteProject = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to delete project
      // await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowDeleteModal(false)
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate project progress
  const calculateProgress = () => {
    if (!project.endDate) return 0
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)
    const now = new Date()
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
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
                {project.assignedConsultants.map((consultant) => (
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
                ))}
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
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
