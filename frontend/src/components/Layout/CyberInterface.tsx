import React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'

interface CyberInterfaceProps {
  children: React.ReactNode
}

export const CyberInterface: React.FC<CyberInterfaceProps> = ({ children }) => {
  const { currentChapter, selectedChapter, isOffline } = useAppStore()

  return (
    <div className="min-h-screen bg-cyber-gradient relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 animate-pulse" />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scan opacity-50" />
      </div>

      {/* Header Interface */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 p-4 border-b border-neon-blue/30 bg-cyberpunk-darker/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 border-2 border-neon-pink rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-blue/20 flex items-center justify-center"
            >
              <span className="text-neon-pink font-cyber text-xl font-bold">TS</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-cyber font-bold neon-text">TECHNO SUTRA</h1>
              <p className="text-xs text-neon-blue/70 font-mono">CYBERPUNK JOURNEY v1.0</p>
            </div>
          </div>

          {/* Status Display */}
          <div className="flex items-center space-x-6">
            {/* Chapter Counter */}
            <div className="text-right">
              <div className="text-xs text-neon-blue/70 font-mono">CHAPTER</div>
              <div className="text-2xl font-cyber font-bold neon-text">
                {String(currentChapter).padStart(2, '0')}/56
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500' : 'bg-neon-green'} animate-pulse`} />
              <span className="text-xs font-mono text-neon-blue/70">
                {isOffline ? 'OFFLINE' : 'CONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Bottom Interface */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-neon-blue/30 bg-cyberpunk-darker/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto">
          {selectedChapter && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 border border-neon-blue/50 rounded-lg bg-gradient-to-br from-cyberpunk-dark to-cyberpunk-darker flex items-center justify-center">
                  <span className="text-neon-blue font-cyber text-lg font-bold">
                    {String(selectedChapter.id).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-cyber text-white">{selectedChapter.title}</h3>
                  <p className="text-sm text-neon-blue/70">{selectedChapter.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-mono rounded ${
                      selectedChapter.difficulty === 'Iniciante' ? 'bg-neon-green/20 text-neon-green' :
                      selectedChapter.difficulty === 'Intermediário' ? 'bg-neon-yellow/20 text-neon-yellow' :
                      selectedChapter.difficulty === 'Avançado' ? 'bg-neon-pink/20 text-neon-pink' :
                      'bg-neon-purple/20 text-neon-purple'
                    }`}>
                      {selectedChapter.difficulty}
                    </span>
                    <span className="px-2 py-1 text-xs font-mono rounded bg-neon-blue/20 text-neon-blue">
                      {selectedChapter.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <NavigationButton direction="prev" />
                <NavigationButton direction="next" />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface NavigationButtonProps {
  direction: 'prev' | 'next'
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ direction }) => {
  const { currentChapter, setCurrentChapter } = useAppStore()

  const handleClick = () => {
    if (direction === 'prev' && currentChapter > 1) {
      setCurrentChapter(currentChapter - 1)
    } else if (direction === 'next' && currentChapter < 56) {
      setCurrentChapter(currentChapter + 1)
    }
  }

  const isDisabled = (direction === 'prev' && currentChapter <= 1) || 
                    (direction === 'next' && currentChapter >= 56)

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.05 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      onClick={handleClick}
      disabled={isDisabled}
      className={`p-3 border rounded-lg font-mono text-sm transition-all ${
        isDisabled 
          ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
          : 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-cyberpunk-dark'
      }`}
    >
      {direction === 'prev' ? '← PREV' : 'NEXT →'}
    </motion.button>
  )
}