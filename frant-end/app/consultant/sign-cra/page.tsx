'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { WorkScheduleAPI, DashboardAPI, UserSignatureAPI } from '@/lib/api'
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

  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [project, setProject] = useState<ProjectType | null>(null)
  const [workLog, setWorkLog] = useState<WorkLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [savingSignature, setSavingSignature] = useState(false)
  const [signatureSaved, setSignatureSaved] = useState(false)
  const [loadingSignature, setLoadingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureToLoad, setSignatureToLoad] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Vérifier l'authentification - Seul le consultant peut signer
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const currentUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null
        
        if (!token || currentUserType !== 'consultant') {
          router.push('/login')
          return
        }

        // Valider les paramètres
        if (!month || !year || month < 1 || month > 12) {
          setError('Paramètres invalides. Veuillez retourner au dashboard.')
          setLoading(false)
          return
        }

        // Charger les données du consultant
        const data = await DashboardAPI.consultantDashboard()
        const consultantData = data.consultant
        const projectData = data.project
        const groupedData = await WorkScheduleAPI.getGroupedByMonth()

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

        // Vérifier si le consultant a déjà une signature enregistrée (pour n'importe quel CRA)
        // La signature est liée à l'utilisateur (consultant), pas à un CRA spécifique
        try {
          // Récupérer toutes les signatures de type CRA pour trouver celle du consultant
          const allConsultantSignaturesResponse = await UserSignatureAPI.getByDocumentType('CRA')
          
          // Gérer différentes structures de réponse
          let allConsultantSignatures: any[] = []
          if (Array.isArray(allConsultantSignaturesResponse)) {
            allConsultantSignatures = allConsultantSignaturesResponse
          } else if (allConsultantSignaturesResponse && typeof allConsultantSignaturesResponse === 'object') {
            const apiResponse = allConsultantSignaturesResponse as any
            if (apiResponse.success && Array.isArray(apiResponse.data)) {
              allConsultantSignatures = apiResponse.data
            } else if (Array.isArray(apiResponse)) {
              allConsultantSignatures = apiResponse
            } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
              allConsultantSignatures = apiResponse.data
            }
          }
          
          // Trouver la dernière signature du consultant (la plus récente)
          // La signature est identifiée par user_type contenant 'Consultant'
          const consultantSignatures = allConsultantSignatures
            .filter((sig: any) => {
              const userType = typeof sig.user_type === 'string' ? sig.user_type : ''
              return userType.includes('Consultant') || userType === 'App\\Models\\Consultant' || userType === 'App\Models\Consultant'
            })
            .sort((a: any, b: any) => {
              // Trier par date de signature (plus récent en premier)
              const dateA = new Date(a.signed_at || a.created_at || 0).getTime()
              const dateB = new Date(b.signed_at || b.created_at || 0).getTime()
              return dateB - dateA
            })
          
          if (consultantSignatures.length > 0 && consultantSignatures[0].signature_data) {
            // Le consultant a déjà une signature enregistrée, on va la charger automatiquement
            setSignatureSaved(true)
            console.log('Signature consultant trouvée - chargement automatique')
            
            // Stocker la signature pour le chargement automatique après initialisation du canvas
            setSignatureToLoad(consultantSignatures[0].signature_data)
          } else {
            // Aucune signature trouvée, on affiche le bouton "Enregistrer la signature"
            setSignatureSaved(false)
            console.log('Aucune signature consultant trouvée')
          }
        } catch (error) {
          // Ignorer les erreurs de vérification de signature au chargement
          console.log('Erreur lors de la vérification de la signature consultant:', error)
          // Par défaut, on considère qu'il n'y a pas de signature
          setSignatureSaved(false)
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement:', error)
        setError(error?.response?.data?.message || 'Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month, year, router])

  // Fonctions pour le canvas de signature consultant
  useEffect(() => {
    let ctx: CanvasRenderingContext2D | null = null
    let isDrawing = false

    // Fonction pour initialiser le canvas
    const initCanvas = (): boolean => {
      const canvas = canvasRef.current
      if (!canvas) {
        return false
      }

      const rect = canvas.getBoundingClientRect()
      const width = rect.width > 0 ? rect.width : 800
      
      canvas.width = width
      canvas.height = 200
      
      const context = canvas.getContext('2d')
      if (!context) {
        console.error('Cannot get 2d context')
        return false
      }
      
      context.strokeStyle = '#000000'
      context.lineWidth = 3
      context.lineCap = 'round'
      context.lineJoin = 'round'
      
      ctx = context
      console.log('✅ Canvas initialisé:', { width: canvas.width, height: canvas.height })
      return true
    }

    // Initialiser le canvas
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
      const currentCanvas = canvasRef.current
      if (!currentCanvas) return null

      const rect = currentCanvas.getBoundingClientRect()
      let clientX: number, clientY: number
      
      if ('touches' in e) {
        // Pour les écrans tactiles
        if (e.touches.length === 0) return null
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        // Pour la souris
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }
      
      // Calculer l'échelle pour convertir les coordonnées CSS en coordonnées canvas
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
      
      // S'assurer que le contexte est initialisé
      if (!ctx) {
        if (!initCanvas()) {
          console.error('Impossible d\'initialiser le canvas')
          return
        }
      }
      
      if (!ctx) return
      
      const pos = getPos(e)
      if (!pos) return
      
      isDrawing = true
      setIsDrawing(true)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      // Dessiner un point immédiatement pour voir le début du tracé
      ctx.lineTo(pos.x + 0.5, pos.y + 0.5)
      ctx.stroke()
      
      console.log('🖱️ Souris down:', pos)
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
      const currentCanvas = canvasRef.current
      if (isDrawing && currentCanvas) {
        isDrawing = false
        setIsDrawing(false)
        const dataURL = currentCanvas.toDataURL('image/png')
        setSignatureData(dataURL)
        console.log('✅ Signature sauvegardée')
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      // S'assurer que le contexte est initialisé
      if (!ctx) {
        if (!initCanvas()) {
          return
        }
      }
      
      if (!ctx) return
      
      const pos = getPos(e)
      if (!pos) return
      
      isDrawing = true
      setIsDrawing(true)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      // Dessiner un point immédiatement pour le toucher
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
      const currentCanvas = canvasRef.current
      if (isDrawing && currentCanvas) {
        isDrawing = false
        setIsDrawing(false)
        const dataURL = currentCanvas.toDataURL('image/png')
        setSignatureData(dataURL)
        console.log('✅ Signature sauvegardée')
      }
    }

    // Attacher les événements au canvas
    const attachEvents = () => {
      const currentCanvas = canvasRef.current
      if (!currentCanvas) {
        console.warn('Canvas non disponible pour attacher les événements')
        return
      }

      console.log('✅ Attachement des événements au canvas')

      // Attacher les événements pour la souris (PC)
      currentCanvas.addEventListener('mousedown', onMouseDown)
      currentCanvas.addEventListener('mousemove', onMouseMove)
      currentCanvas.addEventListener('mouseup', onMouseUp)
      currentCanvas.addEventListener('mouseleave', onMouseUp)
      currentCanvas.addEventListener('mouseout', onMouseUp)
      
      // Attacher les événements pour l'écran tactile
      currentCanvas.addEventListener('touchstart', onTouchStart, { passive: false })
      currentCanvas.addEventListener('touchmove', onTouchMove, { passive: false })
      currentCanvas.addEventListener('touchend', onTouchEnd)
      currentCanvas.addEventListener('touchcancel', onTouchEnd)

      return currentCanvas
    }

    return () => {
      clearTimeout(initTimer)
      
      const currentCanvas = canvasRef.current
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

  // Fonction pour charger une signature dans le canvas (utilisée pour le chargement automatique et l'import manuel)
  const loadConsultantSignatureToCanvas = useCallback((signatureDataUrl: string, showAlert: boolean = false) => {
    const canvas = canvasRef.current
    if (!canvas) {
      // Si le canvas n'est pas encore initialisé, réessayer après un court délai
      setTimeout(() => loadConsultantSignatureToCanvas(signatureDataUrl, showAlert), 200)
      return
    }

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Impossible d\'obtenir le contexte du canvas')
        return
      }

      // S'assurer que le canvas est initialisé avec les bonnes dimensions
      const rect = canvas.getBoundingClientRect()
      const width = rect.width > 0 ? rect.width : 800
      
      if (canvas.width !== width) {
        canvas.width = width
        canvas.height = 200
      }

      // Réinitialiser le contexte après redimensionnement
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculer les dimensions pour garder les proportions
      const maxWidth = canvas.width
      const maxHeight = canvas.height
      let imgWidth = img.width
      let imgHeight = img.height

      if (imgWidth > maxWidth) {
        imgHeight = (imgHeight * maxWidth) / imgWidth
        imgWidth = maxWidth
      }
      if (imgHeight > maxHeight) {
        imgWidth = (imgWidth * maxHeight) / imgHeight
        imgHeight = maxHeight
      }

      // Centrer l'image sur le canvas
      const x = (canvas.width - imgWidth) / 2
      const y = (canvas.height - imgHeight) / 2

      // Dessiner l'image
      ctx.drawImage(img, x, y, imgWidth, imgHeight)

      // Sauvegarder la signature
      const dataURL = canvas.toDataURL('image/png')
      setSignatureData(dataURL)
      setError(null)
      
      if (showAlert) {
        alert('Signature importée avec succès!')
      }
    }

    img.onerror = () => {
      console.error('Erreur lors du chargement de l\'image de la signature')
      setError('Erreur lors du chargement de l\'image de la signature')
    }

    img.src = signatureDataUrl
  }, [])

  // Charger automatiquement la signature si elle existe
  useEffect(() => {
    if (signatureToLoad) {
      // Attendre un peu pour s'assurer que le canvas est complètement initialisé
      const timer = setTimeout(() => {
        loadConsultantSignatureToCanvas(signatureToLoad, false)
        setSignatureToLoad(null) // Réinitialiser après chargement
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [signatureToLoad, loadConsultantSignatureToCanvas])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
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
        const canvas = canvasRef.current
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
        setSignatureData(dataURL)
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
    if (!signatureData) {
      setError('Veuillez d\'abord créer ou télécharger une signature')
      return
    }

    if (!consultant) {
      setError('Consultant non trouvé')
      return
    }

    try {
      setSavingSignature(true)
      setError(null)

      // Enregistrer la signature dans user_signatures
      const result = await UserSignatureAPI.save(signatureData, {
        documentType: 'CRA',
        consultantId: consultant.id,
        month: month,
        year: year,
        metadata: {
          action: 'consultant_signature_saved',
          consultant_name: consultant.name,
          month_name: workLog?.monthName || `${month}/${year}`
        }
      })

      // Gérer différentes structures de réponse
      let response: any
      if (result?.data) {
        if (typeof result.data === 'object' && 'success' in result.data) {
          response = result.data
        } else if (typeof result.data === 'object' && 'data' in result.data) {
          response = result.data
        } else {
          response = { success: true, data: result.data }
        }
      } else {
        response = { success: true, data: result }
      }

      if (!response.success) {
        setError(response.message || 'Erreur lors de l\'enregistrement de la signature')
        return
      }

      // Marquer que la signature est enregistrée
      setSignatureSaved(true)
      
      console.log('Signature enregistrée avec succès:', response.data)
      alert('Signature enregistrée avec succès ! Cette signature sera réutilisée pour tous vos CRA.')
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la signature:', error)
      
      let errorMessage = 'Erreur lors de l\'enregistrement de la signature'
      
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setSavingSignature(false)
    }
  }

  // Fonction pour importer/charger la signature depuis user_signatures
  const handleImportSignature = async () => {
    try {
      setLoadingSignature(true)
      setError(null)

      // Récupérer toutes les signatures de type CRA pour trouver celle du consultant
      const allConsultantSignaturesResponse = await UserSignatureAPI.getByDocumentType('CRA')
      
      let allConsultantSignatures: any[] = []
      if (Array.isArray(allConsultantSignaturesResponse)) {
        allConsultantSignatures = allConsultantSignaturesResponse
      } else if (allConsultantSignaturesResponse && typeof allConsultantSignaturesResponse === 'object') {
        const apiResponse = allConsultantSignaturesResponse as any
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          allConsultantSignatures = apiResponse.data
        } else if (Array.isArray(apiResponse)) {
          allConsultantSignatures = apiResponse
        } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
          allConsultantSignatures = apiResponse.data
        }
      }
      
      // Trouver la dernière signature du consultant (la plus récente)
      const consultantSignatures = allConsultantSignatures
        .filter((sig: any) => {
          const userType = typeof sig.user_type === 'string' ? sig.user_type : ''
          return userType.includes('Consultant') || userType === 'App\\Models\\Consultant' || userType === 'App\Models\Consultant'
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.signed_at || a.created_at || 0).getTime()
          const dateB = new Date(b.signed_at || b.created_at || 0).getTime()
          return dateB - dateA
        })
      
      if (consultantSignatures.length > 0 && consultantSignatures[0].signature_data) {
        // Charger la signature sur le canvas
        loadConsultantSignatureToCanvas(consultantSignatures[0].signature_data, true)
      } else {
        setError('Aucune signature consultant trouvée')
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'importation de la signature:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de l\'importation de la signature'
      setError(errorMessage)
    } finally {
      setLoadingSignature(false)
    }
  }

  const generateAndDownloadPDF = async () => {
    if (!workLog || !consultant || !signatureData) return

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
    doc.text('Signature du Consultant', 20, yPosition)
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

      const img = await loadImage(signatureData)
      const imgWidth = 80
      const imgHeight = (img.height * imgWidth) / img.width
      
      if (yPosition + imgHeight > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }

      doc.addImage(signatureData, 'PNG', 20, yPosition, imgWidth, imgHeight)
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

    // Vérifier que la signature est présente
    if (!signatureData) {
      setError('Veuillez signer dans la zone de signature')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir signer votre CRA de ${workLog?.monthName} ?\n\nCette action est irréversible et certifie que les informations du CRA sont exactes.`)) {
      return
    }

    try {
      setSigning(true)
      setError(null)

      // Envoyer la signature du consultant
      const result = await WorkScheduleAPI.signCRA(month, year, signatureData, consultant.id)
      const response = result.data as any

      if (!response.success) {
        setError(response.message || 'Erreur lors de la signature')
        return
      }

      // Le PDF sera envoyé par email automatiquement quand toutes les signatures (consultant, client, manager) seront présentes
      
      // Rediriger vers le dashboard consultant
      router.push('/consultant/dashboard?signed=true')
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
              router.push('/consultant/dashboard')
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
                router.push('/consultant/dashboard')
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

        {/* Section de signature - Consultant */}
        <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
              <PenTool className="h-5 w-5 mr-2 text-primary" />
              Signature du Consultant
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
                    disabled={!signatureData || savingSignature}
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
              
              {/* Canvas de signature consultant */}
              <div className="border-2 border-dashed border-border rounded-lg bg-white dark:bg-gray-800 p-4">
                <canvas
                  ref={canvasRef}
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
                  onClick={clearSignature}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={!signatureData && !isDrawing}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Effacer la signature</span>
                </button>
              </div>
              
              {/* Aperçu de la signature */}
              {signatureData && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Signature consultant enregistrée</span>
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
              router.push('/consultant/dashboard')
            }}
            className="px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
            disabled={signing}
          >
            Annuler
          </button>
          <motion.button
            onClick={handleSign}
            disabled={signing || !signatureData}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!signing && signatureData ? { scale: 1.05 } : {}}
            whileTap={!signing && signatureData ? { scale: 0.95 } : {}}
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

