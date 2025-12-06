"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FactureAPI } from '@/lib/api'
import type { Facture } from '@/lib/type'
import { ArrowLeft, Edit, Receipt, Calendar, Euro, User, Building, Loader2, Printer } from 'lucide-react'

export default function ViewFacturePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [facture, setFacture] = useState<Facture | null>(null)
  const [loading, setLoading] = useState(true)

  const factureId = params?.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (factureId) {
      loadFacture()
    }
  }, [factureId])

  const loadFacture = async () => {
    if (!factureId) return

    try {
      setLoading(true)
      const response = await FactureAPI.get(factureId)
      // FactureAPI.get retourne une réponse axios, donc on accède à response.data
      setFacture(response.data.data || response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la facture",
        variant: "destructive"
      })
      router.push('/comptable/factures')
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

  const calculateTotal = () => {
    if (!facture) return 0
    if (facture.items && facture.items.length > 0) {
      return facture.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }
    return facture.total || 0
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Facture introuvable</p>
          <Button onClick={() => router.push('/comptable/factures')}>
            Retour aux factures
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/comptable/factures')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Facture #{facture.id}</h1>
                <p className="text-muted-foreground">Détails de la facture</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              {facture.status === 'draft' && (
                <Button
                  onClick={() => router.push(`/comptable/factures/edit/${facture.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations principales */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informations de la Facture
              </CardTitle>
              {getStatusBadge(facture.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Client</span>
                </div>
                <div className="text-lg font-semibold">
                  {facture.client?.company_name || 
                   facture.client?.contact_name || 
                   facture.client?.contact_email || 
                   'N/A'}
                </div>
                {facture.client?.contact_email && (
                  <div className="text-sm text-muted-foreground">
                    {facture.client.contact_email}
                  </div>
                )}
              </div>

              {/* Consultant */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Consultant</span>
                </div>
                <div className="text-lg font-semibold">
                  {facture.consultant?.name || 
                   `${facture.consultant?.first_name || ''} ${facture.consultant?.last_name || ''}`.trim() ||
                   facture.consultant?.email || 
                   'N/A'}
                </div>
                {facture.consultant?.email && (
                  <div className="text-sm text-muted-foreground">
                    {facture.consultant.email}
                  </div>
                )}
              </div>

              {/* Date de facture */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date de facture</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatDate(facture.facture_date)}
                </div>
              </div>

              {/* Date d'échéance */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date d'échéance</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatDate(facture.due_date)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items de la facture */}
        {facture.items && facture.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Détails des Prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Quantité</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Prix unitaire</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facture.items.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      >
                        <td className="p-4">{item.description}</td>
                        <td className="p-4 text-right">{item.quantity}</td>
                        <td className="p-4 text-right">€{item.unit_price.toFixed(2)}</td>
                        <td className="p-4 text-right font-semibold">
                          €{(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={3} className="p-4 text-right font-bold text-lg">
                        Total
                      </td>
                      <td className="p-4 text-right font-bold text-lg text-primary">
                        <div className="flex items-center justify-end gap-2">
                          <Euro className="h-5 w-5" />
                          {calculateTotal().toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total si pas d'items */}
        {(!facture.items || facture.items.length === 0) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <Euro className="h-6 w-6" />
                  {calculateTotal().toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Supplémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Date de création</span>
                <div className="font-medium">
                  {formatDate(facture.created_at)}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dernière modification</span>
                <div className="font-medium">
                  {formatDate(facture.updated_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

