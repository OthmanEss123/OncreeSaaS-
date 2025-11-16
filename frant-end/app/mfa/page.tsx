'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { MfaAPI, clearAllCache } from '@/lib/api'

export default function MfaPage() {
  const router = useRouter()
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    // Récupérer les valeurs depuis sessionStorage côté client uniquement
    if (typeof window === 'undefined') {
      return
    }

    const storedChallengeId = sessionStorage.getItem('mfa.challengeId')
    const storedUserType = sessionStorage.getItem('mfa.type')
    const storedEmail = sessionStorage.getItem('mfa.email')

    console.log('🔍 MFA Page - SessionStorage values:', {
      challengeId: storedChallengeId,
      userType: storedUserType,
      email: storedEmail,
      allSessionStorage: {
        keys: Object.keys(sessionStorage),
        values: Object.keys(sessionStorage).map(key => ({
          key,
          value: sessionStorage.getItem(key)
        }))
      }
    })

    // Mettre à jour les états
    setChallengeId(storedChallengeId)
    setUserType(storedUserType)
    setEmail(storedEmail)

    // Vérifier que le challengeId existe
    if (!storedChallengeId) {
      console.error('❌ Challenge ID manquant dans sessionStorage')
      console.error('📋 Toutes les clés sessionStorage:', Object.keys(sessionStorage))
      setError('Challenge ID manquant. Veuillez vous reconnecter.')
      setIsLoading(false)
      // Rediriger après un court délai pour permettre à l'utilisateur de voir l'erreur
      setTimeout(() => {
        router.replace('/login')
      }, 2000)
      return
    }

    // Vérifier que le challengeId est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(storedChallengeId)) {
      console.error('❌ Challenge ID invalide (pas un UUID):', storedChallengeId)
      setError('Challenge ID invalide. Veuillez vous reconnecter.')
      setIsLoading(false)
      setTimeout(() => {
        router.replace('/login')
      }, 2000)
      return
    }

    console.log('✅ Challenge ID valide:', storedChallengeId)
    setIsLoading(false)
    // Focus sur le premier input après un court délai
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [router])

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Validation initiale
    if (!challengeId) {
      setError('Challenge ID manquant. Veuillez vous reconnecter.')
      return
    }

    // Vérifier que le challengeId est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(challengeId)) {
      console.error('❌ Challenge ID invalide (pas un UUID):', challengeId)
      setError('Challenge ID invalide. Veuillez vous reconnecter.')
      return
    }

    // Nettoyer le code: joindre les chiffres et s'assurer qu'il n'y a que des chiffres
    const fullCode = code.join('').trim().replace(/\D/g, '')

    console.log('🔍 Validation du code MFA:', {
      rawCode: code.join(''),
      cleanedCode: fullCode,
      length: fullCode.length,
      isNumeric: /^\d{6}$/.test(fullCode),
      challengeId,
      challengeIdIsUUID: uuidRegex.test(challengeId)
    })

    // Validation stricte du code
    if (!fullCode || fullCode.length !== 6) {
      setError('Veuillez entrer exactement 6 chiffres.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    if (!/^\d{6}$/.test(fullCode)) {
      setError('Le code doit contenir uniquement des chiffres.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Préparer les données de la requête
      const requestData = {
        challenge_id: challengeId,
        code: fullCode
      }

      console.log('📤 Envoi de la requête MFA verify:', requestData)

      // Appel à l'API
      const { data } = await MfaAPI.verify(challengeId, fullCode)
      
      console.log('✅ Réponse reçue de l\'API:', data)

      console.log('✅ Code MFA vérifié avec succès:', {
        hasToken: !!data.token,
        type: data.type,
        user: data.user
      })

      // Nettoyer le sessionStorage
      sessionStorage.removeItem('mfa.challengeId')
      sessionStorage.removeItem('mfa.type')
      sessionStorage.removeItem('mfa.email')

      // Vider le cache et stocker le token
      clearAllCache()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userType', data.type)

      console.log('🚀 Redirection vers le dashboard:', data.type)

      // Redirection selon le type d'utilisateur
      switch (data.type) {
        case 'admin':
          router.push('/dashboard')
          break
        case 'client':
          router.push('/client/dashboard')
          break
        case 'manager':
          router.push('/manager/dashboard')
          break
        case 'rh':
          router.push('/rh/dashboard')
          break
        case 'comptable':
          router.push('/comptable')
          break
        case 'consultant':
          router.push('/consultant/dashboard')
          break
        default:
          console.warn('⚠️ Type utilisateur inconnu:', data.type)
          router.push('/')
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la vérification MFA:', err)
      console.error('❌ Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      })

      // Gestion des erreurs de validation (422)
      if (err.response?.status === 422) {
        const validationErrors = err.response?.data?.errors
        console.error('❌ Erreurs de validation détaillées (422):', {
          errors: validationErrors,
          fullResponse: err.response?.data
        })
        
        if (validationErrors) {
          // Afficher toutes les erreurs de validation
          const errorMessages: string[] = []
          
          // Gérer challenge_id
          if (validationErrors.challenge_id) {
            if (Array.isArray(validationErrors.challenge_id)) {
              errorMessages.push(...validationErrors.challenge_id)
            } else if (typeof validationErrors.challenge_id === 'string') {
              errorMessages.push(validationErrors.challenge_id)
            }
          }
          
          // Gérer code
          if (validationErrors.code) {
            if (Array.isArray(validationErrors.code)) {
              errorMessages.push(...validationErrors.code)
            } else if (typeof validationErrors.code === 'string') {
              errorMessages.push(validationErrors.code)
            }
          }
          
          const errorMessage = errorMessages.length > 0 
            ? errorMessages.join('. ') 
            : 'Erreur de validation. Vérifiez que le code contient exactement 6 chiffres et que le challenge ID est valide.'
          
          setError(errorMessage)
          console.error('❌ Message d\'erreur affiché:', errorMessage)
        } else {
          // Aucune erreur structurée, utiliser le message générique
          const message = err.response?.data?.message || 'Erreur de validation. Vérifiez vos données.'
          setError(message)
          console.error('❌ Message d\'erreur (générique):', message)
        }
      } else if (err.response?.status === 404) {
        setError('Challenge introuvable ou expiré. Veuillez vous reconnecter.')
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Code incorrect ou expiré.')
      } else {
        // Erreur réseau ou autre
        const fallback =
          err.response?.data?.message ??
          (err.response?.data?.errors?.code && Array.isArray(err.response.data.errors.code) 
            ? err.response.data.errors.code[0] 
            : err.response?.data?.errors?.code) ??
          err.message ??
          'Vérification impossible, veuillez réessayer.'
        
        setError(fallback)
        console.error('❌ Message d\'erreur (fallback):', fallback)
      }

      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Afficher un message de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si pas de challengeId, ne pas afficher le formulaire
  if (!challengeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-destructive">
            Erreur
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || 'Challenge ID manquant. Veuillez vous reconnecter.'}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative bg-card border border-border rounded-lg shadow-sm p-8">
          <Link
            href="/login"
            className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>

          <h1 className="text-2xl font-semibold text-center mb-2">
            Vérification en deux étapes
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Nous avons envoyé un code à 6 chiffres à{' '}
            <span className="font-medium text-foreground">
              {email ?? 'votre adresse email'}
            </span>
            .
          </p>

          {error && (
            <div className="mb-4 p-3 border border-destructive/30 bg-destructive/10 rounded-md text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={element => {
                    inputRefs.current[index] = element
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={event => handleCodeChange(index, event.target.value)}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className="w-full py-3 px-4 rounded-lg text-white flex items-center justify-center gap-2 transition-colors bg-primary disabled:bg-muted disabled:text-muted-foreground"
              whileHover={
                !isSubmitting && code.join('').length === 6 ? { scale: 1.02 } : {}
              }
              whileTap={
                !isSubmitting && code.join('').length === 6 ? { scale: 0.98 } : {}
              }
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Vérifier le code
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}








