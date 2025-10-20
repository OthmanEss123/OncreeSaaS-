'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PasswordRecoveryAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Shield, 
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function VerifyCodePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  
  // Refs for the input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail')
    if (!storedEmail) {
      // If no email, redirect back to forgot-password
      router.push('/forgot-password')
    } else {
      setEmail(storedEmail)
    }
  }, [router])

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('')
      setCode(newCode)
      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const fullCode = code.join('')
    
    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres')
      setIsSubmitting(false)
      return
    }

    try {
      console.log('Données envoyées:', { email, code: fullCode })
      // Verify the code
      await PasswordRecoveryAPI.verifyCode(email, fullCode)
      
      // Store code in sessionStorage for reset-password page
      sessionStorage.setItem('resetCode', fullCode)
      
      // Redirect to reset-password page
      router.push('/reset-password')
    } catch (err: any) {
      console.error('Erreur lors de la vérification du code:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Code invalide ou expiré. Veuillez réessayer.'
      )
      // Clear the code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError(null)

    try {
      await PasswordRecoveryAPI.sendResetCode(email)
      
      // Show success message
      setError(null)
      alert('Un nouveau code a été envoyé à votre email !')
      
      // Clear the code fields
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      console.error('Erreur lors du renvoi du code:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Erreur lors du renvoi du code. Veuillez réessayer.'
      )
    } finally {
      setIsResending(false)
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
            <Link
              href="/forgot-password"
              className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Vérifier votre code
            </h1>
            
            <p className="text-muted-foreground text-sm">
              Nous avons envoyé un code à 6 chiffres à<br />
              <strong className="text-foreground">{email}</strong>
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

            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 text-center">
                Entrez le code à 6 chiffres
              </label>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground transition-all"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-lg text-white flex items-center justify-center space-x-2 transition-colors ${
                isSubmitting || code.join('').length !== 6
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
              whileHover={!isSubmitting && code.join('').length === 6 ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && code.join('').length === 6 ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Vérifier le code</span>
                </>
              )}
            </motion.button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:text-primary/80 transition-colors font-medium text-sm inline-flex items-center"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    <span>Renvoyer le code</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <Link 
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                ← Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}






