import axios from 'axios'
import type {
  Client,
  Manager,
  Rh,
  Comptable,
  Consultant,
  Project,
  Assignment,
  Quote,
  Facture,
  FactureItem,
  WorkSchedule,
  WorkType,
  LeaveType,
  Conge
} from '@/lib/type'

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean
  data: T
}

// ----- Axios instance -----
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.saas.oncree.fr/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log pour debug (surtout pour MFA)
    if (config.url?.includes('mfa/verify')) {
      console.log('🔍 Axios Request Interceptor - MFA Verify:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      })
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Log pour debug (surtout pour MFA)
    if (response.config.url?.includes('mfa/verify')) {
      console.log('✅ Axios Response Interceptor - MFA Verify Success:', {
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    // Log pour debug (surtout pour MFA)
    if (error.config?.url?.includes('mfa/verify')) {
      console.error('❌ Axios Response Interceptor - MFA Verify Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: error.config?.data
      })
    }
    
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userType')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
// ========================
// 🚀 SYSTÈME DE CACHE
// ========================
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes par défaut

/**
 * Fonction helper pour faire des appels GET avec cache
 */
export const cachedGet = async <T>(url: string, ttl = CACHE_TTL): Promise<T> => {
  const now = Date.now()
  const cached = apiCache.get(url)
  
  // Si cache existe et pas expiré, retourner depuis cache
  if (cached && now - cached.timestamp < ttl) {
    console.log(`✅ Cache HIT: ${url}`)
    return cached.data
  }
  
  // Sinon, faire l'appel API
  console.log(`🌐 API CALL: ${url}`)
  try {
    const response = await api.get<T>(url)
    
    // Mettre en cache seulement si la réponse est réussie
    if (response.data) {
      apiCache.set(url, { data: response.data, timestamp: now })
    }
    
    return response.data
  } catch (error: any) {
    // Ne pas mettre en cache les erreurs
    // Améliorer le logging pour mieux capturer les détails
    const errorDetails: any = {
      url,
      message: error?.message || 'Erreur inconnue',
      name: error?.name,
      code: error?.code,
    }
    
    // Ajouter les détails de la réponse si disponibles
    if (error?.response) {
      errorDetails.status = error.response.status
      errorDetails.statusText = error.response.statusText
      errorDetails.headers = error.response.headers
      
      // Essayer de capturer les données de réponse de différentes manières
      try {
        errorDetails.data = error.response.data
      } catch (e) {
        errorDetails.dataError = 'Impossible de lire les données de réponse'
      }
      
      // Si les données sont un objet, essayer de les sérialiser
      if (error.response.data && typeof error.response.data === 'object') {
        try {
          errorDetails.dataString = JSON.stringify(error.response.data, null, 2)
        } catch (e) {
          errorDetails.dataString = 'Impossible de sérialiser les données'
        }
      }
    } else if (error?.request) {
      errorDetails.requestError = 'Aucune réponse reçue du serveur'
      errorDetails.request = error.request
    }
    
    console.error(`❌ Erreur API pour ${url}:`, errorDetails)
    console.error('❌ Erreur complète:', error)
    
    throw error // Re-lancer l'erreur pour que le code appelant puisse la gérer
  }
}

/**
 * Fonction pour invalider le cache
 */
export const invalidateCache = (pattern?: string) => {
  if (!pattern) {
    apiCache.clear()
    console.log('🗑️ Cache vidé complètement')
    return
  }
  
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key)
      console.log(`🗑️ Cache invalidé: ${key}`)
    }
  }
}

/**
 * Fonction pour vider le cache au logout
 */
export const clearAllCache = () => {
  apiCache.clear()
  console.log('🗑️ Tout le cache a été vidé')
}

/**
 * Fonction pour obtenir des données groupées par mois avec cache intelligent
 */
export const getWorkLogsGroupedByMonth = async (year?: number, month?: number): Promise<any[]> => {
  const cacheKey = year && month 
    ? `/work-logs-grouped/${year}/${month}` 
    : '/work-logs-grouped'
  
  // Cache plus long pour les données groupées (15 minutes)
  const response = await cachedGet<ApiResponse<any[]>>(cacheKey, 15 * 60 * 1000)
  return response.data
}


// ========================
//  CLIENTS
// ========================
export const ClientAPI = {
  all: () => cachedGet<Client[]>('/clients', 5 * 60 * 1000),
  get: (id: number) => cachedGet<Client>(`/clients/${id}`, 3 * 60 * 1000),
  create: async (data: Partial<Client>) => {
    const result = await api.post<Client>('/clients', data)
    invalidateCache('/clients')
    invalidateCache('/admin/consultants-data')
    return result
  },
  update: async (id: number, data: Partial<Client>) => {
    const result = await api.put<Client>(`/clients/${id}`, data)
    invalidateCache('/clients')
    invalidateCache('/admin/consultants-data')
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/clients/${id}`)
    invalidateCache('/clients')
    invalidateCache('/admin/consultants-data')
    return result
  },
  // Récupérer les informations du client connecté
  me: () => cachedGet<Client>('/client/me', 2 * 60 * 1000)
}

// ========================
//  MANAGERS
// ========================
export const ManagerAPI = {
  all: () => api.get<Manager[]>('/managers'),
  get: (id: number) => api.get<Manager>(`/managers/${id}`),
  create: (data: Partial<Manager>) => api.post<Manager>('/managers', data),
  update: (id: number, data: Partial<Manager>) => api.put<Manager>(`/managers/${id}`, data),
  delete: (id: number) => api.delete(`/managers/${id}`)
}

// ========================
//  RH
// ========================
export const RhAPI = {
  all: () => api.get<Rh[]>('/rh'),
  get: (id: number) => api.get<Rh>(`/rh/${id}`),
  create: (data: Partial<Rh>) => api.post<Rh>('/rh', data),
  update: (id: number, data: Partial<Rh>) => api.put<Rh>(`/rh/${id}`, data),
  delete: (id: number) => api.delete(`/rh/${id}`),
  // Récupérer les informations du RH connecté
  me: () => cachedGet<Rh>('/rh/me', 2 * 60 * 1000)
}

// ========================
//  COMPTABLES
// ========================
export const ComptableAPI = {
  all: () => cachedGet<Comptable[]>('/comptables', 5 * 60 * 1000), // Cache 5 minutes
  get: (id: number) => cachedGet<Comptable>(`/comptables/${id}`, 3 * 60 * 1000),
  create: async (data: Partial<Comptable>) => {
    const result = await api.post<Comptable>('/comptables', data)
    invalidateCache('/comptables') // Invalider cache après création
    return result
  },
  update: async (id: number, data: Partial<Comptable>) => {
    const result = await api.put<Comptable>(`/comptables/${id}`, data)
    invalidateCache('/comptables') // Invalider cache après modification
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/comptables/${id}`)
    invalidateCache('/comptables') // Invalider cache après suppression
    return result
  },
  // Récupérer les informations du comptable connecté
  me: () => cachedGet<Comptable>('/comptable/me', 2 * 60 * 1000),
  // 🚀 Endpoints filtrés par client_id du comptable
  getMyConsultants: async () => {
    const response = await cachedGet<ApiResponse<Consultant[]>>('/comptable/consultants', 3 * 60 * 1000)
    return response.data
  },
  getMyWorkSchedules: async () => {
    const response = await cachedGet<ApiResponse<WorkSchedule[]>>('/comptable/work-schedules', 3 * 60 * 1000)
    return response.data
  },
  getMyFactures: async () => {
    const response = await cachedGet<ApiResponse<Facture[]>>('/comptable/factures', 3 * 60 * 1000)
    return response.data
  }
}

// ========================
//  CONSULTANTS
// ========================
export const ConsultantAPI = {
  all: () => cachedGet<Consultant[]>('/consultants', 5 * 60 * 1000), // Cache 5 minutes
  get: (id: number) => cachedGet<Consultant>(`/consultants/${id}`, 3 * 60 * 1000),
  create: async (data: Partial<Consultant>) => {
    const result = await api.post<Consultant>('/consultants', data)
    invalidateCache('/consultants') // Invalider cache après création
    invalidateCache('/admin/consultants-data')
    return result
  },
  update: async (id: number, data: Partial<Consultant>) => {
    const result = await api.put<Consultant>(`/consultants/${id}`, data)
    invalidateCache('/consultants') // Invalider cache après modification
    invalidateCache('/consultant/dashboard-data')
    invalidateCache('/admin/consultants-data')
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/consultants/${id}`)
    invalidateCache('/consultants') // Invalider cache après suppression
    invalidateCache('/admin/consultants-data')
    return result
  },
  assignToProject: async (id: number, projectId: number) => {
    const result = await api.put<Consultant>(`/consultants/${id}/assign-to-project/${projectId}`)
    invalidateCache('/consultants')
    invalidateCache('/projects')
    invalidateCache('/admin/consultants-data')
    return result
  },
  // Récupérer les informations du consultant connecté avec son projet et ses work schedules
  me: () => cachedGet<{ consultant: Consultant; project: Project | null; workSchedules: WorkSchedule[] }>('/consultant/me', 2 * 60 * 1000)
}

// ========================
//  PROJECTS
// ========================
export const ProjectAPI = {
  all: () => cachedGet<Project[]>('/projects', 5 * 60 * 1000),
  get: (id: number) => cachedGet<Project>(`/projects/${id}`, 3 * 60 * 1000),
  create: async (data: Partial<Project>) => {
    const result = await api.post<Project>('/projects', data)
    invalidateCache('/projects')
    invalidateCache('/admin/consultants-data')
    invalidateCache('/consultant/dashboard-data')
    return result
  },
  update: async (id: number, data: Partial<Project>) => {
    const result = await api.put<Project>(`/projects/${id}`, data)
    invalidateCache('/projects')
    invalidateCache('/admin/consultants-data')
    invalidateCache('/consultant/dashboard-data')
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/projects/${id}`)
    invalidateCache('/projects')
    invalidateCache('/admin/consultants-data')
    return result
  },
  assignConsultants: async (id: number, consultants: number[]) => {
    const result = await api.put<Project>(`/projects/${id}/assign-consultants`, { consultants })
    invalidateCache('/projects')
    invalidateCache('/consultants')
    invalidateCache('/admin/consultants-data')
    return result
  }
}

// ========================
//  ASSIGNMENTS
// ========================
export const AssignmentAPI = {
  all: () => api.get<Assignment[]>('/assignments'),
  get: (id: number) => api.get<Assignment>(`/assignments/${id}`),
  create: (data: Partial<Assignment>) => api.post<Assignment>('/assignments', data),
  update: (id: number, data: Partial<Assignment>) => api.put<Assignment>(`/assignments/${id}`, data),
  delete: (id: number) => api.delete(`/assignments/${id}`)
}

// ========================
//  QUOTES (DEVIS)
// ========================
export const QuoteAPI = {
  all: () => api.get<Quote[]>('/quotes'),
  get: (id: number) => api.get<Quote>(`/quotes/${id}`),
  create: (data: Partial<Quote>) => api.post<Quote>('/quotes', data),
  update: (id: number, data: Partial<Quote>) => api.put<Quote>(`/quotes/${id}`, data),
  delete: (id: number) => api.delete(`/quotes/${id}`)
}

// ========================
//  FACTURES
// ========================
export const FactureAPI = {
  all: () => api.get<Facture[]>('/factures'),
  get: (id: number) => api.get<Facture>(`/factures/${id}`),
  create: (data: Partial<Facture>) => api.post<Facture>('/factures', data),
  update: (id: number, data: Partial<Facture>) => api.put<Facture>(`/factures/${id}`, data),
  delete: (id: number) => api.delete(`/factures/${id}`),
  sendEmail: (id: number) => api.post<{ success: boolean; message: string }>(`/factures/${id}/send-email`)
}

// Items d’une facture
export const FactureItemAPI = {
  create: (data: Partial<FactureItem>) => api.post<FactureItem>('/facture-items', data),
  update: (id: number, data: Partial<FactureItem>) => api.put<FactureItem>(`/facture-items/${id}`, data),
  delete: (id: number) => api.delete(`/facture-items/${id}`)
}

// ========================
//  WORK SCHEDULES
// ========================
export const WorkScheduleAPI = {
  all: () => cachedGet<WorkSchedule[]>('/work-schedules', 5 * 60 * 1000), // Cache augmenté à 5 minutes
  mine: () => cachedGet<ApiResponse<WorkSchedule[]>>('/my-work-schedules', 5 * 60 * 1000),
  getGroupedByMonth: async () => {
    const response = await cachedGet<ApiResponse<any[]>>('/work-logs-grouped', 10 * 60 * 1000) // Cache 10 minutes pour données groupées
    return response.data // Retourner directement les données groupées
  },
  get: (id: number) => cachedGet<WorkSchedule>(`/work-schedules/${id}`, 2 * 60 * 1000),
  create: async (data: Partial<WorkSchedule>) => {
    const result = await api.post<WorkSchedule>('/work-schedules', data)
    invalidateCache('/work-schedules')
    invalidateCache('/my-work-schedules')
    invalidateCache('/work-logs-grouped')
    invalidateCache('/consultant/dashboard-data')
    return result
  },
  update: async (id: number, data: Partial<WorkSchedule>) => {
    const result = await api.put<WorkSchedule>(`/work-schedules/${id}`, data)
    invalidateCache('/work-schedules')
    invalidateCache('/my-work-schedules')
    invalidateCache('/work-logs-grouped')
    invalidateCache('/consultant/dashboard-data')
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/work-schedules/${id}`)
    invalidateCache('/work-schedules')
    invalidateCache('/my-work-schedules')
    invalidateCache('/work-logs-grouped')
    invalidateCache('/consultant/dashboard-data')
    return result
  },
  // Signer un CRA mensuel
  signCRA: async (month: number, year: number, signatureData?: string, consultantId?: number) => {
    const result = await api.post<ApiResponse<{ signature: any; signed_at: string }>>('/sign-cra', { 
      month, 
      year,
      signature_data: signatureData,
      consultant_id: consultantId
    })
    invalidateCache('/work-logs-grouped')
    return result
  },
  // Vérifier si un CRA est signé
  checkCRASignature: async (month: number, year: number, consultantId?: number) => {
    const response = await api.get<{ success: boolean; is_signed: boolean; signature: { signed_at: string; created_at: string } | null }>('/check-cra-signature', {
      params: { month, year, consultant_id: consultantId }
    })
    // Le backend retourne directement { success, is_signed, signature }
    return response.data
  },
  // Vérifier le statut détaillé des signatures
  checkCRASignatureStatus: async (month: number, year: number, consultantId?: number) => {
    const response = await api.get<{ success: boolean; status: any }>('/check-cra-signature-status', {
      params: { month, year, consultant_id: consultantId }
    })
    return response.data
  },
  // Vérifier les signatures pour plusieurs périodes (optimisé)
  checkCRASignatures: async (periods: Array<{ month: number; year: number }>, consultantId?: number) => {
    const response = await api.post<{ success: boolean; signatures: Record<string, any> }>('/check-cra-signatures', {
      periods,
      consultant_id: consultantId
    })
    return response.data
  },
  // Télécharger le PDF du CRA signé
  downloadSignedCRAPDF: async (consultantId: number, month: number, year: number) => {
    try {
      const response = await api.get('/download-signed-cra-pdf', {
        params: { consultant_id: consultantId, month, year },
        responseType: 'blob' // Important pour télécharger un fichier
      })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extraire le nom du fichier depuis les headers ou utiliser un nom par défaut
      const contentDisposition = response.headers['content-disposition']
      let fileName = `CRA_Signe_${month}_${year}.pdf`
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) {
          fileName = fileNameMatch[1]
        }
      }
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      throw error
    }
  }
}

// ========================
//  WORK TYPES
// ========================
export const WorkTypeAPI = {
  // Utilise le cache car ces données changent rarement
  all: () => cachedGet<ApiResponse<WorkType[]>>('/work-types', 30 * 60 * 1000) // Cache 30 minutes
}

// ========================
//  LEAVE TYPES
// ========================
export const LeaveTypeAPI = {
  // Utilise le cache car ces données changent rarement
  all: () => cachedGet<ApiResponse<LeaveType[]>>('/leave-types', 30 * 60 * 1000) // Cache 30 minutes
}

// ========================
//  CONGES (LEAVES)
// ========================
export const CongeAPI = {
  // Récupérer tous les congés (pour RH/Admin)
  all: () => cachedGet<ApiResponse<Conge[]>>('/conges', 2 * 60 * 1000),
  
  // Récupérer les congés du consultant connecté
  mine: () => cachedGet<ApiResponse<Conge[]>>('/my-conges', 2 * 60 * 1000),
  
  // Récupérer les congés en attente (pour RH)
  pending: () => cachedGet<ApiResponse<Conge[]>>('/rh/pending-conges', 1 * 60 * 1000),
  
  // Récupérer un congé spécifique
  get: (id: number) => cachedGet<ApiResponse<Conge>>(`/conges/${id}`, 2 * 60 * 1000),
  
  // Créer une demande de congé (consultant)
  create: async (data: { start_date: string; end_date: string; leave_type_id?: number | null; reason?: string | null }) => {
    const result = await api.post<ApiResponse<Conge>>('/conges', data)
    invalidateCache('/conges')
    invalidateCache('/my-conges')
    invalidateCache('/rh/pending-conges')
    return result
  },
  
  // Mettre à jour le statut d'un congé (RH)
  update: async (id: number, data: { status: 'approved' | 'rejected'; rh_comment?: string | null }) => {
    const result = await api.put<ApiResponse<Conge>>(`/conges/${id}`, data)
    invalidateCache('/conges')
    invalidateCache('/my-conges')
    invalidateCache('/rh/pending-conges')
    return result
  },
  
  // Supprimer une demande de congé (consultant, uniquement si pending)
  delete: async (id: number) => {
    const result = await api.delete(`/conges/${id}`)
    invalidateCache('/conges')
    invalidateCache('/my-conges')
    invalidateCache('/rh/pending-conges')
    return result
  }
}

// ========================
//  SCHEDULE CONTESTS
// ========================
export interface ScheduleContest {
  id: number
  client_id: number
  consultant_id: number
  work_schedule_id: number
  justification: string
  status: 'pending' | 'resolved' | 'rejected'
  created_at: string
  updated_at: string
  client?: Client
  consultant?: Consultant
  work_schedule?: WorkSchedule
}

export const ScheduleContestAPI = {
  all: () => cachedGet<ApiResponse<ScheduleContest[]>>('/schedule-contests', 2 * 60 * 1000),
  get: (id: number) => cachedGet<ScheduleContest>(`/schedule-contests/${id}`, 2 * 60 * 1000),
  create: async (data: { work_schedule_id: number; justification: string }) => {
    const result = await api.post<ScheduleContest>('/schedule-contests', data)
    invalidateCache('/schedule-contests')
    invalidateCache('/work-schedules')
    return result
  },
  update: async (id: number, data: Partial<ScheduleContest>) => {
    const result = await api.put<ScheduleContest>(`/schedule-contests/${id}`, data)
    invalidateCache('/schedule-contests')
    invalidateCache('/work-schedules')
    return result
  },
  delete: async (id: number) => {
    const result = await api.delete(`/schedule-contests/${id}`)
    invalidateCache('/schedule-contests')
    invalidateCache('/work-schedules')
    return result
  }
}

// ========================
//  PASSWORD RECOVERY (NEW - 6-digit code system)
// ========================
export const PasswordRecoveryAPI = {
  // Step 1: Send 6-digit code to email
  sendResetCode: (email: string) => api.post('/forgot-password', { email }),
  
  // Step 2: Verify the 6-digit code
  verifyCode: (email: string, code: string) => api.post('/verify-code', { email, code }),
  
  // Step 3: Reset password with verified code
  resetPassword: (email: string, code: string, password: string, password_confirmation: string) => 
    api.post('/reset-password', { email, code, password, password_confirmation })
}

// ========================
//  MFA
// ========================
export const MfaAPI = {
  verify: (challengeId: string, code: string) => {
    console.log('🔍 MfaAPI.verify appelé avec:', { challengeId, code })
    const requestData = { challenge_id: challengeId, code }
    console.log('📤 Données de la requête:', requestData)
    return api.post('/mfa/verify', requestData)
  }
}

// ========================
// 🚀 ENDPOINTS AGRÉGÉS (DASHBOARD)
// ========================
export const DashboardAPI = {
  /**
   * 🚀 1 seul appel pour toutes les données du dashboard consultant
   * Remplace: ConsultantAPI.me() + WorkTypeAPI.all() + LeaveTypeAPI.all()
   * Performance: 3x plus rapide!
   */
  consultantDashboard: async () => {
    const response = await cachedGet<ApiResponse<{
      consultant: Consultant
      project: Project | null
      workSchedules: WorkSchedule[]
      workTypes: WorkType[]
      leaveTypes: LeaveType[]
    }>>('/consultant/dashboard-data', 3 * 60 * 1000) // Cache 3 minutes
    
    return response.data // Retourner directement les données
  },
  
  /**
   * 🚀 1 seul appel pour toutes les données de la page admin consultants
   * Remplace: ConsultantAPI.all() + ClientAPI.all() + ProjectAPI.all()
   * Performance: 3x plus rapide!
   */
  adminConsultants: async () => {
    const response = await cachedGet<ApiResponse<{
      consultants: Consultant[]
      clients: Client[]
      projects: Project[]
    }>>('/admin/consultants-data', 5 * 60 * 1000) // Cache 5 minutes
    
    return response.data // Retourner directement les données
  }
}
