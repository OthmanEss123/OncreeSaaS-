'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PasswordRecoveryAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    // Get email and code from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail')
    const storedCode = sessionStorage.getItem('resetCode')
    
    if (!storedEmail || !storedCode) {
      setError('Session expirée. Veuillez recommencer le processus.')
    } else {
      setEmail(storedEmail)
      setCode(storedCode)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsSubmitting(true)

    try {
      // Appel à l'API pour réinitialiser le mot de passe avec le code
      await PasswordRecoveryAPI.resetPassword(email!, code!, password, confirmPassword)
      
      // Clear sessionStorage
      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetCode')
      
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Mot de passe réinitialisé !
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Votre mot de passe a été mis à jour avec succès.
            </p>
            
            <Link 
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Se connecter maintenant
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error && !email && !code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Session expirée
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Votre session de réinitialisation a expiré. Veuillez recommencer le processus.
            </p>
            
            <div className="space-y-2">
              <Link 
                href="/forgot-password"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Recommencer
              </Link>
              
              <Link 
                href="/login"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm mt-2"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.button
              onClick={() => router.back()}
              className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Nouveau mot de passe
            </h1>
            
            <p className="text-muted-foreground">
              Entrez votre nouveau mot de passe ci-dessous.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </p>
              </motion.div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="Minimum 6 caractères"
                  required
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="Répétez le mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !password.trim() || !confirmPassword.trim()}
              className={`w-full py-2 px-4 rounded-lg text-white flex items-center justify-center space-x-2 transition-colors ${
                isSubmitting || !password.trim() || !confirmPassword.trim()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
              whileHover={!isSubmitting && password.trim() && confirmPassword.trim() ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && password.trim() && confirmPassword.trim() ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Réinitialiser le mot de passe</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link 
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
