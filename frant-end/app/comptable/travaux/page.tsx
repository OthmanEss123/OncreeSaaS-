"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WorkScheduleAPI, FactureAPI } from '@/lib/api'
import type { WorkSchedule } from '@/lib/type'
import { Calendar, FileText, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function TravauxPage() {
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingFacture, setCreatingFacture] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Charger tous les horaires de travail
        const schedulesData = await WorkScheduleAPI.all()
        setWorkSchedules(schedulesData)
        
      } catch (error) {
        console.error('Erreur lors du chargement des horaires de travail:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateFacture = async (schedule: WorkSchedule) => {
    // Vérifications préalables
    if (!schedule.consultant_id) {
      toast({
        title: "Erreur",
        description: "Aucun consultant associé à cet horaire. Impossible de créer une facture.",
        variant: "destructive"
      })
      return
    }

    if (!schedule.consultant?.client_id) {
      toast({
        title: "Erreur",
        description: "Le consultant n'a pas de client associé. Impossible de créer une facture.",
        variant: "destructive"
      })
      return
    }

    try {
      setCreatingFacture(schedule.id)
      
      // Préparer la date au format correct
      const factureDate = schedule.date 
        ? new Date(schedule.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      
      const factureData: any = {
        client_id: Number(schedule.consultant.client_id),
        facture_date: factureDate,
        status: 'draft',
        total: null
      }

      // Ajouter consultant_id seulement s'il est valide
      if (schedule.consultant_id) {
        factureData.consultant_id = Number(schedule.consultant_id)
      }

      console.log('Données de facture à créer:', factureData)
      
      await FactureAPI.create(factureData)
      
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      })

      // Recharger les données après création
      const schedulesData = await WorkScheduleAPI.all()
      setWorkSchedules(schedulesData)
    } catch (error: any) {
      console.error('Erreur lors de la création de la facture:', error)
      console.error('Détails de l\'erreur:', error.response?.data)
      
      // Gérer les erreurs de validation
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const firstError = Object.values(validationErrors)[0]
        const errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError)
        
        toast({
          title: "Erreur de validation",
          description: errorMessage || "Les données fournies sont invalides",
          variant: "destructive"
        })
      } else {
        // Afficher un message d'erreur plus détaillé
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.message
          || "Erreur lors de la création de la facture"
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setCreatingFacture(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Tableau des Horaires de Travail</h1>
        <p className="text-muted-foreground">Consultez tous les horaires de travail des consultants</p>
      </div>

      {/* Tableau des Horaires de Travail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Liste des Horaires de Travail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Consultant</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Jours Travaillés</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Jours Type Travail</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Week-end Travaillé</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type Absence</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Jours Absence</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type de Travail</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type de Congé</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Mois/Année</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Notes</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workSchedules.length > 0 ? (
                  workSchedules.map((schedule, index) => (
                    <tr key={schedule.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="p-4 text-muted-foreground">#{schedule.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {schedule.consultant ? (
                            schedule.consultant.name || 
                            `${schedule.consultant.first_name || ''} ${schedule.consultant.last_name || ''}`.trim() || 
                            'N/A'
                          ) : (
                            `Consultant #${schedule.consultant_id}`
                          )}
                        </div>
                        {schedule.consultant?.email && (
                          <div className="text-xs text-muted-foreground">{schedule.consultant.email}</div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          schedule.type === 'workday' 
                            ? 'bg-blue-100 text-blue-800' 
                            : schedule.type === 'weekend'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {schedule.type === 'workday' ? 'Jour ouvré' : 
                           schedule.type === 'weekend' ? 'Week-end' : 
                           schedule.type === 'vacation' ? 'Vacances' : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.days_worked !== null && schedule.days_worked !== undefined 
                          ? `${schedule.days_worked}` 
                          : '0'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.work_type_days !== null && schedule.work_type_days !== undefined 
                          ? `${schedule.work_type_days}` 
                          : '0'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.weekend_worked !== null && schedule.weekend_worked !== undefined 
                          ? `${schedule.weekend_worked}` 
                          : '0'}
                      </td>
                      <td className="p-4">
                        {schedule.absence_type && schedule.absence_type !== 'none' ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            schedule.absence_type === 'vacation' 
                              ? 'bg-green-100 text-green-800' 
                              : schedule.absence_type === 'sick'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.absence_type === 'vacation' ? 'Vacances' :
                             schedule.absence_type === 'sick' ? 'Maladie' :
                             schedule.absence_type === 'personal' ? 'Personnel' :
                             schedule.absence_type === 'other' ? 'Autre' : 'Aucune'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Aucune</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.absence_days !== null && schedule.absence_days !== undefined 
                          ? `${schedule.absence_days}` 
                          : '0'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.work_type ? (
                          <div>
                            <div className="font-medium text-foreground text-sm">{schedule.work_type.name}</div>
                            {schedule.work_type.code && (
                              <div className="text-xs text-muted-foreground">{schedule.work_type.code}</div>
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.leave_type ? (
                          <div>
                            <div className="font-medium text-foreground text-sm">{schedule.leave_type.name}</div>
                            {schedule.leave_type.code && (
                              <div className="text-xs text-muted-foreground">{schedule.leave_type.code}</div>
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {schedule.month && schedule.year 
                          ? `${schedule.month}/${schedule.year}` 
                          : 'N/A'}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-xs">
                        <div className="truncate" title={schedule.notes || 'N/A'}>
                          {schedule.notes || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateFacture(schedule)}
                          disabled={creatingFacture === schedule.id || !schedule.consultant?.client_id}
                          className="flex items-center gap-2"
                        >
                          {creatingFacture === schedule.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Création...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4" />
                              Créer facture
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="p-8 text-center text-muted-foreground">
                      Aucun horaire de travail trouvé
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



