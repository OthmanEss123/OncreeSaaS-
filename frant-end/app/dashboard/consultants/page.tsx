"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { useEffect, useState } from 'react'
import { ConsultantAPI, ClientAPI, DashboardAPI } from '@/lib/api'
import type { Consultant, Client, Project } from '@/lib/type'

export default function Consultants() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null)
  const [viewingConsultant, setViewingConsultant] = useState<Consultant | null>(null)
  const [deletingConsultant, setDeletingConsultant] = useState<Consultant | null>(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    skills: '',
    daily_rate: '',
    status: 'active' as 'active' | 'inactive',
    client_id: '',
    address: ''
  })



  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const consultantData: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        phone: null, // Pas de champ phone dans le formulaire pour le moment
        role: 'Consultant', // Rôle par défaut
        skills: form.skills,
        daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : null,
        status: form.status,
        address: form.address
      }

      // Ajouter client_id seulement si des clients sont sélectionnés
      if (selectedClients.length > 0) {
        consultantData.client_id = parseInt(selectedClients[0]) // Prendre le premier client sélectionné
      }

      console.log('Données envoyées au backend:', consultantData)
      await ConsultantAPI.create(consultantData)
      // Réinitialiser le formulaire
      setForm({ first_name: '', last_name: '', email: '', password: '', skills: '', daily_rate: '', status: 'active', client_id: '', address: '' })
      setSelectedClients([])
      setIsModalOpen(false)
      // Actualiser la liste
      await refresh()
      showNotification('success', 'Consultant créé avec succès!')
    } catch (error: any) {
      console.error('Erreur lors de la création du consultant:', error)
      showNotification('error', 'Erreur lors de la création: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    try {
      // 🚀 1 SEUL APPEL au lieu de 2 appels séparés!
      const data = await DashboardAPI.adminConsultants()
      
      setConsultants(data.consultants || [])
      setClients(data.clients || [])
      setProjects(data.projects || [])
      
      console.log('✅ Toutes les données chargées en 1 appel:', data)
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error)
      setConsultants([])
      setClients([])
      setProjects([])
      showNotification('error', 'Erreur lors du chargement des consultants')
    }
  }

  const filteredConsultants = consultants.filter(consultant => {
    if (!consultant.name && !consultant.email) return false
    const name = consultant.name?.toLowerCase() || ''
    const email = consultant.email?.toLowerCase() || ''
    const term = searchTerm.toLowerCase()
    return name.includes(term) || email.includes(term)
  })

  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-red-100 text-red-800'
      case 'partially-available': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant)
    // Extraire le prénom et nom de famille du nom complet
    const nameParts = consultant.name ? consultant.name.split(' ') : ['', '']
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    setForm({
      first_name: firstName,
      last_name: lastName,
      email: consultant.email,
      password: '',
      skills: consultant.skills || '',
      daily_rate: consultant.daily_rate?.toString() || '',
      status: consultant.status,
      client_id: consultant.client_id?.toString() || '',
      address: consultant.address || ''
    })
    setSelectedClients([])
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingConsultant) return
    
    setLoading(true)
    try {
      const consultantUpdateData: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: null, // Pas de champ phone dans le formulaire pour le moment
        role: 'Consultant', // Rôle par défaut
        skills: form.skills,
        daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : null,
        status: form.status,
        address: form.address
      }

      // Ajouter client_id seulement si des clients sont sélectionnés
      if (selectedClients.length > 0) {
        consultantUpdateData.client_id = parseInt(selectedClients[0]) // Prendre le premier client sélectionné
      }

      const response = await ConsultantAPI.update(editingConsultant.id, consultantUpdateData)
      
      setIsEditModalOpen(false)
      setEditingConsultant(null)
      setSelectedClients([])
      await refresh()
      showNotification('success', 'Consultant mis à jour avec succès!')
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      showNotification('error', 'Erreur lors de la mise à jour: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (consultant: Consultant) => {
    setDeletingConsultant(consultant)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingConsultant) return
    
    try {
      await ConsultantAPI.delete(deletingConsultant.id)
      await refresh()
      showNotification('success', 'Consultant supprimé avec succès!')
      setIsDeleteModalOpen(false)
      setDeletingConsultant(null)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      showNotification('error', 'Erreur lors de la suppression: ' + (error as Error).message)
    }
  }

  const handleView = (consultant: Consultant) => {
    setViewingConsultant(consultant)
    setIsViewModalOpen(true)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const getSelectedClientNames = () => {
    return selectedClients.map(clientId => {
      const client = clients.find(c => c.id.toString() === clientId)
      return client ? client.company_name : ''
    }).filter(Boolean)
  }

  useEffect(() => { refresh() }, [])
  
  return (
    <DashboardLayout>
      {/* Section de notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Consultants</h1>
            <p className="text-muted-foreground">Manage your consultant team</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Consultant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Consultant</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultantFirstName" className="text-sm font-medium text-foreground">
                      Prénom
                    </Label>
                    <Input
                      id="consultantFirstName"
                      value={form.first_name}
                      onChange={e => handleChange('first_name', e.target.value)}
                      placeholder="Entrez le prénom"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultantLastName" className="text-sm font-medium text-foreground">
                      Nom de famille
                    </Label>
                    <Input
                      id="consultantLastName"
                      value={form.last_name}
                      onChange={e => handleChange('last_name', e.target.value)}
                      placeholder="Entrez le nom de famille"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultantEmail" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="consultantEmail"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultantPassword" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="consultantPassword"
                    type="password"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="Enter password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultantSkills" className="text-sm font-medium text-foreground">
                    Skills
                  </Label>
                  <Input
                    id="consultantSkills"
                    value={form.skills}
                    onChange={e => handleChange('skills', e.target.value)}
                    placeholder="Enter skills (e.g., React, Node.js, Python)"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultantAddress" className="text-sm font-medium text-foreground">
                    Adresse
                  </Label>
                  <Input
                    id="consultantAddress"
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Entrez l'adresse complète du consultant"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultantDailyRate" className="text-sm font-medium text-foreground">
                    Daily Rate
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="consultantDailyRate"
                      type="number"
                      value={form.daily_rate}
                      onChange={e => handleChange('daily_rate', e.target.value)}
                      placeholder="0.00"
                      className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultantStatus" className="text-sm font-medium text-foreground">
                    Status
                  </Label>
                  <select
                    id="consultantStatus"
                    value={form.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-border rounded-md ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    <option value="active" className="bg-background text-foreground">Active</option>
                    <option value="inactive" className="bg-background text-foreground">Inactive</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Clients Assignés
                    <span className="text-xs text-muted-foreground ml-2">(Optionnel)</span>
                  </Label>
                  
                  <div className="border border-border rounded-lg p-4 max-h-48 overflow-y-auto bg-muted/30 backdrop-blur-sm">
                    {clients.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">Aucun client disponible</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Créez d'abord des clients dans la section Clients
                        </p>
                        <Button 
                          onClick={refresh}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-3"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recharger les données
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-foreground">
                            Sélectionnez les clients à assigner
                          </p>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {clients.length} disponible{clients.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {clients.map((client) => (
                            <div 
                              key={client.id} 
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                                selectedClients.includes(client.id.toString())
                                  ? 'bg-primary/10 border-primary/20 shadow-sm'
                                  : 'bg-background hover:bg-muted/50 border-border hover:border-border/60'
                              }`}
                              onClick={() => handleClientToggle(client.id.toString())}
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  id={`client-${client.id}`}
                                  checked={selectedClients.includes(client.id.toString())}
                                  onChange={() => handleClientToggle(client.id.toString())}
                                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 transition-colors"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <label 
                                  htmlFor={`client-${client.id}`} 
                                  className="text-sm font-medium text-foreground cursor-pointer block truncate"
                                >
                                  {client.company_name}
                                </label>
                                <p className="text-xs text-muted-foreground truncate">
                                  {client.contact_email}
                                </p>
                              </div>
                              {selectedClients.includes(client.id.toString()) && (
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedClients.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} sélectionné{selectedClients.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {getSelectedClientNames().map((name, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-border">
                  <Button
                    className="flex-1 h-11 font-medium transition-all duration-200 hover:shadow-md"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajouter le Consultant
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-11 font-medium transition-all duration-200 hover:bg-muted/50"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">All</Button>
          <Button variant="outline">Available</Button>
          <Button variant="outline">Busy</Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Consultant Name</th>
                  <th className="text-left p-4 font-medium text-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-foreground">Skills</th>
                  <th className="text-left p-4 font-medium text-foreground">Adresse</th>
                  <th className="text-left p-4 font-medium text-foreground">Daily Rate</th>
                  <th className="text-left p-4 font-medium text-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultants.length > 0 ? (
                  filteredConsultants.map((consultant, index) => (
                  <tr key={consultant.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-4">
                      <div className="font-medium text-foreground">
                        {consultant.name || `${consultant.first_name || ''} ${consultant.last_name || ''}`.trim() || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{consultant.email || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{consultant.skills || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground max-w-xs">
                      <div className="truncate" title={consultant.address || 'N/A'}>
                        {consultant.address || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{consultant.daily_rate ? `$${consultant.daily_rate}` : 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">
                      <div className="flex flex-col space-y-1">
                        {consultant.client ? (
                          <>
                            <div className="font-medium text-foreground text-sm">
                              {consultant.client.company_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {consultant.client.contact_email}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Aucun client assigné
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={consultant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {consultant.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(consultant)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(consultant)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(consultant)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Aucun consultant trouvé. Ajoutez votre premier consultant pour commencer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le Consultant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">Prénom</Label>
                  <Input
                    id="editFirstName"
                    value={form.first_name}
                    onChange={e => handleChange('first_name', e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Nom de famille</Label>
                  <Input
                    id="editLastName"
                    value={form.last_name}
                    onChange={e => handleChange('last_name', e.target.value)}
                    placeholder="Nom de famille"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="Email du consultant"
                />
              </div>
                
                <div className="space-y-2">
                  <Label>Modifier les Clients Assignés</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                    {clients.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Aucun client disponible</p>
                        <p className="text-xs text-gray-400 mt-1">Créez d'abord des clients dans la section Clients</p>
                        <button 
                          onClick={refresh}
                          className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          🔄 Recharger les données
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 mb-3">
                          Modifiez les clients assignés à ce consultant ({clients.length} clients disponibles)
                        </p>
                        {clients.map((client) => (
                          <div key={client.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded">
                            <input
                              type="checkbox"
                              id={`edit-client-${client.id}`}
                              checked={selectedClients.includes(client.id.toString())}
                              onChange={() => handleClientToggle(client.id.toString())}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`edit-client-${client.id}`} className="text-sm cursor-pointer flex-1">
                              <span className="font-medium">{client.company_name}</span>
                              <span className="text-gray-500 ml-2">({client.contact_email})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedClients.length > 0 && (
                    <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-medium text-blue-800">
                        {selectedClients.length} client(s) sélectionné(s):
                      </span>
                      <br />
                      <span className="text-blue-600">
                        {getSelectedClientNames().join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de visualisation */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Détails du Consultant</DialogTitle>
            </DialogHeader>
            {viewingConsultant && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {viewingConsultant.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {viewingConsultant.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {viewingConsultant.skills || 'Not specified'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Daily Rate</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {viewingConsultant.daily_rate ? `$${viewingConsultant.daily_rate}` : 'Not specified'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {viewingConsultant.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Created Date</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {new Date(viewingConsultant.created_at).toLocaleDateString('en-US')}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            {deletingConsultant && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-red-600 text-2xl mr-3">⚠️</div>
                    <div>
                      <p className="text-red-800 font-medium">
                        Are you sure you want to delete this consultant?
                      </p>
                      <p className="text-red-600 text-sm mt-1">
                        This action is irreversible.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Consultant to delete:</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="font-medium">{deletingConsultant.name}</div>
                    <div className="text-sm text-gray-600">{deletingConsultant.email}</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={confirmDelete}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
