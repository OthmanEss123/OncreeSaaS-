'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Loader2,
  RefreshCw,
  XCircle,
  X,
  PenTool
} from 'lucide-react'
import { ConsultantAPI, WorkScheduleAPI, ScheduleContestAPI, invalidateCache } from '@/lib/api'
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
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [validatingScheduleId, setValidatingScheduleId] = useState<number | null>(null)
  const [contestingScheduleId, setContestingScheduleId] = useState<number | null>(null)
  const [showContestModal, setShowContestModal] = useState(false)
  const [selectedScheduleForContest, setSelectedScheduleForContest] = useState<number | null>(null)
  const [contestJustification, setContestJustification] = useState('')
  const [signedCRAs, setSignedCRAs] = useState<Record<string, {
    consultant?: { signed_at: string };
    client?: { signed_at: string };
    manager?: { signed_at: string };
  }>>({})
  const [currentUserType, setCurrentUserType] = useState<string | null>(null)
  
  // Référence pour éviter les appels API multiples
  const checkedPeriodsRef = useRef<string>('')
  const isCheckingRef = useRef(false)

  // Récupérer le type d'utilisateur au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userType = localStorage.getItem('userType')
      setCurrentUserType(userType)
    }
  }, [])

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
        
        console.log('✅ Consultant chargé:', consultant)
        console.log('📊 Structure de la réponse complète:', {
          responseData: response.data,
          consultant: consultant,
          workSchedules: consultant?.workSchedules,
          work_schedules: consultant?.work_schedules, // Laravel peut utiliser snake_case
          workSchedulesType: typeof consultant?.workSchedules,
          workSchedulesIsArray: Array.isArray(consultant?.workSchedules),
          workSchedulesLength: consultant?.workSchedules?.length,
          allKeys: Object.keys(consultant || {})
        })
        
        // Laravel peut retourner workSchedules en camelCase ou work_schedules en snake_case
        const consultantWorkSchedules = consultant?.workSchedules || consultant?.work_schedules || []
        
        console.log('📊 WorkSchedules chargés:', {
          nombre: consultantWorkSchedules.length,
          premier: consultantWorkSchedules[0] || null,
          tous: consultantWorkSchedules
        })
        console.log('🔍 WorkSchedules à définir dans le state:', consultantWorkSchedules)
        console.log('🔍 Type et longueur:', {
          type: typeof consultantWorkSchedules,
          isArray: Array.isArray(consultantWorkSchedules),
          length: consultantWorkSchedules.length
        })
        setWorkSchedules(consultantWorkSchedules)
        const transformedUser = transformConsultantToUser(consultant, consultantWorkSchedules)
        setUser(transformedUser)
        
        // Transform projects
        const transformedProjects = transformProjects(consultant)
        setProjects(transformedProjects)
      } catch (err: any) {
        console.error('Erreur lors du chargement du consultant:', err)
        console.error('Détails de l\'erreur:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
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

  // Group work schedules by month and year
  const groupWorkSchedulesByMonth = (): WorkLogEntry[] => {
    if (!workSchedules || workSchedules.length === 0) {
      console.log('⚠️ Aucun workSchedule à grouper')
      return []
    }
    
    console.log('🔄 Groupement de', workSchedules.length, 'workSchedules par mois')
    console.log('📋 Premier schedule exemple:', workSchedules[0])
    
    const grouped = workSchedules.reduce((acc, schedule) => {
      try {
        // Vérifier que le schedule a les données nécessaires
        if (!schedule.date && !schedule.month && !schedule.year) {
          console.warn('⚠️ Schedule sans date/mois/année:', schedule)
          return acc
        }
        
        const date = schedule.date ? new Date(schedule.date) : new Date()
        const month = schedule.month || date.getMonth() + 1
        const year = schedule.year || date.getFullYear()
        
        // Vérifier que month et year sont valides
        if (!month || !year || month < 1 || month > 12 || year < 2000 || year > 2100) {
          console.warn('⚠️ Schedule avec mois/année invalide:', { month, year, schedule })
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
        
        // Collecter les types d'absence
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
        
        // Collecter les types de travail
        if (schedule.work_type?.name && !acc[monthKey].workType.includes(schedule.work_type.name)) {
          acc[monthKey].workType = acc[monthKey].workType 
            ? `${acc[monthKey].workType}, ${schedule.work_type.name}`
            : schedule.work_type.name
        }
      } catch (error) {
        console.error('❌ Erreur lors du groupement d\'un schedule:', error, schedule)
      }
      
      return acc
    }, {} as Record<string, WorkLogEntry>)
    
    const result = Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    
    console.log('✅ Groupement terminé:', result.length, 'mois groupés')
    console.log('📋 Résultat:', result)
    
    return result
  }

  // Refresh work schedules
  const refreshWorkSchedules = async () => {
    if (!user) return
    
    try {
      const consultantId = parseInt(user.id)
      // Invalider le cache avant de recharger pour s'assurer d'avoir les relations
      invalidateCache(`/consultants/${consultantId}`)
      invalidateCache('/consultants')
      
      // Forcer le rechargement sans cache
      const { api } = await import('@/lib/api')
      const response = await api.get(`/consultants/${consultantId}`)
      
      // Laravel peut retourner les données directement ou dans response.data
      const consultant = response.data?.data || response.data
      // Laravel peut retourner workSchedules en camelCase ou work_schedules en snake_case
      const consultantWorkSchedules = consultant?.workSchedules || consultant?.work_schedules || []
      
      console.log('✅ WorkSchedules rafraîchis:', {
        nombre: consultantWorkSchedules?.length || 0,
        workSchedules: consultantWorkSchedules,
        consultant: consultant
      })
      
      setWorkSchedules(consultantWorkSchedules)
      // Réinitialiser la référence pour forcer la vérification des signatures après rafraîchissement
      checkedPeriodsRef.current = ''
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err)
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
    }
  }

  // Handle validate work schedule
  const handleValidateSchedule = async (scheduleId: number) => {
    setValidatingScheduleId(scheduleId)
    try {
      // Trouver le schedule actuel pour préserver les notes existantes
      const currentSchedule = workSchedules.find(s => s.id === scheduleId)
      let notesData: any = {}
      
      // Préserver les notes existantes si elles existent
      if (currentSchedule?.notes) {
        try {
          const existingNotes = typeof currentSchedule.notes === 'string' 
            ? JSON.parse(currentSchedule.notes) 
            : currentSchedule.notes
          notesData = { ...existingNotes }
        } catch {
          // Si les notes ne sont pas en JSON, les garder comme texte
          notesData = { originalNotes: currentSchedule.notes }
        }
      }
      
      // Ajouter le statut de validation
      notesData.status = 'validated'
      notesData.validated_at = new Date().toISOString()
      
      // Mettre à jour le statut via l'API
      await WorkScheduleAPI.update(scheduleId, {
        notes: JSON.stringify(notesData)
      })
      
      // Rafraîchir les données
      await refreshWorkSchedules()
      
      // Afficher un message de succès (optionnel)
      console.log('✅ Horaire validé avec succès')
    } catch (err: any) {
      console.error('Erreur lors de la validation:', err)
      setError(err.response?.data?.message || 'Erreur lors de la validation')
    } finally {
      setValidatingScheduleId(null)
    }
  }

  // Handle open contest modal
  const handleOpenContestModal = (scheduleId: number) => {
    setSelectedScheduleForContest(scheduleId)
    setContestJustification('')
    setShowContestModal(true)
  }

  // Handle submit contest with justification
  const handleSubmitContest = async () => {
    if (!selectedScheduleForContest) return
    
    // Vérifier que la justification n'est pas vide
    if (!contestJustification.trim()) {
      setError('Veuillez fournir une justification pour la contestation')
      return
    }
    
    setContestingScheduleId(selectedScheduleForContest)
    try {
      // Créer la contestation via l'API
      await ScheduleContestAPI.create({
        work_schedule_id: selectedScheduleForContest,
        justification: contestJustification.trim()
      })
      
      // Supprimer le work_schedule après la contestation
      try {
        await WorkScheduleAPI.delete(selectedScheduleForContest)
        console.log('✅ Work schedule supprimé avec succès')
      } catch (deleteErr: any) {
        console.error('Erreur lors de la suppression du work schedule:', deleteErr)
        // Ne pas faire échouer toute l'opération si la suppression échoue
        // L'email a déjà été envoyé au consultant
      }
      
      // Rafraîchir les données
      await refreshWorkSchedules()
      
      // Fermer le modal et réinitialiser
      setShowContestModal(false)
      setSelectedScheduleForContest(null)
      setContestJustification('')
      setError(null)
      
      // Afficher un message de succès (optionnel)
      console.log('✅ Contestation créée avec succès et work schedule supprimé')
    } catch (err: any) {
      console.error('Erreur lors de la contestation:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la contestation')
    } finally {
      setContestingScheduleId(null)
    }
  }

  // Rediriger vers la page de signature du CRA
  const handleSignCRA = (log: WorkLog) => {
    const consultantId = user?.id || params.id
    router.push(`/sign-cra?month=${log.month}&year=${log.year}&consultantId=${consultantId}`)
  }
  // Vérifier les signatures des CRA au chargement (optimisé : une seule requête)
  useEffect(() => {
    const checkSignatures = async () => {
      // Ignorer si workSchedules est vide ou si on est déjà en train de vérifier
      if (workSchedules.length === 0 || isCheckingRef.current) {
        return;
      }
      
      // Extraire les périodes uniques (month, year) des schedules
      const periodsMap = new Map<string, { month: number; year: number }>();
      workSchedules.forEach(schedule => {
        const month = schedule.month || (schedule.date ? new Date(schedule.date).getMonth() + 1 : null)
        const year = schedule.year || (schedule.date ? new Date(schedule.date).getFullYear() : null)
        
        if (month && year) {
          const key = `${year}-${month}`;
          periodsMap.set(key, { month, year });
        }
      });
      
      const periods = Array.from(periodsMap.values());
      
      if (periods.length === 0) {
        return;
      }
      
      // Créer une clé unique pour les périodes actuelles
      const periodsKey = periods
        .map(p => `${p.year}-${p.month}`)
        .sort()
        .join(',');
      
      // Ignorer si on a déjà vérifié ces mêmes périodes
      if (checkedPeriodsRef.current === periodsKey) {
        return;
      }
      
      try {
        isCheckingRef.current = true;
        
        // Récupérer le consultant ID
        const consultantId = user?.id ? parseInt(user.id) : undefined;
        
        // Une seule requête pour toutes les signatures
        const result = await WorkScheduleAPI.checkCRASignatures(periods, consultantId);
        
        // Transformer le résultat en format attendu (conserver toutes les signatures par type)
        const signatures: Record<string, {
          consultant?: { signed_at: string };
          client?: { signed_at: string };
          manager?: { signed_at: string };
        }> = {};
        
        Object.entries(result.signatures).forEach(([key, value]) => {
          signatures[key] = {};
          if (value.consultant) {
            signatures[key].consultant = { signed_at: value.consultant.signed_at };
          }
          if (value.client) {
            signatures[key].client = { signed_at: value.client.signed_at };
          }
          if (value.manager) {
            signatures[key].manager = { signed_at: value.manager.signed_at };
          }
        });
        
        setSignedCRAs(signatures);
        checkedPeriodsRef.current = periodsKey; // Mémoriser qu'on a vérifié ces périodes
      } catch (error) {
        console.error('Erreur lors de la vérification des signatures:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkSignatures();
  }, [workSchedules, user])

  const groupedWorkLogs = groupWorkSchedulesByMonth()
  
  // Log pour déboguer
  useEffect(() => {
    console.log('📊 État actuel des workSchedules:', {
      nombre: workSchedules.length,
      workSchedules: workSchedules,
      groupedLogs: groupedWorkLogs
    })
  }, [workSchedules, groupedWorkLogs])

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
                      Mois / Statut
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
                <tbody>
                {(() => {
                  console.log('🔍 Rendu du tableau - workSchedules:', {
                    length: workSchedules.length,
                    workSchedules: workSchedules,
                    isEmpty: workSchedules.length === 0
                  })
                  return null
                })()}
                {workSchedules.length > 0 ? (
                  workSchedules.map((schedule, index) => {
                    console.log(`🔍 Rendu ligne ${index}:`, schedule)
                    return (
                    <tr key={schedule.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {/* Mois */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>
                            {schedule.month && schedule.year 
                              ? new Date(schedule.year, schedule.month - 1, 1).toLocaleDateString('fr-FR', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })
                              : schedule.date
                              ? new Date(schedule.date).toLocaleDateString('fr-FR', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })
                              : 'N/A'}
                          </span>
                          {(() => {
                            // Vérifier le statut dans les notes
                            let status = null
                            let justification = null
                            if (schedule.notes) {
                              try {
                                const notes = typeof schedule.notes === 'string' ? JSON.parse(schedule.notes) : schedule.notes
                                status = notes.status
                                justification = notes.contest_justification || null
                              } catch {
                                // Ignore parsing errors
                              }
                            }
                            
                            if (status === 'validated') {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Validé">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Validé
                                </span>
                              )
                            } else if (status === 'contested') {
                              return (
                                <span 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 cursor-help" 
                                  title={justification ? `Contesté - Justification: ${justification}` : 'Contesté'}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Contesté
                                </span>
                              )
                            }
                            return null
                          })()}
                        </div>
                      </td>
                      
                      {/* Jours travaillés */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.days_worked !== null && schedule.days_worked !== undefined 
                          ? `${schedule.days_worked}` 
                          : '0'}
                      </td>
                      
                      {/* Week-end travaillés */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.weekend_worked !== null && schedule.weekend_worked !== undefined 
                          ? `${schedule.weekend_worked}` 
                          : '0'}
                      </td>
                      
                      {/* Type d'absence */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {schedule.absence_type && schedule.absence_type !== 'none' ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            schedule.absence_type === 'vacation' 
                              ? 'bg-green-100 text-green-800' 
                              : schedule.absence_type === 'sick'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.leave_type?.name || 
                             (schedule.absence_type === 'vacation' ? 'Vacances' :
                              schedule.absence_type === 'sick' ? 'Maladie' :
                              schedule.absence_type === 'personal' ? 'Personnel' :
                              schedule.absence_type === 'other' ? 'Autre' : 'Aucune')}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Aucune</span>
                        )}
                      </td>
                      
                      {/* Jours d'absence */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.absence_days !== null && schedule.absence_days !== undefined 
                          ? `${schedule.absence_days}` 
                          : '0'}
                      </td>
                      
                      {/* Type de travail */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.work_type ? (
                          <div>
                            <div className="font-medium text-gray-900">{schedule.work_type.name}</div>
                            {schedule.work_type.code && (
                              <div className="text-xs text-gray-500">{schedule.work_type.code}</div>
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      
                      {/* Jours de type de travail */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.work_type_days !== null && schedule.work_type_days !== undefined 
                          ? `${schedule.work_type_days}` 
                          : '0'}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleValidateSchedule(schedule.id)}
                            disabled={validatingScheduleId === schedule.id || contestingScheduleId === schedule.id}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: validatingScheduleId !== schedule.id ? 1.05 : 1 }}
                            whileTap={{ scale: validatingScheduleId !== schedule.id ? 0.95 : 1 }}
                            title="Valider cet horaire"
                          >
                            {validatingScheduleId === schedule.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </motion.button>
                          
                          {(() => {
                            const month = schedule.month || (schedule.date ? new Date(schedule.date).getMonth() + 1 : null)
                            const year = schedule.year || (schedule.date ? new Date(schedule.date).getFullYear() : null)
                            const signatureKey = month && year ? `${year}-${month}` : null
                            const signatures = signatureKey ? signedCRAs[signatureKey] : null
                            
                            // Vérifier si l'utilisateur actuel a déjà signé
                            const userHasSigned = currentUserType === 'consultant' && signatures?.consultant
                              || currentUserType === 'client' && signatures?.client
                              || currentUserType === 'manager' && signatures?.manager
                            
                            // Créer un objet log temporaire pour handleSignCRA (comme dans le dashboard consultant)
                            const log: WorkLog = {
                              id: schedule.id.toString(),
                              month: month || 1,
                              year: year || new Date().getFullYear(),
                              daysWorked: schedule.days_worked || 0,
                              workDescription: '',
                              additionalCharges: 0,
                              totalCost: 0,
                              weekendWork: schedule.weekend_worked || 0,
                              absences: schedule.absence_days || 0,
                              workType: schedule.work_type?.name || '',
                              workTypeDays: schedule.work_type_days || 0,
                              date: schedule.date || undefined
                            }
                            
                            // Si l'utilisateur a déjà signé, afficher un badge
                            if (userHasSigned) {
                              const signedBy = currentUserType === 'consultant' ? signatures?.consultant
                                : currentUserType === 'client' ? signatures?.client
                                : signatures?.manager
                              
                              return (
                                <motion.div
                                  className="bg-purple-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm font-medium cursor-default"
                                  title={`Signé par ${currentUserType} le ${new Date(signedBy!.signed_at).toLocaleDateString('fr-FR')}`}>
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Signé ({currentUserType})</span>
                                </motion.div>
                              )
                            }
                            
                            // Sinon, afficher le bouton pour signer
                            return (
                              <motion.button
                                onClick={() => handleSignCRA(log)}
                                disabled={validatingScheduleId === schedule.id || contestingScheduleId === schedule.id}
                                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: validatingScheduleId !== schedule.id && contestingScheduleId !== schedule.id ? 1.05 : 1 }}
                                whileTap={{ scale: validatingScheduleId !== schedule.id && contestingScheduleId !== schedule.id ? 0.95 : 1 }}
                                title="Signer le CRA de ce mois">
                                <PenTool className="h-4 w-4" />
                                <span>Signer</span>
                              </motion.button>
                            )
                          })()}
                          
                          <motion.button
                            onClick={() => handleOpenContestModal(schedule.id)}
                            disabled={validatingScheduleId === schedule.id || contestingScheduleId === schedule.id}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: contestingScheduleId !== schedule.id ? 1.05 : 1 }}
                            whileTap={{ scale: contestingScheduleId !== schedule.id ? 0.95 : 1 }}
                            title="Contester cet horaire"
                          >
                            <XCircle className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      <div className="space-y-2">
                        <p>Aucun horaire de travail trouvé</p>
                        <p className="text-xs text-gray-400">
                          Consultant ID: {user?.id || 'N/A'} | 
                          WorkSchedules dans le state: {workSchedules.length} | 
                          {isLoading ? 'Chargement...' : 'Chargé'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </motion.div>
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

      {/* Contest Justification Modal */}
      {showContestModal && selectedScheduleForContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            
           
            
            <div className="flex items-center space-x-3 mb-4 pr-8">
            <button
              onClick={() => {
                setShowContestModal(false)
                setSelectedScheduleForContest(null)
                setContestJustification('')
                setError(null)
              }}
              disabled={contestingScheduleId !== null}
              
              title="Fermer"
            >
              <XCircle className="h-6 w-6 text-red-600" />
              
            </button>
              <h3 className="text-lg font-semibold text-gray-900">Contester l'horaire</h3>
            </div>
            
            {(() => {
              const schedule = workSchedules.find(s => s.id === selectedScheduleForContest)
              const monthYear = schedule?.month && schedule?.year 
                ? new Date(schedule.year, schedule.month - 1, 1).toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : schedule?.date
                ? new Date(schedule.date).toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : 'N/A'
              
              return (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Période concernée :</span> {monthYear}
                  </p>
                  {schedule && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Jours travaillés :</span> {schedule.days_worked || 0}
                        </div>
                        <div>
                          <span className="font-medium">Week-end travaillés :</span> {schedule.weekend_worked || 0}
                        </div>
                        {schedule.absence_days > 0 && (
                          <div>
                            <span className="font-medium">Jours d'absence :</span> {schedule.absence_days}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
            
            <div className="mb-6">
              <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
                Justification de la contestation <span className="text-red-600">*</span>
              </label>
              <textarea
                id="justification"
                value={contestJustification}
                onChange={(e) => setContestJustification(e.target.value)}
                placeholder="Veuillez expliquer la raison de la contestation de cet horaire..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={5}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {contestJustification.length} caractère(s)
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowContestModal(false)
                  setSelectedScheduleForContest(null)
                  setContestJustification('')
                  setError(null)
                }}
                disabled={contestingScheduleId !== null}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitContest}
                disabled={contestingScheduleId !== null || !contestJustification.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {contestingScheduleId !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Confirmer la contestation</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
