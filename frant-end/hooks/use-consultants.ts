'use client'

import { useState, useEffect } from 'react'
import { ConsultantAPI } from '@/lib/api'
import type { Consultant } from '@/lib/type'

interface UseConsultantsState {
  consultants: Consultant[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useConsultants() {
  const [state, setState] = useState<UseConsultantsState>({
    consultants: [],
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchConsultants = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await ConsultantAPI.all()
      setState(prev => ({
        ...prev,
        consultants: response, // response est directement un tableau
        loading: false
      }))
    } catch (error: any) {
      console.error('Erreur lors de la récupération des consultants:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des consultants'
      }))
    }
  }

  useEffect(() => {
    fetchConsultants()
  }, [])

  return {
    ...state,
    refetch: fetchConsultants
  }
}













