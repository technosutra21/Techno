import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAppStore } from '@/stores/appStore'
import { chaptersData } from '@/data/chapters'
import { ChapterData } from '@/types'

interface CyberMapProps {
  className?: string
  onChapterSelect?: (chapter: ChapterData) => void
}

export const CyberMap: React.FC<CyberMapProps> = ({ 
  className = '', 
  onChapterSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  const { userLocation, currentChapter, setCurrentChapter, originalRoute, customRoute, currentRoute } = useAppStore()
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: createCyberMapStyle(),
      center: [0, 20], // Centered on world
      zoom: 2,
      antialias: true
    })

    map.current.on('load', () => {
      setIsMapLoaded(true)
      addChapterMarkers()
      addRouteVisualization()
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation || !isMapLoaded) return

    // Remove existing user marker
    const existingUserMarker = map.current.getSource('user-location')
    if (existingUserMarker) {
      map.current.removeLayer('user-location-layer')
      map.current.removeSource('user-location')
    }

    // Add user location
    map.current.addSource('user-location', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        }
      }
    })

    map.current.addLayer({
      id: 'user-location-layer',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 12,
        'circle-color': '#ff006e',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.8
      }
    })

    // Add pulsing effect
    map.current.addLayer({
      id: 'user-location-pulse',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5, 20,
          15, 40
        ],
        'circle-color': '#ff006e',
        'circle-opacity': [
          'interpolate',
          ['exponential', 2],
          ['get', 'pulse'],
          0, 0.8,
          1, 0
        ]
      }
    })

  }, [userLocation, isMapLoaded])

  // Update current chapter highlight
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    updateChapterHighlight()
  }, [currentChapter, isMapLoaded])

  const createCyberMapStyle = () => ({
    version: 8,
    sources: {
      'cyber-tiles': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#0a0a0f'
        }
      },
      {
        id: 'cyber-tiles-layer',
        type: 'raster',
        source: 'cyber-tiles',
        paint: {
          'raster-opacity': 0.6,
          'raster-contrast': 0.8,
          'raster-brightness-min': 0.1,
          'raster-brightness-max': 0.3,
          'raster-hue-rotate': 180,
          'raster-saturate': 2
        }
      }
    ]
  })

  const addChapterMarkers = () => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const route = currentRoute === 'original' ? originalRoute : customRoute
    
    route.forEach((point, index) => {
      const chapter = chaptersData.find(c => c.id === point.chapterNumber)
      if (!chapter) return

      // Create custom marker element
      const markerElement = createMarkerElement(chapter, index)
      
      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([point.lng, point.lat])
        .addTo(map.current!)

      // Add click handler
      markerElement.addEventListener('click', () => {
        setCurrentChapter(point.chapterNumber)
        onChapterSelect?.(chapter)
        
        // Fly to marker
        map.current?.flyTo({
          center: [point.lng, point.lat],
          zoom: 8,
          duration: 1000
        })
      })

      markersRef.current.push(marker)
    })
  }

  const createMarkerElement = (chapter: ChapterData, index: number): HTMLElement => {
    const el = document.createElement('div')
    el.className = 'cyber-marker'
    
    const isCurrentChapter = chapter.id === currentChapter
    const isUnlocked = chapter.isUnlocked
    
    el.innerHTML = `
      <div class="relative group cursor-pointer">
        <div class="w-12 h-12 rounded-lg border-2 ${
          isCurrentChapter 
            ? 'border-neon-pink bg-neon-pink/20 shadow-[0_0_20px_rgba(255,0,110,0.5)]' 
            : isUnlocked 
              ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
              : 'border-gray-500 bg-gray-800/50'
        } flex items-center justify-center transition-all duration-300 hover:scale-110">
          <span class="text-sm font-mono font-bold ${
            isCurrentChapter ? 'text-neon-pink' : isUnlocked ? 'text-neon-blue' : 'text-gray-400'
          }">
            ${String(chapter.id).padStart(2, '0')}
          </span>
        </div>
        
        <!-- Pulse effect for current chapter -->
        ${isCurrentChapter ? `
          <div class="absolute inset-0 rounded-lg border-2 border-neon-pink animate-ping opacity-75"></div>
        ` : ''}
        
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-cyberpunk-dark border border-neon-blue/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <div class="text-sm font-cyber text-white">${chapter.title}</div>
          <div class="text-xs text-neon-blue/70">${chapter.difficulty} • ${chapter.category}</div>
        </div>
      </div>
    `
    
    return el
  }

  const addRouteVisualization = () => {
    if (!map.current) return

    const route = currentRoute === 'original' ? originalRoute : customRoute
    
    if (route.length < 2) return

    const coordinates = route.map(point => [point.lng, point.lat])

    // Remove existing route if any
    if (map.current.getSource('route')) {
      map.current.removeLayer('route-line')
      map.current.removeSource('route')
    }

    // Add route line
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    })

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#00d4ff',
        'line-width': 3,
        'line-opacity': 0.8,
        'line-dasharray': [2, 2]
      }
    })

    // Add animated line effect
    map.current.addLayer({
      id: 'route-line-glow',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#00d4ff',
        'line-width': 6,
        'line-opacity': 0.3,
        'line-blur': 2
      }
    })
  }

  const updateChapterHighlight = () => {
    // Re-render markers to update highlighting
    addChapterMarkers()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-lg overflow-hidden border border-neon-blue/30 ${className}`}
    >
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-cyberpunk-dark/90 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neon-blue font-mono">INITIALIZING CYBER MAP...</p>
          </div>
        </div>
      )}

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (userLocation && map.current) {
              map.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 12,
                duration: 1000
              })
            }
          }}
          className="p-2 bg-cyberpunk-darker/80 border border-neon-blue/50 rounded-lg text-neon-blue hover:bg-neon-blue hover:text-cyberpunk-dark transition-colors backdrop-blur-sm"
          disabled={!userLocation}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [0, 20],
                zoom: 2,
                duration: 1000
              })
            }
          }}
          className="p-2 bg-cyberpunk-darker/80 border border-neon-blue/50 rounded-lg text-neon-blue hover:bg-neon-blue hover:text-cyberpunk-dark transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-cyberpunk-darker/80 border border-neon-blue/50 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs text-neon-blue/70 font-mono mb-2">LEGEND</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded border border-neon-pink bg-neon-pink/20"></div>
            <span className="text-xs text-white">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded border border-neon-blue bg-neon-blue/20"></div>
            <span className="text-xs text-white">Unlocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded border border-gray-500 bg-gray-800/50"></div>
            <span className="text-xs text-white">Locked</span>
          </div>
        </div>
      </div>

      {/* Neon border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-neon-blue/30 shadow-[0_0_20px_rgba(0,212,255,0.2)] pointer-events-none"></div>
    </motion.div>
  )
}