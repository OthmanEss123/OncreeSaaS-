'use client'

import { useState, useEffect } from 'react'
import { ProjectAPI } from '@/lib/api'
import type { Project } from '@/lib/type'

interface UseProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProjects() {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchProjects = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await ProjectAPI.all()
      setState(prev => ({
        ...prev,
        projects: response, // response est directement un tableau
        loading: false
      }))
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des projets'
      }))
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    ...state,
    refetch: fetchProjects
  }
}













