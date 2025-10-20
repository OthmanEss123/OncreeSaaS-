'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PasswordRecoveryAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Mail, 
  AlertCircle,
  Send
} from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Appel à l'API pour envoyer le code à 6 chiffres
      const response = await PasswordRecoveryAPI.sendResetCode(email)
      
      // Store email in sessionStorage for next step
      sessionStorage.setItem('resetEmail', email)
      
      // Redirect to verify-code page
      router.push('/verify-code')
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du code:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Erreur lors de l\'envoi du code. Veuillez réessayer.'
      )
    } finally {
      setIsSubmitting(false)
    }
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
              <Mail className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Mot de passe oublié ?
            </h1>
            
            <p className="text-muted-foreground">
              Entrez votre adresse email et nous vous enverrons un code à 6 chiffres pour réinitialiser votre mot de passe.
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
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="votre@email.com"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className={`w-full py-2 px-4 rounded-lg text-white flex items-center justify-center space-x-2 transition-colors ${
                isSubmitting || !email.trim()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
              whileHover={!isSubmitting && email.trim() ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && email.trim() ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Envoyer le code</span>
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
