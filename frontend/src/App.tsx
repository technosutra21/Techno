import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CyberInterface } from '@/components/Layout/CyberInterface'
import { EnhancedModelViewer } from '@/components/ModelViewer/EnhancedModelViewer'
import { CyberMap } from '@/components/Map/CyberMap'
import { useAppStore } from '@/stores/appStore'
import { ChapterData, ViewMode } from '@/types'

interface ViewControlsProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const ViewControls: React.FC<ViewControlsProps> = ({ currentView, onViewChange }) => {
  const controls = [
    { id: 'map' as ViewMode, label: 'MAP VIEW', icon: '🗺️' },
    { id: 'model' as ViewMode, label: '3D MODEL', icon: '🎭' },
    { id: 'gallery' as ViewMode, label: 'GALLERY', icon: '📱' }
  ]

  return (
    <div className="flex space-x-2">
      {controls.map((control) => (
        <motion.button
          key={control.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange(control.id)}
          className={`px-4 py-2 font-mono text-sm border rounded-lg transition-all ${
            currentView === control.id
              ? 'border-neon-pink text-neon-pink bg-neon-pink/10'
              : 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-cyberpunk-dark'
          }`}
        >
          <span className="mr-2">{control.icon}</span>
          {control.label}
        </motion.button>
      ))}
    </div>
  )
}

interface PermissionRequestProps {
  onPermissionGranted: (granted: boolean) => void
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ onPermissionGranted }) => {
  const [isRequesting, setIsRequesting] = useState(false)

  const requestPermission = async () => {
    setIsRequesting(true)
    
    try {
      if (!navigator.geolocation) {
        onPermissionGranted(false)
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      if (position) {
        onPermissionGranted(true)
      }
    } catch (error) {
      console.warn('Geolocation permission denied:', error)
      onPermissionGranted(false)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-cyberpunk-dark/95 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div className="max-w-md p-8 cyber-card text-center">
        <div className="text-6xl mb-6">📍</div>
        <h2 className="text-2xl font-cyber text-neon-blue mb-4">
          LOCATION ACCESS REQUIRED
        </h2>
        <p className="text-gray-300 mb-6">
          Techno Sutra utiliza sua localização para criar uma experiência imersiva 
          personalizada. Seus dados de localização são processados apenas localmente 
          e nunca compartilhados.
        </p>
        
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={requestPermission}
            disabled={isRequesting}
            className="cyber-button w-full"
          >
            {isRequesting ? (
              <>
                <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                REQUESTING ACCESS...
              </>
            ) : (
              'GRANT LOCATION ACCESS'
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPermissionGranted(false)}
            className="w-full px-6 py-3 border border-gray-500 text-gray-400 font-mono text-sm hover:border-gray-400 hover:text-white transition-colors"
          >
            CONTINUE WITHOUT LOCATION
          </motion.button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Você pode alterar essa configuração a qualquer momento nas configurações do seu navegador.
        </p>
      </div>
    </motion.div>
  )
}

function App() {
  const {
    selectedChapter,
    locationPermission,
    setLocationPermission,
    initializeApp
  } = useAppStore()

  const [currentView, setCurrentView] = useState<ViewMode>('gallery')
  const [isInitialized, setIsInitialized] = useState(false)
  const [showPermissionRequest, setShowPermissionRequest] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp()
        setIsInitialized(true)
        
        // Show permission request if needed
        if (locationPermission === 'prompt') {
          setShowPermissionRequest(true)
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsInitialized(true) // Continue anyway
      }
    }

    initialize()
  }, [initializeApp, locationPermission])

  const handlePermissionResponse = (granted: boolean) => {
    setLocationPermission(granted ? 'granted' : 'denied')
    setShowPermissionRequest(false)
  }

  const handleChapterSelect = (chapter: ChapterData) => {
    console.log('Selected chapter:', chapter)
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-cyber-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono text-lg">INITIALIZING TECHNO SUTRA...</p>
        </div>
      </div>
    )
  }

  return (
    <CyberInterface>
      {/* Permission Request Modal */}
      <AnimatePresence>
        {showPermissionRequest && (
          <PermissionRequest onPermissionGranted={handlePermissionResponse} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="min-h-screen pt-20 pb-32">
        <div className="max-w-7xl mx-auto p-6">
          {/* View Controls */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <ViewControls 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {currentView === 'map' && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="w-full h-[70vh]"
              >
                <CyberMap 
                  className="w-full h-full"
                  onChapterSelect={handleChapterSelect}
                />
              </motion.div>
            )}

            {currentView === 'model' && selectedChapter && (
              <motion.div
                key="model-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="w-full h-[70vh]"
              >
                <EnhancedModelViewer
                  chapter={selectedChapter}
                  isVisible={true}
                  onModelLoad={() => console.log('Model loaded')}
                  onModelError={(error) => console.error('Model error:', error)}
                />
              </motion.div>
            )}

            {currentView === 'gallery' && (
              <motion.div
                key="gallery-view"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]"
              >
                {/* Map Panel */}
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-cyberpunk-darker/80 border border-neon-blue/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <span className="text-xs font-mono text-neon-blue">WORLD MAP</span>
                    </div>
                  </div>
                  <CyberMap 
                    className="w-full h-full"
                    onChapterSelect={handleChapterSelect}
                  />
                </div>

                {/* Model Panel */}
                <div className="relative">
                  {selectedChapter ? (
                    <>
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-cyberpunk-darker/80 border border-neon-blue/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                          <span className="text-xs font-mono text-neon-blue">3D MODEL</span>
                        </div>
                      </div>
                      <EnhancedModelViewer
                        chapter={selectedChapter}
                        isVisible={true}
                        onModelLoad={() => console.log('Model loaded')}
                        onModelError={(error) => console.error('Model error:', error)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full cyber-card flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎭</div>
                        <p className="text-neon-blue font-mono">SELECT A CHAPTER</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Click on a chapter marker in the map to view its 3D model
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="cyber-card text-center">
              <div className="text-2xl font-cyber neon-text">56</div>
              <div className="text-xs text-gray-400 font-mono">CHAPTERS</div>
            </div>
            <div className="cyber-card text-center">
              <div className="text-2xl font-cyber text-neon-green">01</div>
              <div className="text-xs text-gray-400 font-mono">UNLOCKED</div>
            </div>
            <div className="cyber-card text-center">
              <div className="text-2xl font-cyber text-neon-yellow">3D</div>
              <div className="text-xs text-gray-400 font-mono">MODELS</div>
            </div>
            <div className="cyber-card text-center">
              <div className="text-2xl font-cyber text-neon-purple">AR</div>
              <div className="text-xs text-gray-400 font-mono">READY</div>
            </div>
          </motion.div>
        </div>
      </div>
    </CyberInterface>
  )
}

export default App