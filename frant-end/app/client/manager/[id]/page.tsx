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
  Shield,
  Calendar,
  AlertTriangle,
  Loader2,
  Building
} from 'lucide-react'
import { ManagerAPI } from '@/lib/api'
import type { Manager } from '@/lib/type'

export default function ManagerDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manager, setManager] = useState<Manager | null>(null)

  // Fetch manager data from API
  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const managerId = parseInt(params.id as string)
        if (isNaN(managerId)) {
          throw new Error('ID de manager invalide')
        }

        const response = await ManagerAPI.get(managerId)
        setManager(response.data || response)
      } catch (err: any) {
        console.error('Erreur lors du chargement du manager:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchManagerData()
    }
  }, [params.id])

  // Action handlers
  const handleEditManager = () => {
    if (manager) {
      router.push(`/client/manager/${manager.id}/edit`)
    }
  }

  const handleDeleteManager = async () => {
    if (!manager) return
    
    setIsDeleting(true)
    try {
      await ManagerAPI.delete(manager.id)
      setShowDeleteModal(false)
      router.push('/client/dashboard')
    } catch (error: any) {
      console.error('Error deleting manager:', error)
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
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !manager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Manager introuvable'}</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
                <h1 className="text-2xl font-bold text-gray-900">{manager.name}</h1>
                <p className="text-gray-600">Détails du manager</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleEditManager}
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
            {/* Manager Overview */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-2xl">
                    {manager.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{manager.name}</h2>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      {manager.role}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium text-gray-900">{manager.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium text-gray-900">
                        {new Date(manager.created_at).toLocaleDateString('fr-FR')}
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
                <User className="h-5 w-5 text-orange-600 mr-2" />
                Informations de Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{manager.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{manager.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-medium text-gray-900">{manager.address || 'Non renseignée'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium text-gray-900">
                      {new Date(manager.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Manager Info Card */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Shield className="h-5 w-5 text-orange-600 mr-2" />
                Informations
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">#{manager.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rôle</span>
                  <span className="font-medium text-orange-600">{manager.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client ID</span>
                  <span className="font-medium text-gray-900">#{manager.client_id}</span>
                </div>
              </div>
            </motion.div>

            {/* Client Info */}
            {manager.client && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Building className="h-5 w-5 text-orange-600 mr-2" />
                  Entreprise
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom de l'entreprise</p>
                    <p className="font-medium text-gray-900">{manager.client.company_name}</p>
                  </div>
                  {manager.client.contact_name && (
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{manager.client.contact_name}</p>
                    </div>
                  )}
                  {manager.client.contact_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{manager.client.contact_email}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Manager Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Manager</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {manager.name} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteManager}
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





















