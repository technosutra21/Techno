import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { useAppStore } from '@/stores/appStore'
import { chaptersData } from '@/data/chapters'
import { ChapterData } from '@/types'

// Configure MapTiler API
maptilersdk.config.apiKey = 'rg7OAqXjLo7cLdwqlrVt'

interface CyberMapProps {
  className?: string
  onChapterSelect?: (chapter: ChapterData) => void
}

export const CyberMap: React.FC<CyberMapProps> = ({ 
  className = '', 
  onChapterSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const markersRef = useRef<maptilersdk.Marker[]>([])
  
  const { userLocation, currentChapter, setCurrentChapter, originalRoute, customRoute, currentRoute } = useAppStore()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize MapTiler map with cyberpunk style
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: createCyberpunkStyle(),
      center: [0, 20],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      antialias: true,
      pitch: 0,
      bearing: 0
    })

    // Add map event listeners
    map.current.on('load', () => {
      setIsMapLoaded(true)
      addCyberpunkLayers()
      addChapterMarkers()
      addRouteVisualization()
    })

    map.current.on('movestart', () => setIsInteracting(true))
    map.current.on('moveend', () => setIsInteracting(false))

    // Add custom controls
    addCyberpunkControls()

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation || !isMapLoaded) return
    updateUserLocationMarker()
  }, [userLocation, isMapLoaded])

  // Update current chapter highlight
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    updateChapterHighlight()
  }, [currentChapter, isMapLoaded])

  const createCyberpunkStyle = () => ({
    version: 8,
    name: 'Cyberpunk Dark',
    sources: {
      'maptiler-raster': {
        type: 'raster',
        tiles: ['https://api.maptiler.com/maps/aquarelle/256/{z}/{x}/{y}@2x.png?key=rg7OAqXjLo7cLdwqlrVt'],
        tileSize: 256,
        attribution: '© MapTiler © OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#000000'
        }
      },
      {
        id: 'aquarelle-base',
        type: 'raster',
        source: 'maptiler-raster',
        paint: {
          'raster-opacity': 0.3,
          'raster-contrast': 0.8,
          'raster-brightness-min': 0.0,
          'raster-brightness-max': 0.2,
          'raster-hue-rotate': 200,
          'raster-saturate': 2.5
        }
      },
      {
        id: 'cyber-grid-overlay',
        type: 'background',
        paint: {
          'background-color': 'rgba(0, 255, 255, 0.02)',
          'background-pattern': 'grid'
        }
      }
    ]
  })

  const addCyberpunkLayers = () => {
    if (!map.current) return

    // Add animated scan lines effect
    map.current.addSource('scan-lines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // Add pulsing points for major cities
    map.current.addSource('cyber-nodes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: { type: 'Point', coordinates: [139.6917, 35.6895] }, properties: { name: 'Neo-Tokyo' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] }, properties: { name: 'New Manhattan' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }, properties: { name: 'Neo-Paris' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.1278, 51.5074] }, properties: { name: 'Cyber London' } }
        ]
      }
    })

    map.current.addLayer({
      id: 'cyber-nodes-glow',
      type: 'circle',
      source: 'cyber-nodes',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 8,
          10, 20
        ],
        'circle-color': '#00ffff',
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['get', 'pulse'],
          0, 0.8,
          1, 0.2
        ],
        'circle-blur': 2
      }
    })
  }

  const addChapterMarkers = () => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const route = currentRoute === 'original' ? originalRoute : customRoute
    
    route.forEach((point, index) => {
      const chapter = chaptersData.find(c => c.id === point.chapterNumber)
      if (!chapter) return

      // Create custom cyberpunk marker
      const markerElement = createCyberpunkMarker(chapter, index)
      
      const marker = new maptilersdk.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([point.lng, point.lat])
        .addTo(map.current!)

      // Add click handler with cyberpunk effects
      markerElement.addEventListener('click', () => {
        triggerCyberEffect(point.lng, point.lat)
        setCurrentChapter(point.chapterNumber)
        onChapterSelect?.(chapter)
        
        // Smooth cyber fly-to
        map.current?.flyTo({
          center: [point.lng, point.lat],
          zoom: 8,
          duration: 2000,
          curve: 1.42,
          pitch: 45,
          bearing: 0
        })
      })

      markersRef.current.push(marker)
    })
  }

  const createCyberpunkMarker = (chapter: ChapterData, index: number): HTMLElement => {
    const el = document.createElement('div')
    el.className = 'cyber-marker-container'
    
    const isCurrentChapter = chapter.id === currentChapter
    const isUnlocked = chapter.isUnlocked
    
    el.innerHTML = `
      <div class="cyber-marker group cursor-pointer relative transform transition-all duration-300 hover:scale-110">
        <!-- Main marker body -->
        <div class="relative">
          <!-- Outer glow ring -->
          <div class="absolute inset-0 w-16 h-16 rounded-full border-2 ${
            isCurrentChapter 
              ? 'border-pink-400 shadow-[0_0_30px_rgba(244,114,182,0.8)]' 
              : isUnlocked 
                ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                : 'border-gray-600 shadow-[0_0_5px_rgba(107,114,128,0.3)]'
          } animate-pulse"></div>
          
          <!-- Inner marker -->
          <div class="relative w-16 h-16 rounded-full border-2 ${
            isCurrentChapter 
              ? 'border-pink-400 bg-gradient-to-br from-pink-500/30 to-purple-600/30' 
              : isUnlocked 
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/30 to-blue-600/30'
                : 'border-gray-600 bg-gradient-to-br from-gray-700/30 to-gray-900/30'
          } flex items-center justify-center backdrop-blur-sm">
            <!-- Chapter number -->
            <div class="text-lg font-mono font-bold ${
              isCurrentChapter ? 'text-pink-300' : isUnlocked ? 'text-cyan-300' : 'text-gray-400'
            }">
              ${String(chapter.id).padStart(2, '0')}
            </div>
          </div>
          
          <!-- Scanning line effect for current chapter -->
          ${isCurrentChapter ? `
            <div class="absolute inset-0 w-16 h-16 rounded-full border-2 border-pink-400 animate-ping opacity-75"></div>
            <div class="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
          ` : ''}
          
          <!-- Data streams -->
          <div class="absolute -top-2 -right-2 w-4 h-4 ${
            isUnlocked ? 'bg-green-400' : 'bg-red-400'
          } rounded-full opacity-80 animate-pulse"></div>
        </div>
        
        <!-- Holographic info panel -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div class="bg-black/90 border border-cyan-400/50 rounded-lg p-3 min-w-48 backdrop-blur-md">
            <div class="text-cyan-300 font-mono text-sm font-bold mb-1">${chapter.title}</div>
            <div class="text-gray-300 text-xs mb-2">${chapter.description}</div>
            <div class="flex space-x-2">
              <span class="px-2 py-1 text-xs font-mono rounded ${
                chapter.difficulty === 'Iniciante' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                chapter.difficulty === 'Intermediário' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                chapter.difficulty === 'Avançado' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }">
                ${chapter.difficulty}
              </span>
              <span class="px-2 py-1 text-xs font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ${chapter.category}
              </span>
            </div>
          </div>
          <!-- Arrow pointer -->
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-400/50"></div>
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

    // Add main route line source
    map.current.addSource('cyber-route', {
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

    // Add multiple layers for cyberpunk route effect
    
    // Base glow layer
    map.current.addLayer({
      id: 'route-glow-outer',
      type: 'line',
      source: 'cyber-route',
      paint: {
        'line-color': '#00ffff',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 12,
          10, 25
        ],
        'line-opacity': 0.3,
        'line-blur': 8
      }
    })

    // Middle glow layer
    map.current.addLayer({
      id: 'route-glow-middle',
      type: 'line',
      source: 'cyber-route',
      paint: {
        'line-color': '#00d4ff',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 8,
          10, 18
        ],
        'line-opacity': 0.6,
        'line-blur': 4
      }
    })

    // Core line
    map.current.addLayer({
      id: 'route-core',
      type: 'line',
      source: 'cyber-route',
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 3,
          10, 8
        ],
        'line-opacity': 0.9
      }
    })

    // Animated data flow
    map.current.addLayer({
      id: 'route-flow',
      type: 'line',
      source: 'cyber-route',
      paint: {
        'line-color': '#ff00ff',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 2,
          10, 5
        ],
        'line-opacity': 0.8,
        'line-dasharray': [0.5, 1.5]
      }
    })
  }

  const triggerCyberEffect = (lng: number, lat: number) => {
    // Add temporary cyber explosion effect
    const effectElement = document.createElement('div')
    effectElement.className = 'cyber-explosion'
    effectElement.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border: 2px solid #00ffff;
      border-radius: 50%;
      pointer-events: none;
      animation: cyberExplosion 1s ease-out forwards;
      z-index: 1000;
    `
    
    const point = map.current?.project([lng, lat])
    if (point) {
      effectElement.style.left = `${point.x - 50}px`
      effectElement.style.top = `${point.y - 50}px`
      mapContainer.current?.appendChild(effectElement)
      
      setTimeout(() => effectElement.remove(), 1000)
    }
  }

  const addCyberpunkControls = () => {
    if (!map.current) return

    // Add custom navigation control with cyberpunk styling
    const nav = new maptilersdk.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    })
    
    map.current.addControl(nav, 'top-right')
  }

  const updateUserLocationMarker = () => {
    if (!map.current || !userLocation) return

    // Remove existing user location
    if (map.current.getSource('user-location')) {
      map.current.removeLayer('user-location-pulse')
      map.current.removeLayer('user-location-core')
      map.current.removeSource('user-location')
    }

    // Add user location source
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
          5, 30,
          15, 60
        ],
        'circle-color': '#ff006e',
        'circle-opacity': 0.3,
        'circle-stroke-color': '#ff006e',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': 0.8
      }
    })

    // Add core marker
    map.current.addLayer({
      id: 'user-location-core',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 8,
        'circle-color': '#ff006e',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 1
      }
    })
  }

  const updateChapterHighlight = () => {
    addChapterMarkers() // Re-render markers to update highlighting
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`relative rounded-xl overflow-hidden border-2 border-cyan-400/40 shadow-[0_0_50px_rgba(0,255,255,0.3)] ${className}`}
    >
      {/* Map container with cyberpunk frame */}
      <div 
        ref={mapContainer} 
        className="w-full h-full relative"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #000000 100%)'
        }}
      />
      
      {/* Loading overlay with advanced animation */}
      {!isMapLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/95 flex items-center justify-center backdrop-blur-sm"
        >
          <div className="text-center">
            {/* Advanced loading animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            
            <div className="space-y-2">
              <p className="text-cyan-400 font-mono text-xl font-bold">INITIALIZING CYBER MAP</p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-cyan-400/70 font-mono text-sm">Loading 56 chapter nodes...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cyberpunk HUD overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* Map info panel */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/80 border border-cyan-400/50 rounded-lg p-3 backdrop-blur-md pointer-events-auto"
        >
          <div className="text-xs text-cyan-400/70 font-mono mb-1">NEURAL MAP</div>
          <div className="text-sm font-mono text-cyan-300 font-bold">TECHNO SUTRA GRID</div>
          <div className="text-xs text-gray-400 mt-1">56 NODES ACTIVE</div>
        </motion.div>

        {/* Status indicators */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col space-y-2"
        >
          <div className="bg-black/80 border border-green-400/50 rounded-lg p-2 backdrop-blur-md pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-green-300">GRID ACTIVE</span>
            </div>
          </div>
          
          {isInteracting && (
            <div className="bg-black/80 border border-yellow-400/50 rounded-lg p-2 backdrop-blur-md pointer-events-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-yellow-300">NAVIGATING</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (userLocation && map.current) {
              map.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 12,
                duration: 1500,
                pitch: 45
              })
            }
          }}
          className="p-3 bg-black/80 border border-cyan-400/50 rounded-lg text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all backdrop-blur-md"
          disabled={!userLocation}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [0, 20],
                zoom: 2,
                duration: 2000,
                pitch: 0,
                bearing: 0
              })
            }
          }}
          className="p-3 bg-black/80 border border-pink-400/50 rounded-lg text-pink-400 hover:bg-pink-400 hover:text-black transition-all backdrop-blur-md"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>

      {/* Legend with cyberpunk styling */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 right-4 bg-black/80 border border-cyan-400/50 rounded-lg p-4 backdrop-blur-md"
      >
        <div className="text-xs text-cyan-400/70 font-mono mb-3 text-center">NODE LEGEND</div>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full border-2 border-pink-400 bg-pink-500/30 shadow-[0_0_10px_rgba(244,114,182,0.5)]"></div>
            <span className="text-xs text-pink-300 font-mono">CURRENT</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <span className="text-xs text-cyan-300 font-mono">UNLOCKED</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full border-2 border-gray-600 bg-gray-800/50"></div>
            <span className="text-xs text-gray-400 font-mono">LOCKED</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(244,114,182,0.8)]"></div>
            <span className="text-xs text-pink-300 font-mono">USER</span>
          </div>
        </div>
      </motion.div>

      {/* Cyberpunk border effects */}
      <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/40 shadow-[inset_0_0_50px_rgba(0,255,255,0.1)] pointer-events-none">
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-cyan-400/60"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-cyan-400/60"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-cyan-400/60"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-cyan-400/60"></div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        .cyber-marker-container {
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
        }
        
        @keyframes cyberExplosion {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .maplibregl-ctrl-group, .maptiler-ctrl-group {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(0, 255, 255, 0.5) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .maplibregl-ctrl-group button, .maptiler-ctrl-group button {
          background: transparent !important;
          color: #00ffff !important;
          border: none !important;
          transition: all 0.3s !important;
        }
        
        .maplibregl-ctrl-group button:hover, .maptiler-ctrl-group button:hover {
          background: rgba(0, 255, 255, 0.2) !important;
          color: #ffffff !important;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
        }
      `}</style>
    </motion.div>
  )
}