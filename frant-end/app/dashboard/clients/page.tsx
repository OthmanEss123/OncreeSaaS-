"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Mail, Phone, Building, X } from "lucide-react"
import { useEffect, useState } from 'react'
import { ClientAPI } from '@/lib/api'
import type { Client } from '@/lib/type'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    password: ''
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const clientData = {
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
        password: form.password
      }
      console.log('Sending client data:', clientData)
      const response = await ClientAPI.create(clientData)
      console.log('Client created successfully:', response)
      // Réinitialiser le formulaire
      setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', address: '', password: '' })
      setIsModalOpen(false)
      // Actualiser la liste
      await refresh()
      showNotification('success', 'Client créé avec succès!')
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      showNotification('error', 'Erreur lors de la création: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    try {
      setIsLoadingClients(true)
      const clientsData = await ClientAPI.all()
      console.log('Clients reçus:', clientsData)
      if (Array.isArray(clientsData)) {
        setClients(clientsData)
      } else {
        setClients([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
      setClients([])
      showNotification('error', 'Erreur lors du chargement des clients')
    } finally {
      setIsLoadingClients(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setForm({
      company_name: client.company_name,
      contact_name: client.contact_name || '',
      contact_email: client.contact_email,
      contact_phone: client.contact_phone || '',
      address: client.address || '',
      password: client.password || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingClient) return
    
    setLoading(true)
    try {
      const response = await ClientAPI.update(editingClient.id, {
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
        password: form.password
      })
      
      setIsEditModalOpen(false)
      setEditingClient(null)
      await refresh()
      showNotification('success', 'Client mis à jour avec succès!')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      showNotification('error', 'Erreur lors de la mise à jour: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (client: Client) => {
    setDeletingClient(client)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingClient) return
    
    try {
      await ClientAPI.delete(deletingClient.id)
      await refresh()
      showNotification('success', 'Client supprimé avec succès!')
      setIsDeleteModalOpen(false)
      setDeletingClient(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showNotification('error', 'Erreur lors de la suppression: ' + (error as Error).message)
    }
  }

  const handleView = (client: Client) => {
    setViewingClient(client)
    setIsViewModalOpen(true)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
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
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientCompany">Company Name</Label>
            <Input
              id="clientCompany"
              value={form.company_name}
              onChange={e => handleChange('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientContactName">Contact Name</Label>
            <Input
              id="clientContactName"
              value={form.contact_name}
              onChange={e => handleChange('contact_name', e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Input
              id="clientAddress"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={form.contact_email}
              onChange={e => handleChange('contact_email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <Input
              id="clientPhone"
              value={form.contact_phone}
              onChange={e => handleChange('contact_phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientAddress">Password</Label>
            <Input
              id="clientPassword"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Add Client'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal d'édition */}
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCompany">Company Name</Label>
            <Input
              id="editCompany"
              value={form.company_name}
              onChange={e => handleChange('company_name', e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editContactName">Contact Name</Label>
            <Input
              id="editContactName"
              value={form.contact_name}
              onChange={e => handleChange('contact_name', e.target.value)}
              placeholder="Contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editEmail">Email</Label>
            <Input
              id="editEmail"
              type="email"
              value={form.contact_email}
              onChange={e => handleChange('contact_email', e.target.value)}
              placeholder="Email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone</Label>
            <Input
              id="editPhone"
              type="tel"
              value={form.contact_phone}
              onChange={e => handleChange('contact_phone', e.target.value)}
              placeholder="Phone number"
            />
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
          <DialogTitle>Détails du Client</DialogTitle>
        </DialogHeader>
        {viewingClient && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {viewingClient.company_name}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {viewingClient.contact_name || 'Not provided'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {viewingClient.contact_email}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {viewingClient.contact_phone || 'Not provided'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Created Date</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {new Date(viewingClient.created_at).toLocaleDateString('en-US')}
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
        {deletingClient && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 text-2xl mr-3">⚠️</div>
                <div>
                  <p className="text-red-800 font-medium">
                    Are you sure you want to delete this client?
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    This action is irreversible.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Client to delete:</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <div className="font-medium">{deletingClient.company_name}</div>
                <div className="text-sm text-gray-600">{deletingClient.contact_email}</div>
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All Clients
                </Button>
                <Button variant="outline" size="sm">
                  Active
                </Button>
                <Button variant="outline" size="sm">
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingClients ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Chargement des clients...
                      </td>
                    </tr>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client) => (
                    <tr key={client.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{client.company_name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {client.contact_email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-4 w-4" />
                          {client.contact_name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {client.contact_phone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(client)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(client)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Aucun client trouvé. Ajoutez votre premier client pour commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
