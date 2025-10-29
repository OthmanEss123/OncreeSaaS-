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
  LeaveType
} from '@/lib/type'

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean
  data: T
}

// ----- Axios instance -----
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://saas.oncree.fr/api',
  headers: { 'Content-Type': 'application/json' }
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
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  const response = await api.get<T>(url)
  
  // Mettre en cache
  apiCache.set(url, { data: response.data, timestamp: now })
  
  return response.data
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
  delete: (id: number) => api.delete(`/factures/${id}`)
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
