'use client'

import { useState, useEffect } from 'react'
import { RhAPI } from '@/lib/api'
import type { Rh } from '@/lib/type'

interface UseRhState {
  rhList: Rh[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRh() {
  const [state, setState] = useState<UseRhState>({
    rhList: [],
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchRh = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await RhAPI.all()
      setState(prev => ({
        ...prev,
        rhList: response.data || response,
        loading: false
      }))
    } catch (error: any) {
      console.error('Erreur lors de la récupération des RH:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des RH'
      }))
    }
  }

  useEffect(() => {
    fetchRh()
  }, [])

  return {
    ...state,
    refetch: fetchRh
  }
}














































