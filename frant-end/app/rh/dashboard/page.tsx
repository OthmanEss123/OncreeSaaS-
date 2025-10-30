'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RhAPI, ClientAPI, ConsultantAPI } from '@/lib/api'
import type { Rh, Client, Consultant } from '@/lib/type'
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  UserCheck,
  UserX,
  Briefcase,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export default function RHDashboard() {
  const router = useRouter()
  const [rh, setRh] = useState<Rh | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')
    
    if (!token || userType !== 'rh') {
      router.push('/login')
      return
    }
    
    // Charger les données seulement si authentifié
    loadDashboardData()
  }, [router])

  // Charger les données du dashboard RH
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Vérifier encore une fois le token avant l'appel
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }
      
      // Récupérer les informations du RH connecté
      const rhData = await RhAPI.me()
      setRh(rhData)
      
      if (!rhData.client_id) {
        setError('RH non associé à un client')
        return
      }
      
      // Récupérer le client associé
      const clientData = await ClientAPI.get(rhData.client_id)
      setClient(clientData)
      
      // Récupérer tous les consultants et filtrer par client_id
      const allConsultants = await ConsultantAPI.all()
      const filteredConsultants = allConsultants.filter(
        (c: Consultant) => c.client_id === rhData.client_id
      )
      setConsultants(filteredConsultants)
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setError('Impossible de charger les données du dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques
  const activeConsultants = consultants.filter(c => c.status === 'active').length
  const inactiveConsultants = consultants.filter(c => c.status === 'inactive').length
  const consultantsWithProjects = consultants.filter(c => c.project_id).length

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Affichage en cas d'erreur
  if (error || !rh) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error || 'Données non disponibles'}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
          >
            Réessayer
          </button>
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
                  {rh.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{rh.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Ressources Humaines
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bouton actualiser */}
            <motion.button
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consultants</p>
                <p className="text-3xl font-bold text-foreground mt-2">{consultants.length}</p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultants Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeConsultants}</p>
              </div>
              <UserCheck className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultants Inactifs</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{inactiveConsultants}</p>
              </div>
              <UserX className="h-10 w-10 text-orange-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avec Projet</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{consultantsWithProjects}</p>
              </div>
              <Briefcase className="h-10 w-10 text-blue-600" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des consultants */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-card rounded-lg shadow-sm border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  Liste des Consultants
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                {consultants.length > 0 ? (
                  <table className="w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Taux Journalier
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {consultants.map((consultant) => (
                        <tr key={consultant.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                <span className="text-primary font-medium text-sm">
                                  {consultant.first_name[0]}{consultant.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-card-foreground">
                                  {consultant.first_name} {consultant.last_name}
                                </div>
                                {consultant.skills && (
                                  <div className="text-xs text-muted-foreground">
                                    {consultant.skills.substring(0, 30)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                            {consultant.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                            {consultant.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              consultant.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                            {consultant.daily_rate ? `${consultant.daily_rate}€/jour` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun consultant trouvé</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar avec informations RH et Client */}
          <div className="space-y-6">
            {/* Informations du RH */}
            <motion.div 
              className="bg-card rounded-lg shadow-sm border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Mes Informations</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{rh.email}</span>
                </div>
                {rh.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{rh.phone}</span>
                  </div>
                )}
                {rh.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{rh.address}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Informations du Client */}
            {client && (
              <motion.div 
                className="bg-card rounded-lg shadow-sm border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                  <Building2 className="h-5 w-5 text-primary mr-2" />
                  Informations Client
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Entreprise</p>
                    <p className="font-medium text-card-foreground">{client.company_name}</p>
                  </div>
                  {client.contact_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium text-card-foreground">{client.contact_name}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{client.contact_email}</span>
                  </div>
                  {client.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{client.contact_phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{client.address}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}















