import React from 'react'

export const API_BASE_URL = 'https://falnote-production.up.railway.app'
export const WS_BASE_URL = 'wss://falnote-production.up.railway.app'

export interface PageData {
  id: number
  main_title: string
  main_subtitle: string
  content: Record<string, string>
  background_image?: string
  partner_logo?: string
  created_at: string
  updated_at: string
  modified_by: string
}

export interface ProjectCard {
  id: number
  title: string
  description: string
  order: number
  image?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  name: string
  date_time: string
  location: string
  event_type: string
  created_at: string
  updated_at: string
}
