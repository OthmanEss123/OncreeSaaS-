'use client'

import { useState, useEffect } from 'react'
import { ComptableAPI } from '@/lib/api'
import type { Comptable } from '@/lib/type'

interface UseComptablesState {
  comptables: Comptable[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useComptables() {
  const [state, setState] = useState<UseComptablesState>({
    comptables: [],
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchComptables = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await ComptableAPI.all()
      setState(prev => ({
        ...prev,
        comptables: response.data || response,
        loading: false
      }))
    } catch (error: any) {
      console.error('Erreur lors de la récupération des comptables:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des comptables'
      }))
    }
  }

  useEffect(() => {
    fetchComptables()
  }, [])

  return {
    ...state,
    refetch: fetchComptables
  }
}









































