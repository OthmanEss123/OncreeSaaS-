"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CongeAPI } from '@/lib/api'
import type { Conge } from '@/lib/type'
import { Calendar, ArrowLeft, Loader2, CheckCircle, XCircle, Clock, User, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RhCongesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [conges, setConges] = useState<Conge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rhComment, setRhComment] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadConges()
  }, [])

  const loadConges = async () => {
    try {
      setLoading(true)
      const data = await CongeAPI.pending()
      
      // Charger aussi tous les congés pour avoir une vue complète
      const allData = await CongeAPI.all()
      
      if (Array.isArray(allData)) {
        setConges(allData)
      } else if (allData?.data) {
        setConges(allData.data)
      } else if (Array.isArray(data)) {
        setConges(data)
      } else if (data?.data) {
        setConges(data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de congés",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (conge: Conge, actionType: 'approve' | 'reject') => {
    setSelectedConge(conge)
    setAction(actionType)
    setRhComment('')
    setIsDialogOpen(true)
  }

  const handleProcessConge = async () => {
    if (!selectedConge || !action) return

    try {
      setProcessing(true)
      await CongeAPI.update(selectedConge.id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        rh_comment: rhComment || null
      })
      
      toast({
        title: "Succès",
        description: `Demande ${action === 'approve' ? 'approuvée' : 'refusée'} avec succès`,
      })
      
      setIsDialogOpen(false)
      setSelectedConge(null)
      setAction(null)
      setRhComment('')
      loadConges()
    } catch (error: any) {
      console.error('Erreur lors du traitement:', error)
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de traiter la demande",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
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

  const filteredConges = filter === 'all' 
    ? conges 
    : conges.filter(c => c.status === filter)

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
                onClick={() => router.push('/rh')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestion des Congés</h1>
                <p className="text-muted-foreground">Approuver ou refuser les demandes de congés</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Refusées</div>
              <div className="text-2xl font-bold text-red-600">
                {conges.filter(c => c.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtre */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Filtrer par statut:</Label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Refusées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des Congés */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' ? 'Toutes les Demandes' : 
               filter === 'pending' ? 'Demandes en Attente' :
               filter === 'approved' ? 'Demandes Approuvées' : 'Demandes Refusées'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredConges.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'Aucune demande de congé' :
                   filter === 'pending' ? 'Aucune demande en attente' :
                   filter === 'approved' ? 'Aucune demande approuvée' : 'Aucune demande refusée'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConges.map((conge) => (
                  <div
                    key={conge.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-semibold text-foreground">
                              {conge.consultant?.name || 
                               `${conge.consultant?.first_name || ''} ${conge.consultant?.last_name || ''}`.trim() ||
                               conge.consultant?.email || 
                               'Consultant inconnu'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {conge.consultant?.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">
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
                          <div className="text-sm text-muted-foreground mb-2 flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span><strong>Motif:</strong> {conge.reason}</span>
                          </div>
                        )}
                        
                        {conge.rh_comment && (
                          <div className="text-sm text-muted-foreground mb-2 flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span><strong>Commentaire RH:</strong> {conge.rh_comment}</span>
                          </div>
                        )}
                        
                        {conge.processed_at && (
                          <div className="text-xs text-muted-foreground">
                            Traité le {formatDate(conge.processed_at)} par {conge.rh?.name || 'RH'}
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          Demande créée le {formatDate(conge.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(conge.status)}
                        {conge.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOpenDialog(conge, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOpenDialog(conge, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Refuser
                            </Button>
                          </div>
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

      {/* Dialog pour approuver/refuser */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
            </DialogTitle>
            <DialogDescription>
              {selectedConge && (
                <>
                  Demande de congé de <strong>{selectedConge.consultant?.name || 'Consultant'}</strong><br />
                  Du {formatDate(selectedConge.start_date)} au {formatDate(selectedConge.end_date)}<br />
                  ({calculateDays(selectedConge.start_date, selectedConge.end_date)} jour(s))
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rh_comment">
                Commentaire {action === 'approve' ? '(optionnel)' : '(recommandé)'}
              </Label>
              <Textarea
                id="rh_comment"
                value={rhComment}
                onChange={(e) => setRhComment(e.target.value)}
                placeholder={action === 'approve' 
                  ? "Ajouter un commentaire (optionnel)..." 
                  : "Expliquer la raison du refus (recommandé)..."}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedConge(null)
                setAction(null)
                setRhComment('')
              }}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              onClick={handleProcessConge}
              disabled={processing}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {action === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

