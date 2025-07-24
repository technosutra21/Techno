export class ModelService {
  private static readonly CDN_BASE = 'https://cdn.statically.io/gh/technosutra21/technosutra/master/'
  private static readonly CACHE_NAME = 'techno-sutra-models'
  private static loadedModels = new Map<number, string>()
  private static preloadQueue = new Set<number>()
  private static isPreloading = false

  /**
   * Estratégia de carregamento inteligente:
   * 1. Verifica cache local primeiro
   * 2. Carrega modelo atual com prioridade alta
   * 3. Pré-carrega modelos adjacentes (±2 posições)
   * 4. Implementa fallback para conexões lentas
   */
  static async loadModel(chapterNumber: number): Promise<string> {
    const modelUrl = `${this.CDN_BASE}modelo${chapterNumber}.glb`
    
    // Verifica cache primeiro
    if (this.loadedModels.has(chapterNumber)) {
      return this.loadedModels.get(chapterNumber)!
    }

    try {
      // Carrega modelo com timeout para conexões lentas
      const response = await Promise.race([
        fetch(modelUrl),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading model')), 10000)
        )
      ])

      if (response && response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        this.loadedModels.set(chapterNumber, objectUrl)
        
        // Salva no cache do browser para uso offline
        await this.cacheModel(chapterNumber, blob)
        
        // Inicia pré-carregamento dos modelos adjacentes
        this.preloadAdjacentModels(chapterNumber)
        
        return objectUrl
      }
    } catch (error) {
      console.warn(`Failed to load model ${chapterNumber}:`, error)
      return this.getFallbackModel(chapterNumber)
    }

    return this.getFallbackModel(chapterNumber)
  }

  private static async preloadAdjacentModels(currentChapter: number): Promise<void> {
    if (this.isPreloading) return
    
    this.isPreloading = true
    const adjacentChapters = [
      currentChapter - 2, currentChapter - 1,
      currentChapter + 1, currentChapter + 2
    ].filter(ch => ch >= 1 && ch <= 56 && !this.preloadQueue.has(ch) && !this.loadedModels.has(ch))

    adjacentChapters.forEach(chapter => {
      this.preloadQueue.add(chapter)
      // Carrega com prioridade baixa em background
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.loadModel(chapter))
      } else {
        setTimeout(() => this.loadModel(chapter), 100)
      }
    })
    
    this.isPreloading = false
  }

  private static async cacheModel(chapterNumber: number, blob: Blob): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAME)
      const response = new Response(blob)
      await cache.put(`modelo${chapterNumber}.glb`, response)
    } catch (error) {
      console.warn('Failed to cache model:', error)
    }
  }

  private static getFallbackModel(chapterNumber: number): string {
    // Retorna um modelo básico ou um placeholder
    console.log(`Using fallback model for chapter ${chapterNumber}`)
    
    // Por enquanto, criar um modelo básico em data URL
    // Em produção, você teria modelos de fallback reais
    return this.createBasicModel(chapterNumber)
  }

  private static createBasicModel(chapterNumber: number): string {
    // Cria um placeholder visual enquanto o modelo real não carrega
    // Em uma implementação real, você teria modelos de backup
    return `data:text/plain,Chapter ${chapterNumber} Model Placeholder`
  }

  /**
   * Pré-carrega modelos baseado na rota atual
   */
  static async preloadRoute(chapterNumbers: number[]): Promise<void> {
    const promises = chapterNumbers.slice(0, 5).map(chapter => 
      this.loadModel(chapter).catch(error => 
        console.warn(`Failed to preload chapter ${chapter}:`, error)
      )
    )
    
    await Promise.allSettled(promises)
  }

  /**
   * Limpa cache de modelos para liberar memória
   */
  static clearCache(): void {
    this.loadedModels.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.loadedModels.clear()
    this.preloadQueue.clear()
  }

  /**
   * Verifica se um modelo está carregado
   */
  static isModelLoaded(chapterNumber: number): boolean {
    return this.loadedModels.has(chapterNumber)
  }

  /**
   * Obtém estatísticas de cache
   */
  static getCacheStats() {
    return {
      loadedModels: this.loadedModels.size,
      preloadQueue: this.preloadQueue.size,
      isPreloading: this.isPreloading
    }
  }
}