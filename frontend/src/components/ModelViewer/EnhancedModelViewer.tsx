import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModelService } from '@/services/ModelService'
import { ChapterData } from '@/types'

// Declare model-viewer as a custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

interface EnhancedModelViewerProps {
  chapter: ChapterData
  isVisible: boolean
  onModelLoad?: () => void
  onModelError?: (error: Error) => void
}

export const EnhancedModelViewer: React.FC<EnhancedModelViewerProps> = ({
  chapter,
  isVisible,
  onModelLoad,
  onModelError
}) => {
  const modelViewerRef = useRef<any>(null)
  const [modelUrl, setModelUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>('')
  const [isARSupported, setIsARSupported] = useState(false)

  useEffect(() => {
    if (isVisible) {
      loadModelForChapter()
      checkARSupport()
    }
  }, [chapter.id, isVisible])

  const loadModelForChapter = async (): void => {
    setIsLoading(true)
    setLoadError('')
    
    try {
      const url = await ModelService.loadModel(chapter.id)
      setModelUrl(url)
      onModelLoad?.()
    } catch (error) {
      const errorMessage = `Falha ao carregar modelo do capítulo ${chapter.id}`
      setLoadError(errorMessage)
      onModelError?.(new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  const checkARSupport = async (): void => {
    try {
      if ('xr' in navigator) {
        const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar')
        setIsARSupported(isSupported || false)
      }
    } catch {
      setIsARSupported(false)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-full h-full bg-gradient-to-br from-cyberpunk-dark via-cyberpunk-darker to-cyberpunk-dark rounded-lg overflow-hidden border border-neon-blue/30"
      >
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-cyberpunk-dark/90 z-10 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neon-blue font-mono text-lg">
                LOADING CHAPTER {String(chapter.id).padStart(2, '0')}
              </p>
              <div className="w-48 h-2 bg-cyberpunk-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-pink"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {loadError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-10 backdrop-blur-sm"
          >
            <div className="text-center p-6 cyber-card">
              <div className="text-4xl text-red-400 mb-4">⚠</div>
              <p className="text-red-400 font-mono mb-4 text-lg">ERROR</p>
              <p className="text-sm text-gray-400 mb-6">{loadError}</p>
              <button 
                onClick={loadModelForChapter}
                className="cyber-button border-red-400 text-red-400 hover:bg-red-400 hover:text-cyberpunk-dark"
              >
                RETRY LOADING
              </button>
            </div>
          </motion.div>
        )}

        {/* Model Viewer */}
        {modelUrl && !loadError && (
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            alt={`Personagem do Capítulo ${chapter.id}: ${chapter.title}`}
            auto-rotate
            camera-controls
            ar={isARSupported}
            ar-modes="webxr scene-viewer quick-look"
            environment-image="neutral"
            exposure="1"
            shadow-intensity="1"
            className="w-full h-full"
            style={{
              backgroundColor: 'transparent',
              '--poster-color': 'transparent',
              '--progress-bar-color': '#00d4ff'
            }}
            onLoad={() => {
              setIsLoading(false)
              onModelLoad?.()
            }}
            onError={(error: any) => {
              setLoadError('Erro ao renderizar modelo 3D')
              onModelError?.(error)
            }}
          />
        )}

        {/* Cyberpunk UI Overlay */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-cyberpunk-dark/95 via-cyberpunk-dark/80 to-transparent"
        >
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="text-xs text-neon-blue/70 font-mono mb-1">CHAPTER</div>
              <div className="text-4xl font-bold neon-text font-cyber mb-2">
                {String(chapter.id).padStart(2, '0')}
              </div>
              <h3 className="text-xl text-white font-cyber font-semibold mb-2">
                {chapter.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-3 max-w-md mb-3">
                {chapter.longDescription}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {chapter.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-mono rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 ml-6">
              {isARSupported && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => modelViewerRef.current?.activateAR()}
                  className="cyber-button border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-cyberpunk-dark"
                >
                  VIEW IN AR
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cyber-button"
              >
                DETAILS
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Neon frame effect */}
        <div className="absolute inset-0 pointer-events-none border-2 border-neon-blue/30 rounded-lg">
          <div className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(0,212,255,0.3)] animate-pulse-neon"></div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-neon-blue/50"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-neon-blue/50"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-neon-blue/50"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-neon-blue/50"></div>
      </motion.div>
    </AnimatePresence>
  )
}