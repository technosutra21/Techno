import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { AppState, JourneyProgress, UserLocation, RoutePoint, ChapterData, LocationPermission, RouteType, ViewMode } from '@/types'
import { LocationService } from '@/services/LocationService'
import { chaptersData, originalRoute, generateCustomRoute } from '@/data/chapters'

interface AppStore extends AppState {
  // Actions
  setCurrentChapter: (chapter: number) => void
  addProgressEntry: (progress: JourneyProgress) => void
  updateUserLocation: (location: UserLocation | null) => void
  setLocationPermission: (permission: LocationPermission) => void
  setCurrentRoute: (route: RouteType) => void
  setViewMode: (mode: ViewMode) => void
  createCustomRoute: (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => void
  syncProgress: () => Promise<void>
  unlockChapter: (chapterId: number) => void
  setSelectedChapter: (chapter: ChapterData | null) => void
  toggleMapVisibility: () => void
  toggleModelViewerVisibility: () => void
  initializeApp: () => Promise<void>
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state with correct Águas da Prata route
        currentRoute: 'original',
        currentChapter: 1,
        journeyProgress: [],
        userLocation: null,
        locationPermission: 'prompt',
        originalRoute: originalRoute, // Rota real de Águas da Prata
        customRoute: [],
        isOffline: !navigator.onLine,
        lastSyncAt: null,
        preloadedChapters: new Set(),
        isMapVisible: true,
        isModelViewerVisible: false,
        selectedChapter: chaptersData[0], // Primeiro capítulo selecionado por padrão
        
        // Actions
        setCurrentChapter: (chapter: number) => {
          const state = get()
          
          // Registra tempo gasto no capítulo anterior
          const lastProgress = state.journeyProgress[state.journeyProgress.length - 1]
          if (lastProgress && lastProgress.chapterNumber !== chapter) {
            const timeSpent = Math.floor(
              (Date.now() - lastProgress.visitedAt.getTime()) / 1000
            )
            
            set(state => ({
              journeyProgress: state.journeyProgress.map(p => 
                p.chapterNumber === lastProgress.chapterNumber 
                  ? { ...p, timeSpent: p.timeSpent + timeSpent }
                  : p
              )
            }))
          }
          
          // Atualiza capítulo atual
          set({ currentChapter: chapter })
          
          // Adiciona nova entrada de progresso
          get().addProgressEntry({
            chapterNumber: chapter,
            visitedAt: new Date(),
            timeSpent: 0,
            location: state.userLocation ? {
              lat: state.userLocation.lat,
              lng: state.userLocation.lng,
              accuracy: state.userLocation.accuracy
            } : undefined
          })

          // Encontra e seleciona o capítulo
          const chapterData = chaptersData.find(c => c.id === chapter)
          if (chapterData) {
            set({ selectedChapter: chapterData })
          }
        },
        
        addProgressEntry: (progress: JourneyProgress) => {
          set(state => ({
            journeyProgress: [
              ...state.journeyProgress.filter(p => p.chapterNumber !== progress.chapterNumber),
              progress
            ]
          }))
        },
        
        updateUserLocation: (location: UserLocation | null) => {
          set({ userLocation: location })
          
          if (!location) return
          
          // Verifica se usuário está próximo de algum ponto da rota
          const state = get()
          const currentRoute = state.currentRoute === 'original' 
            ? state.originalRoute 
            : state.customRoute
            
          const nearbyPoint = currentRoute.find(point => {
            const distance = LocationService.calculateDistance(
              location.lat, location.lng,
              point.lat, point.lng
            )
            return distance < 100 // 100 metros de proximidade
          })
          
          if (nearbyPoint && nearbyPoint.chapterNumber !== state.currentChapter) {
            // Auto-avança para o capítulo quando usuário está próximo
            get().setCurrentChapter(nearbyPoint.chapterNumber)
          }
        },
        
        setLocationPermission: (permission: LocationPermission) => {
          set({ locationPermission: permission })
        },

        setCurrentRoute: (route: RouteType) => {
          set({ currentRoute: route })
        },

        setViewMode: (mode: ViewMode) => {
          set({
            isMapVisible: mode === 'map' || mode === 'gallery',
            isModelViewerVisible: mode === 'model' || mode === 'gallery'
          })
        },
        
        createCustomRoute: (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
          try {
            const customRoute = generateCustomRoute(origin, destination)
            
            set({ 
              customRoute,
              currentRoute: 'custom',
              currentChapter: 1
            })
            
            console.log(`Rota customizada criada: ${origin.lat},${origin.lng} → ${destination.lat},${destination.lng}`)
          } catch (error) {
            console.error('Erro ao gerar rota customizada:', error)
            throw error
          }
        },
        
        syncProgress: async () => {
          const state = get()
          if (state.isOffline) return
          
          try {
            // Implementar sincronização com servidor futuramente
            set({ lastSyncAt: new Date() })
          } catch (error) {
            console.error('Erro ao sincronizar progresso:', error)
          }
        },

        unlockChapter: (chapterId: number) => {
          // Atualiza o chaptersData para desbloquear o capítulo
          const chapter = chaptersData.find(c => c.id === chapterId)
          if (chapter) {
            chapter.isUnlocked = true
            chapter.completedAt = new Date()
          }
        },

        setSelectedChapter: (chapter: ChapterData | null) => {
          set({ selectedChapter: chapter })
        },

        toggleMapVisibility: () => {
          set(state => ({ isMapVisible: !state.isMapVisible }))
        },

        toggleModelViewerVisibility: () => {
          set(state => ({ isModelViewerVisible: !state.isModelViewerVisible }))
        },

        initializeApp: async () => {
          // Inicializa serviços
          try {
            // Verifica permissão de localização
            const permission = await LocationService.checkLocationPermission()
            set({ locationPermission: permission })

            // Configura callbacks de localização
            LocationService.onLocationUpdate((location) => {
              get().updateUserLocation(location)
            })

            LocationService.onLocationError((error) => {
              console.warn('Location service error:', error)
            })

            // Inicia tracking se permitido
            if (permission === 'granted') {
              await LocationService.startLocationTracking()
            }

            // Verifica status offline
            const updateOnlineStatus = () => {
              set({ isOffline: !navigator.onLine })
            }

            window.addEventListener('online', updateOnlineStatus)
            window.addEventListener('offline', updateOnlineStatus)

            // Garante que o primeiro capítulo está selecionado
            const state = get()
            if (!state.selectedChapter) {
              set({ selectedChapter: chaptersData[0] })
            }

            console.log('✅ App inicializado com rota original de Águas da Prata, SP')

          } catch (error) {
            console.error('Erro ao inicializar app:', error)
          }
        }
      }),
      {
        name: 'techno-sutra-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          journeyProgress: state.journeyProgress,
          currentChapter: state.currentChapter,
          currentRoute: state.currentRoute,
          customRoute: state.customRoute,
          lastSyncAt: state.lastSyncAt,
          locationPermission: state.locationPermission
        })
      }
    )
  )
)

// Selectors para performance otimizada
export const useCurrentChapter = () => useAppStore(state => state.currentChapter)
export const useSelectedChapter = () => useAppStore(state => state.selectedChapter)
export const useUserLocation = () => useAppStore(state => state.userLocation)
export const useLocationPermission = () => useAppStore(state => state.locationPermission)
export const useJourneyProgress = () => useAppStore(state => state.journeyProgress)
export const useCurrentRoute = () => useAppStore(state => state.currentRoute)
export const useIsOffline = () => useAppStore(state => state.isOffline)
export const useViewVisibility = () => useAppStore(state => ({
  isMapVisible: state.isMapVisible,
  isModelViewerVisible: state.isModelViewerVisible
}))
export const useOriginalRoute = () => useAppStore(state => state.originalRoute)
export const useCustomRoute = () => useAppStore(state => state.customRoute)