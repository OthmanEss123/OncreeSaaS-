'use client'

import { useState, useEffect } from 'react'
import { ClientAPI, clearAllCache } from '@/lib/api'
import type { Client } from '@/lib/type'
import axios from 'axios'

interface AuthState {
  user: Client | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
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
        
        if (!token) {
          setAuthState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false
          })
          return
        }

        // Récupérer les informations de l'utilisateur depuis le backend selon son type
        const endpoint = userType ? `/${userType}/me` : '/client/me'
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://api.saas.oncree.fr/api"}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setAuthState({
          user: response.data,
          loading: false,
          error: null,
          isAuthenticated: true
        })
      } catch (error: any) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error.response?.data?.message || 'Erreur de connexion',
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
