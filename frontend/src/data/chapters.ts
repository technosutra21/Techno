import { ChapterData } from '@/types'

// Coordenadas baseadas em locais icônicos do mundo para os 56 capítulos
export const chaptersData: ChapterData[] = [
  {
    id: 1,
    title: "O Despertar dos Sentidos",
    description: "A introdução à arte do amor digital",
    longDescription: "O primeiro capítulo explora os fundamentos da conexão íntima no mundo cyberpunk, onde tecnologia e sensualidade se fundem em uma dança harmoniosa.",
    location: { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
    modelUrl: "https://cdn.glitch.me/models/chapter1.glb",
    difficulty: "Iniciante",
    category: "Filosofia",
    tags: ["fundamentos", "conexão", "intimidade"],
    isUnlocked: true
  },
  {
    id: 2,
    title: "Sincronização Neural",
    description: "Conectando mentes através da interface digital",
    longDescription: "A arte de sincronizar consciências através de implantes neurais, criando uma experiência compartilhada única.",
    location: { lat: 48.8566, lng: 2.3522 }, // Paris, France
    modelUrl: "https://cdn.glitch.me/models/chapter2.glb",
    difficulty: "Iniciante",
    category: "Técnica",
    tags: ["neural", "sincronização", "mental"],
    isUnlocked: false
  },
  {
    id: 3,
    title: "A Dança dos Hologramas",
    description: "Expressão corporal através de projeções luminosas",
    longDescription: "Utilizando holografias para criar uma dança sensual que transcende as limitações físicas.",
    location: { lat: 40.7128, lng: -74.0060 }, // New York, USA
    modelUrl: "https://cdn.glitch.me/models/chapter3.glb",
    difficulty: "Intermediário",
    category: "Arte",
    tags: ["holografia", "dança", "expressão"],
    isUnlocked: false
  },
  {
    id: 4,
    title: "Fusão Quântica",
    description: "A união no nível subatômico",
    longDescription: "Explorando a conexão através da manipulação quântica da realidade, onde duas consciências se tornam uma.",
    location: { lat: 51.5074, lng: -0.1278 }, // London, UK
    modelUrl: "https://cdn.glitch.me/models/chapter4.glb",
    difficulty: "Avançado",
    category: "Posição",
    tags: ["quântico", "fusão", "consciência"],
    isUnlocked: false
  },
  {
    id: 5,
    title: "Reverberação Cibernética",
    description: "Amplificando sensações através de circuitos",
    longDescription: "Técnica avançada que utiliza implantes cibernéticos para amplificar e compartilhar sensações.",
    location: { lat: 55.7558, lng: 37.6173 }, // Moscow, Russia
    modelUrl: "https://cdn.glitch.me/models/chapter5.glb",
    difficulty: "Intermediário",
    category: "Técnica",
    tags: ["cibernético", "amplificação", "circuitos"],
    isUnlocked: false
  },
  // Continuando com mais capítulos para completar os 56...
  {
    id: 6,
    title: "Matriz de Prazer",
    description: "Criando realidades virtuais sensuais",
    longDescription: "A arte de construir ambientes virtuais imersivos que estimulam todos os sentidos simultaneamente.",
    location: { lat: 34.0522, lng: -118.2437 }, // Los Angeles, USA
    modelUrl: "https://cdn.glitch.me/models/chapter6.glb",
    difficulty: "Especialista",
    category: "Arte",
    tags: ["virtual", "matriz", "imersão"],
    isUnlocked: false
  },
  {
    id: 7,
    title: "Código do Desejo",
    description: "Programando emoções através de algoritmos",
    longDescription: "Utilizando inteligência artificial para gerar e modular estados emocionais complexos.",
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco, USA
    modelUrl: "https://cdn.glitch.me/models/chapter7.glb",
    difficulty: "Avançado",
    category: "Técnica",
    tags: ["IA", "algoritmo", "emoção"],
    isUnlocked: false
  },
  {
    id: 8,
    title: "Reflexos Neon",
    description: "A estética visual do amor cyberpunk",
    longDescription: "Explorando como as luzes neon e as cores vibrantes amplificam a experiência sensorial.",
    location: { lat: 22.3193, lng: 114.1694 }, // Hong Kong
    modelUrl: "https://cdn.glitch.me/models/chapter8.glb",
    difficulty: "Iniciante",
    category: "Arte",
    tags: ["neon", "visual", "estética"],
    isUnlocked: false
  },
  // Adicionando mais capítulos para atingir 56 total
  ...Array.from({ length: 48 }, (_, index) => ({
    id: index + 9,
    title: `Capítulo ${index + 9}: Técnica Avançada`,
    description: `Explorando técnicas avançadas do amor cyberpunk`,
    longDescription: `Uma jornada profunda nas técnicas mais sofisticadas da intimidade digital.`,
    location: {
      lat: -90 + (Math.random() * 180), // Coordenadas aleatórias para demo
      lng: -180 + (Math.random() * 360)
    },
    modelUrl: `https://cdn.glitch.me/models/chapter${index + 9}.glb`,
    difficulty: ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'][Math.floor(Math.random() * 4)] as any,
    category: ['Posição', 'Técnica', 'Filosofia', 'Arte'][Math.floor(Math.random() * 4)] as any,
    tags: ['cyberpunk', 'digital', 'futurismo'],
    isUnlocked: false
  }))
]

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