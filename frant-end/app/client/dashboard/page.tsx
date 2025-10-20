'use client'
                            
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useProjects } from '@/hooks/use-projects'
import { useConsultants } from '@/hooks/use-consultants'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  Users, 
  Briefcase, 
  Clock, 
  Euro, 
  Plus, 
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  UserCheck,
  Shield,
  LogOut,
  Calculator
} from 'lucide-react'

// TypeScript Interfaces
interface Consultant {
  id: string
  name: string
  role: 'Designer' | 'Developer' | 'Manager' | 'Analyst' | 'Consultant'
  currentProject: string
  dailyRate: number
  daysToday: number
  totalDays: number
  leaveToday: number
  totalLeave: number
  travelExpenses: number
  workedDaysLastMonth: number
  cumulativeWorkedDays: number
  avatar?: string
}

interface Project {
  id: string
  name: string
  status: 'Active' | 'Completed' | 'On Hold'
  totalDays: number
  totalCost: number
  assignedConsultants: string[]
  startDate: string
  endDate?: string
}

interface DailyDays {
  date: string
  days: number
  cost: number
}

// Mock Data
const mockConsultants: Consultant[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    role: 'Designer',
    currentProject: 'E-commerce Redesign',
    dailyRate: 450,
    daysToday: 1,
    totalDays: 15,
    leaveToday: 0,
    totalLeave: 5,
    travelExpenses: 0,
    workedDaysLastMonth: 18,
    cumulativeWorkedDays: 156
  },
  {
    id: '2',
    name: 'Jean Martin',
    role: 'Developer',
    currentProject: 'Mobile App Development',
    dailyRate: 550,
    daysToday: 1,
    totalDays: 25,
    leaveToday: 0,
    totalLeave: 8,
    travelExpenses: 25,
    workedDaysLastMonth: 22,
    cumulativeWorkedDays: 198
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    role: 'Manager',
    currentProject: 'Project Management',
    dailyRate: 600,
    daysToday: 1,
    totalDays: 10,
    leaveToday: 1,
    totalLeave: 12,
    travelExpenses: 0,
    workedDaysLastMonth: 15,
    cumulativeWorkedDays: 142
  },
  {
    id: '4',
    name: 'Pierre Moreau',
    role: 'Analyst',
    currentProject: 'Data Analysis',
    dailyRate: 400,
    daysToday: 1,
    totalDays: 19,
    leaveToday: 0,
    totalLeave: 3,
    travelExpenses: 15,
    workedDaysLastMonth: 20,
    cumulativeWorkedDays: 175
  }
]

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Redesign',
    status: 'Active',
    totalDays: 40,
    totalCost: 14400,
    assignedConsultants: ['Marie Dubois', 'Jean Martin'],
    startDate: '2024-01-15',
    endDate: '2024-03-15'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    status: 'Active',
    totalDays: 56,
    totalCost: 24750,
    assignedConsultants: ['Jean Martin', 'Sophie Laurent'],
    startDate: '2024-02-01',
    endDate: '2024-05-01'
  },
  {
    id: '3',
    name: 'Data Analysis Project',
    status: 'Completed',
    totalDays: 25,
    totalCost: 8000,
    assignedConsultants: ['Pierre Moreau'],
    startDate: '2023-12-01',
    endDate: '2024-01-31'
  }
]

const mockDailyDays: DailyDays[] = [
  { date: '2024-01-15', days: 3.5, cost: 1260 },
  { date: '2024-01-16', days: 4, cost: 1440 },
  { date: '2024-01-17', days: 3.75, cost: 1350 },
  { date: '2024-01-18', days: 3.25, cost: 1170 },
  { date: '2024-01-19', days: 3, cost: 1080 },
  { date: '2024-01-22', days: 3.625, cost: 1305 },
  { date: '2024-01-23', days: 3.875, cost: 1395 }
]

// Helper Functions
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'Designer': return 'bg-purple-100 text-purple-800'
    case 'Developer': return 'bg-blue-100 text-blue-800'
    case 'Manager': return 'bg-green-100 text-green-800'
    case 'Analyst': return 'bg-orange-100 text-orange-800'
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

// Main Dashboard Component
export default function ClientDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError, isAuthenticated, logout } = useAuth()
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects()
  const { consultants, loading: consultantsLoading, error: consultantsError, refetch: refetchConsultants } = useConsultants()
  
  // Filtrer les projets pour n'afficher que ceux du client connecté
  const clientProjects = projects?.filter(p => p.client_id === user?.id) || []
  
  // Calculate summary statistics from real data
  const totalActiveProjects = clientProjects?.filter(p => p.start_date && !p.end_date).length || 0
  const totalConsultants = consultants?.filter(c => c.client_id === user?.id).length || 0
  const totalDaysLogged = 0 // TODO: Calculate from work schedules
  const totalDailyCost = 0 // TODO: Calculate from work schedules
  
  // Filtrer les consultants pour n'afficher que ceux du client connecté
  const clientConsultants = consultants?.filter(c => c.client_id === user?.id) || []
  
  const totalMonthlyDays = mockDailyDays.reduce((sum, d) => sum + d.days, 0)
  const totalMonthlyCost = mockDailyDays.reduce((sum, d) => sum + d.cost, 0)
  const averageCostPerDay = totalMonthlyCost / mockDailyDays.length

  // Combined loading state
  const loading = authLoading || projectsLoading || consultantsLoading
  const error = authError || projectsError || consultantsError

  // Redirection si pas authentifié - utiliser useEffect pour éviter l'erreur de rendu
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Si pas authentifié, ne rien afficher pendant la redirection
  if (!authLoading && !isAuthenticated) {
    return null
  }

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  {user?.company_name?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.company_name || 'Client Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {user?.contact_name ? `Contact: ${user.contact_name}` : 'Client Dashboard'}
                </p>
                {user?.contact_email && (
                  <p className="text-sm text-muted-foreground">{user.contact_email}</p>
                )}
              </div>
            </div>
            
            {/* Quick Summary */}
            <div className="flex space-x-4">
              <motion.div 
                className="bg-card p-4 rounded-lg border border-border"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground">{totalActiveProjects}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-card p-4 rounded-lg border border-border"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Consultants</p>
                    <p className="text-2xl font-bold text-foreground">{totalConsultants}</p>
                  </div>
                </div>
              </motion.div>

              {/* Bouton de déconnexion */}
              <motion.button
                onClick={logout}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/80 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Consultants Table */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">Consultants & Team</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Compétences
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tarif journalier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {consultantsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            <span className="text-muted-foreground">Chargement des consultants...</span>
                          </div>
                        </td>
                      </tr>
                    ) : consultantsError ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-destructive">
                            <p>Erreur: {consultantsError}</p>
                            <button 
                              onClick={refetchConsultants}
                              className="mt-2 text-primary hover:underline"
                            >
                              Réessayer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : !clientConsultants || clientConsultants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun consultant trouvé
                        </td>
                      </tr>
                    ) : (
                      clientConsultants?.map((consultant) => {
                        return (
                          <motion.tr 
                            key={consultant.id}
                            className="hover:bg-muted/50"
                            whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                            transition={{ duration: 0.2 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {consultant.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-card-foreground">
                                    {consultant.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {consultant.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(consultant.role)}`}>
                                {consultant.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                              {consultant.skills || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {consultant.daily_rate ? `€${consultant.daily_rate}/jour` : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                consultant.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() => router.push(`/client/users/${consultant.id}`)}
                                  className="text-primary hover:text-primary/80 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => router.push(`/client/users/${consultant.id}/edit` as any)}
                                  className="text-secondary hover:text-secondary/80 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => {
                                    if (confirm('Êtes-vous sûr de vouloir supprimer ce consultant ?')) {
                                      // TODO: API call to delete consultant
                                      console.log('Delete consultant:', consultant.id)
                                    }
                                  }}
                                  className="text-destructive hover:text-destructive/80 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Charts */}
          <div className="space-y-6">
            {/* Days Chart */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Jours Travaillés Quotidiens</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockDailyDays}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value, name) => [value, name === 'days' ? 'Jours' : 'Coût (€)']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="days" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Projects</h2>
            <div className="flex space-x-3">
              <motion.button
                onClick={() => router.push('/client/users/add' as any)}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="h-4 w-4" />
                <span>Add Consultant</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/client/manager/add')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-4 w-4" />
                <span>Add Manager</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/client/rh/add')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserCheck className="h-4 w-4" />
                <span>Add RH</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/client/comptable/add')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calculator className="h-4 w-4" />
                <span>Add Comptable</span>
              </motion.button>
              <motion.button
                onClick={() => {router.push('/client/projects/add');}}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Project</span>
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  <span className="text-muted-foreground">Chargement des projets...</span>
                </div>
              </div>
            ) : projectsError ? (
              <div className="col-span-full text-center py-8">
                <div className="text-destructive">
                  <p>Erreur: {projectsError}</p>
                  <button 
                    onClick={refetchProjects}
                    className="mt-2 text-primary hover:underline"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : !clientProjects || clientProjects.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Aucun projet trouvé
              </div>
            ) : (
              clientProjects?.map((project) => {
                const status = project.end_date ? 'Completed' : (project.start_date ? 'Active' : 'On Hold')
                return (
                  <motion.div
                    key={project.id}
                    className="bg-card rounded-lg shadow-sm border border-border p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-card-foreground">{project.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {project.description && (
                        <div className="text-sm text-muted-foreground">
                          {project.description}
                        </div>
                      )}
                      
                      {project.start_date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Date de début:</span>
                          <span className="text-sm font-medium text-card-foreground">
                            {new Date(project.start_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      {project.end_date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Date de fin:</span>
                          <span className="text-sm font-medium text-card-foreground">
                            {new Date(project.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Consultant:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {project.consultants?.map((consultant: any) => consultant.name).join(', ') || 'Aucun consultant assigné'}
                        </span>
                      </div>
                      
                      <motion.button
                        onClick={() => router.push(`/client/projects/${project.id}`)}
                        className="w-full mt-4 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Voir les détails</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// TODO: Replace mock data with API calls
// - fetchConsultants() - GET /api/consultants
// - fetchProjects() - GET /api/projects  
// - fetchDailyHours() - GET /api/hours/daily
// - fetchClientInfo() - GET /api/client/info
