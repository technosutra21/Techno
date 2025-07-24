import { UserLocation, LocationError } from '@/types'

export class LocationService {
  private static watchId: number | null = null
  private static lastKnownPosition: GeolocationPosition | null = null
  private static locationAccuracy: 'high' | 'medium' | 'low' = 'medium'
  private static callbacks: {
    onUpdate: ((position: UserLocation) => void)[]
    onError: ((error: LocationError) => void)[]
  } = {
    onUpdate: [],
    onError: []
  }

  /**
   * Sistema de geolocalização adaptativo:
   * - Ajusta precisão baseado no contexto de uso
   * - Implementa fallback para diferentes níveis de precisão
   * - Otimiza consumo de bateria
   */
  static async startLocationTracking(): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocalização não suportada neste dispositivo')
    }

    const options: PositionOptions = {
      enableHighAccuracy: this.locationAccuracy === 'high',
      timeout: this.locationAccuracy === 'high' ? 15000 : 10000,
      maximumAge: this.locationAccuracy === 'high' ? 10000 : 30000
    }

    try {
      // Primeira localização imediata
      const position = await this.getCurrentPosition(options)
      this.lastKnownPosition = position
      const userLocation = this.formatPosition(position)
      this.notifyLocationUpdate(userLocation)

      // Inicia tracking contínuo
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.lastKnownPosition = position
          const userLocation = this.formatPosition(position)
          this.notifyLocationUpdate(userLocation)
        },
        (error) => {
          console.warn('Location error:', error)
          this.handleLocationError(error)
        },
        options
      )

    } catch (error) {
      this.handleLocationError(error as GeolocationPositionError)
    }
  }

  private static getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  private static formatPosition(position: GeolocationPosition): UserLocation {
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp)
    }
  }

  private static handleLocationError(error: GeolocationPositionError): void {
    const locationError: LocationError = {
      code: error.code,
      message: this.getErrorMessage(error.code)
    }

    // Implementa fallback progressivo de precisão
    if (this.locationAccuracy === 'high' && error.code === error.TIMEOUT) {
      this.locationAccuracy = 'medium'
      console.log('Reduzindo precisão para medium devido a timeout')
      // Tenta novamente com precisão menor
      setTimeout(() => this.startLocationTracking(), 1000)
      return
    }
    
    if (this.locationAccuracy === 'medium' && error.code === error.TIMEOUT) {
      this.locationAccuracy = 'low'
      console.log('Reduzindo precisão para low devido a timeout')
      setTimeout(() => this.startLocationTracking(), 1000)
      return
    }

    // Se ainda falhar, notifica erro
    this.notifyLocationError(locationError)
  }

  private static getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Acesso à localização foi negado. Por favor, permita o acesso para uma melhor experiência.'
      case 2:
        return 'Localização não disponível. Verifique sua conexão e tente novamente.'
      case 3:
        return 'Timeout ao obter localização. Tentando com menor precisão...'
      default:
        return 'Erro desconhecido ao acessar localização.'
    }
  }

  static stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  /**
   * Registra callback para atualizações de localização
   */
  static onLocationUpdate(callback: (position: UserLocation) => void): void {
    this.callbacks.onUpdate.push(callback)
  }

  /**
   * Registra callback para erros de localização
   */
  static onLocationError(callback: (error: LocationError) => void): void {
    this.callbacks.onError.push(callback)
  }

  /**
   * Remove callback de localização
   */
  static removeLocationCallback(callback: (position: UserLocation) => void): void {
    const index = this.callbacks.onUpdate.indexOf(callback)
    if (index > -1) {
      this.callbacks.onUpdate.splice(index, 1)
    }
  }

  /**
   * Remove callback de erro
   */
  static removeErrorCallback(callback: (error: LocationError) => void): void {
    const index = this.callbacks.onError.indexOf(callback)
    if (index > -1) {
      this.callbacks.onError.splice(index, 1)
    }
  }

  private static notifyLocationUpdate(location: UserLocation): void {
    this.callbacks.onUpdate.forEach(callback => {
      try {
        callback(location)
      } catch (error) {
        console.error('Error in location update callback:', error)
      }
    })
  }

  private static notifyLocationError(error: LocationError): void {
    this.callbacks.onError.forEach(callback => {
      try {
        callback(error)
      } catch (error) {
        console.error('Error in location error callback:', error)
      }
    })
  }

  /**
   * Calcula distância entre dois pontos em metros
   */
  static calculateDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 6371e3 // raio da Terra em metros
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lng2-lng1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  /**
   * Verifica se o usuário está próximo de um ponto (dentro de radius metros)
   */
  static isNearLocation(
    userLat: number, userLng: number,
    targetLat: number, targetLng: number,
    radius: number = 50
  ): boolean {
    const distance = this.calculateDistance(userLat, userLng, targetLat, targetLng)
    return distance <= radius
  }

  /**
   * Obtém a última posição conhecida
   */
  static getLastKnownPosition(): UserLocation | null {
    if (!this.lastKnownPosition) return null
    
    return this.formatPosition(this.lastKnownPosition)
  }

  /**
   * Define o nível de precisão desejado
   */
  static setAccuracy(accuracy: 'high' | 'medium' | 'low'): void {
    this.locationAccuracy = accuracy
  }

  /**
   * Verifica permissão de localização
   */
  static async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions) {
      return 'prompt' // Fallback para browsers antigos
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state as 'granted' | 'denied' | 'prompt'
    } catch (error) {
      console.warn('Error checking location permission:', error)
      return 'prompt'
    }
  }
}