'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { RhAPI, ConsultantAPI } from '@/lib/api'
import type { Rh } from '@/lib/type'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Euro,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

// TypeScript Interfaces
interface ConsultantFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'Consultant'
  skills: string
  daily_rate: number
  status: 'active' | 'inactive'
  address: string
  password: string
}

export default function AddConsultantPage() {
  const router = useRouter()
  const [rh, setRh] = useState<Rh | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<ConsultantFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Consultant',
    skills: '',
    daily_rate: 0,
    status: 'active',
    address: '',
    password: ''
  })

  const [newSkill, setNewSkill] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)

  // Charger les informations du RH connecté
  useEffect(() => {
    const loadRhData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userType = localStorage.getItem('userType')
        
        if (!token || userType !== 'rh') {
          router.push('/login')
          return
        }
        
        const rhData = await RhAPI.me()
        setRh(rhData)
        
        if (!rhData.client_id) {
          setErrors({ submit: 'RH non associé à un client' })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données RH:', error)
        setErrors({ submit: 'Erreur lors du chargement des données RH' })
      } finally {
        setLoading(false)
      }
    }
    
    loadRhData()
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Available skills options
  const availableSkills = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'PHP',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Project Management', 'Agile', 'Scrum', 'Data Analysis', 'SQL',
    'DevOps', 'AWS', 'Docker', 'Kubernetes', 'Mobile Development'
  ]

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
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }
    
    if (formData.daily_rate <= 0) {
      newErrors.daily_rate = 'Le tarif journalier doit être supérieur à 0'
    }
    
    if (!formData.skills.trim() && selectedSkills.length === 0) {
      newErrors.skills = 'Les compétences sont requises'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!rh?.client_id) {
      setErrors({ submit: 'RH non associé à un client' })
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Préparer les données pour l'API
      const consultantData = {
        ...formData,
        client_id: rh.client_id, // Utiliser le client_id du RH connecté
        skills: selectedSkills.length > 0 ? selectedSkills.join(', ') : formData.skills
      }
      
      // Appel à l'API pour créer le consultant
      await ConsultantAPI.create(consultantData)
      
      setSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/rh/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating consultant:', error)
      setErrors({ 
        submit: error.response?.data?.message || 'Erreur lors de la création du consultant' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle skill addition
  const addSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
    }
  }

  // Handle skill removal
  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillToRemove))
  }

  // Handle skill selection from available skills
  const selectSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nouveau Consultant</h1>
                <p className="text-muted-foreground">
                  Ajouter un nouveau consultant pour votre entreprise
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
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-6 flex items-center">
              <User className="h-5 w-5 text-primary mr-2" />
              Informations Personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.first_name ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Ex: Marie"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.first_name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.last_name ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Ex: Dubois"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.last_name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.password ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="Mot de passe (min 8 caractères)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.email ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="marie.dubois@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.phone ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="+33 6 12 34 56 78"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                />
              </div>
            </div>
          </motion.div>

          {/* Professional Information */}
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-6 flex items-center">
              <Briefcase className="h-5 w-5 text-primary mr-2" />
              Informations Professionnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">Le rôle est automatiquement défini comme "Consultant"</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tarif Journalier (€) *
                </label>
                <input
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.daily_rate ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="450"
                  min="0"
                />
                {errors.daily_rate && (
                  <p className="mt-1 text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.daily_rate}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div 
            className="bg-card rounded-lg shadow-sm border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-card-foreground mb-6">
              Compétences
            </h2>
            
            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Compétences sélectionnées:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary hover:text-primary/80"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Manual Skills Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Compétences (séparées par des virgules) *
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.skills ? 'border-destructive' : 'border-input'
                }`}
                rows={2}
                placeholder="Ex: React, Node.js, UI/UX Design, Project Management"
              />
              {errors.skills && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.skills}
                </p>
              )}
            </div>
            
            {/* Add New Skill */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ajouter une compétence..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
            
            {/* Available Skills */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Compétences disponibles (cliquez pour ajouter):</p>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => selectSkill(skill)}
                    disabled={selectedSkills.includes(skill)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>


          {/* Success Message */}
          {success && (
            <motion.div 
              className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Consultant créé avec succès ! Redirection en cours...
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-input text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            
            <motion.button
              type="submit"
              disabled={isSubmitting || success}
              className={`px-6 py-2 rounded-lg text-primary-foreground flex items-center space-x-2 ${
                isSubmitting || success
                  ? 'bg-muted cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90'
              } transition-colors`}
              whileHover={!isSubmitting && !success ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting && !success ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Création...</span>
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créé avec succès</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créer le Consultant</span>
                </>
              )}
            </motion.button>
          </motion.div>
          
          {errors.submit && (
            <motion.div 
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-destructive flex items-center">
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

