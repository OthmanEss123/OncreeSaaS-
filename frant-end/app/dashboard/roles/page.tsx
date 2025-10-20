'use client'

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { useEffect, useState } from 'react'

// Type pour les rôles (local uniquement)
interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

interface RoleCreate {
  name: string
  description: string
  permissions: string[]
}

interface RoleUpdate {
  name?: string
  description?: string
  permissions?: string[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [form, setForm] = useState<RoleCreate>({
    name: '',
    description: '',
    permissions: []
  })

  // Permissions disponibles
  const availablePermissions = [
    'create_users', 'edit_users', 'delete_users', 'view_users',
    'create_clients', 'edit_clients', 'delete_clients', 'view_clients',
    'create_consultants', 'edit_consultants', 'delete_consultants', 'view_consultants',
    'create_projects', 'edit_projects', 'delete_projects', 'view_projects',
    'create_reports', 'edit_reports', 'delete_reports', 'view_reports',
    'admin_panel', 'system_settings', 'user_management'
  ]

  // Données de démonstration (remplace l'API)
  const initializeRoles = () => {
    const defaultRoles: Role[] = [
      {
        id: 1,
        name: 'Administrateur',
        description: 'Accès complet au système',
        permissions: ['admin_panel', 'system_settings', 'user_management', 'create_users', 'edit_users', 'delete_users', 'view_users'],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      },
      {
        id: 2,
        name: 'Manager',
        description: 'Gestion des équipes et projets',
        permissions: ['view_users', 'create_projects', 'edit_projects', 'view_projects', 'create_reports', 'view_reports'],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      },
      {
        id: 3,
        name: 'Consultant',
        description: 'Accès aux projets assignés',
        permissions: ['view_clients', 'view_projects', 'create_reports', 'edit_reports'],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      },
      {
        id: 4,
        name: 'Client',
        description: 'Accès limité aux informations',
        permissions: ['view_projects'],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }
    ]
    setRoles(defaultRoles)
  }

  useEffect(() => {
    initializeRoles()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleChange = (field: keyof RoleCreate, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePermissionToggle = (permission: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showNotification('error', 'Le nom du rôle est requis')
      return
    }

    setLoading(true)
    try {
      // Simulation d'ajout
      const newRole: Role = {
        id: Math.max(...roles.map(r => r.id)) + 1,
        ...form,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setRoles(prev => [...prev, newRole])
      setIsAddModalOpen(false)
      setForm({ name: '', description: '', permissions: [] })
      showNotification('success', 'Rôle créé avec succès!')
    } catch (error) {
      showNotification('error', 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingRole) return
    
    setLoading(true)
    try {
      const updatedRole: Role = {
        ...editingRole,
        ...form,
        updated_at: new Date().toISOString()
      }
      
      setRoles(prev => prev.map(r => r.id === editingRole.id ? updatedRole : r))
      setIsEditModalOpen(false)
      setEditingRole(null)
      setForm({ name: '', description: '', permissions: [] })
      showNotification('success', 'Rôle mis à jour avec succès!')
    } catch (error) {
      showNotification('error', 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (role: Role) => {
    setViewingRole(role)
    setIsViewModalOpen(true)
  }

  const handleDelete = (role: Role) => {
    setDeletingRole(role)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingRole) return
    
    setLoading(true)
    try {
      setRoles(prev => prev.filter(r => r.id !== deletingRole.id))
      setIsDeleteModalOpen(false)
      setDeletingRole(null)
      showNotification('success', 'Rôle supprimé avec succès!')
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPermissionColor = (permission: string) => {
    if (permission.includes('admin') || permission.includes('system')) return 'bg-red-100 text-red-800'
    if (permission.includes('create') || permission.includes('edit') || permission.includes('delete')) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rôles</h1>
            <p className="text-gray-600 mt-1">Gérez les rôles et permissions du système</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un Rôle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
                <DialogDescription>
                  Créez un nouveau rôle avec des permissions spécifiques
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du rôle</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Ex: Développeur, Support, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Description du rôle et de ses responsabilités"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`perm-${permission}`}
                            checked={form.permissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`perm-${permission}`} className="text-sm cursor-pointer">
                            {permission.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {form.permissions.length > 0 && (
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <span className="font-medium text-blue-800">
                        {form.permissions.length} permission(s) sélectionnée(s)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer le Rôle'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsAddModalOpen(false)
                      setForm({ name: '', description: '', permissions: [] })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
              <div className="text-sm text-gray-600">Total Rôles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{roles.filter(r => r.permissions.length > 5).length}</div>
              <div className="text-sm text-gray-600">Rôles Avancés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{roles.filter(r => r.permissions.includes('admin_panel')).length}</div>
              <div className="text-sm text-gray-600">Rôles Admin</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{availablePermissions.length}</div>
              <div className="text-sm text-gray-600">Permissions Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Rôles ({filteredRoles.length})</CardTitle>
            <CardDescription>
              Gérez les rôles et leurs permissions dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-900">Nom</th>
                    <th className="text-left p-4 font-medium text-gray-900">Description</th>
                    <th className="text-left p-4 font-medium text-gray-900">Permissions</th>
                    <th className="text-left p-4 font-medium text-gray-900">Date Création</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">ID: {role.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900">{role.description}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge
                              key={permission}
                              variant="secondary"
                              className={`text-xs ${getPermissionColor(permission)}`}
                            >
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} autres
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(role.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(role)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(role)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(role)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>
                Modifiez les informations et permissions du rôle
              </DialogDescription>
            </DialogHeader>
            {editingRole && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Nom du rôle</Label>
                  <Input
                    id="editName"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Nom du rôle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Input
                    id="editDescription"
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Description du rôle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-perm-${permission}`}
                            checked={form.permissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`edit-perm-${permission}`} className="text-sm cursor-pointer">
                            {permission.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingRole(null)
                      setForm({ name: '', description: '', permissions: [] })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de visualisation */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du rôle</DialogTitle>
              <DialogDescription>
                Informations complètes du rôle sélectionné
              </DialogDescription>
            </DialogHeader>
            {viewingRole && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nom</Label>
                    <p className="text-lg font-semibold">{viewingRole.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID</Label>
                    <p className="text-lg">{viewingRole.id}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-900">{viewingRole.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Permissions ({viewingRole.permissions.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingRole.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        className={getPermissionColor(permission)}
                      >
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                    <p>{new Date(viewingRole.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Dernière modification</Label>
                    <p>{new Date(viewingRole.updated_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de suppression */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce rôle ?
              </DialogDescription>
            </DialogHeader>
            {deletingRole && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900">Rôle à supprimer :</h4>
                  <p className="text-red-700">{deletingRole.name}</p>
                  <p className="text-sm text-red-600">{deletingRole.description}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={confirmDelete}
                    disabled={loading}
                  >
                    {loading ? 'Suppression...' : 'Oui, supprimer'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDeleteModalOpen(false)
                      setDeletingRole(null)
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </DashboardLayout>
  )
}
