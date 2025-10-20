'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDateKey, isSameDay } from '@/lib/date-utils'
import { WorkScheduleAPI, WorkTypeAPI, LeaveTypeAPI } from '@/lib/api'
import { 
  Plus, 
  Calendar, 
  Briefcase,
  Car,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  Upload,
  FileText,
  Image,
  Trash2,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react'

// TypeScript Interfaces
interface Project {
  id: string
  name: string
  clientName: string
  status: 'Active' | 'Completed' | 'On Hold'
}

interface TravelExpense {
  id: string
  amount: number
  description: string
  receipts: File[]
}

interface WorkType {
  id: number
  name: string
}

interface LeaveType {
  id: number
  name: string
}

interface TimeEntry {
  id: string
  date: string
  projectId: string
  task: string
  description: string
  workType: number
  leaveType?: number
  travelExpenses: TravelExpense[]
  period: 'morning' | 'evening'
  // Propriétés pour les congés mensuels
  month?: number
  year?: number
  daysWorked?: number
  absences?: number
  weekendWork?: number
}

interface DayPeriod {
  date: string
  period: 'morning' | 'evening'
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm'
  confirmText?: string
  cancelText?: string
}

// Custom Modal Component
const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'confirm':
        return <AlertTriangle className="h-6 w-6 text-blue-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'error':
        return 'bg-red-100'
      case 'confirm':
        return 'bg-blue-100'
      default:
        return 'bg-blue-100'
    }
  }

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            {/* Content */}
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBgColor()} flex items-center justify-center`}>
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <div className="flex space-x-3 justify-end">
                {onConfirm && (
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {cancelText}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => {
                    if (onConfirm) {
                      onConfirm()
                    }
                    onClose()
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${getConfirmButtonColor()}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

// File Upload Component
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  existingFiles: File[]
  onFileRemove: (index: number) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, existingFiles, onFileRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      return isImage || isPDF
    })
    
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      return isImage || isPDF
    })
    
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />
    }
    return <FileText className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Glissez-déposez vos justificatifs ici ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Formats acceptés : JPG, PNG, PDF (max 10MB par fichier)
        </p>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choisir des fichiers
        </label>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Justificatifs ajoutés :</h4>
          {existingFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <motion.button
                onClick={() => onFileRemove(index)}
                className="text-red-600 hover:text-red-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Supprimer le fichier"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock Data
const mockTimeEntries: TimeEntry[] = []

export default function TimesheetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  
  const [selectedDayPeriods, setSelectedDayPeriods] = useState<DayPeriod[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [navigationLoading, setNavigationLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)
  const [showLeaveCalendar, setShowLeaveCalendar ] = useState(false)
  const [selectedLeaveDays, setSelectedLeaveDays] = useState<DayPeriod[]>([])
  const [showWorkTypeCalendar, setShowWorkTypeCalendar] = useState(false)
  const [selectedWorkTypeDays, setSelectedWorkTypeDays] = useState<DayPeriod[]>([])
  const [editingWorkLog, setEditingWorkLog] = useState<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // État pour les jours déjà enregistrés dans la base de données
  const [savedWorkDays, setSavedWorkDays] = useState<DayPeriod[]>([])
  
  // États pour les jours des types de travail et congés séparément
  const [savedWorkTypeDays, setSavedWorkTypeDays] = useState<DayPeriod[]>([])
  const [savedLeaveTypeDays, setSavedLeaveTypeDays] = useState<DayPeriod[]>([])
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm'
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })
  
  const [formData, setFormData] = useState({
    projectId: '1', // Projet par défaut: Refonte E-commerce
    task: 'Développement Frontend',
    description: 'Implémentation des composants React pour la page produit, optimisation des performances et intégration des fonctionnalités de paiement. Tests unitaires et validation des interactions utilisateur.',
    workType: 1, // Type de travail par défaut: Travaux internes (Consultants)
    leaveType: 0, // Type de congé (optionnel)
    travelExpenses: [] as TravelExpense[]
  })

  // Charger les données du backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Charger les types de travail, de congés ET les work schedules déjà enregistrés
        const [workTypesResponse, leaveTypesResponse, workSchedulesResponse] = await Promise.all([
          WorkTypeAPI.all(),
          LeaveTypeAPI.all(),
          WorkScheduleAPI.mine()
        ])
        
        console.log('🔍 Réponse WorkTypeAPI:', workTypesResponse)
        console.log('🔍 Réponse LeaveTypeAPI:', leaveTypesResponse)
        console.log('🔍 Réponse WorkScheduleAPI:', workSchedulesResponse)
        
        // Vérifier que les données sont bien des tableaux
        const workTypesData = Array.isArray(workTypesResponse) 
          ? workTypesResponse 
          : Array.isArray(workTypesResponse.data) 
            ? workTypesResponse.data 
            : []
            
        const leaveTypesData = Array.isArray(leaveTypesResponse) 
          ? leaveTypesResponse 
          : Array.isArray(leaveTypesResponse.data) 
            ? leaveTypesResponse.data 
            : []
        
        // Extraire les work schedules
        const workSchedulesData = Array.isArray(workSchedulesResponse)
          ? workSchedulesResponse
          : Array.isArray(workSchedulesResponse.data)
            ? workSchedulesResponse.data
            : []
        
        setWorkTypes(workTypesData)
        setLeaveTypes(leaveTypesData)
        
        // Extraire les jours enregistrés depuis selected_days
        const savedDays: DayPeriod[] = []
        const savedWorkTypeDays: DayPeriod[] = []
        const savedLeaveTypeDays: DayPeriod[] = []
        
        workSchedulesData.forEach((schedule: any) => {
          // Si period est fourni (ancien système par période)
          if (schedule.date && schedule.period) {
            savedDays.push({
              date: schedule.date,
              period: schedule.period
            })
          }
          
          // Si selected_days existe (nouveau système mensuel avec jours exacts)
          if (schedule.selected_days) {
            try {
              const selectedDaysData = typeof schedule.selected_days === 'string'
                ? JSON.parse(schedule.selected_days)
                : schedule.selected_days
              
              if (Array.isArray(selectedDaysData)) {
                selectedDaysData.forEach((dayPeriod: any) => {
                  if (dayPeriod.date && dayPeriod.period) {
                    savedDays.push({
                      date: dayPeriod.date,
                      period: dayPeriod.period
                    })
                  }
                })
              }
            } catch (e) {
              console.error('Erreur parsing selected_days:', e)
            }
          }
          
          // Si work_type_selected_days existe (jours sélectionnés pour types de travail)
          if (schedule.work_type_selected_days) {
            try {
              const workTypeDaysData = typeof schedule.work_type_selected_days === 'string'
                ? JSON.parse(schedule.work_type_selected_days)
                : schedule.work_type_selected_days
              
              if (Array.isArray(workTypeDaysData)) {
                workTypeDaysData.forEach((dayPeriod: any) => {
                  if (dayPeriod.date && dayPeriod.period) {
                    savedWorkTypeDays.push({
                      date: dayPeriod.date,
                      period: dayPeriod.period
                    })
                  }
                })
              }
            } catch (e) {
              console.error('Erreur parsing work_type_selected_days:', e)
            }
          }
          
          // Si leave_type_selected_days existe (jours sélectionnés pour congés)
          if (schedule.leave_type_selected_days) {
            try {
              const leaveTypeDaysData = typeof schedule.leave_type_selected_days === 'string'
                ? JSON.parse(schedule.leave_type_selected_days)
                : schedule.leave_type_selected_days
              
              if (Array.isArray(leaveTypeDaysData)) {
                leaveTypeDaysData.forEach((dayPeriod: any) => {
                  if (dayPeriod.date && dayPeriod.period) {
                    savedLeaveTypeDays.push({
                      date: dayPeriod.date,
                      period: dayPeriod.period
                    })
                  }
                })
              }
            } catch (e) {
              console.error('Erreur parsing leave_type_selected_days:', e)
            }
          }
        })
        
        setSavedWorkDays(savedDays)
        setSavedWorkTypeDays(savedWorkTypeDays)
        setSavedLeaveTypeDays(savedLeaveTypeDays)
        
        console.log('✅ Types chargés:', {
          workTypes: workTypesData.length,
          leaveTypes: leaveTypesData.length,
          workTypesData: workTypesData,
          leaveTypesData: leaveTypesData,
          savedWorkDays: savedDays.length,
          savedWorkTypeDays: savedWorkTypeDays.length,
          savedLeaveTypeDays: savedLeaveTypeDays.length,
          schedules: workSchedulesData.length
        })
        
        console.log('📅 Détails savedWorkDays:', savedDays)
        console.log('🔵 Détails savedWorkTypeDays:', savedWorkTypeDays)
        console.log('🔴 Détails savedLeaveTypeDays:', savedLeaveTypeDays)
        console.log('📊 Work Schedules bruts:', workSchedulesData)
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Modal helper functions
  const showModal = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm' = 'info',
    onConfirm?: () => void,
    confirmText: string = 'OK',
    cancelText: string = 'Annuler'
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirmer',
    cancelText: string = 'Annuler'
  ) => {
    showModal(title, message, 'confirm', onConfirm, confirmText, cancelText)
  }

  const showSuccess = (title: string, message: string) => {
    showModal(title, message, 'success')
  }

  const showWarning = (title: string, message: string) => {
    showModal(title, message, 'warning')
  }

  const showError = (title: string, message: string) => {
    showModal(title, message, 'error')
  }

  const showInfo = (title: string, message: string) => {
    showModal(title, message, 'info')
  }

  // Initialize client-side state
  React.useEffect(() => {
    setIsClient(true)
    setCurrentMonth(new Date())
    
    // Check if we're in edit mode
    if (isEditMode && typeof window !== 'undefined') {
      const editData = localStorage.getItem('timesheet-edit-data')
      if (editData) {
        try {
          const parsedEditData = JSON.parse(editData)
          const workLog = parsedEditData.workLog
          
          setEditingWorkLog(workLog)
          
          // Pre-fill form with work log data
          if (workLog.details && workLog.details.length > 0) {
            // For grouped entries, load all related day periods
            const dayPeriods: DayPeriod[] = []
            workLog.details.forEach((detail: any) => {
              dayPeriods.push({ date: detail.date, period: detail.period })
            })
            setSelectedDayPeriods(dayPeriods)
            
            // Use data from first detail for form
            const firstDetail = workLog.details[0]
            setFormData({
              projectId: firstDetail.projectId || '1',
              task: firstDetail.task || 'Développement Frontend',
              description: firstDetail.description || '',
              workType: firstDetail.workType || '1',
              leaveType: firstDetail.leaveType || '',
              travelExpenses: firstDetail.travelExpenses || []
            })
          } else {
            // For single entries
            setFormData({
              projectId: workLog.projectId || '1',
              task: workLog.task || 'Développement Frontend',
              description: workLog.workDescription || '',
              workType: workLog.workType || '1',
              leaveType: workLog.leaveType || '',
              travelExpenses: workLog.travelExpenses || []
            })
          }
          
          // Set current month to the work log's month
          if (workLog.month && workLog.year) {
            setCurrentMonth(new Date(workLog.year, workLog.month - 1, 1))
          } else if (workLog.date) {
            const workLogDate = new Date(workLog.date)
            setCurrentMonth(workLogDate)
          }
          
        } catch (error) {
          console.error('Error loading edit data:', error)
          showError('Erreur', 'Impossible de charger les données à modifier')
        }
      }
    } else {
      // Clear all saved data on first load to start fresh (only if not in edit mode)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('timesheet-entries')
        // Clear any other related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('timesheet-') || key.startsWith('leave-')) {
            localStorage.removeItem(key)
          }
        })
      }
    }
    
    // Start with empty entries - REMOVED setTimeEntries([]) as per user request
    // setTimeEntries([])
  }, [isEditMode])

  // Charger automatiquement les jours enregistrés en mode édition quand savedWorkDays est chargé
  useEffect(() => {
    if (isEditMode && savedWorkDays.length > 0 && typeof window !== 'undefined') {
      const editData = localStorage.getItem('timesheet-edit-data')
      if (editData) {
        try {
          const parsedEditData = JSON.parse(editData)
          const workLog = parsedEditData.workLog
          
          const currentMonthNum = workLog.month || new Date(workLog.date).getMonth() + 1
          const currentYear = workLog.year || new Date(workLog.date).getFullYear()
          
          const monthSavedDays = savedWorkDays.filter(dp => {
            const dpDate = new Date(dp.date)
            return dpDate.getMonth() + 1 === currentMonthNum && dpDate.getFullYear() === currentYear
          })
          
          console.log('🔍 Mode édition - Recherche des jours pour:', { month: currentMonthNum, year: currentYear })
          console.log('🔍 savedWorkDays total:', savedWorkDays.length)
          console.log('🔍 monthSavedDays trouvés:', monthSavedDays.length)
          
          if (monthSavedDays.length > 0) {
            // Retirer de savedWorkDays et ajouter à selectedDayPeriods
            setSavedWorkDays(prev => prev.filter(dp => {
              const dpDate = new Date(dp.date)
              return !(dpDate.getMonth() + 1 === currentMonthNum && dpDate.getFullYear() === currentYear)
            }))
            setSelectedDayPeriods(monthSavedDays)
            
            showSuccess(
              'Mode édition activé',
              `${monthSavedDays.length} période(s) chargée(s) pour modification du mois : ${workLog.monthName || new Date(workLog.year, workLog.month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
            )
          } else {
            showInfo(
              'Mode édition',
              `Aucun jour enregistré trouvé pour : ${workLog.monthName || new Date(workLog.year, workLog.month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}. Vous pouvez créer de nouvelles sélections.`
            )
          }
        } catch (error) {
          console.error('Error in edit mode auto-load:', error)
        }
      }
    }
  }, [savedWorkDays, isEditMode])

  // SUPPRIMÉ: Ne plus sauvegarder automatiquement dans localStorage
  // Les sélections restent uniquement en mémoire (état React) jusqu'au clic sur "Valider et envoyer le CRA"

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }



  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    if (!currentMonth || navigationLoading) return
    
    setNavigationLoading(true)
    
    // Utiliser setTimeout pour éviter le blocage de l'UI
    setTimeout(() => {
      setCurrentMonth(prev => {
        if (!prev) return new Date()
        const newMonth = new Date(prev)
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1)
        } else {
          newMonth.setMonth(prev.getMonth() + 1)
        }
        return newMonth
      })
      
      // Arrêter le loading après un court délai
      setTimeout(() => {
        setNavigationLoading(false)
      }, 100)
    }, 0)
  }, [currentMonth, navigationLoading])

  // Handle day period selection
  const handleDayPeriodClick = (date: Date, period: 'morning' | 'evening') => {
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}). Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    
    // Vérifier si ce jour/période est déjà enregistré dans la base de données
    const isAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === period)
    if (isAlreadySaved) {
      showWarning(
        'Période déjà enregistrée',
        `Cette période (${period === 'morning' ? 'Matin' : 'Soir'} du ${date.toLocaleDateString('fr-FR')}) a déjà été enregistrée. Pour la modifier, utilisez le bouton "Modifier" dans le dashboard.`
      )
      return
    }
    
    const dayPeriod: DayPeriod = { date: dateKey, period }
    
    setSelectedDayPeriods(prev => {
      const isSelected = prev.some(dp => dp.date === dateKey && dp.period === period)
      if (isSelected) {
        return prev.filter(dp => !(dp.date === dateKey && dp.period === period))
      } else {
        return [...prev, dayPeriod]
      }
    })
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle full day selection (both morning and evening)
  const handleFullDayClick = (date: Date) => {
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}). Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    
    // Vérifier si l'une des périodes est déjà enregistrée dans la base de données
    const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'morning')
    const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'evening')
    
    if (morningAlreadySaved || eveningAlreadySaved) {
      const periodsText = morningAlreadySaved && eveningAlreadySaved 
        ? 'Les deux périodes (Matin et Soir)'
        : morningAlreadySaved 
          ? 'La période du matin'
          : 'La période du soir'
      
      showWarning(
        'Période déjà enregistrée',
        `${periodsText} de ce jour (${date.toLocaleDateString('fr-FR')}) a déjà été enregistrée dans la base de données.`
      )
      return
    }
    
    const morningSelected = isDayPeriodSelected(date, 'morning')
    const eveningSelected = isDayPeriodSelected(date, 'evening')
    
    setSelectedDayPeriods(prev => {
      // If both periods are selected, deselect both
      if (morningSelected && eveningSelected) {
        return prev.filter(dp => !(dp.date === dateKey))
      }
      // If neither or only one is selected, select both
      else {
        const newPeriods = prev.filter(dp => !(dp.date === dateKey))
        return [...newPeriods, 
          { date: dateKey, period: 'morning' as const },
          { date: dateKey, period: 'evening' as const }
        ]
      }
    })
  }

  // Handle select all weekdays (Monday to Friday) for the current month
  const handleSelectAllWeekdays = () => {
    if (!currentMonth) return 
    
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const newDayPeriods: DayPeriod[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dateKey = formatDateKey(date)
      
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if this day is already recorded in timeEntries
        const hasRecordedEntries = timeEntries.some(entry => entry.date === dateKey)
        
        // Vérifier si les périodes ne sont pas déjà sauvegardées dans la base de données
        const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'morning')
        const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'evening')
        
        // Only add if not already recorded and not already saved
        if (!hasRecordedEntries) {
          if (!morningAlreadySaved) {
            newDayPeriods.push({ date: dateKey, period: 'morning' as const })
          }
          if (!eveningAlreadySaved) {
            newDayPeriods.push({ date: dateKey, period: 'evening' as const })
          }
        }
      }
    }
    
    // Add all weekdays without removing existing selections
    setSelectedDayPeriods(prev => [...prev, ...newDayPeriods])
  }

  // Handle select all weekends (Saturday and Sunday) for the current month
  const handleSelectAllWeekends = () => {
    if (!currentMonth) return
    
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const newDayPeriods: DayPeriod[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dateKey = formatDateKey(date)
      
      // Select only Saturday (6) and Sunday (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Check if this day is already recorded in timeEntries
        const hasRecordedEntries = timeEntries.some(entry => entry.date === dateKey)
        
        // Vérifier si les périodes ne sont pas déjà sauvegardées dans la base de données
        const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'morning')
        const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'evening')
        
        // Only add if not already recorded and not already saved
        if (!hasRecordedEntries) {
          if (!morningAlreadySaved) {
            newDayPeriods.push({ date: dateKey, period: 'morning' as const })
          }
          if (!eveningAlreadySaved) {
            newDayPeriods.push({ date: dateKey, period: 'evening' as const })
          }
        }
      }
    }
    
    // Add all weekends without removing existing selections
    setSelectedDayPeriods(prev => [...prev, ...newDayPeriods])
  }

  // Handle select all days (weekdays + weekends) for the current month
  const handleSelectAllDays = () => {
    if (!currentMonth) return
    
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const newDayPeriods: DayPeriod[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = formatDateKey(date)
      
      // Check if this day is already recorded in timeEntries
      const hasRecordedEntries = timeEntries.some(entry => entry.date === dateKey)
      
      // Vérifier si les périodes ne sont pas déjà sauvegardées dans la base de données
      const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'morning')
      const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dateKey && dp.period === 'evening')
      
      // Only add if not already recorded and not already saved
      if (!hasRecordedEntries) {
        if (!morningAlreadySaved) {
          newDayPeriods.push({ date: dateKey, period: 'morning' as const })
        }
        if (!eveningAlreadySaved) {
          newDayPeriods.push({ date: dateKey, period: 'evening' as const })
        }
      }
    }
    
    // Add all days without removing existing selections
    setSelectedDayPeriods(prev => [...prev, ...newDayPeriods])
  }

  // Handle clear all selected day periods
  const handleClearAllSelections = () => {
    showConfirm(
      'Effacer les sélections',
      'Êtes-vous sûr de vouloir effacer toutes les sélections ?',
      () => {
        setSelectedDayPeriods([])
      },
      'Effacer',
      'Annuler'
    )
  }

  // Get entries for selected day periods
  const getEntriesForDayPeriods = (dayPeriods: DayPeriod[]) => {
    return timeEntries.filter(entry => 
      dayPeriods.some(dp => dp.date === entry.date && dp.period === entry.period)
    )
  }

  // Calculate total expenses for selected day periods
  const getSelectedDayPeriodsTotals = () => {
    const entries = getEntriesForDayPeriods(selectedDayPeriods)
    const totalExpenses = entries.reduce((sum, entry) => 
      sum + entry.travelExpenses.reduce((entrySum, expense) => entrySum + expense.amount, 0), 0
    )
    return { totalExpenses }
  }

  // Calculate total expenses for current form
  const getFormTravelExpensesTotal = () => {
    return formData.travelExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Calculate working days for current month
  const getWorkingDaysForCurrentMonth = () => {
    if (!currentMonth) return 0
    
    const currentMonthPeriods = selectedDayPeriods.filter(dayPeriod => {
      const dayPeriodDate = new Date(dayPeriod.date)
      return dayPeriodDate.getFullYear() === currentMonth.getFullYear() && 
             dayPeriodDate.getMonth() === currentMonth.getMonth()
    })
    
    // Get unique dates (days) from selected periods
    const uniqueDays = new Set(currentMonthPeriods.map(period => period.date))
    return uniqueDays.size
  }

  // SUPPRIMÉ: getLeaveEntriesByType() - N'est plus nécessaire car on affiche directement selectedLeaveDays
  // SUPPRIMÉ: getWorkTypeEntriesByType() - N'est plus nécessaire car on affiche directement selectedWorkTypeDays

  // Get all months with selected periods
  const getAllMonthsWithPeriods = () => {
    const monthsMap = new Map()
    
    // Liste des jours de la semaine
    const weekDays = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
    const weekendDays = ['di', 'sa'] // dimanche et samedi
    const workingDays = ['lu', 'ma', 'me', 'je', 've'] // lundi à vendredi
    
    selectedDayPeriods.forEach(dayPeriod => {
      const date = new Date(dayPeriod.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          name: monthName,
          periods: []
        })
      }
      monthsMap.get(monthKey).periods.push(dayPeriod)
    })
    
    return Array.from(monthsMap.values()).map(month => {
      const uniqueDays = new Set(month.periods.map((period: DayPeriod) => period.date))
      
      // Compter les jours de semaine (lundi à vendredi)
      const workingDaysCount = Array.from(uniqueDays).filter(dateStr => {
        const date = new Date(dateStr as string)
        const dayOfWeek = date.getDay()
        const dayName = weekDays[dayOfWeek]
        return workingDays.includes(dayName)
      }).length
      
      // Compter les week-ends (dimanche et samedi)
      const weekendDaysCount = Array.from(uniqueDays).filter(dateStr => {
        const date = new Date(dateStr as string)
        const dayOfWeek = date.getDay()
        const dayName = weekDays[dayOfWeek]
        return weekendDays.includes(dayName)
      }).length
      
      return {
        name: month.name,
        workingDays: workingDaysCount,
        weekendDays: weekendDaysCount,
        totalDays: uniqueDays.size
      }
    })
  }

  // Check if a day period is selected
  const isDayPeriodSelected = (date: Date, period: 'morning' | 'evening') => {
    const dateKey = formatDateKey(date)
    return selectedDayPeriods.some(dp => dp.date === dateKey && dp.period === period)
  }

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    let processedValue = value
    
    // Convert string values to numbers for workType and leaveType
    if (field === 'workType') {
      processedValue = parseInt(value) || 1
    } else if (field === 'leaveType') {
      processedValue = parseInt(value) || 0
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle travel expense changes
  const handleTravelExpenseChange = (expenseId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      travelExpenses: prev.travelExpenses.map(expense =>
        expense.id === expenseId ? { ...expense, [field]: value } : expense
      )
    }))
  }

  // Add new travel expense
  const addTravelExpense = () => {
    const newExpense: TravelExpense = {
      id: Date.now().toString(),
      amount: 0,
      description: '',
      receipts: []
    }
    setFormData(prev => ({
      ...prev,
      travelExpenses: [...prev.travelExpenses, newExpense]
    }))
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Remove travel expense
  const removeTravelExpense = (expenseId: string) => {
    setFormData(prev => ({
      ...prev,
      travelExpenses: prev.travelExpenses.filter(expense => expense.id !== expenseId)
    }))
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle file upload for travel expense
  const handleTravelExpenseFiles = (expenseId: string, files: File[]) => {
    setFormData(prev => ({
      ...prev,
      travelExpenses: prev.travelExpenses.map(expense =>
        expense.id === expenseId 
          ? { ...expense, receipts: [...expense.receipts, ...files] }
          : expense
      )
    }))
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Remove file from travel expense
  const removeTravelExpenseFile = (expenseId: string, fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      travelExpenses: prev.travelExpenses.map(expense =>
        expense.id === expenseId 
          ? { ...expense, receipts: expense.receipts.filter((_, index) => index !== fileIndex) }
          : expense
      )
    }))
  }

  // Handle leave day period selection (matin/soir)
  const handleLeaveDayPeriodClick = (date: Date, period: 'morning' | 'evening') => {
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}) pour les congés. Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    setSelectedLeaveDays(prev => {
      const existingIndex = prev.findIndex(dp => dp.date === dateKey && dp.period === period)
      if (existingIndex !== -1) {
        // Remove if already selected
        return prev.filter((_, idx) => idx !== existingIndex)
      } else {
        // Add new period
        return [...prev, { date: dateKey, period }]
      }
    })
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle leave day selection (kept for compatibility, but now uses both periods)
  const handleLeaveDayClick = (date: Date) => {
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}) pour les congés. Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    setSelectedLeaveDays(prev => {
      const hasMorning = prev.some(dp => dp.date === dateKey && dp.period === 'morning')
      const hasEvening = prev.some(dp => dp.date === dateKey && dp.period === 'evening')
      
      if (hasMorning && hasEvening) {
        // Remove both periods
        return prev.filter(dp => dp.date !== dateKey)
      } else {
        // Add missing periods
        const newPeriods = []
        if (!hasMorning) newPeriods.push({ date: dateKey, period: 'morning' as const })
        if (!hasEvening) newPeriods.push({ date: dateKey, period: 'evening' as const })
        return [...prev, ...newPeriods]
      }
    })
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle work type day period selection (matin/soir)
  const handleWorkTypeDayPeriodClick = (date: Date, period: 'morning' | 'evening') => {
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}) pour le type de travail. Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    setSelectedWorkTypeDays(prev => {
      const existingIndex = prev.findIndex(dp => dp.date === dateKey && dp.period === period)
      if (existingIndex !== -1) {
        // Remove if already selected
        return prev.filter((_, idx) => idx !== existingIndex)
      } else {
        // Add new period
        return [...prev, { date: dateKey, period }]
      }
    })
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Handle work type day selection (kept for compatibility, but now uses both periods)
  const handleWorkTypeDayClick = (date: Date) => { 
    // Vérifier si la date est trop éloignée dans le futur (plus de 2 ans)
    const today = new Date()
    const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    
    if (date > twoYearsFromNow) {
      alert(`⚠️ Impossible de sélectionner une date trop éloignée (${date.toLocaleDateString('fr-FR')}) pour le type de travail. Veuillez sélectionner une date dans les 2 prochaines années.`)
      return
    }
    
    const dateKey = formatDateKey(date)
    setSelectedWorkTypeDays(prev => {
      const hasMorning = prev.some(dp => dp.date === dateKey && dp.period === 'morning')
      const hasEvening = prev.some(dp => dp.date === dateKey && dp.period === 'evening')
      
      if (hasMorning && hasEvening) {
        // Remove both periods
        return prev.filter(dp => dp.date !== dateKey)
      } else {
        // Add missing periods
        const newPeriods = []
        if (!hasMorning) newPeriods.push({ date: dateKey, period: 'morning' as const })
        if (!hasEvening) newPeriods.push({ date: dateKey, period: 'evening' as const })
        return [...prev, ...newPeriods]
      }
    })
    
    if (isEditMode) {
      setHasUnsavedChanges(true)
    }
  }

  // Clear leave selection and remove from localStorage
  const handleClearLeaveSelection = () => {
    if (selectedLeaveDays.length === 0 && !formData.leaveType) {
      showInfo('Information', 'Aucun congé à effacer')
      return
    }

    const leaveTypeName = leaveTypes.find(lt => lt.id === formData.leaveType)?.name || 'sélectionné'
    const confirmMessage = selectedLeaveDays.length > 0 
      ? `Êtes-vous sûr de vouloir effacer le type de congé "${leaveTypeName}" et les ${selectedLeaveDays.length} jour(s) sélectionné(s) ?`
      : `Êtes-vous sûr de vouloir effacer le type de congé "${leaveTypeName}" ?`

    showConfirm(
      'Effacer les congés',
      confirmMessage,
      () => {
        // Clear current selection
        setSelectedLeaveDays([])
        setFormData(prev => ({ ...prev, leaveType: 0 }))
        
        // Remove leave entries from timeEntries and update localStorage - REMOVED as per user request
        // setTimeEntries(prev => {
        //   const updatedEntries = prev.filter(entry => !entry.leaveType || entry.leaveType === '')
        //   // Update localStorage
        //   if (typeof window !== 'undefined') {
        //     localStorage.setItem('timesheet-entries', JSON.stringify(updatedEntries))
        //   }
        //   return updatedEntries
        // })
        
        showSuccess('Succès', 'Sélection de congé effacée avec succès!')
      },
      'Effacer',
      'Annuler'
    )
  }

  // Clear work type selection
  const handleClearWorkTypeSelection = () => {
    if (selectedWorkTypeDays.length === 0 && !formData.workType) {
      showInfo('Information', 'Aucun type de travail à effacer')
      return
    }

    const workTypeName = workTypes.find(wt => wt.id === formData.workType)?.name || 'sélectionné'
    const confirmMessage = selectedWorkTypeDays.length > 0 
      ? `Êtes-vous sûr de vouloir effacer le type de travail "${workTypeName}" et les ${selectedWorkTypeDays.length} jour(s) sélectionné(s) ?`
      : `Êtes-vous sûr de vouloir effacer le type de travail "${workTypeName}" ?`

    showConfirm(
      'Effacer le type de travail',
      confirmMessage,
      () => {
        // Clear current selection
        setSelectedWorkTypeDays([])
        setFormData(prev => ({ ...prev, workType: 1 })) // Reset to default
        
        showSuccess('Succès', 'Sélection de type de travail effacée avec succès!')
      },
      'Effacer',
      'Annuler'
    )
  }

  // Handle save all modifications in edit mode
  const handleSaveAllModifications = () => {
    if (!isEditMode || !editingWorkLog) {
      showError('Erreur', 'Aucune donnée à modifier')
      return
    }

    // Check if there are any changes to save
    const hasChanges = selectedDayPeriods.length > 0 || 
                      selectedLeaveDays.length > 0 || 
                      selectedWorkTypeDays.length > 0 ||
                      formData.travelExpenses.length > 0

    if (!hasChanges) {
      showInfo('Information', 'Aucune modification détectée')
      return
    }

    showConfirm(
      'Enregistrer les modifications',
      'Voulez-vous enregistrer toutes les modifications apportées ?',
      async () => {
        // Envoyer directement au backend
        if (typeof window !== 'undefined') {
          // Create new entries based on current selections
          const newEntries: TimeEntry[] = []
          
          // Add work entries from selected day periods
          selectedDayPeriods.forEach(dayPeriod => {
            const newEntry: TimeEntry = {
              id: `${Date.now()}-${dayPeriod.date}-${dayPeriod.period}`,
              date: dayPeriod.date,
              projectId: formData.projectId,
              task: formData.task,
              description: formData.description,
              workType: formData.workType,
              travelExpenses: formData.travelExpenses,
              period: dayPeriod.period
            }
            newEntries.push(newEntry)
          })
          
          // Grouper les congés par mois au lieu de créer des entrées individuelles
          if (selectedLeaveDays.length > 0 && formData.leaveType) {
            // Convertir DayPeriod[] en string[] pour la compatibilité avec groupLeaveDaysByMonth
            const leaveDaysStrings = selectedLeaveDays.map(dp => dp.date)
            const leaveEntriesByMonth = groupLeaveDaysByMonth(leaveDaysStrings, formData.leaveType)
            newEntries.push(...leaveEntriesByMonth)
          }
          
          // Add work type entries with periods
          selectedWorkTypeDays.forEach(dayPeriod => {
            const selectedWorkType = workTypes.find(wt => wt.id === formData.workType)
            if (selectedWorkType) {
              newEntries.push({
                id: `work-${dayPeriod.period}-${Date.now()}-${dayPeriod.date}`,
                date: dayPeriod.date,
                projectId: formData.projectId,
                task: formData.task,
                description: formData.description,
                workType: formData.workType,
                travelExpenses: [],
                period: dayPeriod.period
              })
            }
          })
            
            // Envoyer directement au backend
          if (newEntries.length > 0) {
            await sendToBackend(newEntries)
          }
          
          // Clear edit data
          localStorage.removeItem('timesheet-edit-data')
        }
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false)
        
        showSuccess(
          'Modifications enregistrées',
          'Toutes les modifications ont été enregistrées avec succès! Redirection vers le dashboard...'
        )
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/consultant/dashboard')
        }, 1500)
      },
      'Enregistrer',
      'Annuler'
    )
  }

  // Clear all data including cookies/localStorage
  const handleClearAllData = () => {
    const confirmMessage = `Cette action va effacer TOUTES les données :
• Tous les congés enregistrés
• Toutes les saisies de temps
• Toutes les sélections
• Les données sauvegardées dans le navigateur

Cette action est IRRÉVERSIBLE. Continuer ?`

    showConfirm(
      '⚠️ ATTENTION',
      confirmMessage,
      () => {
        // Clear all state
        setSelectedLeaveDays([])
        setSelectedWorkTypeDays([])
        setSelectedDayPeriods([])
        // setTimeEntries([]) - REMOVED as per user request
        setFormData({
          projectId: '1',
          task: 'Développement Frontend',
          description: 'Implémentation des composants React pour la page produit, optimisation des performances et intégration des fonctionnalités de paiement. Tests unitaires et validation des interactions utilisateur.',
          workType: 1,
          leaveType: 0,
          travelExpenses: []
        })
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('timesheet-entries')
          localStorage.removeItem('dashboard-work-logs')
          localStorage.removeItem('timesheet-edit-data')
          // Clear any other related localStorage items
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('timesheet-') || key.startsWith('leave-') || key.startsWith('dashboard-')) {
              localStorage.removeItem(key)
            }
          })
        }
        
        showSuccess('Succès', 'Toutes les données ont été effacées avec succès!')
      },
      'Effacer tout',
      'Annuler'
    )
  }

  // Handle leave submission - DÉSACTIVÉ: Maintenant géré par le bouton principal CRA
  const handleLeaveSubmit = async () => {
    // Cette fonction n'est plus utilisée - l'enregistrement se fait via handleWorkSubmit
  }

  // Handle work type submission - DÉSACTIVÉ: Maintenant géré par le bouton principal CRA
  const handleWorkTypeSubmit = async () => {
    // Cette fonction n'est plus utilisée - l'enregistrement se fait via handleWorkSubmit
  }

  // Validation for work form
  const validateWorkForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Check if there are any selected day periods OR leave entries
    const hasWorkEntries = selectedDayPeriods.length > 0
    const hasLeaveEntries = timeEntries.some(entry => entry.leaveType && entry.leaveType !== 0)
    
    if (!hasWorkEntries && !hasLeaveEntries) {
      newErrors.dayPeriods = 'Veuillez sélectionner au moins une période de travail ou ajouter des congés'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation for leave form
  const validateLeaveForm = (): boolean => {
    if (!formData.leaveType) {
      showWarning('Champ requis', 'Veuillez sélectionner un type de congé')
      return false
    }
    
    if (selectedLeaveDays.length === 0) {
      showWarning('Sélection requise', 'Veuillez sélectionner au moins un jour de congé dans le calendrier')
      return false
    }

    // Check for conflicts with existing entries
    const conflictingDays = selectedLeaveDays.filter(dayPeriod => {
      return timeEntries.some(entry => 
        entry.date === dayPeriod.date && entry.leaveType && entry.leaveType !== 0
      )
    })

    if (conflictingDays.length > 0) {
      const confirmMessage = `${conflictingDays.length} jour(s) ont déjà des congés enregistrés. Voulez-vous continuer ?`
      showWarning('Conflit détecté', confirmMessage)
      // Pour simplifier, on continue quand même (ou l'utilisateur peut annuler manuellement)
    }
    
    return true
  }

  // Validation for work type form
  const validateWorkTypeForm = (): boolean => {
    if (!formData.workType) {
      showWarning('Champ requis', 'Veuillez sélectionner un type de travail')
      return false
    }
    
    if (selectedWorkTypeDays.length === 0) {
      showWarning('Sélection requise', 'Veuillez sélectionner au moins un jour de travail dans le calendrier')
      return false
    }

    // Check for conflicts with existing entries
    const conflictingDays = selectedWorkTypeDays.filter(dayPeriod => {
      return timeEntries.some(entry => 
        entry.date === dayPeriod.date && !entry.leaveType
      )
    })

    if (conflictingDays.length > 0) {
      const confirmMessage = `${conflictingDays.length} jour(s) ont déjà des entrées de travail enregistrées. Voulez-vous continuer ?`
      showWarning('Conflit détecté', confirmMessage)
      // Pour simplifier, on continue quand même (ou l'utilisateur peut annuler manuellement)
    }
    
    return true
  }

  // Function to send data directly to backend
  const sendToBackend = async (data: any[]) => {
    try {
      console.log('📤 Envoi des données directement au backend:', data)
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('❌ Token d\'authentification manquant')
        throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.')
      }

      // Envoyer chaque entrée au backend (le backend gère les doublons automatiquement)
      for (const entry of data) {
        // Convertir la date au format YYYY-MM-DD si elle est au format ISO
        let formattedDate = entry.date
        if (entry.date.includes('T')) {
          formattedDate = entry.date.split('T')[0]
        }
        
        // Valider le format de date (doit être YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          console.error('❌ Format de date invalide:', formattedDate)
          continue
        }

        // Déterminer si c'est un congé
        const isLeave = entry.leaveType && entry.leaveType !== 0
        
        // Préparer les données pour l'API
        const workScheduleData = {
          date: formattedDate,
          type: isLeave ? 'vacation' as const : 'workday' as const,
          notes: JSON.stringify({
            task: entry.workDescription,
            description: entry.workDescription,
            workType: entry.workType,
            leaveType: entry.leaveType,
            daysWorked: entry.daysWorked,
            travelExpenses: entry.additionalCharges,
            weekendWork: entry.weekendWork,
            absences: entry.absences
          }),
          leave_type_id: entry.leaveType && entry.leaveType !== 0 ? entry.leaveType : null,
          absence_days: entry.absences || 0,
          // Ajouter month et year pour les congés mensuels
          month: entry.month || new Date(formattedDate).getMonth() + 1,
          year: entry.year || new Date(formattedDate).getFullYear()
        }

        // Le backend gère automatiquement les doublons avec updateOrCreate
        console.log('💾 Sauvegarde de l\'entrée pour', entry.date)
        try {
          await WorkScheduleAPI.create(workScheduleData)
          console.log('✅ Entrée sauvegardée avec succès (création ou mise à jour)')
        } catch (error: any) {
          console.error('❌ Erreur lors de la sauvegarde:', error)
          throw error
        }
      }

      console.log('✅ Toutes les données envoyées au backend avec succès')
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi au backend:', error)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erreur inconnue lors de l\'envoi'
      
      alert(`❌ Erreur lors de l'envoi au backend: ${errorMessage}`)
    }
  }

  // Handle work form submission
  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier qu'il y a au moins une sélection (calendrier principal, congés ou types de travail)
    const hasMainCalendar = selectedDayPeriods.length > 0
    const hasLeaveCalendar = selectedLeaveDays.length > 0 && formData.leaveType && formData.leaveType !== 0
    const hasWorkTypeCalendar = selectedWorkTypeDays.length > 0 && formData.workType
    
    if (!hasMainCalendar && !hasLeaveCalendar && !hasWorkTypeCalendar) {
      showWarning(
        'Aucune sélection',
        'Veuillez sélectionner au moins des périodes dans le calendrier principal, des jours de congé ou des jours de type de travail.'
      )
      return
    }
    
    // Vérifier le token d'authentification
    const token = localStorage.getItem('authToken')
    if (!token) {
      showError(
        'Non authentifié',
        'Vous devez être connecté pour enregistrer du travail. Veuillez vous reconnecter.'
      )
      router.push('/login')
      return
    }
    
    try {
      // Create entries for each selected day period (calendrier principal)
      const newEntries: TimeEntry[] = []
      
      console.log('📆 Périodes sélectionnées (calendrier principal):', selectedDayPeriods.map(dp => ({ date: dp.date, period: dp.period })))
      
      selectedDayPeriods.forEach(dayPeriod => {
        const newEntry: TimeEntry = {
          id: `${Date.now()}-${dayPeriod.date}-${dayPeriod.period}`,
          date: dayPeriod.date,
          projectId: formData.projectId,
          task: formData.task,
          description: formData.description,
          workType: formData.workType,
          travelExpenses: formData.travelExpenses,
          period: dayPeriod.period
        }
        newEntries.push(newEntry)
      })
      
      // Add leave entries grouped by month (calendrier de congés)
      if (selectedLeaveDays.length > 0 && formData.leaveType) {
        console.log('🏖️ Périodes de congés sélectionnées:', selectedLeaveDays.length, 'période(s)')
        // Convertir DayPeriod[] en string[] pour la compatibilité avec groupLeaveDaysByMonth
        const leaveDaysStrings = selectedLeaveDays.map(dp => dp.date)
        const leaveEntriesByMonth = groupLeaveDaysByMonth(leaveDaysStrings, formData.leaveType)
        newEntries.push(...leaveEntriesByMonth)
      }
      
      // Add work type entries (calendrier de types de travail) with periods
      if (selectedWorkTypeDays.length > 0) {
        console.log('💼 Périodes de type de travail sélectionnées:', selectedWorkTypeDays.length, 'période(s)')
        selectedWorkTypeDays.forEach(dayPeriod => {
          newEntries.push({
            id: `work-${dayPeriod.period}-${Date.now()}-${dayPeriod.date}`,
            date: dayPeriod.date,
            projectId: formData.projectId,
            task: formData.task,
            description: formData.description,
            workType: formData.workType,
            travelExpenses: [],
            period: dayPeriod.period
          })
        })
      }
      
      console.log('📝 Total entrées créées:', newEntries.length)
      
      // Grouper les entrées par mois et créer une seule entrée mensuelle par mois
      const monthlyEntries = groupEntriesByMonth(newEntries)

      // Compter les périodes de type de travail par mois
      const workTypeDaysByMonth = new Map<string, number>()
      selectedWorkTypeDays.forEach(dayPeriod => {
        const dateObj = new Date(dayPeriod.date)
        const month = dateObj.getMonth() + 1
        const year = dateObj.getFullYear()
        const key = `${year}-${month}`
        
        if (!workTypeDaysByMonth.has(key)) {
          workTypeDaysByMonth.set(key, 0)
        }
        // Chaque période compte comme 0.5 jour
        workTypeDaysByMonth.set(key, workTypeDaysByMonth.get(key)! + 0.5) 
      })
      
      console.log('📤 Envoi de', monthlyEntries.length, 'entrée(s) mensuelle(s) à l\'API')
      console.log('📅 Entrées mensuelles:', monthlyEntries.map(e => ({ month: e.month, year: e.year, daysWorked: e.daysWorked })))
      
      let createdCount = 0
      
      for (let i = 0; i < monthlyEntries.length; i++) {
        const entry = monthlyEntries[i]
        const key = `${entry.year}-${entry.month}`
        // Créer une entrée pour le premier jour du mois
        const firstDayOfMonth = new Date(entry.year, entry.month - 1, 1)
        const dateString = firstDayOfMonth.toISOString().split('T')[0]

        const workTypeDays = workTypeDaysByMonth.get(key)
        
        // Récupérer les jours sélectionnés pour ce mois (nouveaux seulement)
        const newMonthSelectedDays = selectedDayPeriods.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Récupérer les jours déjà sauvegardés pour ce mois
        const savedMonthSelectedDays = savedWorkDays.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Fusionner les nouveaux jours avec les jours déjà sauvegardés
        const monthSelectedDays = [...savedMonthSelectedDays, ...newMonthSelectedDays]
        
        // Récupérer les jours sélectionnés pour les types de travail de ce mois (nouveaux seulement)
        const newMonthWorkTypeDays = selectedWorkTypeDays.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Récupérer les jours de types de travail déjà sauvegardés pour ce mois
        const savedMonthWorkTypeDays = savedWorkTypeDays.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Fusionner les nouveaux jours de types de travail avec les jours déjà sauvegardés
        const monthWorkTypeDays = [...savedMonthWorkTypeDays, ...newMonthWorkTypeDays]
        
        // Récupérer les jours sélectionnés pour les congés de ce mois (nouveaux seulement)
        const newMonthLeaveTypeDays = selectedLeaveDays.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Récupérer les jours de congés déjà sauvegardés pour ce mois
        const savedMonthLeaveTypeDays = savedLeaveTypeDays.filter(dp => {
          const dpDate = new Date(dp.date)
          return dpDate.getMonth() + 1 === entry.month && dpDate.getFullYear() === entry.year
        })
        
        // Fusionner les nouveaux jours de congés avec les jours déjà sauvegardés
        const monthLeaveTypeDays = [...savedMonthLeaveTypeDays, ...newMonthLeaveTypeDays]
        
        // Calculer le total de jours travaillés basé sur les jours fusionnés (chaque période = 0.5 jour)
        const totalDaysWorked = monthSelectedDays.length * 0.5
        
        // Calculer le total de jours de weekend travaillés basé sur les jours fusionnés
        const totalWeekendWorked = monthSelectedDays.filter(dp => {
          const date = new Date(dp.date)
          const dayOfWeek = date.getDay()
          return dayOfWeek === 0 || dayOfWeek === 6
        }).length * 0.5
        
        console.log(`📊 Fusion des jours pour ${entry.month}/${entry.year}:`)
        console.log(`  - Jours calendrier principal: ${savedMonthSelectedDays.length} sauvegardés + ${newMonthSelectedDays.length} nouveaux = ${monthSelectedDays.length} total`)
        console.log(`  - Jours types de travail: ${savedMonthWorkTypeDays.length} sauvegardés + ${newMonthWorkTypeDays.length} nouveaux = ${monthWorkTypeDays.length} total`)
        console.log(`  - Jours congés: ${savedMonthLeaveTypeDays.length} sauvegardés + ${newMonthLeaveTypeDays.length} nouveaux = ${monthLeaveTypeDays.length} total`)
        console.log(`  - Total jours travaillés: ${totalDaysWorked} (basé sur ${monthSelectedDays.length} périodes)`)
        console.log(`  - Total weekend travaillé: ${totalWeekendWorked}`)
        
        const workScheduleData = {
          date: dateString,
          period: null, // NULL pour les entrées mensuelles
          selected_days: JSON.stringify(monthSelectedDays), // NOUVEAU: Stocker les jours exacts sélectionnés
          work_type_selected_days: JSON.stringify(monthWorkTypeDays), // NOUVEAU: Jours sélectionnés pour types de travail
          leave_type_selected_days: JSON.stringify(monthLeaveTypeDays), // NOUVEAU: Jours sélectionnés pour congés
          notes: JSON.stringify({
            task: formData.task,
            description: formData.description,
            workType: formData.workType,
            leaveType: entry.leaveType,
            daysWorked: totalDaysWorked,
            travelExpenses: entry.additionalCharges,
            weekendWork: totalWeekendWorked,
            absences: entry.absences
          }),
          work_type_id: formData.workType || null,
          work_type_days: workTypeDays || 0,
          days_worked: totalDaysWorked,
          weekend_worked: totalWeekendWorked,
          absence_days: entry.absences,
          leave_type_id: entry.leaveType && entry.leaveType !== 0 ? entry.leaveType : null,
          month: entry.month,
          year: entry.year
        }
        
        console.log(`📝 Traitement entrée ${i + 1}/${monthlyEntries.length}:`, `${entry.month}/${entry.year}`)
        console.log(`📋 Données à envoyer:`, workScheduleData)
        console.log(`📊 Détail: work_type_days=${workTypeDays || 0} (type de travail), days_worked=${totalDaysWorked} (calendrier principal - basé sur jours fusionnés)`)
        
        try {
          await WorkScheduleAPI.create(workScheduleData as any)
          console.log('✅ Entrée mensuelle sauvegardée avec succès pour', `${entry.month}/${entry.year}`)
          createdCount++
          
          // Délai entre les requêtes pour éviter le rate limiting
          if (i < monthlyEntries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (error: any) {
          console.error('❌ Erreur lors de la sauvegarde de', `${entry.month}/${entry.year}`, ':', error)
          if (error.response?.data) {
            console.error('Détails de l\'erreur:', error.response.data)
          }
          throw error
        }
      }
      
      // Clear edit data if in edit mode
      if (isEditMode) {
        localStorage.removeItem('timesheet-edit-data')
      }
      
      // Clear all selections after successful save
      setSelectedDayPeriods([])
      setSelectedLeaveDays([])
      setSelectedWorkTypeDays([])
      
      // Afficher un message de succès
      showSuccess(
        'CRA envoyé avec succès',
        `${createdCount} entrée(s) mensuelle(s) ont été enregistrées avec succès.`
      )
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/consultant/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'enregistrement:', error)
      
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue'
      
      showError(
        'Erreur d\'enregistrement',
        `Impossible d'enregistrer le travail: ${errorMessage}`
      )
    }
  }

  // Grouper les jours de congé par mois pour créer des entrées mensuelles
  const groupLeaveDaysByMonth = (leaveDays: string[], leaveTypeId: number) => {
    const leaveEntriesByMonth = new Map<string, {
      month: number
      year: number
      leaveType: number
      daysCount: number
      dates: string[]
    }>()

    leaveDays.forEach(dateKey => {
      const date = new Date(dateKey)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const key = `${year}-${month}`

      if (!leaveEntriesByMonth.has(key)) {
        leaveEntriesByMonth.set(key, {
          month,
          year,
          leaveType: leaveTypeId,
          daysCount: 0,
          dates: []
        })
      }

      const monthData = leaveEntriesByMonth.get(key)!
      monthData.daysCount++
      monthData.dates.push(dateKey)
    })

    // Créer une entrée mensuelle pour chaque mois
    const monthlyLeaveEntries: TimeEntry[] = []
    leaveEntriesByMonth.forEach((monthData, key) => {
      const selectedLeaveType = leaveTypes.find(lt => lt.id === monthData.leaveType)
      if (selectedLeaveType) {
        monthlyLeaveEntries.push({
          id: `leave-monthly-${Date.now()}-${key}`,
          date: `${monthData.year}-${String(monthData.month).padStart(2, '0')}-01`, // Premier jour du mois
          projectId: formData.projectId,
          task: 'Congé mensuel',
          description: `Congé: ${selectedLeaveType.name} (${monthData.daysCount} jour(s))`,
          workType: 0,
          leaveType: monthData.leaveType,
          travelExpenses: [],
          period: 'morning' as const, // Période par défaut (sera groupée)
          // Données spécifiques pour les congés mensuels
          month: monthData.month,
          year: monthData.year,
          daysWorked: 0, // Pas de travail pour les congés
          absences: monthData.daysCount, // Nombre de jours de congé
          weekendWork: 0
        } as TimeEntry)
      }
    })

    return monthlyLeaveEntries
  }

  // Group entries by month for backend submission
  const groupEntriesByMonth = (entries: TimeEntry[]) => {
    const monthlyGroups = new Map<string, {
      month: number
      year: number
      daysWorked: number
      additionalCharges: number
      weekendWork: number
      absences: number
      leaveType?: number
    }>()

    entries.forEach(entry => {
      // Pour les entrées mensuelles (congés), utiliser les valeurs déjà calculées
      if (entry.month && entry.year) {
        const key = `${entry.year}-${entry.month}`
        
        if (!monthlyGroups.has(key)) {
          monthlyGroups.set(key, {
            month: entry.month,
            year: entry.year,
            daysWorked: 0,
            additionalCharges: 0,
            weekendWork: 0,
            absences: 0,
            leaveType: undefined
          })
        }

        const group = monthlyGroups.get(key)!
        // Utiliser les valeurs pré-calculées pour les congés mensuels
        group.daysWorked += entry.daysWorked || 0
        group.absences += entry.absences || 0
        group.weekendWork += entry.weekendWork || 0
        group.additionalCharges += entry.travelExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        
        // Stocker le leaveType pour les congés
        if (entry.leaveType && !group.leaveType) {
          group.leaveType = entry.leaveType
        }
      } else {
        // Pour les entrées quotidiennes normales, calculer à partir de la date
      const date = new Date(entry.date)
      const month = date.getMonth() + 1 // 1-12
      const year = date.getFullYear()
      const key = `${year}-${month}`

      if (!monthlyGroups.has(key)) {
        monthlyGroups.set(key, {
          month,
          year,
          daysWorked: 0,
          additionalCharges: 0,
          weekendWork: 0,
          absences: 0,
          leaveType: undefined
        })
      }

      const group = monthlyGroups.get(key)!
      group.daysWorked += 0.5 // Each period is 0.5 days
      group.additionalCharges += entry.travelExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      // Check if weekend
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        group.weekendWork += 0.5
      }
      
      // Check if leave
      if (entry.leaveType) {
        group.absences += 0.5
        // Stocker le leaveType (prendre le premier rencontré pour ce mois)
        if (!group.leaveType) {
          group.leaveType = entry.leaveType
          }
        }
      }
    })

    return Array.from(monthlyGroups.values())
  }

  // Transform timesheet entries to dashboard work log format
  const transformToWorkLogs = (entries: TimeEntry[]) => {
    // Group entries by date
    const groupedByDate = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = {
          morning: null,
          evening: null
        }
      }
      acc[entry.date][entry.period] = entry
      return acc
    }, {} as Record<string, { morning: TimeEntry | null, evening: TimeEntry | null }>)
    
    // Convert to dashboard format
    return Object.entries(groupedByDate).map(([date, periods]) => {
      const morningEntry = periods.morning
      const eveningEntry = periods.evening
      
      // Count number of periods worked (0.5 per period)
      const daysWorked = (morningEntry ? 0.5 : 0) + (eveningEntry ? 0.5 : 0)
      
      // Calculate total travel expenses
      const totalExpenses = [morningEntry, eveningEntry]
        .filter(Boolean)
        .reduce((sum, entry) => {
          return sum + (entry?.travelExpenses?.reduce((expSum, exp) => expSum + exp.amount, 0) || 0)
        }, 0)
      
      // Get work description (prefer the one with more content)
      const workDescription = morningEntry?.description || eveningEntry?.description || 
                             morningEntry?.task || eveningEntry?.task || 'Travail saisi'
      
      // Get work type name
      const workTypeId = morningEntry?.workType || eveningEntry?.workType || 1
      const workTypeName = workTypes.find(wt => wt.id === workTypeId)?.name || 'Travaux internes (Consultants)'
      
      // Check if it's leave
      const isLeave = morningEntry?.leaveType || eveningEntry?.leaveType
      const leaveTypeName = isLeave ? leaveTypes.find(lt => lt.id === isLeave)?.name : null
      
      // Check if the date is a weekend (Saturday = 6, Sunday = 0)
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
      
      return {
        id: `work-log-${Date.now()}-${date}`,
        date: date,
        daysWorked: daysWorked,
        workDescription: leaveTypeName ? `Congé: ${leaveTypeName}` : workDescription,
        additionalCharges: totalExpenses,
        totalCost: (daysWorked * 450) + totalExpenses, // 450 is daily rate
        weekendWork: isWeekend ? daysWorked : 0, // Calculate weekend work based on day of week
        absences: isLeave ? daysWorked : 0,
        workType: leaveTypeName ? `Congé - ${leaveTypeName}` : workTypeName
      }
    })
  }

  // Clear form
  const clearForm = () => {
    setFormData({
      projectId: '1', // Projet par défaut: Refonte E-commerce
      task: 'Développement Frontend',
      description: 'Implémentation des composants React pour la page produit, optimisation des performances et intégration des fonctionnalités de paiement. Tests unitaires et validation des interactions utilisateur.',
      workType: 1, // Type de travail par défaut: Travaux internes (Consultants)
      leaveType: 0, // Type de congé (optionnel)
      travelExpenses: []
    })
    // Keep selectedDayPeriods - do not clear them
    // setSelectedDayPeriods([])
    setErrors({})
  }

  // Mémoriser les calculs coûteux pour éviter les re-calculs inutiles
  const days = useMemo(() => {
    if (!currentMonth) return []
    return getDaysInMonth(currentMonth)
  }, [currentMonth])

  const selectedTotals = useMemo(() => {
    return getSelectedDayPeriodsTotals()
  }, [selectedDayPeriods])

  // Don't render until client-side
  if (!isClient || !currentMonth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </motion.button>
            <div className="ml-4 flex-1">
              {isEditMode && editingWorkLog ? (
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-semibold text-gray-900">Modification des données</h1>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Mode édition
                    </span>
                    {hasUnsavedChanges && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Modifications non sauvegardées</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Modifiez les données pour : {editingWorkLog.monthName || new Date(editingWorkLog.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Saisie de Temps</h1>
                  <p className="text-sm text-gray-600">Gérez vos tâches et frais de déplacement</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleClearAllData}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors px-3 py-2 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Effacer toutes les données (congés, saisies, cookies)"
              >
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Effacer tout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Section - Calendar */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Calendar Header */}
            <div className="flex items-center mb-6">
              <Calendar className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Calendrier</h2>
                <p className="text-sm text-gray-600">Sélectionnez plusieurs dates pour saisir vos tâches</p>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <motion.button
                onClick={() => navigateMonth('prev')}
                disabled={navigationLoading}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${navigationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: navigationLoading ? 1 : 1.05 }}
                whileTap={{ scale: navigationLoading ? 1 : 0.95 }}
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </motion.button>
              
              <h3 className="text-lg font-medium text-gray-900">
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              
              <motion.button
                onClick={() => navigateMonth('next')}
                disabled={navigationLoading}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${navigationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: navigationLoading ? 1 : 1.05 }}
                whileTap={{ scale: navigationLoading ? 1 : 0.95 }}
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Quick Selection Buttons */}
            <div className="flex justify-center flex-wrap gap-2 mb-4">
             
              
              <motion.button
                onClick={handleSelectAllWeekdays}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Ajouter tous les jours de semaine (lundi-vendredi) du mois à la sélection (évite les conflits avec congés/types de travail)"
              >
                <Calendar className="h-4 w-4" />
                <span>Semaine</span>
              </motion.button>
              
              <motion.button
                onClick={handleClearAllSelections}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Effacer toutes les sélections"
              >
                <X className="h-4 w-4" />
                <span>Effacer</span>
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {['di', 'lu', 'ma', 'me', 'je', 've', 'sa'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>
                }
                
                const isToday = isSameDay(day, new Date())
                const twoYearsFromNow = new Date(new Date().getFullYear() + 2, new Date().getMonth(), new Date().getDate())
                const isTooFarFuture = day > twoYearsFromNow
                const dayKey = formatDateKey(day)
                const dayEntries = timeEntries.filter(entry => entry.date === dayKey)
                const hasEntries = dayEntries.length > 0
                const hasLeaveEntries = dayEntries.some(entry => entry.leaveType && entry.leaveType !== 0)
                const hasWorkTypeEntries = dayEntries.some(entry => !entry.leaveType && entry.workType)
                const morningSelected = isDayPeriodSelected(day, 'morning')
                const eveningSelected = isDayPeriodSelected(day, 'evening')
                
                // Check if day is selected in other calendars
                const isInLeaveSelection = selectedLeaveDays.some(dp => dp.date === dayKey)
                const isInWorkTypeSelection = selectedWorkTypeDays.some(dp => dp.date === dayKey)
                
                return (
                  <div key={day.toISOString()} className="p-1">
                    <motion.button
                      onClick={() => {
                        // Vérifier si les deux périodes sont déjà sauvegardées
                        const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                        const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                        const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                        const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                        const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                        const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                        
                        const bothPeriodsAlreadySaved = (morningAlreadySaved && eveningAlreadySaved) ||
                                                     (morningWorkTypeSaved && eveningWorkTypeSaved) ||
                                                     (morningLeaveTypeSaved && eveningLeaveTypeSaved)
                        
                        if (bothPeriodsAlreadySaved) {
                          showWarning('Jour déjà enregistré', 
                            `Les deux périodes (Matin et Soir) de ce jour (${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}) ont déjà été enregistrées dans la base de données.`)
                          return
                        }
                        
                        handleFullDayClick(day)
                      }}
                      disabled={isTooFarFuture}
                      className={`w-full text-center text-xs font-medium mb-1 rounded transition-colors ${
                        isTooFarFuture
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : (() => {
                              // Vérifier si les deux périodes sont déjà sauvegardées
                              const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              
                              const bothPeriodsAlreadySaved = (morningAlreadySaved && eveningAlreadySaved) ||
                                                           (morningWorkTypeSaved && eveningWorkTypeSaved) ||
                                                           (morningLeaveTypeSaved && eveningLeaveTypeSaved)
                              
                              if (bothPeriodsAlreadySaved) {
                                return 'text-gray-400 cursor-not-allowed bg-gray-200 border border-dashed border-gray-400'
                              }
                              
                              if (isToday) {
                                return 'text-red-600 hover:bg-red-50'
                              }
                              
                              return 'text-gray-900 hover:bg-gray-100'
                            })()
                      } ${
                        morningSelected && eveningSelected 
                          ? 'bg-green-100 text-green-700' 
                          : ''
                      }`}
                      whileHover={!isTooFarFuture ? { scale: 1.05 } : {}}
                      whileTap={!isTooFarFuture ? { scale: 0.95 } : {}}
                      title={
                        isTooFarFuture 
                          ? "Date trop éloignée - non sélectionnable" 
                          : (() => {
                              // Vérifier si les deux périodes sont déjà sauvegardées
                              const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                              const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                              
                              const bothPeriodsAlreadySaved = (morningAlreadySaved && eveningAlreadySaved) ||
                                                           (morningWorkTypeSaved && eveningWorkTypeSaved) ||
                                                           (morningLeaveTypeSaved && eveningLeaveTypeSaved)
                              
                              if (bothPeriodsAlreadySaved) {
                                return `Les deux périodes (Matin et Soir) de ce jour (${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}) ont déjà été enregistrées dans la base de données.`
                              }
                              
                              return "Cliquer pour sélectionner/désélectionner toute la journée"
                            })()
                      }
                    >
                      {day.getDate()}
                    </motion.button>
                      <div className="space-y-1">
                        {/* Check if day is selected in other calendars */}
                        {(() => {
                          // Determine button states and styles
                          const isInOtherCalendar = isInLeaveSelection || isInWorkTypeSelection
                          
                          // Vérifier si les périodes sont déjà sauvegardées dans la base de données
                          const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          // Vérifier si les jours sont sauvegardés dans les types de travail
                          const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          // Vérifier si les jours sont sauvegardés dans les congés
                          const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          // Morning period state determination
                          const morningEntry = dayEntries.find(e => e.period === 'morning')
                          const morningIsLeave = morningEntry && morningEntry.leaveType
                          const morningIsWorkType = morningEntry && !morningEntry.leaveType && morningEntry.workType
                          
                          // Evening period state determination  
                          const eveningEntry = dayEntries.find(e => e.period === 'evening')
                          const eveningIsLeave = eveningEntry && eveningEntry.leaveType
                          const eveningIsWorkType = eveningEntry && !eveningEntry.leaveType && eveningEntry.workType
                          
                          return (
                            <>
                              {/* Morning period */}
                              <motion.button
                                onClick={() => !isInOtherCalendar && !isTooFarFuture && !morningAlreadySaved && !morningWorkTypeSaved && !morningLeaveTypeSaved && handleDayPeriodClick(day, 'morning')}
                                disabled={isInOtherCalendar || isTooFarFuture || morningAlreadySaved || morningWorkTypeSaved || morningLeaveTypeSaved}
                                className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                  isTooFarFuture
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : morningAlreadySaved
                                    ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                    : morningWorkTypeSaved
                                    ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                    : morningLeaveTypeSaved
                                    ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                    : isInOtherCalendar
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-dashed border-gray-400'
                                    : morningIsLeave 
                                    ? 'bg-purple-500 text-white'
                                    : morningIsWorkType
                                    ? 'bg-orange-500 text-white'
                                    : morningSelected
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                whileHover={!isInOtherCalendar && !isTooFarFuture && !morningAlreadySaved ? { scale: 1.05 } : {}}
                                whileTap={!isInOtherCalendar && !isTooFarFuture && !morningAlreadySaved ? { scale: 0.95 } : {}}
                                title={
                                  isTooFarFuture
                                    ? "Date trop éloignée - non sélectionnable"
                                    : morningAlreadySaved
                                    ? "Période déjà enregistrée dans la base de données"
                                    : isInOtherCalendar
                                    ? `Jour réservé pour ${isInLeaveSelection ? 'congé' : 'type de travail'}`
                                    : morningIsLeave 
                                    ? `Congé: ${leaveTypes.find(lt => lt.id === morningEntry?.leaveType)?.name}`
                                    : morningIsWorkType
                                    ? `Travail: ${workTypes.find(wt => wt.id === morningEntry?.workType)?.name}`
                                    : 'Période matin'
                                }
                              >
                                <Sun className="h-3 w-3" />
                                <span>M</span>
                              </motion.button>
                              
                              {/* Evening period */}
                              <motion.button
                                onClick={() => !isInOtherCalendar && !isTooFarFuture && !eveningAlreadySaved && !eveningWorkTypeSaved && !eveningLeaveTypeSaved && handleDayPeriodClick(day, 'evening')}
                                disabled={isInOtherCalendar || isTooFarFuture || eveningAlreadySaved || eveningWorkTypeSaved || eveningLeaveTypeSaved}
                                className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                  isTooFarFuture
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : eveningAlreadySaved
                                    ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                    : eveningWorkTypeSaved
                                    ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                    : eveningLeaveTypeSaved
                                    ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                    : isInOtherCalendar
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-dashed border-gray-400'
                                    : eveningIsLeave
                                    ? 'bg-purple-500 text-white'
                                    : eveningIsWorkType
                                    ? 'bg-orange-500 text-white'
                                    : eveningSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                whileHover={!isInOtherCalendar && !isTooFarFuture && !eveningAlreadySaved ? { scale: 1.05 } : {}}
                                whileTap={!isInOtherCalendar && !isTooFarFuture && !eveningAlreadySaved ? { scale: 0.95 } : {}}
                                title={
                                  isTooFarFuture
                                    ? "Date trop éloignée - non sélectionnable"
                                    : eveningAlreadySaved
                                    ? "Période déjà enregistrée dans la base de données"
                                    : isInOtherCalendar
                                    ? `Jour réservé pour ${isInLeaveSelection ? 'congé' : 'type de travail'}`
                                    : eveningIsLeave 
                                    ? `Congé: ${leaveTypes.find(lt => lt.id === eveningEntry?.leaveType)?.name}`
                                    : eveningIsWorkType
                                    ? `Travail: ${workTypes.find(wt => wt.id === eveningEntry?.workType)?.name}`
                                    : 'Période soir'
                                }
                              >
                                <Moon className="h-3 w-3" />
                                <span>S</span>
                              </motion.button>
                            </>
                          )
                        })()}
                      </div>
                    {hasEntries && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>
 
            {/* Visual Legend */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Légende</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Matin sélectionné</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>après midi sélectionné</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Congé enregistré</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Type travail enregistré</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 border-2 border-green-700 rounded"></div>
                  <span>Travail sauvegardé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                  <span>Type travail sauvegardé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 border-2 border-red-700 rounded"></div>
                  <span>Congé sauvegardé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 border border-dashed border-gray-400 rounded"></div>
                  <span>jours deja selectionnés</span>
                </div>
              </div>
            </div>

            {/* Leave Days Selected Summary - Show selected days, not recorded entries */}
            {selectedLeaveDays.length > 0 && formData.leaveType && formData.leaveType !== 0 && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                    Congés sélectionnés (non enregistrés)
                  </h4>
                  <motion.button
                    onClick={handleClearLeaveSelection}
                    className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Effacer la sélection de congés"
                  >
                    <X className="h-3 w-3" />
                    <span>Effacer</span>
                  </motion.button>
                </div>
                <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-800">
                      {leaveTypes.find(lt => lt.id === formData.leaveType)?.name}
                        </div>
                        <div className="text-sm font-bold text-purple-600">
                      {selectedLeaveDays.length} jour(s)
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                    {selectedLeaveDays.slice(0, 5).map((dp: DayPeriod, idx: number) => (
                          <span
                            key={`${dp.date}-${dp.period}-${idx}`}
                            className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            {formatDate(new Date(dp.date))}
                            {dp.period === 'morning' ? <Sun className="h-2 w-2" /> : <Moon className="h-2 w-2" />}
                          </span>
                        ))}
                    {selectedLeaveDays.length > 5 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{selectedLeaveDays.length - 5} autres
                          </span>
                        )}
                      </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-orange-600 font-medium flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Non enregistré - Utilisez "Valider et envoyer le CRA" pour sauvegarder
                    </p>
                    </div>
                </div>
              </div>
            )}

            {/* Work Type Days Selected Summary - Show selected days, not recorded entries */}
            {selectedWorkTypeDays.length > 0 && formData.workType && (
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Briefcase className="h-4 w-4 text-orange-600 mr-2" />
                    Type de travail sélectionné (non enregistré)
                  </h4>
                  <motion.button
                    onClick={handleClearWorkTypeSelection}
                    className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Effacer la sélection de type de travail"
                  >
                    <X className="h-3 w-3" />
                    <span>Effacer</span>
                  </motion.button>
                </div>
                <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-800">
                      {workTypes.find(wt => wt.id === formData.workType)?.name}
                        </div>
                        <div className="text-sm font-bold text-orange-600">
                      {selectedWorkTypeDays.length} jour(s)
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                    {selectedWorkTypeDays.slice(0, 5).map((dp: DayPeriod, idx: number) => (
                          <span
                            key={`${dp.date}-${dp.period}-${idx}`}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            {formatDate(new Date(dp.date))}
                            {dp.period === 'morning' ? <Sun className="h-2 w-2" /> : <Moon className="h-2 w-2" />}
                          </span>
                        ))}
                    {selectedWorkTypeDays.length > 5 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{selectedWorkTypeDays.length - 5} autres
                          </span>
                        )}
                      </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-orange-600 font-medium flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Non enregistré - Utilisez "Valider et envoyer le CRA" pour sauvegarder
                    </p>
                    </div>
                </div>
              </div>
            )}

            {/* Selected Day Periods Summary */}
            {selectedDayPeriods.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Périodes sélectionnées
                </h4>
                <div className="space-y-3">
                  {getAllMonthsWithPeriods().map((month, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold text-gray-800">
                          {month.name}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total jours</div>
                          <div className="text-2xl font-bold text-gray-600">
                            {month.totalDays}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Jours de semaine</div>
                          <div className="text-lg font-bold text-blue-600">
                            {month.workingDays}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Week-ends</div>
                          <div className="text-lg font-bold text-green-600">
                            {month.weekendDays}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de déplacement :</span>
                    <span className="font-medium">{selectedTotals.totalExpenses.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          {/* Right Section - Time Entry Form */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Form Header */}
            <div className="flex items-center mb-6">
              <Plus className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">+ Saisie de Travail</h2>
                <p className="text-sm text-gray-600">
                  {selectedDayPeriods.length > 0 
                    ? `${selectedDayPeriods.length} période(s) sélectionnée(s)`
                    : 'Sélectionnez des périodes matin/soir dans le calendrier principal'
                  }
                </p>
              </div>
            </div>
            
              {/* Work Type Selection */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900">Saisie de Type de Travail</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      onClick={handleClearWorkTypeSelection}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Effacer le type de travail et les jours sélectionnés"
                    >
                      <X className="h-4 w-4" />
                      <span>Effacer</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowWorkTypeCalendar(!showWorkTypeCalendar)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{showWorkTypeCalendar ? 'Masquer' : 'Afficher'}</span>
                    </motion.button>
                  </div>
                </div>

                {showWorkTypeCalendar && (
                  <div className="space-y-4">
                    {/* Work Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de travail
                      </label>
                      <select
                        value={formData.workType}
                        onChange={(e) => handleFormChange('workType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner un type de travail</option>
                        {workTypes.map((workType) => (
                          <option key={workType.id} value={workType.id}>
                            {workType.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Work Type Calendar */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Sélectionner les jours de travail - {currentMonth?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        💡 <strong>Cliquez sur le numéro du jour</strong> pour sélectionner matin ET soir, ou cliquez sur M/S pour choisir une période spécifique
                      </p>
                      
                      <div className="grid grid-cols-7 gap-1 mb-4">
                        {/* Day headers */}
                        {['di', 'lu', 'ma', 'me', 'je', 've', 'sa'].map((day) => (
                          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days with morning/evening periods */}
                        {days.map((day, index) => {
                          if (!day) {
                            return <div key={index} className="p-2"></div>
                          }
                          
                          const dayKey = formatDateKey(day)
                          const isToday = isSameDay(day, new Date())
                          
                          // Check periods selection
                          const morningSelected = selectedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningSelected = selectedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          // Check conflicts with other calendars
                          const isInMainCalendar = selectedDayPeriods.some(dp => dp.date === dayKey)
                          const isInLeaveCalendar = selectedLeaveDays.some(dp => dp.date === dayKey)
                          const hasRecordedEntries = timeEntries.some(entry => entry.date === dayKey)
                          
                          // Vérifier si les périodes sont déjà sauvegardées dans la base de données
                          const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          const isConflicted = isInMainCalendar || isInLeaveCalendar || hasRecordedEntries || 
                                              morningAlreadySaved || eveningAlreadySaved || 
                                              morningWorkTypeSaved || eveningWorkTypeSaved || 
                                              morningLeaveTypeSaved || eveningLeaveTypeSaved
                          
                          return (
                            <div key={day.toISOString()} className="border border-gray-200 rounded-lg p-2 bg-white">
                              {/* Day number - clickable to select both periods */}
                              <motion.button
                                onClick={() => !isConflicted && handleWorkTypeDayClick(day)}
                                disabled={isConflicted}
                                className={`w-full text-center text-xs font-medium mb-2 p-1 rounded transition-colors ${
                                  isToday 
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                    : morningSelected || eveningSelected
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:bg-gray-100'
                                } ${isConflicted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                title={isConflicted ? 'Jour déjà utilisé' : 'Cliquer pour sélectionner matin et soir'}
                              >
                                {day.getDate()}
                              </motion.button>
                              <div className="space-y-1">
                                {/* Morning period */}
                                <motion.button
                                  onClick={() => !isConflicted && handleWorkTypeDayPeriodClick(day, 'morning')}
                                  disabled={isConflicted}
                                  className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                    isConflicted
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : morningSelected
                                      ? 'bg-blue-500 text-white'
                                      : morningAlreadySaved
                                      ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                      : morningWorkTypeSaved
                                      ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                      : morningLeaveTypeSaved
                                      ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                  whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                  title={isConflicted ? 'Jour déjà utilisé' : 'Période matin'}
                                >
                                  <Sun className="h-3 w-3" />
                                  <span>M</span>
                                </motion.button>
                                
                                {/* Evening period */}
                                <motion.button
                                  onClick={() => !isConflicted && handleWorkTypeDayPeriodClick(day, 'evening')}
                                  disabled={isConflicted}
                                  className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                    isConflicted
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : eveningSelected
                                      ? 'bg-blue-600 text-white'
                                      : eveningAlreadySaved
                                      ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                      : eveningWorkTypeSaved
                                      ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                      : eveningLeaveTypeSaved
                                      ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                  whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                  title={isConflicted ? 'Jour déjà utilisé' : 'Période soir'}
                                >
                                  <Moon className="h-3 w-3" />
                                  <span>S</span>
                                </motion.button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Selected Work Type Days Summary */}
                      {selectedWorkTypeDays.length > 0 && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">
                              Périodes sélectionnées ({selectedWorkTypeDays.length})
                            </h5>
                            {formData.workType && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {workTypes.find(wt => wt.id === formData.workType)?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedWorkTypeDays.map((dp, idx) => (
                              <span
                                key={`${dp.date}-${dp.period}-${idx}`}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                {formatDate(new Date(dp.date))}
                                {dp.period === 'morning' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                                <span className="text-xs">({dp.period === 'morning' ? 'M' : 'S'})</span>
                              </span>
                            ))}
                          </div>
                          {formData.workType && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                💡 Les jours sélectionnés (matin et soir) seront enregistrés quand vous cliquez sur "Valider et envoyer le CRA"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info message - Submit via main CRA button */}
                      {selectedWorkTypeDays.length > 0 && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            {selectedWorkTypeDays.length} jour(s) sélectionné(s). Utilisez le bouton "Valider et envoyer le CRA" en bas pour enregistrer.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Travel Expenses Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900">Frais de déplacement</h3>
                  </div>
                  <motion.button
                    type="button"
                    onClick={addTravelExpense}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </motion.button>
                </div>

                {formData.travelExpenses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Aucun frais de déplacement ajouté
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.travelExpenses.map((expense, index) => (
                      <div key={expense.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Déplacement #{index + 1}
                          </span>
                          <motion.button
                            type="button"
                            onClick={() => removeTravelExpense(expense.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={expense.description}
                              onChange={(e) => handleTravelExpenseChange(expense.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="Ex: Déplacement client (50km)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Montant (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={expense.amount}
                              onChange={(e) => handleTravelExpenseChange(expense.id, 'amount', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Justificatifs (photos/PDF)
                          </label>
                          <FileUpload
                            onFilesSelected={(files) => handleTravelExpenseFiles(expense.id, files)}
                            existingFiles={expense.receipts}
                            onFileRemove={(fileIndex) => removeTravelExpenseFile(expense.id, fileIndex)}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Total des frais */}
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Total des frais :</span>
                        <span className="font-bold text-red-600">
                          {getFormTravelExpensesTotal().toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Total justificatifs :</span>
                        <span>
                          {formData.travelExpenses.reduce((total, expense) => total + expense.receipts.length, 0)} fichier(s)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Management Section */}
              <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Saisie de Congés</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        type="button"
                        onClick={handleClearLeaveSelection}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Effacer le type de congé et les jours sélectionnés"
                      >
                        <X className="h-4 w-4" />
                        <span>Effacer</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setShowLeaveCalendar(!showLeaveCalendar)}
                        className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>{showLeaveCalendar ? 'Masquer' : 'Afficher'}</span>
                      </motion.button>
                    </div>
                  </div>

                {showLeaveCalendar && (
                  <div className="space-y-4">
                    {/* Leave Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de congé
                      </label>
                      <select
                        value={formData.leaveType}
                        onChange={(e) => handleFormChange('leaveType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Sélectionner un type de congé</option>
                        {leaveTypes.map((leaveType) => (
                          <option key={leaveType.id} value={leaveType.id}>
                            {leaveType.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Leave Calendar */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Sélectionner les jours de congé - {currentMonth?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        💡 <strong>Cliquez sur le numéro du jour</strong> pour sélectionner matin ET soir, ou cliquez sur M/S pour choisir une période spécifique
                      </p>
                      
                      <div className="grid grid-cols-7 gap-1 mb-4">
                        {/* Day headers */}
                        {['di', 'lu', 'ma', 'me', 'je', 've', 'sa'].map((day) => (
                          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days with morning/evening periods */}
                        {days.map((day, index) => {
                          if (!day) {
                            return <div key={index} className="p-2"></div>
                          }
                          
                          const dayKey = formatDateKey(day)
                          const isToday = isSameDay(day, new Date())
                          
                          // Check periods selection
                          const morningSelected = selectedLeaveDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningSelected = selectedLeaveDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          // Check conflicts with other calendars
                          const isInMainCalendar = selectedDayPeriods.some(dp => dp.date === dayKey)
                          const isInWorkTypeCalendar = selectedWorkTypeDays.some(dp => dp.date === dayKey)
                          const hasRecordedEntries = timeEntries.some(entry => entry.date === dayKey)
                          
                          // Vérifier si les périodes sont déjà sauvegardées dans la base de données
                          const morningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningAlreadySaved = savedWorkDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          const morningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningWorkTypeSaved = savedWorkTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          const morningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'morning')
                          const eveningLeaveTypeSaved = savedLeaveTypeDays.some(dp => dp.date === dayKey && dp.period === 'evening')
                          
                          const isConflicted = isInMainCalendar || isInWorkTypeCalendar || hasRecordedEntries || 
                                              morningAlreadySaved || eveningAlreadySaved || 
                                              morningWorkTypeSaved || eveningWorkTypeSaved || 
                                              morningLeaveTypeSaved || eveningLeaveTypeSaved
                          
                          return (
                            <div key={day.toISOString()} className="border border-gray-200 rounded-lg p-2 bg-white">
                              {/* Day number - clickable to select both periods */}
                              <motion.button
                                onClick={() => !isConflicted && handleLeaveDayClick(day)}
                                disabled={isConflicted}
                                className={`w-full text-center text-xs font-medium mb-2 p-1 rounded transition-colors ${
                                  isToday 
                                    ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                                    : morningSelected || eveningSelected
                                    ? 'text-purple-600 bg-purple-50'
                                    : 'text-gray-600 hover:bg-gray-100'
                                } ${isConflicted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                title={isConflicted ? 'Jour déjà utilisé' : 'Cliquer pour sélectionner matin et soir'}
                              >
                                {day.getDate()}
                              </motion.button>
                              <div className="space-y-1">
                                {/* Morning period */}
                                <motion.button
                                  onClick={() => !isConflicted && handleLeaveDayPeriodClick(day, 'morning')}
                                  disabled={isConflicted}
                                  className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                    isConflicted
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : morningSelected
                                      ? 'bg-purple-500 text-white'
                                      : morningAlreadySaved
                                      ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                      : morningWorkTypeSaved
                                      ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                      : morningLeaveTypeSaved
                                      ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                  whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                  title={isConflicted ? 'Jour déjà utilisé' : 'Période matin'}
                                >
                                  <Sun className="h-3 w-3" />
                                  <span>M</span>
                                </motion.button>
                                
                                {/* Evening period */}
                                <motion.button
                                  onClick={() => !isConflicted && handleLeaveDayPeriodClick(day, 'evening')}
                                  disabled={isConflicted}
                                  className={`w-full p-1 text-xs rounded transition-colors flex items-center justify-center space-x-1 ${
                                    isConflicted
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : eveningSelected
                                      ? 'bg-purple-600 text-white'
                                      : eveningAlreadySaved
                                      ? 'bg-green-600 text-white cursor-not-allowed border-2 border-green-700'
                                      : eveningWorkTypeSaved
                                      ? 'bg-blue-600 text-white cursor-not-allowed border-2 border-blue-700'
                                      : eveningLeaveTypeSaved
                                      ? 'bg-red-600 text-white cursor-not-allowed border-2 border-red-700'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  whileHover={!isConflicted ? { scale: 1.05 } : {}}
                                  whileTap={!isConflicted ? { scale: 0.95 } : {}}
                                  title={isConflicted ? 'Jour déjà utilisé' : 'Période soir'}
                                >
                                  <Moon className="h-3 w-3" />
                                  <span>S</span>
                                </motion.button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Selected Leave Days Summary */}
                      {selectedLeaveDays.length > 0 && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">
                              Périodes sélectionnées ({selectedLeaveDays.length})
                            </h5>
                            {formData.leaveType && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                {leaveTypes.find(lt => lt.id === formData.leaveType)?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedLeaveDays.map((dp, idx) => (
                              <span
                                key={`${dp.date}-${dp.period}-${idx}`}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                {formatDate(new Date(dp.date))}
                                {dp.period === 'morning' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                                <span className="text-xs">({dp.period === 'morning' ? 'M' : 'S'})</span>
                              </span>
                            ))}
                          </div>
                          {formData.leaveType && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                💡 Les jours sélectionnés seront groupés par mois et enregistrés quand vous cliquez sur "Valider et envoyer le CRA"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info message - Submit via main CRA button */}
                      {selectedLeaveDays.length > 0 && formData.leaveType && formData.leaveType !== 0 && (
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm text-purple-800 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            {selectedLeaveDays.length} jour(s) de congé sélectionné(s). Utilisez le bouton "Valider et envoyer le CRA" en bas pour enregistrer.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

               {/* Work Form Error */}
               {errors.dayPeriods && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.dayPeriods}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Utilisez le calendrier principal pour sélectionner des périodes matin/soir, ou ajoutez des congés dans la section "Saisie de Congés".
                  </p>
                </div>
              )}
                <form onSubmit={handleWorkSubmit} className="space-y-6">

               {/* Action Buttons - Always visible */}
                <div className="flex space-x-4 pt-6">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="h-4 w-4" />
                    <span>Valider et envoyer le CRA</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={clearForm}
                    className="flex-1 bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="h-4 w-4" />
                    <span>Effacer</span>
                  </motion.button>
                </div>
                </form>
          </motion.div>
          
        </div>
        
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={hideModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </div>
  )
} 
