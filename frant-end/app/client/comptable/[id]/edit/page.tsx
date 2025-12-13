'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ComptableAPI } from '@/lib/api'
import type { Comptable } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  User, 
  Mail, 
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

// TypeScript Interfaces
interface ComptableFormData {
  name: string
  email: string
  phone: string
  role: 'Comptable'
  password: string
}

export default function EditComptablePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [comptable, setComptable] = useState<Comptable | null>(null)
  
  const [formData, setFormData] = useState<ComptableFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'Comptable',
    password: ''
  })

  // Fetch Comptable data
  useEffect(() => {
    const fetchComptable = async () => {
      try {
        setIsLoading(true)
        const comptableId = parseInt(params.id as string)
        if (isNaN(comptableId)) {
          throw new Error('ID de comptable invalide')
        }

        const response = await ComptableAPI.get(comptableId)
        const comptableData = response.data || response
        setComptable(comptableData)
        
        // Populate form with Comptable data
        setFormData({
          name: comptableData.name || '',
          email: comptableData.email || '',
          phone: comptableData.phone || '',
          role: 'Comptable',
          password: ''
        })
      } catch (err: any) {
        console.error('Erreur lors du chargement du comptable:', err)
        setErrors({ submit: err.response?.data?.message || 'Erreur lors du chargement des données' })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchComptable()
    }
  }, [params.id])

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  if (!authLoading && !isAuthenticated) {
    return null
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !comptable) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const comptableData: Partial<Comptable> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }
      
      if (formData.password) {
        comptableData.password = formData.password
      }
      
      await ComptableAPI.update(comptable.id, comptableData)
      
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/client/comptable/${comptable.id}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error updating comptable:', error)
      setErrors({ 
        submit: error.response?.data?.message || 'Erreur lors de la mise à jour du comptable' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier le Comptable</h1>
                <p className="text-gray-600">
                  Modifier les informations de {comptable?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 text-purple-600 mr-2" />
              Informations Personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Jean Dupont"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe (optionnel)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Laisser vide pour garder l'actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jean.dupont@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+33 6 12 34 56 78"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="h-5 w-5 text-purple-600 mr-2" />
              Informations Professionnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Le rôle ne peut pas être modifié</p>
              </div>
            </div>
          </motion.div>

          {success && (
            <motion.div 
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-green-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Comptable mis à jour avec succès ! Redirection en cours...
              </p>
            </motion.div>
          )}

          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <motion.button
              type="submit"
              disabled={isSubmitting || success}
              className={`px-6 py-2 rounded-lg text-white flex items-center space-x-2 ${
                isSubmitting || success
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors`}
              whileHover={!isSubmitting && !success ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting && !success ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Mis à jour</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </motion.button>
          </motion.div>
          
          {errors.submit && (
            <motion.div 
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </motion.div>
          )}
        </form>
      </main>
    </div>
  )
}





















