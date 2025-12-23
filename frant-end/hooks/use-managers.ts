'use client'

import { useState, useEffect } from 'react'
import { ManagerAPI } from '@/lib/api'
import type { Manager } from '@/lib/type'

interface UseManagersState {
  managers: Manager[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useManagers() {
  const [state, setState] = useState<UseManagersState>({
    managers: [],
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchManagers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await ManagerAPI.all()
      setState(prev => ({
        ...prev,
        managers: response.data || response,
        loading: false
      }))
    } catch (error: any) {
      console.error('Erreur lors de la récupération des managers:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des managers'
      }))
    }
  }

  useEffect(() => {
    fetchManagers()
  }, [])

  return {
    ...state,
    refetch: fetchManagers
  }
}










































