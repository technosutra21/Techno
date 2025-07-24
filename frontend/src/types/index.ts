export interface ChapterData {
  id: number
  title: string
  description: string
  longDescription: string
  location: {
    lat: number
    lng: number
  }
  modelUrl: string
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista'
  category: 'Posição' | 'Técnica' | 'Filosofia' | 'Arte'
  tags: string[]
  isUnlocked: boolean
  completedAt?: Date
}

export interface JourneyProgress {
  chapterNumber: number
  visitedAt: Date
  timeSpent: number // em segundos
  location?: {
    lat: number
    lng: number
    accuracy: number
  }
}

export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: Date
}

export interface RoutePoint {
  lat: number
  lng: number
  chapterNumber: number
  title?: string
  description?: string
}

export interface AppState {
  // Journey State
  currentRoute: 'original' | 'custom'
  currentChapter: number
  journeyProgress: JourneyProgress[]
  
  // Location State
  userLocation: UserLocation | null
  locationPermission: 'granted' | 'denied' | 'prompt'
  
  // Route State
  originalRoute: RoutePoint[]
  customRoute: RoutePoint[]
  
  // App State
  isOffline: boolean
  lastSyncAt: Date | null
  
  // Performance State
  preloadedChapters: Set<number>
  
  // UI State
  isMapVisible: boolean
  isModelViewerVisible: boolean
  selectedChapter: ChapterData | null
}

export interface LocationError {
  code: number
  message: string
}

export type LocationPermission = 'granted' | 'denied' | 'prompt'
export type RouteType = 'original' | 'custom'
export type ViewMode = 'map' | 'model' | 'gallery'