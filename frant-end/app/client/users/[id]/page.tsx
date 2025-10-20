'use client'

import React, { useState } from 'react'
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
  TrendingUp
} from 'lucide-react'

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

// Mock data - In real app, this would come from API
const mockUser: User = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Dubois',
  email: 'marie.dubois@email.com',
  phone: '+33 6 12 34 56 78',
  role: 'Designer',
  dailyRate: 450,
  skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'React'],
  experience: 5,
  location: 'Paris, France',
  availability: 'Available',
  startDate: '2023-06-01',
  notes: 'Spécialisée dans le design d\'interfaces modernes et l\'expérience utilisateur. Très créative et à l\'écoute des besoins clients.',
  currentProject: 'E-commerce Redesign',
  totalHours: 1200,
  totalEarnings: 54000,
  rating: 4.8
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Redesign',
    status: 'Active',
    hoursWorked: 120,
    cost: 5400,
    startDate: '2024-01-15',
    endDate: '2024-03-15'
  },
  {
    id: '2',
    name: 'Mobile App UI',
    status: 'Completed',
    hoursWorked: 80,
    cost: 3600,
    startDate: '2023-11-01',
    endDate: '2023-12-15'
  },
  {
    id: '3',
    name: 'Brand Identity',
    status: 'Completed',
    hoursWorked: 60,
    cost: 2700,
    startDate: '2023-09-01',
    endDate: '2023-10-15'
  }
]

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // In real app, fetch user data based on params.id
  const user = mockUser

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
    router.push(`/client/users/${user.id}/edit`)
  }

  const handleDeleteUser = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to delete user
      // await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowDeleteModal(false)
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate experience in years and months
  const calculateExperience = () => {
    const startDate = new Date(user.startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    return { years, months }
  }

  const experience = calculateExperience()

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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Note moyenne</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{user.rating}</span>
                  </div>
                </div>
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
                {mockProjects.map((project) => (
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
                ))}
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
