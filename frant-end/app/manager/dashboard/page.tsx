'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useConsultants } from '@/hooks/use-consultants'
import { useProjects } from '@/hooks/use-projects'
import { 
  Users, 
  Briefcase, 
  UserPlus, 
  Calculator,
  UserCheck,
  Shield,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Euro,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Plus,
  Settings,
  FileText,
  Activity,
  AlertCircle
} from 'lucide-react'

// TypeScript Interfaces
interface ManagerStats {
  totalConsultants: number
  activeConsultants: number
  totalProjects: number
  activeProjects: number
  totalManagers: number
  totalRh: number
  totalComptables: number
}

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth()
  const { consultants: allConsultants, loading: consultantsLoading, error: consultantsError } = useConsultants()
  const { projects, loading: projectsLoading, error: projectsError } = useProjects()
  
  // State pour gérer la visibilité des sections
  const [visibleSections, setVisibleSections] = useState({
    consultants: true,
    rh: false,
    comptables: false,
    projects: false
  })
  
  // State for manager statistics
  const [stats, setStats] = useState<ManagerStats>({
    totalConsultants: 0,
    activeConsultants: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalManagers: 0,
    totalRh: 0,
    totalComptables: 0
  })

  // Filtrer les consultants par client_id du manager
  const consultants = React.useMemo(() => {
    if (!user?.client_id || !allConsultants) return []
    return allConsultants.filter(c => c.client_id === user.client_id)
  }, [allConsultants, user?.client_id])

  // Calculate statistics
  useEffect(() => {
    if (consultants && projects) {
      const activeConsultants = consultants.filter(c => c.status === 'active').length
      const activeProjects = projects.filter(p => p.start_date && !p.end_date).length
      
      setStats({
        totalConsultants: consultants.length,
        activeConsultants,
        totalProjects: projects.length,
        activeProjects,
        totalManagers: 1, // Le manager actuel
        totalRh: 0, // TODO: Fetch from API
        totalComptables: 0 // TODO: Fetch from API
      })
    }
  }, [consultants, projects])

  // Redirection si pas authentifié
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
  if (authLoading || consultantsLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'consultant': return 'bg-blue-100 text-blue-800'
      case 'manager': return 'bg-orange-100 text-orange-800'
      case 'rh': return 'bg-green-100 text-green-800'
      case 'comptable': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  // Fonction pour afficher une section et défiler vers elle
  const showSection = (sectionKey: 'consultants' | 'rh' | 'comptables' | 'projects', sectionId: string) => {
    // Cacher toutes les sections et afficher uniquement celle sélectionnée
    setVisibleSections({
      consultants: false,
      rh: false,
      comptables: false,
      projects: false,
      [sectionKey]: true
    })
    
    // Attendre un peu que la section soit rendue, puis défiler
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Navigation cards data
  const navigationCards = [
    {
      title: 'Gérer les Consultants',
      description: 'Voir la liste des consultants',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100',
      sectionId: 'consultants-section',
      sectionKey: 'consultants' as const
    },
    {
      title: 'Gérer les RH',
      description: 'Voir la liste des RH',
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      hoverColor: 'hover:bg-green-100',
      sectionId: 'rh-section',
      sectionKey: 'rh' as const
    },
    {
      title: 'Gérer les Comptables',
      description: 'Voir la liste des comptables',
      icon: Calculator,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-100',
      sectionId: 'comptables-section',
      sectionKey: 'comptables' as const
    },
    {
      title: 'Voir les Projets',
      description: 'Consulter la liste des projets',
      icon: Briefcase,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      hoverColor: 'hover:bg-indigo-100',
      sectionId: 'projects-section',
      sectionKey: 'projects' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Manager
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {(user as any)?.name || user?.contact_name || 'Manager'}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.company_name || 'Entreprise'}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <motion.button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeConsultants}/{stats.totalConsultants}
                </p>
                <p className="text-xs text-gray-500">actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeProjects}/{stats.totalProjects}
                </p>
                <p className="text-xs text-gray-500">actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RH</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRh}</p>
                <p className="text-xs text-gray-500">utilisateurs</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comptables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComptables}</p>
                <p className="text-xs text-gray-500">utilisateurs</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => (
              <motion.div
                key={card.title}
                className={`${card.bgColor} p-6 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 ${card.hoverColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => showSection(card.sectionKey, card.sectionId)}
              >
                <div className="flex items-center mb-4">
                  <card.icon className={`h-8 w-8 ${card.textColor}`} />
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {card.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Consultants Table */}
        {visibleSections.consultants && (
        <div id="consultants-section" className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Consultants Récemment Ajoutés
              </h2>
              <motion.button
                onClick={() => router.push('/manager/consultant/add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Consultant</span>
              </motion.button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compétences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux journalier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultantsError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-red-600">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Erreur: {consultantsError}</p>
                      </div>
                    </td>
                  </tr>
                ) : consultants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun consultant trouvé
                    </td>
                  </tr>
                ) : (
                  consultants.slice(0, 5).map((consultant) => (
                    <motion.tr 
                      key={consultant.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {consultant.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {consultant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consultant.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultant.skills || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {consultant.daily_rate ? `€${consultant.daily_rate}/jour` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(consultant.status)}`}>
                          {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => router.push(`/client/users/${consultant.id}`)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => router.push(`/client/users/${consultant.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Placeholder sections pour RH, Comptables, Projets */}
        {visibleSections.rh && (
        <div id="rh-section" className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des RH</h2>
              <motion.button
                onClick={() => router.push('/manager/rh/add')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter RH</span>
              </motion.button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">Section en cours de développement</p>
          </div>
        </div>
        )}

        {visibleSections.comptables && (
        <div id="comptables-section" className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Comptables</h2>
              <motion.button
                onClick={() => router.push('/manager/comptable/add')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Comptable</span>
              </motion.button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">Section en cours de développement</p>
          </div>
        </div>
        )}

        {visibleSections.projects && (
        <div id="projects-section" className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Projets</h2>
              <motion.button
                onClick={() => router.push('/client/projects/add')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Projet</span>
              </motion.button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">Section en cours de développement</p>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}

