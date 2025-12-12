'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ConsultantAPI, RhAPI, invalidateCache } from '@/lib/api'
import type { Consultant, Rh, WorkSchedule } from '@/lib/type'
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
  Code,
  RefreshCw
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
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])

  // Interface for grouped work log entries
  interface WorkLogEntry {
    id: string
    month: number
    year: number
    monthName: string
    daysWorked: number
    weekendWork: number
    absences: number
    absenceType: string
    workType: string
    workTypeDays: number
  }

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

        // Invalider le cache pour s'assurer d'avoir les relations workType et leaveType
        invalidateCache(`/consultants/${consultantId}`)
        invalidateCache('/consultants') // Invalider aussi le cache général
        
        // Récupérer les données du RH
        const rhData = await RhAPI.me()
        setRh(rhData)
        
        // Forcer le rechargement sans cache en utilisant directement l'API pour le consultant
        const { api } = await import('@/lib/api')
        const response = await api.get(`/consultants/${consultantId}`)
        
        // Laravel peut retourner les données directement ou dans response.data
        const consultantData = response.data?.data || response.data
        
        // Vérifier que le consultant appartient au même client
        if (consultantData.client_id !== rhData.client_id) {
          throw new Error('Vous n\'avez pas accès à ce consultant')
        }
        
        // Laravel peut retourner workSchedules en camelCase ou work_schedules en snake_case
        const consultantWorkSchedules = consultantData?.workSchedules || consultantData?.work_schedules || []
        
        console.log('✅ Consultant chargé (RH):', consultantData)
        console.log('📊 WorkSchedules chargés (RH):', {
          nombre: consultantWorkSchedules.length,
          premier: consultantWorkSchedules[0] || null,
          tous: consultantWorkSchedules
        })
        
        setConsultant(consultantData)
        setWorkSchedules(consultantWorkSchedules)
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

  // Group work schedules by month and year
  const groupWorkSchedulesByMonth = (): WorkLogEntry[] => {
    if (!workSchedules || workSchedules.length === 0) {
      console.log('⚠️ Aucun workSchedule à grouper (RH)')
      return []
    }
    
    console.log('🔄 Groupement de', workSchedules.length, 'workSchedules par mois (RH)')
    
    const grouped = workSchedules.reduce((acc, schedule) => {
      try {
        // Vérifier que le schedule a les données nécessaires
        if (!schedule.date && !schedule.month && !schedule.year) {
          console.warn('⚠️ Schedule sans date/mois/année (RH):', schedule)
          return acc
        }
        
        const date = schedule.date ? new Date(schedule.date) : new Date()
        const month = schedule.month || date.getMonth() + 1
        const year = schedule.year || date.getFullYear()
        
        // Vérifier que month et year sont valides
        if (!month || !year || month < 1 || month > 12 || year < 2000 || year > 2100) {
          console.warn('⚠️ Schedule avec mois/année invalide (RH):', { month, year, schedule })
          return acc
        }
        
        const monthKey = `${year}-${String(month).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          id: monthKey,
          month,
          year,
          monthName: new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
          }),
          daysWorked: 0,
          weekendWork: 0,
          absences: 0,
          absenceType: '',
          workType: '',
          workTypeDays: 0
        }
      }
      
      acc[monthKey].daysWorked += schedule.days_worked || 0
      acc[monthKey].weekendWork += schedule.weekend_worked || 0
      acc[monthKey].absences += schedule.absence_days || 0
      acc[monthKey].workTypeDays += schedule.work_type_days || 0
      
      // Collecter les types d'absence avec leave_type si disponible
      if (schedule.absence_type && schedule.absence_type !== 'none') {
        if (schedule.leave_type?.name) {
          if (!acc[monthKey].absenceType.includes(schedule.leave_type.name)) {
            acc[monthKey].absenceType = acc[monthKey].absenceType 
              ? `${acc[monthKey].absenceType}, ${schedule.leave_type.name}`
              : schedule.leave_type.name
          }
        } else if (!acc[monthKey].absenceType.includes(schedule.absence_type)) {
          acc[monthKey].absenceType = acc[monthKey].absenceType 
            ? `${acc[monthKey].absenceType}, ${schedule.absence_type}`
            : schedule.absence_type
        }
      }
      
      if (schedule.work_type?.name && !acc[monthKey].workType.includes(schedule.work_type.name)) {
        acc[monthKey].workType = acc[monthKey].workType 
          ? `${acc[monthKey].workType}, ${schedule.work_type.name}`
          : schedule.work_type.name
      }
      
      return acc
    } catch (error) {
      console.error('❌ Erreur lors du groupement d\'un schedule (RH):', error, schedule)
      return acc
    }
    }, {} as Record<string, WorkLogEntry>)
    
    const result = Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    
    console.log('✅ Groupement terminé (RH):', result.length, 'mois groupés')
    console.log('📋 Résultat (RH):', result)
    
    return result
  }

  // Refresh work schedules
  const refreshWorkSchedules = async () => {
    if (!consultant) return
    
    try {
      const consultantId = consultant.id
      // Invalider le cache avant de recharger pour s'assurer d'avoir les relations
      invalidateCache(`/consultants/${consultantId}`)
      invalidateCache('/consultants')
      
      // Forcer le rechargement sans cache
      const { api } = await import('@/lib/api')
      const response = await api.get(`/consultants/${consultantId}`)
      
      // Laravel peut retourner les données directement ou dans response.data
      const consultantData = response.data?.data || response.data
      // Laravel peut retourner workSchedules en camelCase ou work_schedules en snake_case
      const consultantWorkSchedules = consultantData?.workSchedules || consultantData?.work_schedules || []
      
      console.log('✅ WorkSchedules rafraîchis (RH):', {
        nombre: consultantWorkSchedules.length,
        workSchedules: consultantWorkSchedules
      })
      
      setWorkSchedules(consultantWorkSchedules)
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err)
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
    }
  }

  const groupedWorkLogs = groupWorkSchedulesByMonth()

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

        {/* Journal de Travail Table */}
        <div className="mt-8">
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Journal de Travail</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Historique des heures travaillées par mois
                  </p>
                </div>
                <motion.button
                  onClick={refreshWorkSchedules}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Rafraîchir les données"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualiser</span>
                </motion.button>
              </div>
            </div>
              
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mois
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jours travaillés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week-end travaillés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type d'absence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jours d'absence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de travail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jours de type de travail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    console.log('🔍 Rendu tableau RH - workSchedules:', {
                      length: workSchedules.length,
                      workSchedules: workSchedules,
                      groupedLogs: groupedWorkLogs,
                      groupedLogsLength: groupedWorkLogs.length
                    })
                    return null
                  })()}
                  {groupedWorkLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="space-y-2">
                          <p>Aucune donnée de travail disponible</p>
                          <p className="text-xs text-gray-400">
                            Consultant ID: {consultant?.id || 'N/A'} | 
                            WorkSchedules dans le state: {workSchedules.length} | 
                            {isLoading ? 'Chargement...' : 'Chargé'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    groupedWorkLogs.map((log) => (
                      <motion.tr 
                        key={log.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.monthName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {log.daysWorked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {log.weekendWork > 0 ? log.weekendWork : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.absenceType || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {log.absences > 0 ? log.absences : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.workType || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {log.workTypeDays > 0 ? `${log.workTypeDays} jour(s)` : '-'}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
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









