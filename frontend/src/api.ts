import axios from 'axios'
import { API_BASE_URL } from './types'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const pageDataApi = {
  get: () => api.get('/api/page-data'),
  update: (data: any) => api.put('/api/page-data', data),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/page-data/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadPartnerLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/page-data/partner-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const projectCardsApi = {
  getAll: () => api.get('/api/project-cards'),
  create: (data: any) => api.post('/api/project-cards', data),
  update: (id: number, data: any) => api.put(`/api/project-cards/${id}`, data),
  delete: (id: number) => api.delete(`/api/project-cards/${id}`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/project-cards/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const eventsApi = {
  getAll: (type?: string) => api.get('/api/events', { params: { event_type: type } }),
  create: (data: any) => api.post('/api/events', data),
  update: (id: number, data: any) => api.put(`/api/events/${id}`, data),
  delete: (id: number) => api.delete(`/api/events/${id}`),
}

export const statusApi = {
  get: () => api.get('/api/status'),
}

export default api
