'use client'

import { useState, useEffect } from 'react'
import { ConsultantAPI, clearAllCache } from '@/lib/api'
import type { Consultant } from '@/lib/type'

interface ConsultantAuthState {
  user: Consultant | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export function useConsultantAuth() {
  const [authState, setAuthState] = useState<ConsultantAuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  })

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userType = localStorage.getItem('userType')
        
        if (!token || userType !== 'consultant') {
          setAuthState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false
          })
          return
        }

        // Récupérer les informations du consultant depuis le backend
        // Note: Vous devrez peut-être créer un endpoint /consultant/me dans votre API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saas.oncree.fr/api'}/consultant/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const consultantData = await response.json()
          setAuthState({
            user: consultantData,
            loading: false,
            error: null,
            isAuthenticated: true
          })
        } else {
          throw new Error('Erreur lors de la récupération des informations consultant')
        }
      } catch (error: any) {
        console.error('Erreur lors de la récupération des informations consultant:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error.message || 'Erreur de connexion',
          isAuthenticated: false
        })
      }
    }

    initializeAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userType')
    clearAllCache() // Vider le cache pour éviter que les données d'un consultant soient visibles par un autre
    setAuthState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false
    })
  }

  return {
    ...authState,
    logout
  }
}












