"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { clearAllCache } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 🔑 Appel à l'API Laravel
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.saas.oncree.fr/api"}/login`,
        { email, password }
      )

      // Debug: Log la réponse de l'API
      console.log('🔍 Réponse API Login:', {
        mfa_required: data.mfa_required,
        type: data.type,
        challenge_id: data.challenge_id,
        has_token: !!data.token,
        code: data.code // Code MFA en développement
      })

      if (data.mfa_required) {
        console.log('✅ MFA requis - Redirection vers /mfa')
        
        // Vérifier que challenge_id existe et est valide
        if (!data.challenge_id) {
          console.error('❌ challenge_id manquant dans la réponse:', data)
          setError('Erreur: challenge_id manquant. Veuillez réessayer.')
          setLoading(false)
          return
        }

        // Vérifier que challenge_id est un UUID valide
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(data.challenge_id)) {
          console.error('❌ challenge_id invalide (pas un UUID):', data.challenge_id)
          setError('Erreur: challenge_id invalide. Veuillez réessayer.')
          setLoading(false)
          return
        }
        
        console.log('✅ Challenge ID valide:', data.challenge_id)
        
        // Log du code MFA en développement (sans alerte)
        if (data.code) {
          console.log('🔑 Code MFA (développement):', data.code)
        }
        
        // Stocker les données dans sessionStorage de manière synchrone
        try {
          sessionStorage.setItem("mfa.challengeId", String(data.challenge_id))
          sessionStorage.setItem("mfa.type", String(data.type ?? ""))
          sessionStorage.setItem("mfa.email", email)
          
          // Vérifier que les données ont bien été stockées
          const storedChallengeId = sessionStorage.getItem("mfa.challengeId")
          const storedType = sessionStorage.getItem("mfa.type")
          const storedEmail = sessionStorage.getItem("mfa.email")
          
          console.log('📦 Données stockées dans sessionStorage:', {
            challengeId: storedChallengeId,
            type: storedType,
            email: storedEmail,
            allSessionStorage: {
              keys: Object.keys(sessionStorage),
              values: Object.keys(sessionStorage).map(key => ({
                key,
                value: sessionStorage.getItem(key)
              }))
            }
          })
          
          // Vérifier que le challengeId a bien été stocké
          if (!storedChallengeId || storedChallengeId !== String(data.challenge_id)) {
            console.error('❌ Erreur: challengeId n\'a pas été stocké correctement dans sessionStorage')
            setError('Erreur lors du stockage des données. Veuillez réessayer.')
            setLoading(false)
            return
          }
          
          // Attendre un court délai pour s'assurer que sessionStorage est bien mis à jour
          // avant de naviguer
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Double vérification avant la navigation
          const verifyChallengeId = sessionStorage.getItem("mfa.challengeId")
          if (!verifyChallengeId || verifyChallengeId !== String(data.challenge_id)) {
            console.error('❌ Erreur: challengeId perdu après stockage')
            setError('Erreur lors du stockage des données. Veuillez réessayer.')
            setLoading(false)
            return
          }
          
          console.log('✅ Vérification réussie, redirection vers /mfa')
          router.push("/mfa")
        } catch (storageError) {
          console.error('❌ Erreur lors du stockage dans sessionStorage:', storageError)
          setError('Erreur lors du stockage des données. Veuillez réessayer.')
          setLoading(false)
          return
        }
        return
      }

      console.log('⚠️ MFA non requis - Connexion directe')

      // 🗑️ Vider le cache avant de stocker le nouveau token pour éviter les données d'un ancien utilisateur
      clearAllCache()

      // ⚡ Stocker le token (exemple simple : localStorage)
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("userType", data.type)

      // ✅ Redirection selon le rôle
      switch (data.type) {
        case "admin":
          router.push("/dashboard")
          break
        case "client":
          router.push("/client/dashboard")
          break
        case "manager":
          router.push("/manager/dashboard")
          break
        case "rh":
          router.push("/rh/dashboard")
          break
        case "comptable":
          router.push("/comptable")
          break
        case "consultant":
          router.push("/consultant/dashboard")
          break
        default:
          router.push("/")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <h1 className="text-3xl font-bold text-primary">OncreeSaaS</h1>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Bon retour</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm">
                  Se souvenir de moi
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Connexion..." : "Se Connecter"}
            </Button>
            <div className="text-center text-sm">
              Vous n'avez pas de compte ?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
