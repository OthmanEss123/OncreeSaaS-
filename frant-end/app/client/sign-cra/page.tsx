'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { WorkScheduleAPI, ConsultantAPI, UserSignatureAPI } from '@/lib/api'
import type { Consultant, Project as ProjectType, WorkSchedule } from '@/lib/type'
import jsPDF from 'jspdf'
import { 
  ArrowLeft, 
  PenTool, 
  CheckCircle, 
  FileText,
  AlertCircle,
  Loader2,
  Briefcase,
  User,
  RotateCcw,
  Upload
} from 'lucide-react'

interface WorkLog {
  id: string
  month: number
  year: number
  monthName?: string
  daysWorked: number
  weekendWork: number
  absences: number
  workTypeDays: number
  absenceType: string
  workType: string
  details?: any[]
}

export default function SignCRAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const month = parseInt(searchParams.get('month') || '0')
  const year = parseInt(searchParams.get('year') || '0')
  const consultantIdParam = searchParams.get('consultantId')

  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [project, setProject] = useState<ProjectType | null>(null)
  const [workLog, setWorkLog] = useState<WorkLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [savingSignature, setSavingSignature] = useState(false)
  const [signatureSaved, setSignatureSaved] = useState(false)
  const [loadingSignature, setLoadingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSignatureData, setClientSignatureData] = useState<string | null>(null)
  const clientCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawingClient, setIsDrawingClient] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Vérifier l'authentification - Seul le client peut signer
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const currentUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null
        
        if (!token || currentUserType !== 'client') {
          router.push('/login')
          return
        }

        // Valider les paramètres
        if (!month || !year || month < 1 || month > 12) {
          setError('Paramètres invalides. Veuillez retourner au dashboard.')
          setLoading(false)
          return
        }

        // Valider que consultantId est fourni
        const consultantId = consultantIdParam ? parseInt(consultantIdParam) : null
        if (!consultantId) {
          setError('ID consultant requis pour signer le CRA')
          setLoading(false)
          return
        }

        // Charger les données du consultant spécifié
        const consultantData = await ConsultantAPI.get(consultantId)
        
        // Charger les work schedules du consultant
        const { api } = await import('@/lib/api')
        const response = await api.get(`/consultants/${consultantId}`)
        const consultantWithSchedules = response.data?.data || response.data
        
        let projectData: ProjectType | null = null
        if (consultantWithSchedules?.project) {
          projectData = consultantWithSchedules.project
        }

        // Transformer les work schedules en format groupé
        const schedules = consultantWithSchedules?.workSchedules || consultantWithSchedules?.work_schedules || []
        
        // Grouper par mois
        const groupedMap = new Map<string, any>()
        schedules.forEach((schedule: any) => {
          const scheduleMonth = schedule.month || (schedule.date ? new Date(schedule.date).getMonth() + 1 : null)
          const scheduleYear = schedule.year || (schedule.date ? new Date(schedule.date).getFullYear() : null)
          
          if (scheduleMonth && scheduleYear) {
            const key = `${scheduleYear}-${scheduleMonth}`
            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                id: key,
                month: scheduleMonth,
                year: scheduleYear,
                monthName: new Date(scheduleYear, scheduleMonth - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                daysWorked: 0,
                weekendWork: 0,
                absences: 0,
                absenceType: '',
                workType: '',
                workTypeDays: 0,
                details: []
              })
            }
            
            const group = groupedMap.get(key)
            group.daysWorked += schedule.days_worked || 0
            group.weekendWork += schedule.weekend_worked || 0
            group.absences += schedule.absence_days || 0
            group.workTypeDays += schedule.work_type_days || 0
            
            if (schedule.absence_type && schedule.absence_type !== 'none') {
              if (schedule.leave_type?.name) {
                if (!group.absenceType.includes(schedule.leave_type.name)) {
                  group.absenceType = group.absenceType ? `${group.absenceType}, ${schedule.leave_type.name}` : schedule.leave_type.name
                }
              }
            }
            
            if (schedule.work_type?.name) {
              if (!group.workType.includes(schedule.work_type.name)) {
                group.workType = group.workType ? `${group.workType}, ${schedule.work_type.name}` : schedule.work_type.name
              }
            }
          }
        })
        
        const groupedData = Array.from(groupedMap.values())

        setConsultant(consultantData)
        setProject(projectData)

        // Trouver le log pour le mois/année spécifié
        const log = (groupedData as WorkLog[]).find((l: WorkLog) => l.month === month && l.year === year)

        if (!log) {
          setError(`Aucun CRA trouvé pour ${new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`)
          setLoading(false)
          return
        }

        setWorkLog(log)
      } catch (error: any) {
        console.error('Erreur lors du chargement:', error)
        setError(error?.response?.data?.message || 'Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month, year, consultantIdParam, router])

  // Fonctions pour le canvas de signature client
  useEffect(() => {
    let ctx: CanvasRenderingContext2D | null = null
    let isDrawing = false

    const initCanvas = (): boolean => {
      const canvas = clientCanvasRef.current
      if (!canvas) return false

      const rect = canvas.getBoundingClientRect()
      const width = rect.width > 0 ? rect.width : 800
      
      canvas.width = width
      canvas.height = 200
      
      const context = canvas.getContext('2d')
      if (!context) return false
      
      context.strokeStyle = '#000000'
      context.lineWidth = 3
      context.lineCap = 'round'
      context.lineJoin = 'round'
      
      ctx = context
      return true
    }

    let initAttempts = 0
    const tryInit = () => {
      if (initCanvas()) {
        attachEvents()
      } else if (initAttempts < 20) {
        initAttempts++
        setTimeout(tryInit, 100)
      }
    }

    const initTimer = setTimeout(tryInit, 200)

    const getPos = (e: MouseEvent | TouchEvent) => {
      const currentCanvas = clientCanvasRef.current
      if (!currentCanvas) return null

      const rect = currentCanvas.getBoundingClientRect()
      let clientX: number, clientY: number
      
      if ('touches' in e) {
        if (e.touches.length === 0) return null
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }
      
      const scaleX = currentCanvas.width / rect.width
      const scaleY = currentCanvas.height / rect.height
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!ctx) {
        if (!initCanvas()) return
      }
      if (!ctx) return
      
      const pos = getPos(e)
      if (!pos) return
      
      isDrawing = true
      setIsDrawingClient(true)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + 0.5, pos.y + 0.5)
      ctx.stroke()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing || !ctx) return
      e.preventDefault()
      e.stopPropagation()
      
      const pos = getPos(e)
      if (!pos) return
      
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const onMouseUp = () => {
      const currentCanvas = clientCanvasRef.current
      if (isDrawing && currentCanvas) {
        isDrawing = false
        setIsDrawingClient(false)
        const dataURL = currentCanvas.toDataURL('image/png')
        setClientSignatureData(dataURL)
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!ctx) {
        if (!initCanvas()) return
      }
      if (!ctx) return
      
      const pos = getPos(e)
      if (!pos) return
      
      isDrawing = true
      setIsDrawingClient(true)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + 0.5, pos.y + 0.5)
      ctx.stroke()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDrawing || !ctx) return
      e.preventDefault()
      e.stopPropagation()
      
      const pos = getPos(e)
      if (!pos) return
      
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const onTouchEnd = () => {
      const currentCanvas = clientCanvasRef.current
      if (isDrawing && currentCanvas) {
        isDrawing = false
        setIsDrawingClient(false)
        const dataURL = currentCanvas.toDataURL('image/png')
        setClientSignatureData(dataURL)
      }
    }

    const attachEvents = () => {
      const currentCanvas = clientCanvasRef.current
      if (!currentCanvas) return

      currentCanvas.addEventListener('mousedown', onMouseDown)
      currentCanvas.addEventListener('mousemove', onMouseMove)
      currentCanvas.addEventListener('mouseup', onMouseUp)
      currentCanvas.addEventListener('mouseleave', onMouseUp)
      currentCanvas.addEventListener('mouseout', onMouseUp)
      currentCanvas.addEventListener('touchstart', onTouchStart, { passive: false })
      currentCanvas.addEventListener('touchmove', onTouchMove, { passive: false })
      currentCanvas.addEventListener('touchend', onTouchEnd)
      currentCanvas.addEventListener('touchcancel', onTouchEnd)
    }

    return () => {
      clearTimeout(initTimer)
      const currentCanvas = clientCanvasRef.current
      if (currentCanvas) {
        currentCanvas.removeEventListener('mousedown', onMouseDown)
        currentCanvas.removeEventListener('mousemove', onMouseMove)
        currentCanvas.removeEventListener('mouseup', onMouseUp)
        currentCanvas.removeEventListener('mouseleave', onMouseUp)
        currentCanvas.removeEventListener('mouseout', onMouseUp)
        currentCanvas.removeEventListener('touchstart', onTouchStart)
        currentCanvas.removeEventListener('touchmove', onTouchMove)
        currentCanvas.removeEventListener('touchend', onTouchEnd)
        currentCanvas.removeEventListener('touchcancel', onTouchEnd)
      }
    }
  }, [])

  const clearClientSignature = () => {
    const canvas = clientCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setClientSignatureData(null)
  }

  // Fonction pour gérer l'upload d'une image de signature
  const handleUploadSignature = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image (PNG, JPG, etc.)')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      
      // Charger l'image et la dessiner sur le canvas
      const img = new Image()
      img.onload = () => {
        const canvas = clientCanvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculer les dimensions pour garder les proportions
        const maxWidth = canvas.width
        const maxHeight = canvas.height
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Centrer l'image sur le canvas
        const x = (canvas.width - width) / 2
        const y = (canvas.height - height) / 2

        // Dessiner l'image
        ctx.drawImage(img, x, y, width, height)

        // Sauvegarder la signature
        const dataURL = canvas.toDataURL('image/png')
        setClientSignatureData(dataURL)
        setError(null)
      }

      img.onerror = () => {
        setError('Erreur lors du chargement de l\'image')
      }

      img.src = imageUrl
    }

    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier')
    }

    reader.readAsDataURL(file)

    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Fonction pour enregistrer la signature dans user_signatures
  const handleSaveSignature = async () => {
    if (!clientSignatureData) {
      setError('Veuillez d\'abord créer ou télécharger une signature')
      return
    }

    if (!consultant) {
      setError('Consultant non trouvé')
      return
    }

    const consultantId = consultantIdParam ? parseInt(consultantIdParam) : consultant.id

    try {
      setSavingSignature(true)
      setError(null)

      // Enregistrer la signature dans user_signatures
      const result = await UserSignatureAPI.save(clientSignatureData, {
        documentType: 'CRA',
        consultantId: consultantId,
        month: month,
        year: year,
        metadata: {
          action: 'client_signature_saved',
          consultant_name: consultant.name,
          month_name: workLog?.monthName || `${month}/${year}`
        }
      })

      const response = result.data as any

      if (!response.success) {
        setError(response.message || 'Erreur lors de l\'enregistrement de la signature')
        return
      }

      // Marquer que la signature est enregistrée
      setSignatureSaved(true)
      
      // Afficher un message de succès
      alert('Signature enregistrée avec succès dans la base de données!')
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la signature:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de l\'enregistrement de la signature'
      setError(errorMessage)
    } finally {
      setSavingSignature(false)
    }
  }

  // Fonction pour importer/charger la signature depuis user_signatures
  const handleImportSignature = async () => {
    if (!consultant) {
      setError('Consultant non trouvé')
      return
    }

    const consultantId = consultantIdParam ? parseInt(consultantIdParam) : consultant.id

    try {
      setLoadingSignature(true)
      setError(null)

      // Récupérer les signatures pour ce CRA
      const response = await UserSignatureAPI.getByCRA(consultantId, month, year)
      
      // L'API backend retourne { success: true, data: [...] }
      // cachedGet retourne response.data qui sera { success: true, data: [...] }
      let signatures: any[] = []
      if (Array.isArray(response)) {
        signatures = response
      } else if (response && typeof response === 'object') {
        const apiResponse = response as any
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          signatures = apiResponse.data
        } else if (Array.isArray(apiResponse)) {
          signatures = apiResponse
        }
      }
      
      if (!signatures || signatures.length === 0) {
        setError('Aucune signature enregistrée trouvée pour ce CRA')
        return
      }

      // Trouver la signature du client (user_type contient 'Client')
      const clientSignature = signatures.find((sig: any) => {
        const userType = typeof sig.user_type === 'string' ? sig.user_type : ''
        return userType.includes('Client') || userType === 'App\\Models\\Client'
      })

      if (!clientSignature || !clientSignature.signature_data) {
        setError('Aucune signature client trouvée')
        return
      }

      // Charger la signature sur le canvas
      const img = new Image()
      img.onload = () => {
        const canvas = clientCanvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculer les dimensions pour garder les proportions
        const maxWidth = canvas.width
        const maxHeight = canvas.height
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Centrer l'image sur le canvas
        const x = (canvas.width - width) / 2
        const y = (canvas.height - height) / 2

        // Dessiner l'image
        ctx.drawImage(img, x, y, width, height)

        // Sauvegarder la signature
        const dataURL = canvas.toDataURL('image/png')
        setClientSignatureData(dataURL)
        setError(null)
        alert('Signature importée avec succès!')
      }

      img.onerror = () => {
        setError('Erreur lors du chargement de l\'image de la signature')
      }

      img.src = clientSignature.signature_data
    } catch (error: any) {
      console.error('Erreur lors de l\'importation de la signature:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de l\'importation de la signature'
      setError(errorMessage)
    } finally {
      setLoadingSignature(false)
    }
  }

  const generateAndDownloadPDF = async () => {
    if (!workLog || !consultant || !clientSignatureData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Couleurs
    const primaryColor: [number, number, number] = [59, 130, 246] // Bleu
    const textColor: [number, number, number] = [31, 41, 55] // Gris foncé

    // En-tête avec fond coloré
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Compte Rendu d\'Activité (CRA)', pageWidth / 2, 25, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(monthName, pageWidth / 2, 35, { align: 'center' })

    yPosition = 50

    // Informations du consultant
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Informations du Consultant', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nom: ${consultant.name}`, 20, yPosition)
    yPosition += 7
    doc.text(`Email: ${consultant.email}`, 20, yPosition)
    yPosition += 7

    if (project) {
      doc.text(`Projet: ${project.name}`, 20, yPosition)
      yPosition += 7
    }

    yPosition += 5

    // Résumé du CRA
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Résumé du CRA', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    // Tableau des statistiques
    const stats = [
      ['Jours travaillés', `${workLog.daysWorked} jour(s)`],
      ['Jours travaillés en week-end', workLog.weekendWork > 0 ? `${workLog.weekendWork} jour(s)` : 'Aucun'],
      ['Jours d\'absence', workLog.absences > 0 ? `${workLog.absences} jour(s)` : 'Aucun'],
      ['Type d\'absence', workLog.absenceType || '-'],
      ['Type de travail', workLog.workType || '-'],
      ['Jours de Type de Travail', (workLog.workTypeDays || 0) > 0 ? `${workLog.workTypeDays} jour(s)` : '-']
    ]

    stats.forEach(([label, value]) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 80, yPosition)
      yPosition += 7
    })

    yPosition += 10

    // Signature
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Signature du Client', 20, yPosition)
    yPosition += 10

    // Convertir la signature base64 en image et l'ajouter au PDF
    try {
      // Créer une promesse pour charger l'image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      const img = await loadImage(clientSignatureData)
      const imgWidth = 80
      const imgHeight = (img.height * imgWidth) / img.width
      
      if (yPosition + imgHeight > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }

      doc.addImage(clientSignatureData, 'PNG', 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10

      // Date de signature
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      const signatureDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Signé le: ${signatureDate}`, 20, yPosition)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la signature au PDF:', error)
      // Continuer sans la signature
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Signature non disponible', 20, yPosition)
      
      const signatureDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Signé le: ${signatureDate}`, 20, yPosition + 10)
    }

    // Pied de page
    yPosition = pageHeight - 20
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text('Ce document a été généré automatiquement et certifie que les informations du CRA sont exactes.', 
      pageWidth / 2, yPosition, { align: 'center' })

    // Télécharger le PDF
    const fileName = `CRA_${consultant.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
  }

  const handleSign = async () => {
    if (!consultant) {
      setError('Consultant non trouvé')
      return
    }

    // Vérifier que la signature client est présente
    if (!clientSignatureData) {
      setError('Veuillez signer dans la zone de signature')
      return
    }

    const consultantId = consultantIdParam ? parseInt(consultantIdParam) : consultant.id
    
    if (!confirm(`Êtes-vous sûr de vouloir signer le CRA de ${consultant.name} pour ${workLog?.monthName} ?\n\nCette action est irréversible et certifie que les informations du CRA sont exactes.`)) {
      return
    }

    try {
      setSigning(true)
      setError(null)

      // Envoyer la signature du client
      const result = await WorkScheduleAPI.signCRA(month, year, clientSignatureData, consultantId)
      const response = result.data as any

      if (!response.success) {
        setError(response.message || 'Erreur lors de la signature')
        return
      }

      // Le PDF sera envoyé par email automatiquement quand toutes les signatures (consultant, client, manager) seront présentes
      
      // Rediriger vers la page du consultant
      router.push(`/client/users/${consultantId}?signed=true`)
    } catch (error: any) {
      console.error('Erreur lors de la signature:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la signature du CRA'
      setError(errorMessage)
    } finally {
      setSigning(false)
    }
  }

  const monthName = workLog?.monthName || new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error && !workLog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-card-foreground mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => {
              if (consultantIdParam) {
                router.push(`/client/users/${consultantIdParam}`)
              } else {
                router.push('/client/dashboard')
              }
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (consultantIdParam) {
                  router.push(`/client/users/${consultantIdParam}`)
                } else {
                  router.push('/client/dashboard')
                }
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Signature du CRA</h1>
              <p className="text-sm text-muted-foreground">{monthName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations du consultant */}
        {consultant && (
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-card-foreground">{consultant.name}</h2>
                <p className="text-sm text-muted-foreground">{consultant.email}</p>
              </div>
            </div>
            {project && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Projet: {project.name}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Détails du CRA */}
        {workLog && (
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Résumé du CRA - {monthName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jours travaillés</p>
                  <p className="text-2xl font-bold text-card-foreground">{workLog.daysWorked} jour(s)</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jours travaillés en week-end</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workLog.weekendWork > 0 ? `${workLog.weekendWork} jour(s)` : 'Aucun'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jours d'absence</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workLog.absences > 0 ? `${workLog.absences} jour(s)` : 'Aucun'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type d'absence</p>
                  <p className="text-lg font-medium text-card-foreground">
                    {workLog.absenceType || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type de travail</p>
                  <p className="text-lg font-medium text-card-foreground">
                    {workLog.workType || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jours de Type de Travail</p>
                  <p className="text-lg font-medium text-card-foreground">
                    {(workLog.workTypeDays || 0) > 0 ? `${workLog.workTypeDays} jour(s)` : '-'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section de signature - Client */}
        <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
              <PenTool className="h-5 w-5 mr-2 text-primary" />
              Signature du Client
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">
                Veuillez signer dans la zone ci-dessous en utilisant votre souris ou votre doigt (sur écran tactile).
                Vous pouvez également télécharger une image de votre signature.
              </p>
              
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadSignature}
                className="hidden"
              />
              
              {/* Boutons pour uploader et enregistrer/importer la signature */}
              <div className="mb-3 flex justify-end gap-3">
               
                
                {signatureSaved ? (
                  <button
                    onClick={handleImportSignature}
                    type="button"
                    disabled={loadingSignature}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingSignature ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Importer la signature</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSaveSignature}
                    type="button"
                    disabled={!clientSignatureData || savingSignature}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSignature ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Enregistrer la signature</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Canvas de signature client */}
              <div className="border-2 border-dashed border-border rounded-lg bg-white dark:bg-gray-800 p-4">
                <canvas
                  ref={clientCanvasRef}
                  className="w-full cursor-crosshair rounded"
                  style={{ 
                    height: '200px', 
                    touchAction: 'none',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff'
                  }}
                  width={800}
                  height={200}
                />
              </div>
              
              {/* Bouton pour effacer */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearClientSignature}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={!clientSignatureData && !isDrawingClient}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Effacer la signature</span>
                </button>
              </div>
              
              {/* Aperçu de la signature */}
              {clientSignatureData && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Signature client enregistrée</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        {/* Avertissement et confirmation */}
        <motion.div 
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Important - Action irréversible
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                En signant ce CRA, vous certifiez que toutes les informations sont exactes et conformes à la réalité.
                Cette action est irréversible. Veuillez vérifier attentivement les données et signer dans la zone prévue avant de confirmer.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message d'erreur */}
        {error && (
          <motion.div 
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Boutons d'action */}
        <motion.div 
          className="flex justify-end space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button
            onClick={() => {
              if (consultantIdParam) {
                router.push(`/client/users/${consultantIdParam}`)
              } else {
                router.push('/client/dashboard')
              }
            }}
            className="px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
            disabled={signing}
          >
            Annuler
          </button>
          <motion.button
            onClick={handleSign}
            disabled={signing || !clientSignatureData}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!signing && clientSignatureData ? { scale: 1.05 } : {}}
            whileTap={!signing && clientSignatureData ? { scale: 0.95 } : {}}
          >
            {signing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signature en cours...</span>
              </>
            ) : (
              <>
                <PenTool className="h-5 w-5" />
                <span>Confirmer et signer le CRA</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}

