'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ConsultantAPI, WorkScheduleAPI, invalidateCache } from '@/lib/api'
import type { Consultant, WorkSchedule } from '@/lib/type'
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
  RefreshCw,
  PenTool,
  Download,
  Eye,
  X
} from 'lucide-react'

export default function ConsultantDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [signedCRAs, setSignedCRAs] = useState<Record<string, {
    consultant?: { signed_at: string };
    client?: { signed_at: string };
    manager?: { signed_at: string };
  }>>({})
  const [showViewCRAModal, setShowViewCRAModal] = useState(false)
  const [selectedCRALog, setSelectedCRALog] = useState<WorkLog | null>(null)
  const [selectedCRASignatures, setSelectedCRASignatures] = useState<{
    consultant?: { signature_data?: string; signed_at: string };
    client?: { signature_data?: string; signed_at: string };
    manager?: { signature_data?: string; signed_at: string };
  } | null>(null)
  const [loadingSignatures, setLoadingSignatures] = useState(false)

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

  interface WorkLog {
    id: string
    date?: string
    month: number
    year: number
    daysWorked: number
    workDescription: string
    additionalCharges: number
    totalCost: number
    weekendWork: number
    absences: number
    workTypeDays?: number
    absenceType?: string
    workType: string
    monthName?: string
    details?: WorkLog[]
  }

  // Utiliser useMemo pour groupedWorkLogs pour éviter les recalculs inutiles
  // Doit être appelé avant tous les useEffect pour respecter l'ordre des hooks
  const groupedWorkLogs = useMemo(() => {
    if (!workSchedules || workSchedules.length === 0) {
      return []
    }
    
    const grouped = workSchedules.reduce((acc, schedule) => {
      try {
        if (!schedule.date && !schedule.month && !schedule.year) {
          return acc
        }
        
        const date = schedule.date ? new Date(schedule.date) : new Date()
        const month = schedule.month || date.getMonth() + 1
        const year = schedule.year || date.getFullYear()
        
        if (!month || !year || month < 1 || month > 12 || year < 2000 || year > 2100) {
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
        
        acc[monthKey].daysWorked += Number(schedule.days_worked) || 0
        acc[monthKey].weekendWork += Number(schedule.weekend_worked) || 0
        acc[monthKey].absences += Number(schedule.absence_days) || 0
        acc[monthKey].workTypeDays += Number(schedule.work_type_days) || 0
        
        if (schedule.absence_type && !acc[monthKey].absenceType.includes(schedule.absence_type)) {
          acc[monthKey].absenceType = acc[monthKey].absenceType 
            ? `${acc[monthKey].absenceType}, ${schedule.absence_type}`
            : schedule.absence_type
        }
        
        if (schedule.work_type?.name && !acc[monthKey].workType.includes(schedule.work_type.name)) {
          acc[monthKey].workType = acc[monthKey].workType 
            ? `${acc[monthKey].workType}, ${schedule.work_type.name}`
            : schedule.work_type.name
        }
        
        if (schedule.absence_type && schedule.absence_type !== 'none') {
          if (schedule.leave_type?.name) {
            if (!acc[monthKey].absenceType.includes(schedule.leave_type.name)) {
              acc[monthKey].absenceType = acc[monthKey].absenceType 
                ? `${acc[monthKey].absenceType}, ${schedule.leave_type.name}`
                : schedule.leave_type.name
            }
          }
        }
        
        return acc
      } catch (error) {
        return acc
      }
    }, {} as Record<string, WorkLogEntry>)
    
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [workSchedules])

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

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

        // Invalider le cache pour s'assurer d'avoir les relations workType et leaveType
        invalidateCache(`/consultants/${consultantId}`)
        invalidateCache('/consultants') // Invalider aussi le cache général
        
        // Forcer le rechargement sans cache en utilisant directement l'API
        const { api } = await import('@/lib/api')
        const response = await api.get(`/consultants/${consultantId}`)
        
        // Laravel peut retourner les données directement ou dans response.data
        const consultant = response.data?.data || response.data
        
        // Laravel peut retourner workSchedules en camelCase ou work_schedules en snake_case
        const consultantWorkSchedules = consultant?.workSchedules || consultant?.work_schedules || []
        
        console.log('✅ Consultant chargé (Manager):', consultant)
        console.log('📊 WorkSchedules chargés (Manager):', {
          nombre: consultantWorkSchedules.length,
          premier: consultantWorkSchedules[0] || null,
          tous: consultantWorkSchedules
        })
        
        setConsultant(consultant)
        setWorkSchedules(consultantWorkSchedules)
      } catch (err: any) {
        console.error('Erreur lors du chargement du consultant:', err)
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && !authLoading && isAuthenticated) {
      fetchConsultantData()
    }
  }, [params.id, authLoading, isAuthenticated])

  // Vérifier les signatures des CRA - DOIT être avant tous les early returns
  useEffect(() => {
    const checkSignatures = async () => {
      if (!consultant || groupedWorkLogs.length === 0) {
        return
      }

      try {
        const periods = groupedWorkLogs.map(log => ({ month: log.month, year: log.year }))
        const result = await WorkScheduleAPI.checkCRASignatures(periods, consultant.id)
        
        // Transformer le résultat en format attendu
        const signatures: Record<string, {
          consultant?: { signed_at: string };
          client?: { signed_at: string };
          manager?: { signed_at: string };
        }> = {}
        
        Object.entries(result.signatures).forEach(([key, value]) => {
          signatures[key] = {}
          if (value.consultant) {
            signatures[key].consultant = { signed_at: value.consultant.signed_at }
          }
          if (value.client) {
            signatures[key].client = { signed_at: value.client.signed_at }
          }
          if (value.manager) {
            signatures[key].manager = { signed_at: value.manager.signed_at }
          }
        })
        
        setSignedCRAs(signatures)
      } catch (error) {
        console.error('Erreur lors de la vérification des signatures:', error)
      }
    }

    checkSignatures()

    // Re-vérifier les signatures si on revient de la page de signature
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('signed') === 'true') {
      checkSignatures().then(() => {
        // Nettoyer l'URL après la vérification
        window.history.replaceState({}, '', window.location.pathname)
      })
    }
  }, [consultant, groupedWorkLogs])

  // Action handlers - après tous les hooks
  const handleEditConsultant = () => {
    if (consultant) {
      router.push(`/manager/consultant/${consultant.id}/edit`)
    }
  }

  const handleDeleteConsultant = async () => {
    if (!consultant) return
    
    setIsDeleting(true)
    try {
      await ConsultantAPI.delete(consultant.id)
      invalidateCache('/consultants')
      setShowDeleteModal(false)
      router.push('/manager/dashboard')
    } catch (error: any) {
      console.error('Error deleting consultant:', error)
      setError(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Refresh work schedules
  const refreshWorkSchedules = async () => {
    if (!consultant) return
    
    try {
      const consultantId = consultant.id
      invalidateCache(`/consultants/${consultantId}`)
      invalidateCache('/consultants')
      
      const { api } = await import('@/lib/api')
      const response = await api.get(`/consultants/${consultantId}`)
      
      const consultantData = response.data?.data || response.data
      const consultantWorkSchedules = consultantData?.workSchedules || consultantData?.work_schedules || []
      
      setWorkSchedules(consultantWorkSchedules)
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err)
    }
  }

  const handleDownloadPDF = async (log: WorkLogEntry | WorkLog) => {
    if (!consultant) {
      alert('❌ Consultant non trouvé')
      return
    }

    const signatureKey = `${log.year}-${log.month}`
    const signatures = signedCRAs[signatureKey]
    const consultantSigned = signatures?.consultant !== undefined
    const clientSigned = signatures?.client !== undefined
    const managerSigned = signatures?.manager !== undefined

    if (!consultantSigned || !clientSigned || !managerSigned) {
      alert('❌ Le CRA doit être signé par toutes les parties (consultant, client, manager) avant de pouvoir télécharger le PDF.')
      return
    }

    try {
      await WorkScheduleAPI.downloadSignedCRAPDF(consultant.id, log.month, log.year)
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors du téléchargement du PDF'
      alert(`❌ ${errorMessage}`)
    }
  }

  const handleViewSignedCRA = async (log: WorkLog) => {
    setSelectedCRALog(log)
    setLoadingSignatures(true)
    setShowViewCRAModal(true)
    
    try {
      const consultantId = consultant?.id
      if (!consultantId) {
        throw new Error('Consultant ID not found')
      }
      const result = await WorkScheduleAPI.getCRASignatures(log.month, log.year, consultantId)
      
      if (result.success && result.signatures) {
        setSelectedCRASignatures(result.signatures)
      } else {
        // Fallback aux signatures existantes si l'API échoue
        const signatureKey = `${log.year}-${log.month}`
        const signatures = signedCRAs[signatureKey] || null
        setSelectedCRASignatures(signatures)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des signatures:', error)
      // Fallback aux signatures existantes
      const signatureKey = `${log.year}-${log.month}`
      const signatures = signedCRAs[signatureKey] || null
      setSelectedCRASignatures(signatures)
    } finally {
      setLoadingSignatures(false)
    }
  }

  // Early returns - APRÈS tous les hooks
  if (!authLoading && !isAuthenticated) {
    return null
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

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
                  onClick={() => router.push(`/manager/dashboard`)}
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
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    {consultant.project.start_date && (
                      <span>Début: {new Date(consultant.project.start_date).toLocaleDateString('fr-FR')}</span>
                    )}
                    {consultant.project.end_date && (
                      <span>Fin: {new Date(consultant.project.end_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client ID</span>
                  <span className="font-medium text-gray-900">#{consultant.client_id}</span>
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

            {/* Client Info */}
            {consultant.client && (
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  Entreprise
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom de l'entreprise</p>
                    <p className="font-medium text-gray-900">{consultant.client.company_name}</p>
                  </div>
                  {consultant.client.contact_name && (
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{consultant.client.contact_name}</p>
                    </div>
                  )}
                  {consultant.client.contact_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{consultant.client.contact_email}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    console.log('🔍 Rendu tableau Manager - workSchedules:', {
                      length: workSchedules.length,
                      workSchedules: workSchedules,
                      groupedLogs: groupedWorkLogs,
                      groupedLogsLength: groupedWorkLogs.length
                    })
                    return null
                  })()}
                  {groupedWorkLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
                          {Number(log.daysWorked) || 0}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {(() => {
                            const signatureKey = `${log.year}-${log.month}`
                            const signatures = signedCRAs[signatureKey]
                            const isManagerSigned = signatures?.manager !== null && signatures?.manager !== undefined
                            const allSigned = signatures?.consultant && signatures?.client && signatures?.manager

                            if (allSigned) {
                              return (
                                <div className="flex items-center space-x-2 text-green-600">
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="text-sm font-medium">Complètement signé</span>
                                </div>
                              )
                            }

                            if (isManagerSigned) {
                              return (
                                <div className="flex items-center space-x-2 text-blue-600">
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="text-sm font-medium">Signé (Manager)</span>
                                </div>
                              )
                            }

                            return (
                              <motion.button
                                onClick={() => router.push(`/manager/sign-cra?month=${log.month}&year=${log.year}&consultantId=${consultant.id}`)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Signer le CRA"
                              >
                                <PenTool className="h-4 w-4" />
                                <span>Signer</span>
                              </motion.button>
                            )
                          })()}
                          {/* Bouton pour voir le CRA signé */}
                            {(() => {
                              const month = log.month
                              const year = log.year
                              const signatureKey = month && year ? `${year}-${month}` : null
                              const signatures = signatureKey ? signedCRAs[signatureKey] : null
                              const consultantSigned = signatures?.consultant !== undefined
                              const clientSigned = signatures?.client !== undefined
                              const managerSigned = signatures?.manager !== undefined
                              if (consultantSigned && clientSigned && managerSigned) {
                                const workLog: WorkLog = {
                                  id: log.id,
                                  month: month || 1,
                                  year: year || new Date().getFullYear(),
                                  daysWorked: log.daysWorked ,
                                  workDescription: '',
                                  additionalCharges: 0,
                                  totalCost: 0,
                                  weekendWork: log.weekendWork || 0,
                                  absences: log.absences || 0,
                                  workType: log.workType || ''
                                }
                                
                                return (
                                  <motion.button
                                    onClick={() => handleViewSignedCRA(workLog)}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm font-medium" 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Voir le CRA signé">
                                    <Eye className="h-3 w-3" />
                                    <span>Voir CRA</span>
                                  </motion.button>
                                )
                              } return null
                            })()}
                          {/* Bouton Télécharger PDF (seulement si toutes les signatures sont présentes) */}
                          {(() => {
                            const signatureKey = `${log.year}-${log.month}`
                            const signatures = signedCRAs[signatureKey]
                            const consultantSigned = signatures?.consultant !== undefined
                            const clientSigned = signatures?.client !== undefined
                            const managerSigned = signatures?.manager !== undefined
                            
                            if (consultantSigned && clientSigned && managerSigned) {
                              return (
                                <motion.button
                                  onClick={() => handleDownloadPDF(log)}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm font-medium ml-2"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  title="Télécharger le PDF du CRA signé">
                                  <Download className="h-4 w-4" />
                                  <span>Télécharger PDF</span>
                                </motion.button>
                              )
                            }
                            return null
                          })()}
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
      {/* View Signed CRA Modal */}
      {showViewCRAModal && selectedCRALog && consultant && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  CRA Signé - {new Date(selectedCRALog.year, selectedCRALog.month - 1, 1).toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowViewCRAModal(false)
                  setSelectedCRALog(null)
                  setSelectedCRASignatures(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* En-tête comme dans le PDF */}
            <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                COMPTE RENDU D'ACTIVITÉ (CRA)
              </h2>
              <p className="text-lg text-gray-700">
                {new Date(selectedCRALog.year, selectedCRALog.month - 1, 1).toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Informations du consultant */}
            <div className="mb-6 space-y-2 text-sm">
              <p>
                <strong>Consultant :</strong> {consultant.name || `${consultant.first_name} ${consultant.last_name}`} ({consultant.email})
              </p>
              {consultant.project && (
                <p>
                  <strong>Projet :</strong> {consultant.project.name}
                </p>
              )}
              <p>
                <strong>Date de génération :</strong> {new Date().toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Tableau détaillé des jours travaillés */}
            {(() => {
              // Filtrer les schedules pour le mois/année sélectionné
              const monthSchedules = workSchedules.filter(schedule => {
                if (!schedule.date) return false
                const scheduleDate = new Date(schedule.date)
                return scheduleDate.getMonth() + 1 === selectedCRALog.month && 
                       scheduleDate.getFullYear() === selectedCRALog.year
              })

              // Grouper par jour
              const daysData: Record<string, { date: Date; morning?: any; evening?: any }> = {}
              monthSchedules.forEach(schedule => {
                if (!schedule.date) return
                const date = new Date(schedule.date)
                const key = date.toISOString().split('T')[0]
                
                if (!daysData[key]) {
                  daysData[key] = { date }
                }
                
                const period = (schedule as any).period || 'morning'
                if (period === 'morning') {
                  daysData[key].morning = schedule
                } else if (period === 'evening') {
                  daysData[key].evening = schedule
                }
              })

              // Trier les jours
              const sortedDays = Object.values(daysData).sort((a, b) => 
                a.date.getTime() - b.date.getTime()
              )

              return (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-blue-600">
                    Détail des jours travaillés
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-indigo-600 text-white">
                          <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Jour</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Jours travaillés</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Week-end travaillé</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Absence</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Type de travail</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Type de congé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedDays.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="border border-gray-300 px-3 py-4 text-center text-red-600">
                              Aucun jour travaillé pour ce mois.
                            </td>
                          </tr>
                        ) : (
                          sortedDays.map((day, idx) => {
                            const date = day.date
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                            
                            let daysWorked = 0
                            let absenceDays = 0
                            
                            ;['morning', 'evening'].forEach(period => {
                              const schedule = day[period as 'morning' | 'evening']
                              if (schedule) {
                                if ((schedule.absence_days ?? 0) > 0) {
                                  absenceDays += 0.5
                                } else {
                                  daysWorked += 0.5
                                }
                              }
                            })
                            
                            const weekendWork = (isWeekend && daysWorked > 0) ? daysWorked : 0
                            
                            const workType = (day.morning as any)?.workType?.name || 
                                           (day.evening as any)?.workType?.name || '-'
                            
                            const leaveType = (day.morning as any)?.leaveType?.name || 
                                            (day.evening as any)?.leaveType?.name || '-'

                            return (
                              <tr 
                                key={idx} 
                                className={isWeekend ? 'bg-yellow-50' : ''}
                              >
                                <td className="border border-gray-300 px-3 py-2">
                                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {date.toLocaleDateString('fr-FR', { weekday: 'long' }).charAt(0).toUpperCase() + 
                                   date.toLocaleDateString('fr-FR', { weekday: 'long' }).slice(1)}
                                </td>
                                <td className={`border border-gray-300 px-3 py-2 ${daysWorked > 0 ? 'text-green-700 font-semibold' : ''}`}>
                                  {daysWorked || '-'}
                                </td>
                                <td className={`border border-gray-300 px-3 py-2 ${weekendWork > 0 ? 'text-orange-600 font-semibold' : ''}`}>
                                  {weekendWork || '-'}
                                </td>
                                <td className={`border border-gray-300 px-3 py-2 ${absenceDays > 0 ? 'text-red-600 font-semibold' : ''}`}>
                                  {absenceDays || '-'}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">{workType}</td>
                                <td className="border border-gray-300 px-3 py-2">{leaveType}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })()}

            {/* Signatures */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-blue-600">
                Signatures
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Signature Consultant */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <strong className="text-gray-900 block mb-3">Consultant</strong>
                  {loadingSignatures ? (
                    <div className="bg-gray-50 rounded border border-gray-200 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : selectedCRASignatures?.consultant ? (
                    <div>
                      <div className="bg-gray-50 rounded border border-gray-300 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                        {selectedCRASignatures.consultant.signature_data ? (
                          <img 
                            src={selectedCRASignatures.consultant.signature_data} 
                            alt="Signature Consultant" 
                            className="max-w-full max-h-[70px] object-contain"
                          />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Signé le {new Date(selectedCRASignatures.consultant.signed_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Non signé</p>
                  )}
                </div>

                {/* Signature Client */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <strong className="text-gray-900 block mb-3">Client</strong>
                  {loadingSignatures ? (
                    <div className="bg-gray-50 rounded border border-gray-200 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                    </div>
                  ) : selectedCRASignatures?.client ? (
                    <div>
                      <div className="bg-gray-50 rounded border border-gray-300 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                        {selectedCRASignatures.client.signature_data ? (
                          <img 
                            src={selectedCRASignatures.client.signature_data} 
                            alt="Signature Client" 
                            className="max-w-full max-h-[70px] object-contain"
                          />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Signé le {new Date(selectedCRASignatures.client.signed_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Non signé</p>
                  )}
                </div>

                {/* Signature Manager */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <strong className="text-gray-900 block mb-3">Manager</strong>
                  {loadingSignatures ? (
                    <div className="bg-gray-50 rounded border border-gray-200 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                    </div>
                  ) : selectedCRASignatures?.manager ? (
                    <div>
                      <div className="bg-gray-50 rounded border border-gray-300 p-3 mb-2 min-h-[80px] flex items-center justify-center">
                        {selectedCRASignatures.manager.signature_data ? (
                          <img 
                            src={selectedCRASignatures.manager.signature_data} 
                            alt="Signature Manager" 
                            className="max-w-full max-h-[70px] object-contain"
                          />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Signé le {new Date(selectedCRASignatures.manager.signed_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Non signé</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowViewCRAModal(false)
                  setSelectedCRALog(null)
                  setSelectedCRASignatures(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {selectedCRALog && (
                <button
                  onClick={() => {
                    handleDownloadPDF(selectedCRALog)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger PDF</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
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









