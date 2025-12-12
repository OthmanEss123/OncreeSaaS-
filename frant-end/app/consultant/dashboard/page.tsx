'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getCurrentDateKey } from '@/lib/date-utils'
import { ConsultantAPI, WorkScheduleAPI, WorkTypeAPI, LeaveTypeAPI, DashboardAPI } from '@/lib/api'
import type { Consultant, Project as ProjectType, WorkSchedule, WorkType, LeaveType } from '@/lib/type'
import { 
  Plus, 
  Clock, 
  Euro, 
  Calendar, 
  Briefcase,
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  AlertCircle,
  FileText,
  RefreshCw,
  Edit,
  Upload,
  Send,
  LogOut
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
  location: string
  avatar?: string
}

interface Project {
  id: string
  name: string
  description: string
  clientName: string
  status: 'Active' | 'Completed' | 'On Hold'
  startDate: string
  endDate?: string
  totalDays: number
  totalCost: number
}

interface WorkLog {
  id: string
  date?: string  // Optionnel, utilisé seulement dans les détails
  month: number  // Mois (1-12)
  year: number   // Année
  daysWorked: number
  workDescription: string
  additionalCharges: number
  totalCost: number
  weekendWork: number
  absences: number
  workTypeDays?: number // Jours de Type de Travail
  absenceType?: string  // Type d'absence (congé maladie, congé payé, etc.)
  workType: string
  monthName?: string // Pour les entrées groupées par mois
  details?: WorkLog[] // Pour stocker les détails des entrées originales
}

interface WorkEntryForm {
  date: string
  daysWorked: number
  workDescription: string
  additionalCharges: number
  weekendWork: number
  absences: number
  workType: string
}

// Mock Data
const mockWorkLogs: WorkLog[] = []

const mockWorkTypes = [
  'Travaux internes (Consultants)',
  'Développement projet client',
  'Formation',
  'Maintenance',
  'Consulting'
]

export default function UserDashboard() {
  const router = useRouter()
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [project, setProject] = useState<ProjectType | null>(null)
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [workEntry, setWorkEntry] = useState<WorkEntryForm>({
    date: getCurrentDateKey(),
    daysWorked: 1,
    workDescription: '',
    additionalCharges: 0,
    weekendWork: 0,
    absences: 0,
    workType: 'Travaux internes (Consultants)'
  })

  // Transformer les workSchedules en workLogs groupés par mois
  const transformWorkSchedulesToWorkLogs = (schedules: WorkSchedule[]): WorkLog[] => {
    if (!schedules || schedules.length === 0) {
      console.log('⚠️ Aucun schedule à transformer')
      return []
    }
    
    console.log('🔄 Transformation de', schedules.length, 'workSchedules en workLogs')
    console.log('📋 Premier schedule exemple:', schedules[0])
    
    const grouped = schedules.reduce((acc, schedule) => {
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
            workDescription: 'Résumé mensuel',
            additionalCharges: 0,
            totalCost: 0,
            weekendWork: 0,
            absences: 0,
            workTypeDays: 0,
            absenceType: '',
            workType: '',
            details: []
          }
        }
        
        acc[monthKey].daysWorked += schedule.days_worked || 0
        acc[monthKey].weekendWork += schedule.weekend_worked || 0
        acc[monthKey].absences += schedule.absence_days || 0
        acc[monthKey].workTypeDays += schedule.work_type_days || 0
        
        // Calculer les charges supplémentaires depuis les notes
        if (schedule.notes) {
          try {
            const notes = typeof schedule.notes === 'string' ? JSON.parse(schedule.notes) : schedule.notes
            if (notes.travelExpenses) {
              if (Array.isArray(notes.travelExpenses)) {
                acc[monthKey].additionalCharges += notes.travelExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
              } else {
                acc[monthKey].additionalCharges += parseFloat(notes.travelExpenses) || 0
              }
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
        
        // Calculer le coût total
        const dailyRate = consultant?.daily_rate || 450
        const dayCost = (schedule.days_worked || 0) * dailyRate
        acc[monthKey].totalCost += dayCost
        
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
        
        // Ajouter les détails
        acc[monthKey].details.push({
          id: schedule.id.toString(),
          date: schedule.date,
          month,
          year,
          daysWorked: schedule.days_worked || 0,
          workDescription: schedule.notes ? (typeof schedule.notes === 'string' ? schedule.notes : JSON.stringify(schedule.notes)) : 'Travail enregistré',
          additionalCharges: acc[monthKey].additionalCharges,
          totalCost: dayCost,
          weekendWork: schedule.weekend_worked || 0,
          absences: schedule.absence_days || 0,
          workTypeDays: schedule.work_type_days || 0,
          absenceType: schedule.absence_type || '',
          workType: schedule.work_type?.name || ''
        })
      } catch (error) {
        console.error('❌ Erreur lors de la transformation d\'un schedule:', error, schedule)
      }
      
      return acc
    }, {} as Record<string, any>)
    
    const result = Object.values(grouped).map((group: any) => ({
      id: group.id,
      month: group.month,
      year: group.year,
      monthName: group.monthName,
      daysWorked: Math.round(group.daysWorked * 10) / 10,
      workDescription: `${group.details.length} entrée(s) de travail`,
      additionalCharges: Math.round(group.additionalCharges * 100) / 100,
      totalCost: Math.round(group.totalCost * 100) / 100,
      weekendWork: Math.round(group.weekendWork * 10) / 10,
      absences: Math.round(group.absences * 10) / 10,
      workTypeDays: Math.round(group.workTypeDays * 10) / 10,
      absenceType: group.absenceType || '-',
      workType: group.workType || '-',
      details: group.details
    })).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    
    console.log('✅ Transformation terminée:', result.length, 'mois groupés')
    return result
  }

  // Charger les données du consultant depuis l'API
  useEffect(() => {
    const fetchConsultantData = async () => {
      try {
        setLoading(true)
        
        // Vérifier que l'utilisateur est authentifié
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null
        
        if (!token) {
          console.warn('⚠️ Aucun token d\'authentification trouvé, redirection vers /login')
          router.push('/login')
          return
        }
        
        // Vérifier que l'utilisateur est bien un consultant
        if (userType !== 'consultant') {
          console.warn(`⚠️ Accès refusé: type d'utilisateur "${userType}" au lieu de "consultant"`)
          console.warn('⚠️ Redirection vers la page de connexion')
          router.push('/login')
          return
        }
        
        // 🚀 1 SEUL APPEL au lieu de 3 appels séparés!
        const data = await DashboardAPI.consultantDashboard()
        console.log('✅ Toutes les données chargées en 1 appel:', data)
        console.log('👤 Consultant:', data.consultant)
        console.log('📁 Projet:', data.project)
        console.log('👥 Client du projet:', data.project?.client)
        
        setConsultant(data.consultant)
        setProject(data.project)
        const schedules = data.workSchedules || []
        setWorkSchedules(schedules)
        setWorkTypes(data.workTypes || [])
        setLeaveTypes(data.leaveTypes || [])
        
        console.log('✅ Types chargés:', {
          workTypes: (data.workTypes || []).length,
          leaveTypes: (data.leaveTypes || []).length
        })
        
        console.log('📊 WorkSchedules chargés:', {
          nombre: schedules.length,
          premier: schedules[0] || null,
          tous: schedules
        })
        
        // Transformer les workSchedules en workLogs groupés par mois
        if (schedules.length > 0) {
          console.log('📊 Transformation des workSchedules en workLogs:', schedules.length, 'entrées')
          const transformedLogs = transformWorkSchedulesToWorkLogs(schedules)
          console.log('✅ WorkLogs transformés:', transformedLogs.length, 'mois')
          console.log('📋 Détails des workLogs:', transformedLogs)
          setWorkLogs(transformedLogs)
        } else {
          console.log('⚠️ Aucun workSchedule trouvé, tentative de chargement depuis /work-logs-grouped')
          // Essayer de charger depuis l'endpoint groupé
          loadWorkLogsFromBackend()
        }
       
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des données:', error)
        
        // Améliorer l'extraction du message d'erreur
        let errorMessage = 'Erreur lors du chargement des données'
        let errorStatus = null
        
        try {
          if (error?.response) {
            errorStatus = error.response.status
            
            // Essayer différentes façons d'extraire le message
            if (error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message
              } else {
                // Essayer de sérialiser les données pour voir ce qu'elles contiennent
                try {
                  errorMessage = JSON.stringify(error.response.data)
                } catch (e) {
                  errorMessage = 'Erreur serveur (données non sérialisables)'
                }
              }
            }
          } else if (error?.message) {
            errorMessage = error.message
          }
        } catch (e) {
          console.error('Erreur lors de l\'extraction du message:', e)
        }
        
        console.error('📋 Détails de l\'erreur:', {
          status: errorStatus,
          statusText: error?.response?.statusText,
          message: errorMessage,
          errorType: error?.name,
          errorCode: error?.code,
          fullError: error
        })
        
        // Si l'erreur est 401 (non authentifié), rediriger vers la page de connexion
        if (errorStatus === 401) {
          console.warn('⚠️ Non authentifié, redirection vers /login')
          router.push('/login')
          return
        }
        
        // Si l'erreur est 500, afficher un message plus informatif
        if (errorStatus === 500) {
          console.error('⚠️ Erreur serveur 500. Vérifiez les logs du serveur backend.')
          console.error('💡 Message d\'erreur:', errorMessage)
        }
        
        // En cas d'erreur, on garde les données mockées
        // L'utilisateur pourra toujours utiliser l'interface avec les données mockées
        
      } finally {
        setLoading(false)
      }
    }

    fetchConsultantData()
  }, [])

  // Créer des variables dérivées pour utiliser les vraies données si disponibles
  const currentUser: User | null = consultant ? {
    id: consultant.id.toString(),
    firstName: consultant.name?.split(' ')[0] || 'Consultant',
    lastName: consultant.name?.split(' ').slice(1).join(' ') || '',
    email: consultant.email || '',
    phone: consultant.phone || '',
    role: consultant.role || 'Consultant',
    dailyRate: consultant.daily_rate || 450,
    location: consultant.address || 'Non renseigné',
    avatar: undefined
  } : null
  
  const currentProject: Project | null = project ? {
    id: project.id.toString(),
    name: project.name || '',
    description: project.description || '',
    clientName: project.client?.company_name || project.client?.contact_name || 'Client',
    status: 'Active' as 'Active' | 'Completed' | 'On Hold',
    startDate: project.start_date || '',
    endDate: project.end_date || undefined,
    totalDays: 0,
    totalCost: 0
  } : null

  // Function to group work logs by month (utilisé pour les données mockées seulement)
  const groupWorkLogsByMonth = (logs: WorkLog[]) => {
    const grouped = logs.reduce((acc, log) => {
      const monthKey = `${log.year}-${String(log.month).padStart(2, '0')}`
      const monthName = new Date(log.year, log.month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          id: monthKey,
          month: log.month,
          year: log.year,
          monthName: monthName,
          daysWorked: 0,
          workDescription: 'Résumé mensuel',
          additionalCharges: 0,
          totalCost: 0,
          weekendWork: 0,
          absences: 0,
          workTypeDays: 0, // Nouveau compteur pour les jours de Type de Travail
          absenceTypes: new Set<string>(),
          workTypes: new Set<string>(),
          details: []
        }
      }
      
      acc[monthKey].daysWorked += log.daysWorked
      acc[monthKey].additionalCharges += log.additionalCharges
      acc[monthKey].totalCost += log.totalCost
      acc[monthKey].weekendWork += log.weekendWork
      acc[monthKey].absences += log.absences
      if (log.absenceType) {
        acc[monthKey].absenceTypes.add(log.absenceType)
      }
      if (log.workType) {
        acc[monthKey].workTypes.add(log.workType)
        acc[monthKey].workTypeDays += log.daysWorked // Ajouter les jours de travail
      }
      acc[monthKey].details.push(log)
      
      return acc
    }, {} as Record<string, any>)
    
    // Convert to array and format work types
    return Object.values(grouped).map(group => ({
      id: group.id,
      month: group.month,
      year: group.year,
      monthName: group.monthName,
      daysWorked: Math.round(group.daysWorked * 10) / 10, // Round to 1 decimal
      workDescription: `${group.details.length} entrée(s) de travail`,
      additionalCharges: Math.round(group.additionalCharges * 100) / 100, // Round to 2 decimals
      totalCost: Math.round(group.totalCost * 100) / 100, // Round to 2 decimals
      weekendWork: Math.round(group.weekendWork * 10) / 10, // Round to 1 decimal
      absences: Math.round(group.absences * 10) / 10, // Round to 1 decimal
      workTypeDays: Math.round(group.workTypeDays * 10) / 10, // Round to 1 decimal
      absenceType: Array.from(group.absenceTypes).join(', '),
      workType: Array.from(group.workTypes).join(', '),
      details: group.details
    }))
  }

  // Méthode normale pour charger les données du Journal de Travail depuis le backend
  const loadWorkLogsFromBackend = async () => {
    try {
      console.log('📥 Chargement du Journal de Travail depuis le backend...')
      
      // Appel API direct sans cache complexe
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saas.oncree.fr/api'
      const response = await fetch(`${apiUrl}/work-logs-grouped`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      const groupedData = result.data
      
      console.log('✅ Données reçues:', groupedData)
      
      if (!Array.isArray(groupedData) || groupedData.length === 0) {
        console.log('⚠️ Aucune donnée trouvée')
        setWorkLogs([])
        return
      }
      
      // Transformer les données pour le tableau
      const workLogsData: WorkLog[] = groupedData.map((item: any) => ({
        id: item.id,
        month: item.month,
        year: item.year,
        monthName: item.monthName,
        daysWorked: item.daysWorked || 0,
        workDescription: `${item.details?.length || 0} entrée(s)`,
        additionalCharges: 0,
        totalCost: 0,
        weekendWork: item.weekendWork || 0,
        absences: item.absences || 0,
        workTypeDays: item.workTypeDays || 0,
        absenceType: item.absenceType || '-',
        workType: item.workType || '-',
        details: item.details || []
      }))
      
      setWorkLogs(workLogsData)
      console.log('✅ Journal de Travail chargé:', workLogsData.length, 'mois')
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error)
      setWorkLogs([])
    }
  }


  // Fonction de déconnexion
  const handleLogout = () => {
    // Supprimer le token d'authentification
    localStorage.removeItem('authToken')
    // Rediriger vers la page de connexion
    router.push('/login')
  }

  // Handle edit work log - redirect to timesheet with data for modification
  const handleEditWorkLog = (workLog: WorkLog) => {
    // Save the work log data to localStorage for the timesheet to access
    localStorage.setItem('timesheet-edit-data', JSON.stringify({
      workLog: workLog
    }))
    
    // Redirect to timesheet in edit mode
    router.push('/consultant/timesheet?edit=true')
  }

  // Envoyer le rapport mensuel au client par email
  const handleSendReport = async (log: WorkLog) => {
    // Vérifier si le consultant a un projet et un client
    if (!project || !project.client) {
      alert('❌ Aucun client trouvé pour ce projet');
      return;
    }

    const clientEmail = project.client.contact_email;
    const clientName = project.client.company_name || project.client.contact_name;

    if (!clientEmail) {
      alert('❌ L\'email du client n\'est pas configuré');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir envoyer le rapport de ${log.monthName} ?\n\nLe rapport sera envoyé au client (${clientEmail}) ainsi qu'au comptable, RH et manager associés.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saas.oncree.fr/api';
      const response = await fetch(`${apiUrl}/send-monthly-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: log.month,
          year: log.year
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Erreur : ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport:', error);
      alert('❌ Erreur lors de l\'envoi du rapport');
    }
  };

  // Load data from backend on component mount (seulement si workSchedules est vide)
  useEffect(() => {
    // Si workSchedules est vide, essayer de charger depuis l'endpoint groupé
    if (workSchedules.length === 0 && consultant) {
      console.log('📥 Chargement depuis /work-logs-grouped car workSchedules est vide')
      loadWorkLogsFromBackend()
    }
  }, [consultant])

  // Initialize with grouped mock data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use mock data as fallback
      const groupedByMonth = groupWorkLogsByMonth(mockWorkLogs)
      setWorkLogs(groupedByMonth)
    }
  }, [])

  // Listen for focus events to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      loadWorkLogsFromBackend()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Les données sont déjà groupées par mois depuis le backend
  const groupedWorkLogs = workLogs
  
  // Calculate totals
  const totalDays = workLogs.reduce((sum, log) => sum + log.daysWorked, 0)
  const totalCharges = workLogs.reduce((sum, log) => sum + log.additionalCharges, 0)
  const totalCost = workLogs.reduce((sum, log) => sum + log.totalCost, 0)
  const totalWorkDays = new Set(workLogs.map(log => `${log.year}-${log.month}`)).size

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'On Hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    if (role.toLowerCase().includes('senior')) return 'bg-purple-100 text-purple-800'
    if (role.toLowerCase().includes('designer')) return 'bg-blue-100 text-blue-800'
    if (role.toLowerCase().includes('developer')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Validation function
  const validateWorkEntry = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!workEntry.date) {
      newErrors.date = 'La date est requise'
    }
    
    if (workEntry.daysWorked <= 0) {
      newErrors.daysWorked = 'Le nombre de jours doit être supérieur à 0'
    }
    
    if (!workEntry.workDescription.trim()) {
      newErrors.workDescription = 'La description du travail est requise'
    }
    
    if (workEntry.additionalCharges < 0) {
      newErrors.additionalCharges = 'Les charges supplémentaires ne peuvent pas être négatives'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle work entry submission
  const handleAddWorkEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateWorkEntry()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/work-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(workEntry)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Calculate total cost for this entry
      const totalCost = (workEntry.daysWorked * (currentUser?.dailyRate || 450)) + workEntry.additionalCharges
      
      // Extraire month et year de la date
      const entryDate = new Date(workEntry.date)
      const month = entryDate.getMonth() + 1
      const year = entryDate.getFullYear()
      
      // Add new work log
      const newWorkLog: WorkLog = {
        id: Date.now().toString(),
        month: month,
        year: year,
        date: workEntry.date, // Garder la date dans les détails
        daysWorked: workEntry.daysWorked,
        workDescription: workEntry.workDescription,
        additionalCharges: workEntry.additionalCharges,
        totalCost: totalCost,
        weekendWork: workEntry.weekendWork,
        absences: workEntry.absences,
        workType: workEntry.workType
      }
      
      setWorkLogs(prev => [newWorkLog, ...prev])
      
      // Reset form
      setWorkEntry({
        date: (() => {
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })(),
        daysWorked: 1,
        workDescription: '',
        additionalCharges: 0,
        weekendWork: 0,
        absences: 0,
        workType: 'Travaux internes (Consultants)'
      })
      
      setShowAddModal(false)
      setErrors({})
    } catch (error) {
      console.error('Error adding work entry:', error)
      setErrors({ submit: 'Erreur lors de l\'ajout de l\'entrée de travail' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    {currentUser?.firstName[0]}{currentUser?.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(currentUser?.role || '')}`}>
                      {currentUser?.role}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{currentUser?.location}</span>
                  </div>
                </div>
              </div>
            
             {/* Quick Stats */}
             <div className="hidden lg:flex items-center space-x-4">
               {project && (
                 <motion.div 
                   className="bg-card p-4 rounded-lg border border-border"
                   whileHover={{ scale: 1.02 }}
                   transition={{ duration: 0.2 }}
                 >
                   <div className="flex items-center">
                     <Briefcase className="h-8 w-8 text-primary" />
                     <div className="ml-3">
                       <p className="text-sm font-medium text-muted-foreground">Client</p>
                       <p className="text-lg font-bold text-foreground">{currentProject?.clientName}</p>
                     </div>
                   </div>
                 </motion.div>
               )}
               
               {/* Bouton Déconnexion */}
               <motion.button
                 onClick={handleLogout}
                 className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/80 transition-colors flex items-center space-x-2"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 title="Se déconnecter"
               >
                 <LogOut className="h-5 w-5" />
                 <span>Déconnexion</span>
               </motion.button>
             </div>
             
             {/* Bouton Déconnexion Mobile */}
             <div className="lg:hidden">
               <motion.button
                 onClick={handleLogout}
                 className="bg-destructive text-destructive-foreground p-2 rounded-lg hover:bg-destructive/80 transition-colors"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 title="Se déconnecter"
               >
                 <LogOut className="h-5 w-5" />
               </motion.button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <motion.div 
              className="bg-card rounded-lg shadow-sm border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center">
                  <Briefcase className="h-5 w-5 text-primary mr-2" />
                  Projet Actuel
                </h2>
                {project && currentProject && (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(currentProject.status)}`}>
                    {currentProject.status}
                  </span>
                )}
              </div>
              
              {project && currentProject ? (
                <>
                  <h3 className="text-xl font-bold text-card-foreground mb-2">{currentProject.name}</h3>
                  <p className="text-muted-foreground mb-4">{currentProject.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium text-card-foreground">{currentProject.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de début</p>
                      <p className="font-medium text-card-foreground">
                        {currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString('fr-FR') : 'Non définie'}
                      </p>
                    </div>
                    {currentProject.endDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date de fin</p>
                        <p className="font-medium text-card-foreground">{new Date(currentProject.endDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">Aucun projet assigné</h3>
                  <p className="text-muted-foreground">
                    Vous n'êtes pas encore assigné à un projet. Contactez votre manager pour plus d'informations.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div 
              className="bg-card rounded-lg shadow-sm border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-card-foreground mb-6">Informations de Contact</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentUser?.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentUser?.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentUser?.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Time & Charges Table - Full Width */}
        <div className="mt-8">
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="px-6 py-4 border-b border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">Journal de Travail</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Données chargées depuis le backend
                  </p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={loadWorkLogsFromBackend}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Rafraîchir les données">
                    <RefreshCw className="h-4 w-4" />
                    <span>Actualiser</span>
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/consultant/timesheet')}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </motion.button>
                </div>
              </div>
            </div>
              
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Mois
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                      Jour de travail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                  Nbre travaillés en W.E.(jours)
                  
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Type d'absence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                      Jours d'absence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">
                      Saisie de Type de Travail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-36">
                      Jours de Type de Travail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {groupedWorkLogs.map((log) => (
                    <motion.tr 
                      key={log.id}
                      className="hover:bg-muted/50"
                      whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                      transition={{ duration: 0.2 }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {log.monthName || new Date(log.year, log.month - 1, 1).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {log.daysWorked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {log.weekendWork > 0 ? log.weekendWork : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {log.absenceType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {log.absences > 0 ? log.absences : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {log.workType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {(log.workTypeDays || 0) > 0 ? `${log.workTypeDays} jour(s)` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        <div className="flex space-x-2">
                          {/* Bouton Modifier */}
                          <motion.button
                            onClick={() => handleEditWorkLog(log)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Modifier les jours de ce mois">
                            <Upload className="h-4 w-4" />
                            <span>Modifier</span>
                          </motion.button>
                          
                          {/* Bouton Envoyer par email */}
                          <motion.button
                            onClick={() => handleSendReport(log)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Envoyer le rapport au client, comptable, RH et manager par email">
                            <Send className="h-4 w-4" />
                            <span>Envoyer</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Add Work Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Ajouter une Entrée de Travail</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddWorkEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={workEntry.date}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.date ? 'border-destructive' : 'border-border'
                  }`}/>
                {errors.date && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.date}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Heures travaillées *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={workEntry.daysWorked}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, daysWorked: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.daysWorked ? 'border-destructive' : 'border-border'
                  }`}/>
                {errors.daysWorked && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.daysWorked}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Description du travail *
                </label>
                <textarea
                  value={workEntry.workDescription}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, workDescription: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.workDescription ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Décrivez le travail effectué..."
                />
                {errors.workDescription && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.workDescription}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Charges supplémentaires (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={workEntry.additionalCharges}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, additionalCharges: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.additionalCharges ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.additionalCharges && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.additionalCharges}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Frais de déplacement, repas, etc.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Nbre travaillés en W.E.(jours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={workEntry.weekendWork}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, weekend_worked: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Absences (jours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={workEntry.absences}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, absences: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Type de travail
                </label>
                <select
                  value={workEntry.workType}
                  onChange={(e) => setWorkEntry(prev => ({ ...prev, workType: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {workTypes.length > 0 ? (
                    workTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    mockWorkTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Cost Preview */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coût estimé:</span>
                  <span className="font-medium text-primary">
                    €{((workEntry.daysWorked * (currentUser?.dailyRate || 450)) + workEntry.additionalCharges).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-primary-foreground flex items-center space-x-2 ${
                    isSubmitting 
                      ? 'bg-muted cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/80'
                  } transition-colors`}
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Ajout...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Ajouter</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              {errors.submit && (
                <motion.div 
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}

// TODO: Replace mock data with API calls
// - fetchUser() - GET /api/user/profile
// - fetchCurrentProject() - GET /api/user/current-project
// - fetchWorkLogs() - GET /api/user/work-logs
// - addWorkLog() - POST /api/user/work-logs
// - deleteWorkLog() - DELETE /api/user/work-logs/:id
