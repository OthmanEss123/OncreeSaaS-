"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ComptableAPI } from '@/lib/api'
import type { Facture } from '@/lib/type'
import { Receipt, Plus, Eye, ArrowLeft, Loader2, Calendar, Euro, User } from 'lucide-react'

export default function FacturesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadFactures()
  }, [])

  const loadFactures = async () => {
    try {
      setLoading(true)
      // Charger uniquement les factures du client du comptable
      const data = await ComptableAPI.getMyFactures()
      // S'assurer que data est un tableau
      if (Array.isArray(data)) {
        setFactures(data)
      } else if (data && Array.isArray(data.data)) {
        // Si la réponse est encapsulée dans un objet data
        setFactures(data.data)
      } else {
        console.error('Format de données inattendu:', data)
        setFactures([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive"
      })
      setFactures([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Envoyée', className: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Payée', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    }
    const statusInfo = statusMap[status] || statusMap.draft
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculer le total d'une facture : jours travaillés × taux journalier
  const calculateFactureTotal = (facture: Facture): number => {
    if (facture.items && facture.items.length > 0) {
      // Si la facture a des items : quantity (jours travaillés) × unit_price (taux journalier)
      return facture.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }
    // Fallback vers le total stocké ou 0
    return facture.total || 0
  }

  // S'assurer que factures est toujours un tableau
  const facturesArray = Array.isArray(factures) ? factures : []
  
  const filteredFactures = facturesArray.filter(facture => {
    const search = searchTerm.toLowerCase()
    const consultantName = facture.consultant?.name || 
      `${facture.consultant?.first_name || ''} ${facture.consultant?.last_name || ''}`.trim() ||
      facture.consultant?.email || ''
    const clientName = facture.client?.company_name || 
      facture.client?.contact_name || 
      facture.client?.contact_email || ''
    
    return (
      facture.id.toString().includes(search) ||
      consultantName.toLowerCase().includes(search) ||
      clientName.toLowerCase().includes(search) ||
      facture.status.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/comptable')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Toutes les Factures</h1>
                <p className="text-muted-foreground">Gérer et consulter toutes vos factures</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/comptable/factures/add')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer Facture
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recherche */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Input
                placeholder="Rechercher par ID, consultant, client ou statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Factures</div>
              <div className="text-2xl font-bold text-foreground">{facturesArray.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Payées</div>
              <div className="text-2xl font-bold text-green-600">
                {facturesArray.filter(f => f.status === 'paid').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">En Attente</div>
              <div className="text-2xl font-bold text-blue-600">
                {facturesArray.filter(f => f.status === 'sent').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Montant</div>
              <div className="text-2xl font-bold text-primary">
                €{facturesArray.reduce((sum, f) => sum + calculateFactureTotal(f), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des Factures */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Factures</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFactures.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucune facture trouvée' : 'Aucune facture disponible'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => router.push('/comptable/factures/add')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première facture
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Consultant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Échéance</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Montant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactures.map((facture, index) => (
                      <tr 
                        key={facture.id} 
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      >
                        <td className="p-4">
                          <div className="font-medium text-foreground">#{facture.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-foreground">
                            {facture.client?.company_name || 
                             facture.client?.contact_name || 
                             facture.client?.contact_email || 
                             'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">
                            {facture.consultant?.name || 
                             `${facture.consultant?.first_name || ''} ${facture.consultant?.last_name || ''}`.trim() ||
                             facture.consultant?.email || 
                             'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(facture.facture_date)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">
                            {formatDate(facture.due_date)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Euro className="h-4 w-4" />
                            {calculateFactureTotal(facture).toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(facture.status)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Ajouter la navigation vers la page de détail
                              toast({
                                title: "Détails",
                                description: `Facture #${facture.id} - ${facture.status}`,
                              })
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

