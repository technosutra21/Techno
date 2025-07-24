import { ChapterData } from '@/types'

// Coordenadas de Águas da Prata, SP, Brasil
const AGUAS_DA_PRATA_CENTER = { lat: -22.0555, lng: -46.7119 }

// Rota original com 56 pontos em Águas da Prata e região
const createOriginalRoute = (): Array<{lat: number, lng: number, chapterNumber: number, title: string, description: string}> => {
  const basePoints = [
    // Centro de Águas da Prata e pontos históricos/turísticos reais
    { lat: -22.0555, lng: -46.7119, name: "Centro de Águas da Prata" }, // Praça central
    { lat: -22.0520, lng: -46.7150, name: "Fonte Platina" }, // Fonte histórica
    { lat: -22.0580, lng: -46.7090, name: "Igreja Matriz" },
    { lat: -22.0545, lng: -46.7200, name: "Estação Ferroviária" },
    { lat: -22.0510, lng: -46.7180, name: "Balneário Municipal" },
    { lat: -22.0590, lng: -46.7050, name: "Mirante da Serra" },
    { lat: -22.0525, lng: -46.7220, name: "Parque das Águas" },
    { lat: -22.0570, lng: -46.7080, name: "Museu Municipal" },
    { lat: -22.0535, lng: -46.7160, name: "Thermas Water Park" },
    { lat: -22.0560, lng: -46.7130, name: "Hotel Panorama" },
    // Expandindo para região metropolitana e cidades próximas
    { lat: -22.0600, lng: -46.7250, name: "São João da Boa Vista" },
    { lat: -22.0480, lng: -46.6950, name: "Poços de Caldas direction" },
    { lat: -22.0650, lng: -46.7300, name: "Espírito Santo do Pinhal" },
    { lat: -22.0450, lng: -46.6900, name: "Andradas direction" },
    { lat: -22.0680, lng: -46.7350, name: "Casa Branca direction" }
  ]

  // Gerar 56 pontos distribuídos organicamente pela região
  const route = []
  const radiusKm = 25 // 25km de raio da cidade
  
  for (let i = 0; i < 56; i++) {
    let point
    
    if (i < basePoints.length) {
      // Usar pontos reais para os primeiros capítulos
      point = basePoints[i]
    } else {
      // Distribuir demais pontos em espiral/círculo pela região
      const angle = (i * 2 * Math.PI) / 56 + (Math.random() * 0.5 - 0.25)
      const distance = (Math.random() * radiusKm) + 2 // 2-27km do centro
      const distanceInDegrees = distance / 111 // aproximadamente 111km por grau
      
      point = {
        lat: AGUAS_DA_PRATA_CENTER.lat + Math.cos(angle) * distanceInDegrees,
        lng: AGUAS_DA_PRATA_CENTER.lng + Math.sin(angle) * distanceInDegrees,
        name: `Ponto da Jornada ${i + 1}`
      }
    }
    
    const chapter = chaptersData[i] || chaptersData[0]
    
    route.push({
      lat: point.lat,
      lng: point.lng,
      chapterNumber: i + 1,
      title: chapter.title,
      description: chapter.description
    })
  }
  
  return route
}

// Coordenadas baseadas em capítulos do Kama Sutra com localização em Águas da Prata
export const chaptersData: ChapterData[] = [
  {
    id: 1,
    title: "O Despertar dos Sentidos",
    description: "A introdução à arte do amor no coração de Águas da Prata",
    longDescription: "O primeiro capítulo explora os fundamentos da conexão íntima na cidade das águas termais, onde corpo e alma se encontram em harmonia.",
    location: { lat: -22.0555, lng: -46.7119 }, // Centro de Águas da Prata
    modelUrl: "https://cdn.glitch.me/models/chapter1.glb",
    difficulty: "Iniciante",
    category: "Filosofia",
    tags: ["fundamentos", "conexão", "águas termais"],
    isUnlocked: true
  },
  {
    id: 2,
    title: "A Fonte da Paixão",
    description: "Descobrindo a fonte interior do desejo",
    longDescription: "Como as águas termais de Águas da Prata curam o corpo, a paixão verdadeira cura a alma e desperta os sentidos.",
    location: { lat: -22.0520, lng: -46.7150 }, // Fonte Platina
    modelUrl: "https://cdn.glitch.me/models/chapter2.glb",
    difficulty: "Iniciante",
    category: "Técnica",
    tags: ["paixão", "despertar", "fonte"],
    isUnlocked: false
  },
  {
    id: 3,
    title: "Comunhão Sagrada",
    description: "A união espiritual dos corpos",
    longDescription: "Na Igreja Matriz de Águas da Prata, aprendemos que o amor verdadeiro é uma forma de comunhão sagrada.",
    location: { lat: -22.0580, lng: -46.7090 }, // Igreja Matriz
    modelUrl: "https://cdn.glitch.me/models/chapter3.glb",
    difficulty: "Intermediário",
    category: "Arte",
    tags: ["sagrado", "união", "espírito"],
    isUnlocked: false
  },
  {
    id: 4,
    title: "A Jornada dos Sentidos",
    description: "Partida para o autoconhecimento",
    longDescription: "Como os viajantes que chegavam pela estação ferroviária, iniciamos nossa jornada de descoberta sensorial.",
    location: { lat: -22.0545, lng: -46.7200 }, // Estação Ferroviária
    modelUrl: "https://cdn.glitch.me/models/chapter4.glb",
    difficulty: "Avançado",
    category: "Posição",
    tags: ["jornada", "descoberta", "movimento"],
    isUnlocked: false
  },
  {
    id: 5,
    title: "Águas Curativas",
    description: "O poder terapêutico do toque",
    longDescription: "No Balneário Municipal, as águas termais ensinam sobre o poder curativo do toque consciente e carinhoso.",
    location: { lat: -22.0510, lng: -46.7180 }, // Balneário Municipal
    modelUrl: "https://cdn.glitch.me/models/chapter5.glb",
    difficulty: "Intermediário",
    category: "Técnica",
    tags: ["cura", "toque", "terapia"],
    isUnlocked: false
  },
  // Continuar com os demais 51 capítulos...
  ...Array.from({ length: 51 }, (_, index) => ({
    id: index + 6,
    title: `Capítulo ${index + 6}: Técnica dos Mestres`,
    description: `Explorando as artes refinadas do amor em Águas da Prata`,
    longDescription: `Uma jornada profunda pelas técnicas mais sofisticadas da intimidade, inspirada na tranquilidade e beleza natural de Águas da Prata.`,
    location: {
      // Distribuir os pontos em círculo pela região de Águas da Prata
      lat: AGUAS_DA_PRATA_CENTER.lat + (Math.cos((index * 2 * Math.PI) / 51) * (0.01 + Math.random() * 0.02)),
      lng: AGUAS_DA_PRATA_CENTER.lng + (Math.sin((index * 2 * Math.PI) / 51) * (0.01 + Math.random() * 0.02))
    },
    modelUrl: `https://cdn.glitch.me/models/chapter${index + 6}.glb`,
    difficulty: ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'][Math.floor(Math.random() * 4)] as any,
    category: ['Posição', 'Técnica', 'Filosofia', 'Arte'][Math.floor(Math.random() * 4)] as any,
    tags: ['águas da prata', 'tradição', 'mestria'],
    isUnlocked: false
  }))
]

// Rota original fixa
export const originalRoute = createOriginalRoute()

export const getChapterById = (id: number): ChapterData | undefined => {
  return chaptersData.find(chapter => chapter.id === id)
}

export const getUnlockedChapters = (): ChapterData[] => {
  return chaptersData.filter(chapter => chapter.isUnlocked)
}

export const getChaptersByDifficulty = (difficulty: ChapterData['difficulty']): ChapterData[] => {
  return chaptersData.filter(chapter => chapter.difficulty === difficulty)
}

export const getChaptersByCategory = (category: ChapterData['category']): ChapterData[] => {
  return chaptersData.filter(chapter => chapter.category === category)
}

// Função para criar rota customizada entre dois pontos
export const generateCustomRoute = (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
  const route = []
  
  for (let i = 0; i < 56; i++) {
    const progress = i / 55 // 0 to 1
    
    // Interpolação linear entre origem e destino
    const lat = origin.lat + (destination.lat - origin.lat) * progress
    const lng = origin.lng + (destination.lng - origin.lng) * progress
    
    // Adicionar alguma variação aleatória para não ficar linha reta
    const variation = 0.005 // ~500m de variação
    const randomLat = lat + (Math.random() - 0.5) * variation
    const randomLng = lng + (Math.random() - 0.5) * variation
    
    const chapter = chaptersData[i]
    
    route.push({
      lat: randomLat,
      lng: randomLng,
      chapterNumber: i + 1,
      title: chapter.title,
      description: chapter.description
    })
  }
  
  return route
}