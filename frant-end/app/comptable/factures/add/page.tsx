"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ComptableAPI, FactureAPI, FactureItemAPI } from '@/lib/api'
import type { Facture } from '@/lib/type'
import { ArrowLeft, Save, Receipt } from 'lucide-react'

export default function AddFacturePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    consultant_name: '',
    working_days: '',
    cost_per_day: '',
    working_month: ''
  })

  const calculateTotal = () => {
    const days = parseFloat(formData.working_days) || 0
    const costPerDay = parseFloat(formData.cost_per_day) || 0
    return days * costPerDay
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.consultant_name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du consultant",
        variant: "destructive"
      })
      return
    }

    if (!formData.working_days || parseFloat(formData.working_days) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nombre de jours de travail",
        variant: "destructive"
      })
      return
    }

    if (!formData.cost_per_day || parseFloat(formData.cost_per_day) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le coût de travail par jour",
        variant: "destructive"
      })
      return
    }

    if (!formData.working_month) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner le mois de travail",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Récupérer le comptable connecté pour obtenir son client_id
      const comptable = await ComptableAPI.me()
      if (!comptable || !comptable.client_id) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations du comptable. Veuillez vous reconnecter.",
          variant: "destructive"
        })
        setSubmitting(false)
        return
      }

      const clientId = comptable.client_id
      const total = calculateTotal()
      const today = new Date().toISOString().split('T')[0]

      // Créer la facture
      const factureData: Partial<Facture> = {
        client_id: clientId,
        consultant_id: null,
        facture_date: today,
        due_date: null,
        status: 'draft',
        total: total
      }

      // Créer la facture via l'API
      console.log('📤 Envoi des données de facture:', factureData)
      const factureResponse = await FactureAPI.create(factureData)
      console.log('📥 Réponse de l\'API facture:', factureResponse)
      
      // FactureAPI.create retourne une réponse axios, les données sont dans response.data
      // Laravel retourne directement l'objet facture dans response.data
      const facture = factureResponse.data
      console.log('✅ Facture extraite:', facture)

      // Vérifier que la facture a été créée avec un ID
      if (!facture || !facture.id) {
        console.error('❌ Facture créée sans ID:', { 
          facture, 
          factureResponse,
          factureResponseData: factureResponse.data 
        })
        throw new Error('La facture n\'a pas été créée correctement. Aucun ID retourné.')
      }
      
      console.log('✅ Facture créée avec succès, ID:', facture.id)

      // Valider et convertir les valeurs numériques
      const quantity = parseFloat(formData.working_days)
      const unitPrice = parseFloat(formData.cost_per_day)

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Le nombre de jours de travail doit être un nombre valide supérieur à 0')
      }

      if (isNaN(unitPrice) || unitPrice <= 0) {
        throw new Error('Le coût par jour doit être un nombre valide supérieur à 0')
      }

      // Préparer les données de l'item
      const itemData = {
        facture_id: Number(facture.id),
        description: `Travail de ${formData.consultant_name} - ${formData.working_days} jour(s) - Mois: ${formData.working_month}`,
        quantity: quantity,
        unit_price: unitPrice
      }

      console.log('📤 Création de l\'item de facture avec les données:', itemData)

      // Créer l'item de la facture avec les détails
      try {
        const itemResponse = await FactureItemAPI.create(itemData)
        console.log('✅ Item créé avec succès:', itemResponse.data)
      } catch (itemError: any) {
        console.error('❌ Erreur lors de la création de l\'item:', itemError)
        console.error('❌ Détails de l\'erreur item:', {
          status: itemError.response?.status,
          data: itemError.response?.data,
          message: itemError.message
        })
        // Si la facture a été créée mais l'item a échoué, on informe l'utilisateur
        // mais on ne supprime pas la facture (elle peut être complétée plus tard)
        toast({
          title: "Attention",
          description: `Facture créée (ID: ${facture.id}) mais l'item n'a pas pu être ajouté. Vous pouvez l'ajouter manuellement.`,
          variant: "default"
        })
        router.push(`/comptable/factures/edit/${facture.id}`)
        return
      }

      toast({
        title: "Succès",
        description: `Facture #${facture.id} créée avec succès`,
      })

      // Rediriger vers la page des factures pour voir la nouvelle facture
      router.push('/comptable/factures')
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la facture:', error)
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: error.config?.data
      })
      
      // Extraire les détails de l'erreur de validation
      let errorMessage = "Erreur lors de la création de la facture"
      
      if (error.response?.status === 422) {
        // Erreur de validation
        const errors = error.response?.data?.errors
        if (errors) {
          // Formater les erreurs de validation Laravel
          const errorMessages = Object.entries(errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'facture_id' ? 'Facture' : 
                               field === 'quantity' ? 'Quantité' :
                               field === 'unit_price' ? 'Prix unitaire' :
                               field === 'description' ? 'Description' :
                               field === 'client_id' ? 'Client' :
                               field === 'facture_date' ? 'Date de facture' : field
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            })
            .join(' | ')
          errorMessage = `Erreur de validation: ${errorMessages}`
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else {
          errorMessage = `Erreur de validation (422). Vérifiez la console pour plus de détails.`
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Vous n'êtes pas authentifié. Veuillez vous reconnecter."
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard."
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
        duration: 10000 // Afficher plus longtemps pour que l'utilisateur puisse lire
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nouvelle Facture</h1>
                <p className="text-muted-foreground">Créer une nouvelle facture</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informations de la Facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nom du Consultant */}
              <div className="space-y-2">
                <Label htmlFor="consultant_name">Nom du Consultant *</Label>
                <Input
                  id="consultant_name"
                  type="text"
                  placeholder="Entrez le nom du consultant"
                  value={formData.consultant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultant_name: e.target.value }))}
                  required
                />
              </div>

              {/* Jours de Travail */}
              <div className="space-y-2">
                <Label htmlFor="working_days">Jours de Travail *</Label>
                <Input
                  id="working_days"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Nombre de jours travaillés"
                  value={formData.working_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, working_days: e.target.value }))}
                  required
                />
              </div>

              {/* Coût par Jour */}
              <div className="space-y-2">
                <Label htmlFor="cost_per_day">Coût de Travail par Jour (€) *</Label>
                <Input
                  id="cost_per_day"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Coût par jour en euros"
                  value={formData.cost_per_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_per_day: e.target.value }))}
                  required
                />
              </div>

              {/* Mois de Travail */}
              <div className="space-y-2">
                <Label htmlFor="working_month">Mois de Travail *</Label>
                <Input
                  id="working_month"
                  type="month"
                  placeholder="Sélectionnez le mois"
                  value={formData.working_month}
                  onChange={(e) => setFormData(prev => ({ ...prev, working_month: e.target.value }))}
                  required
                />
              </div>

              {/* Total Calculé */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    €{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Création...' : 'Créer la Facture'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

