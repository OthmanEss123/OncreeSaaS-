"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ComptableAPI } from '@/lib/api'
import type { Consultant, Comptable } from '@/lib/type'
import { Users, User, Receipt } from 'lucide-react'
import axios from 'axios'

export default function ComptablePage() {
  const router = useRouter()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [comptable, setComptable] = useState<Comptable | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Charger les informations du comptable connecté
        const comptableData = await ComptableAPI.me()
        setComptable(comptableData)
        
        // Charger uniquement les consultants du client du comptable
        const consultantsData = await ComptableAPI.getMyConsultants()
        setConsultants(consultantsData)
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError('Accès refusé. Veuillez vous reconnecter en tant que comptable.')
          // Rediriger vers login après un délai
          setTimeout(() => router.push('/login'), 2000)
        } else {
          setError('Erreur lors du chargement des données.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/login')}
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Tableau de Bord Comptable</h1>
          <p className="text-muted-foreground">Informations des consultants et du comptable</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/comptable/factures')}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Voir Factures
          </Button>
          <Button 
            onClick={() => router.push('/comptable/factures/add')}
            className="bg-primary hover:bg-primary/90"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Créer Facture
          </Button>
        </div>
      </div>

      {/* Tableau des Consultants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informations des Consultants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Téléphone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Compétences</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Taux Journalier</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Adresse</th>
                </tr>
              </thead>
              <tbody>
                {consultants.length > 0 ? (
                  consultants.map((consultant, index) => (
                    <tr key={consultant.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {consultant.name || `${consultant.first_name || ''} ${consultant.last_name || ''}`.trim() || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{consultant.email || 'N/A'}</td>
                      <td className="p-4 text-muted-foreground">{consultant.phone || 'N/A'}</td>
                      <td className="p-4 text-muted-foreground max-w-xs">
                        <div className="truncate" title={consultant.skills || 'N/A'}>
                          {consultant.skills || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {consultant.daily_rate ? `€${consultant.daily_rate}` : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          consultant.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {consultant.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground max-w-xs">
                        <div className="truncate" title={consultant.address || 'N/A'}>
                          {consultant.address || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Aucun consultant trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des Informations du Comptable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mes Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Téléphone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Rôle</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Adresse</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date de Création</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date de Mise à Jour</th>
                </tr>
              </thead>
              <tbody>
                {comptable ? (
                  <tr className="bg-background">
                    <td className="p-4 text-muted-foreground">#{comptable.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">
                        {comptable.name || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{comptable.email || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{comptable.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {comptable.role || 'Comptable'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {comptable.client ? (
                        <div>
                          <div className="font-medium text-foreground">{comptable.client.company_name}</div>
                          <div className="text-xs text-muted-foreground">{comptable.client.contact_email}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs">
                      <div className="truncate" title={comptable.address || 'N/A'}>
                        {comptable.address || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {comptable.created_at ? new Date(comptable.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {comptable.updated_at ? new Date(comptable.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      Aucune information disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
