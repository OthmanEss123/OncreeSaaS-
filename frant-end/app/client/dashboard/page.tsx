'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useConsultants } from '@/hooks/use-consultants'
import { useProjects } from '@/hooks/use-projects'
import { useManagers } from '@/hooks/use-managers'
import { useRh } from '@/hooks/use-rh'
import { useComptables } from '@/hooks/use-comptables'
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
interface ClientStats {
  totalConsultants: number
  activeConsultants: number
  totalProjects: number
  activeProjects: number
  totalManagers: number
  totalRh: number
  totalComptables: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth()
  const { consultants: allConsultants, loading: consultantsLoading, error: consultantsError } = useConsultants()
  const { projects: allProjects, loading: projectsLoading, error: projectsError } = useProjects()
  const { managers: allManagers, loading: managersLoading, error: managersError } = useManagers()
  const { rhList: allRh, loading: rhLoading, error: rhError } = useRh()
  const { comptables: allComptables, loading: comptablesLoading, error: comptablesError } = useComptables()
  
  // State pour gérer la visibilité des sections
  const [visibleSections, setVisibleSections] = useState({
    consultants: true,
    managers: false,
    rh: false,
    comptables: false,
    projects: false
  })
  
  // State for client statistics
  const [stats, setStats] = useState<ClientStats>({
    totalConsultants: 0,
    activeConsultants: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalManagers: 0,
    totalRh: 0,
    totalComptables: 0
  })

  // Filtrer les consultants par client_id du client
  const consultants = React.useMemo(() => {
    if (!user?.id || !allConsultants) return []
    return allConsultants.filter(c => c.client_id === user.id)
  }, [allConsultants, user?.id])

  // Filtrer les projets par client_id du client
  const projects = React.useMemo(() => {
    if (!user?.id || !allProjects) return []
    return allProjects.filter(p => p.client_id === user.id)
  }, [allProjects, user?.id])

  // Filtrer les managers par client_id du client
  const managers = React.useMemo(() => {
    if (!user?.id || !allManagers) return []
    return allManagers.filter(m => m.client_id === user.id)
  }, [allManagers, user?.id])

  // Filtrer les RH par client_id du client
  const rhList = React.useMemo(() => {
    if (!user?.id || !allRh) return []
    return allRh.filter(r => r.client_id === user.id)
  }, [allRh, user?.id])

  // Filtrer les comptables par client_id du client
  const comptables = React.useMemo(() => {
    if (!user?.id || !allComptables) return []
    return allComptables.filter(c => c.client_id === user.id)
  }, [allComptables, user?.id])

  // Calculate statistics
  useEffect(() => {
    if (consultants && projects && managers && rhList && comptables) {
      const activeConsultants = consultants.filter(c => c.status === 'active').length
      const activeProjects = projects.filter(p => p.start_date && !p.end_date).length
      
      setStats({
        totalConsultants: consultants.length,
        activeConsultants,
        totalProjects: projects.length,
        activeProjects,
        totalManagers: managers.length,
        totalRh: rhList.length,
        totalComptables: comptables.length
      })
    }
  }, [consultants, projects, managers, rhList, comptables])

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
  if (authLoading || consultantsLoading || projectsLoading || managersLoading || rhLoading || comptablesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  // Fonction pour afficher une section et défiler vers elle
  const showSection = (sectionKey: 'consultants' | 'managers' | 'rh' | 'comptables' | 'projects', sectionId: string) => {
    // Cacher toutes les sections et afficher uniquement celle sélectionnée
    setVisibleSections({
      consultants: false,
      managers: false,
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
      title: 'Gérer les Managers',
      description: 'Voir la liste des managers',
      icon: Shield,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      hoverColor: 'hover:bg-orange-100',
      sectionId: 'managers-section',
      sectionKey: 'managers' as const
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
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Client
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {user?.contact_name || user?.company_name || 'Client'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  {stats.totalConsultants}
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
                  {stats.totalProjects}
                </p>
                <p className="text-xs text-gray-500">actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalManagers}</p>
                <p className="text-xs text-gray-500">utilisateurs</p>
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
            transition={{ duration: 0.3, delay: 0.25 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                Liste des Consultants
              </h2>
              <motion.button
                onClick={() => router.push('/client/users/add')}
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
                  consultants.map((consultant) => (
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
                          <motion.button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce consultant ?')) {
                                // TODO: API call to delete consultant
                                console.log('Delete consultant:', consultant.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Managers Section */}
        {visibleSections.managers && (
        <div id="managers-section" className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Managers</h2>
              <motion.button
                onClick={() => router.push('/client/manager/add')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Manager</span>
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
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managersError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-red-600">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Erreur: {managersError}</p>
                      </div>
                    </td>
                  </tr>
                ) : managers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucun manager trouvé
                    </td>
                  </tr>
                ) : (
                  managers.map((manager) => (
                    <motion.tr 
                      key={manager.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-medium">
                              {manager.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {manager.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manager.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manager.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {manager.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => router.push(`/client/manager/${manager.id}`)}
                            className="text-orange-600 hover:text-orange-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => router.push(`/client/manager/${manager.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce manager ?')) {
                                // TODO: API call to delete manager
                                console.log('Delete manager:', manager.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* RH Section */}
        {visibleSections.rh && (
        <div id="rh-section" className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des RH</h2>
              <motion.button
                onClick={() => router.push('/client/rh/add')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter RH</span>
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
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rhError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-red-600">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Erreur: {rhError}</p>
                      </div>
                    </td>
                  </tr>
                ) : rhList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucun RH trouvé
                    </td>
                  </tr>
                ) : (
                  rhList.map((rh) => (
                    <motion.tr 
                      key={rh.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-medium">
                              {rh.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {rh.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rh.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rh.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {rh.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => router.push(`/client/rh/${rh.id}`)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => router.push(`/client/rh/${rh.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce RH ?')) {
                                // TODO: API call to delete RH
                                console.log('Delete RH:', rh.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Comptables Section */}
        {visibleSections.comptables && (
        <div id="comptables-section" className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Comptables</h2>
              <motion.button
                onClick={() => router.push('/client/comptable/add')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Comptable</span>
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
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comptablesError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-red-600">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Erreur: {comptablesError}</p>
                      </div>
                    </td>
                  </tr>
                ) : comptables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucun comptable trouvé
                    </td>
                  </tr>
                ) : (
                  comptables.map((comptable) => (
                    <motion.tr 
                      key={comptable.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-medium">
                              {comptable.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {comptable.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {comptable.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {comptable.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {comptable.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => router.push(`/client/comptable/${comptable.id}`)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => router.push(`/client/comptable/${comptable.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce comptable ?')) {
                                // TODO: API call to delete comptable
                                console.log('Delete comptable:', comptable.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Projects Section */}
        {visibleSections.projects && (
        <div id="projects-section" className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-6">
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
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de fin
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
                {projectsError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-red-600">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Erreur: {projectsError}</p>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun projet trouvé
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const status = project.end_date ? 'Terminé' : (project.start_date ? 'Actif' : 'En attente')
                    const statusColor = project.end_date 
                      ? 'bg-gray-100 text-gray-800' 
                      : (project.start_date ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                    
                    return (
                      <motion.tr 
                        key={project.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {project.description || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR') : 'En cours'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => router.push(`/client/projects/${project.id}`)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => router.push(`/client/projects/${project.id}/edit`)}
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
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
