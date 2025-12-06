'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ConsultantAPI, invalidateCache } from '@/lib/api'
import type { Consultant } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface ConsultantFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  skills: string
  daily_rate: number
  status: 'active' | 'inactive'
}

export default function EditConsultantPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  
  const [formData, setFormData] = useState<ConsultantFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    skills: '',
    daily_rate: 0,
    status: 'active'
  })

  // Redirection si pas authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch consultant data
  useEffect(() => {
    const fetchConsultantData = async () => {
      try {
        setIsLoading(true)
        
        const consultantId = parseInt(params.id as string)
        if (isNaN(consultantId)) {
          throw new Error('ID de consultant invalide')
        }

        const response = await ConsultantAPI.get(consultantId)
        setConsultant(response)

        // Parse skills
        let skillsString = ''
        if (response.skills) {
          try {
            const parsed = JSON.parse(response.skills)
            skillsString = Array.isArray(parsed) ? parsed.join(', ') : response.skills
          } catch {
            skillsString = response.skills
          }
        }

        // Populate form
        setFormData({
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          email: response.email || '',
          phone: response.phone || '',
          address: response.address || '',
          skills: skillsString,
          daily_rate: response.daily_rate || 0,
          status: response.status || 'active'
        })
      } catch (err: any) {
        console.error('Erreur lors du chargement du consultant:', err)
        setErrors({ fetch: err.response?.data?.message || err.message || 'Erreur lors du chargement des données' })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && !authLoading && isAuthenticated) {
      fetchConsultantData()
    }
  }, [params.id, authLoading, isAuthenticated])

  // Si pas authentifié, ne rien afficher pendant la redirection
  if (!authLoading && !isAuthenticated) {
    return null
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }
    
    if (!formData.skills.trim()) {
      newErrors.skills = 'Les compétences sont requises'
    }
    
    if (formData.daily_rate <= 0) {
      newErrors.daily_rate = 'Le taux journalier doit être supérieur à 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !consultant) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        skills: formData.skills,
        daily_rate: formData.daily_rate,
        status: formData.status
      }
      
      await ConsultantAPI.update(consultant.id, updateData)
      invalidateCache(`/consultants/${consultant.id}`)
      invalidateCache('/consultants')
      
      setSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/manager/consultant/${consultant.id}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error updating consultant:', error)
      setErrors({ 
        submit: error.response?.data?.message || 'Erreur lors de la mise à jour du consultant' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Show fetch error
  if (errors.fetch || !consultant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{errors.fetch || 'Consultant introuvable'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
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
              <motion.button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier le Consultant</h1>
                <p className="text-gray-600">
                  {consultant.name || `${consultant.first_name} ${consultant.last_name}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Informations Personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Jean"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.first_name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Dupont"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.last_name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Information */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              Informations Professionnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux journalier (€) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.daily_rate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="450"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.daily_rate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.daily_rate}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétences *
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.skills ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Développement, React, Node.js, Python, SQL"
                />
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.skills}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Séparez les compétences par des virgules</p>
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          {success && (
            <motion.div 
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-green-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Consultant mis à jour avec succès ! Redirection en cours...
              </p>
            </motion.div>
          )}

          {/* Error Message */}
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

          {/* Submit Button */}
          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
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
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
              whileHover={!isSubmitting && !success ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting && !success ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
                  <span>Enregistrer</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </div>
  )
}





