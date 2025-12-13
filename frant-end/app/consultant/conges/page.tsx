"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CongeAPI, LeaveTypeAPI, invalidateCache } from '@/lib/api'
import type { Conge, LeaveType } from '@/lib/type'
import { Calendar, Plus, ArrowLeft, Loader2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CongesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [conges, setConges] = useState<Conge[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type_id: '',
    reason: ''
  })

  useEffect(() => {
    // Vérifier l'authentification avant de charger les données
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null
    
    if (!token || userType !== 'consultant') {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté en tant que consultant pour accéder à cette page",
        variant: "destructive"
      })
      router.push('/login')
      return
    }
    
    // Invalider le cache des types de congés pour forcer le rechargement
    invalidateCache('/leave-types')
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [congesData, leaveTypesData] = await Promise.all([
        CongeAPI.mine().catch(err => {
          console.error('Erreur lors du chargement des congés:', err)
          // Si erreur 403, problème d'authentification ou d'autorisation
          if (err.response?.status === 403) {
            const errorMessage = err.response?.data?.message || "Accès non autorisé"
            toast({
              title: "Erreur d'autorisation",
              description: errorMessage + ". Veuillez vous reconnecter.",
              variant: "destructive"
            })
            // Rediriger vers la page de connexion
            setTimeout(() => {
              router.push('/login')
            }, 2000)
            return { success: false, data: [] }
          }
          // Si erreur 500, probablement que la table n'existe pas encore
          if (err.response?.status === 500) {
            return { success: false, data: [] }
          }
          throw err
        }),
        LeaveTypeAPI.all().catch(err => {
          console.error('Erreur lors du chargement des types de congés:', err)
          return { success: false, data: [] }
        })
      ])
      
      // Gérer les congés
      if (Array.isArray(congesData)) {
        setConges(congesData)
      } else if (congesData?.data) {
        setConges(Array.isArray(congesData.data) ? congesData.data : [])
      } else {
        setConges([])
      }
      
      // Gérer les types de congés
      console.log('📋 Données brutes des types de congés:', leaveTypesData)
      if (Array.isArray(leaveTypesData)) {
        console.log('✅ Types de congés (array):', leaveTypesData.length)
        setLeaveTypes(leaveTypesData)
      } else if (leaveTypesData?.data) {
        console.log('✅ Types de congés (data):', leaveTypesData.data.length)
        setLeaveTypes(Array.isArray(leaveTypesData.data) ? leaveTypesData.data : [])
      } else if (leaveTypesData?.success && leaveTypesData?.data) {
        console.log('✅ Types de congés (success.data):', leaveTypesData.data.length)
        setLeaveTypes(Array.isArray(leaveTypesData.data) ? leaveTypesData.data : [])
      } else {
        console.warn('⚠️ Format de données inattendu pour les types de congés:', leaveTypesData)
        setLeaveTypes([])
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error)
      let errorMessage = "Impossible de charger les données"
      
      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || "Accès non autorisé. Veuillez vous reconnecter."
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else if (error.response?.status === 500) {
        errorMessage = "La table des congés n'existe pas encore. Veuillez exécuter la migration : php artisan migrate"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
      setConges([])
      setLeaveTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les dates",
        variant: "destructive"
      })
      return
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: "Erreur",
        description: "La date de fin doit être après la date de début",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await CongeAPI.create({
        start_date: formData.start_date,
        end_date: formData.end_date,
        leave_type_id: formData.leave_type_id && formData.leave_type_id !== 'none' ? parseInt(formData.leave_type_id) : null,
        reason: formData.reason || null
      })
      
      toast({
        title: "Succès",
        description: "Demande de congé créée avec succès",
      })
      
      setIsDialogOpen(false)
      setFormData({
        start_date: '',
        end_date: '',
        leave_type_id: '',
        reason: ''
      })
      loadData()
    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de créer la demande de congé",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (conge: Conge) => {
    if (conge.status !== 'pending') {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer une demande déjà traitée",
        variant: "destructive"
      })
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette demande de congé ?`)) {
      return
    }

    try {
      setDeletingId(conge.id)
      await CongeAPI.delete(conge.id)
      toast({
        title: "Succès",
        description: "Demande de congé supprimée avec succès",
      })
      loadData()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer la demande",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const statusInfo = statusMap[status] || statusMap.pending
    const Icon = statusInfo.icon
    return (
      <Badge className={statusInfo.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

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
                onClick={() => router.push('/consultant/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mes Congés</h1>
                <p className="text-muted-foreground">Gérer vos demandes de congés</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Demande
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Demandes</div>
              <div className="text-2xl font-bold text-foreground">{conges.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">En Attente</div>
              <div className="text-2xl font-bold text-yellow-600">
                {conges.filter(c => c.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Approuvées</div>
              <div className="text-2xl font-bold text-green-600">
                {conges.filter(c => c.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des Congés */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Demandes de Congés</CardTitle>
          </CardHeader>
          <CardContent>
            {conges.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune demande de congé</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la première demande
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {conges.map((conge) => (
                  <div
                    key={conge.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-semibold text-foreground">
                              {formatDate(conge.start_date)} - {formatDate(conge.end_date)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {calculateDays(conge.start_date, conge.end_date)} jour(s)
                            </div>
                          </div>
                        </div>
                        
                        {conge.leave_type && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Type: {conge.leave_type.name}
                          </div>
                        )}
                        
                        {conge.reason && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Motif: {conge.reason}
                          </div>
                        )}
                        
                        {conge.rh_comment && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <strong>Commentaire RH:</strong> {conge.rh_comment}
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Créée le {formatDate(conge.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(conge.status)}
                        {conge.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(conge)}
                            disabled={deletingId === conge.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deletingId === conge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog pour créer une demande */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle Demande de Congé</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer une nouvelle demande de congé
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leave_type_id">Type de congé (optionnel)</Label>
                <Select
                  value={formData.leave_type_id || undefined}
                  onValueChange={(value) => {
                    // Permettre de réinitialiser en passant undefined
                    setFormData({ ...formData, leave_type_id: value === 'clear' ? '' : value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.length > 0 ? (
                      <>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="none" disabled>Aucun type disponible</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motif (optionnel)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Raison du congé..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer la demande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

