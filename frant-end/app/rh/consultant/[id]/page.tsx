'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ConsultantAPI, RhAPI, invalidateCache } from '@/lib/api'
import type { Consultant, Rh } from '@/lib/type'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  AlertTriangle,
  Loader2,
  DollarSign,
  CheckCircle,
  XCircle,
  Code
} from 'lucide-react'

export default function ConsultantDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [rh, setRh] = useState<Rh | null>(null)

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')
    
    if (!token || userType !== 'rh') {
      router.push('/login')
    }
  }, [router])

  // Fetch consultant data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const consultantId = parseInt(params.id as string)
        if (isNaN(consultantId)) {
          throw new Error('ID de consultant invalide')
        }

        // Récupérer les données du RH et du consultant
        const [rhData, consultantData] = await Promise.all([
          RhAPI.me(),
          ConsultantAPI.get(consultantId)
        ])
        
        setRh(rhData)
        
        // Vérifier que le consultant appartient au même client
        if (consultantData.client_id !== rhData.client_id) {
          throw new Error('Vous n\'avez pas accès à ce consultant')
        }
        
        setConsultant(consultantData)
      } catch (err: any) {
        console.error('Erreur lors du chargement du consultant:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  // Action handlers
  const handleEditConsultant = () => {
    if (consultant) {
      router.push(`/rh/consultant/${consultant.id}/edit`)
    }
  }

  const handleDeleteConsultant = async () => {
    if (!consultant) return
    
    setIsDeleting(true)
    try {
      await ConsultantAPI.delete(consultant.id)
      invalidateCache('/consultants')
      setShowDeleteModal(false)
      router.push('/rh/dashboard')
    } catch (error: any) {
      console.error('Error deleting consultant:', error)
      setError(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !consultant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Consultant introuvable'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  // Parse skills
  let skillsArray: string[] = []
  if (consultant.skills) {
    try {
      const parsed = JSON.parse(consultant.skills)
      skillsArray = Array.isArray(parsed) ? parsed : [consultant.skills]
    } catch {
      skillsArray = consultant.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
  }

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                </h1>
                <p className="text-gray-600">Détails du consultant</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleEditConsultant}
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
            {/* Consultant Overview */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">
                    {consultant.first_name?.[0]}{consultant.last_name?.[0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                    </h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      consultant.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium text-gray-900">{consultant.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taux journalier</p>
                      <p className="font-medium text-gray-900">
                        {consultant.daily_rate ? `${consultant.daily_rate} €` : 'Non défini'}
                      </p>
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
                <User className="h-5 w-5 text-blue-600 mr-2" />
                Informations de Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{consultant.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{consultant.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-medium text-gray-900">{consultant.address || 'Non renseignée'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium text-gray-900">
                      {new Date(consultant.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            {skillsArray.length > 0 && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Code className="h-5 w-5 text-blue-600 mr-2" />
                  Compétences
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Project Information */}
            {consultant.project && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  Projet Assigné
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{consultant.project.name}</h3>
                  {consultant.project.description && (
                    <p className="text-gray-600 text-sm mt-1">{consultant.project.description}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultant Info Card */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                Informations
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">#{consultant.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statut</span>
                  <span className={`font-medium flex items-center ${
                    consultant.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {consultant.status === 'active' ? (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Actif</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-1" /> Inactif</>
                    )}
                  </span>
                </div>
                {consultant.daily_rate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taux journalier</span>
                    <span className="font-medium text-blue-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {consultant.daily_rate} €
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Delete Consultant Modal */}
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
              Êtes-vous sûr de vouloir supprimer {consultant.name || `${consultant.first_name} ${consultant.last_name}`} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConsultant}
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





