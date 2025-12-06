"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FactureAPI, FactureItemAPI, ComptableAPI } from '@/lib/api'
import type { Facture, FactureItem, Consultant } from '@/lib/type'
import { ArrowLeft, Save, Receipt, Loader2, Plus, Trash2 } from 'lucide-react'

export default function EditFacturePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [facture, setFacture] = useState<Facture | null>(null)
  const [formData, setFormData] = useState({
    consultant_id: '',
    facture_date: '',
    due_date: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'cancelled'
  })
  const [items, setItems] = useState<Array<{ id?: number; description: string; quantity: string; unit_price: string }>>([])

  const factureId = params?.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (factureId) {
      loadData()
    }
  }, [factureId])

  const loadData = async () => {
    if (!factureId) return

    try {
      setLoading(true)
      
      // Charger les consultants
      const consultantsData = await ComptableAPI.getMyConsultants()
      setConsultants(consultantsData)

      // Charger la facture
      const response = await FactureAPI.get(factureId)
      // FactureAPI.get retourne une réponse axios, donc on accède à response.data
      const factureData = response.data.data || response.data
      setFacture(factureData)

      // Remplir le formulaire
      setFormData({
        consultant_id: factureData.consultant_id?.toString() || '',
        facture_date: factureData.facture_date ? factureData.facture_date.split('T')[0] : '',
        due_date: factureData.due_date ? factureData.due_date.split('T')[0] : '',
        status: factureData.status
      })

      // Charger les items
      if (factureData.items && factureData.items.length > 0) {
        setItems(factureData.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString()
        })))
      } else {
        setItems([{ description: '', quantity: '', unit_price: '' }])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
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

  const addItem = () => {
    setItems([...items, { description: '', quantity: '', unit_price: '' }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    if (newItems.length === 0) {
      setItems([{ description: '', quantity: '', unit_price: '' }])
    } else {
      setItems(newItems)
    }
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      return sum + (quantity * unitPrice)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!facture) return

    if (items.length === 0 || items.some(item => !item.description || !item.quantity || !item.unit_price)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs des items",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Mettre à jour la facture
      const factureData: Partial<Facture> = {
        consultant_id: formData.consultant_id ? parseInt(formData.consultant_id) : null,
        facture_date: formData.facture_date,
        due_date: formData.due_date || null,
        status: formData.status,
        total: calculateTotal()
      }

      await FactureAPI.update(facture.id, factureData)

      // Supprimer les anciens items
      if (facture.items) {
        for (const item of facture.items) {
          try {
            await FactureItemAPI.delete(item.id)
          } catch (error) {
            console.error('Erreur lors de la suppression d\'un item:', error)
          }
        }
      }

      // Créer les nouveaux items
      for (const item of items) {
        await FactureItemAPI.create({
          facture_id: facture.id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        })
      }

      toast({
        title: "Succès",
        description: "Facture modifiée avec succès",
      })

      router.push('/comptable/factures')
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la modification de la facture",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
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
      <header className="bg-white shadow-sm border-b">
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
                <h1 className="text-2xl font-bold text-foreground">Modifier la Facture #{facture.id}</h1>
                <p className="text-muted-foreground">Modifier les informations de la facture</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informations de la Facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consultant */}
              <div className="space-y-2">
                <Label htmlFor="consultant_id">Consultant</Label>
                <select
                  id="consultant_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.consultant_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultant_id: e.target.value }))}
                >
                  <option value="">Sélectionner un consultant</option>
                  {consultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name || `${consultant.first_name} ${consultant.last_name}`.trim() || consultant.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de facture */}
              <div className="space-y-2">
                <Label htmlFor="facture_date">Date de facture *</Label>
                <Input
                  id="facture_date"
                  type="date"
                  value={formData.facture_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, facture_date: e.target.value }))}
                  required
                />
              </div>

              {/* Date d'échéance */}
              <div className="space-y-2">
                <Label htmlFor="due_date">Date d'échéance</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  min={formData.facture_date}
                />
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="paid">Payée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items de la Facture</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
                  <div className="col-span-5">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description de la prestation"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Prix unitaire (€) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <div className="w-full">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-semibold">
                        €{((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  €{calculateTotal().toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/comptable/factures')}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

