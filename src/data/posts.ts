import heroImg from '../assets/hero.png'

export interface Reaction {
  emoji: string
  count: number
}

export interface Comment {
  id: number
  author: string
  avatar: string
  time: string
  text: string
  likes: number
}

export interface PhotoInfo {
  credit: string
  details: string
}

export interface Post {
  id: number
  author: string
  handle: string
  avatar: string
  verified?: boolean
  time: string
  date: string
  topic: string
  title: string
  excerpt: string
  body: string[]
  image?: string
  imageInfo?: PhotoInfo
  reactions: Reaction[]
  comments: Comment[]
  marks: number
  views: number
}

export interface Topic {
  emoji: string
  label: string
}

export const topics: Topic[] = [
  { emoji: '🏃', label: '5K' },
  { emoji: '🏃‍♂️', label: '10K' },
  { emoji: '🏅', label: 'Meia maratona' },
  { emoji: '🏁', label: 'Maratona' },
]

export const popularPhotographers = [
  {
    author: 'Rafael Duarte',
    avatar: '📸',
    text: 'Como encontrar as fotos da sua corrida: o guia real do traceMark',
    views: 1328,
  },
  {
    author: 'Ísis Cardoso',
    avatar: '📷',
    text: 'As lentes certas para cada trecho da corrida — e quando elas aparecem',
    views: 456,
  },
  {
    author: 'Bruno Tavares',
    avatar: '🎬',
    text: 'Como escolher o ponto de registro na chegada: por onde começar',
    views: 459,
  },
]

export const popularQuestions = [
  {
    author: 'Camila Aires',
    avatar: '📸',
    text: 'Como encontrar as fotos da minha última corrida pelo número de peito?',
    comments: 24,
  },
  {
    author: 'Helena Prado',
    avatar: '📷',
    text: 'Quais configurações usar em corridas noturnas para o foto não sair tremido?',
    comments: 349,
  },
]

export const currentUser = {
  name: 'Camila Aires',
  handle: '@camilaaires',
  avatar: '📸',
  verified: true,
  bio: 'Fotógrafa independente que registra corridas de rua. Publico os melhores ângulos da largada, do Km 21 e da chegada. 🏁',
  city: 'São Paulo, BR',
  joined: 'Entrou em março de 2024',
  stats: { posts: 12, followers: 3456, following: 210 },
}

export const posts: Post[] = [
  {
    id: 1,
    author: 'traceMark',
    handle: '@tracemark',
    avatar: 't',
    verified: true,
    time: '31 s',
    date: '21 de outubro de 2026 às 09:12',
    topic: 'Corridas de rua',
    title: 'Como encontrar as fotos da sua corrida: o guia real do traceMark',
    excerpt:
      'Muitos corredores saem da linha de chegada e vão direto atrás das fotos — e a vontade de achar aquele registro do Km 21 é imediata. Mas dá mesmo para encontrar tudo sem rolar o feed por horas?',
    body: [
      'Muitos corredores saem da linha de chegada e vão direto atrás das fotos — e a vontade de achar aquele registro do Km 21 é imediata. Mas será que dá para encontrar tudo sem rolar o feed por horas?',
      'Aqui no traceMark, toda foto é tagueada pela corrida, pela distância e pelo fotógrafo. Dá para filtrar pelo número de peito nas fotos já revisadas ou navegar direto pelas tomadas de cada km.',
      'Fotógrafos independentes publicam direto no feed, com crédito completo: câmera, lente, abertura, obturador e o exato km do registro. Se apareceu uma imagem sua sem crédito, avise nos comentários — a comunidade conserta rápido.',
      'Até lá: hidratação, gel e os olhos abertos para a câmera na subida. 📸',
    ],
    image: heroImg,
    imageInfo: {
      credit: 'Foto: Rafael Duarte / traceMark',
      details: 'Nikon Z8 • 70-200mm • f/2.8 • 1/2000 s • ISO 400 • Km 21, entrada da chegada',
    },
    reactions: [
      { emoji: '❤️', count: 1328 },
      { emoji: '🔥', count: 458 },
      { emoji: '😮', count: 23 },
    ],
    comments: [
      {
        id: 1,
        author: 'Helena Prado',
        avatar: '📷',
        time: '12 min',
        text: 'Achei minha foto do Km 21 pelo filtro da prova em segundos! Melhor notícia da semana 🏅',
        likes: 34,
      },
      {
        id: 2,
        author: 'Ísis Cardoso',
        avatar: '📷',
        time: '1 h',
        text: 'Vale lembrar: sempre confira o crédito antes de repostar. Fotógrafo independente vive disso.',
        likes: 82,
      },
      {
        id: 3,
        author: 'Bruno Tavares',
        avatar: '🎬',
        time: '2 h',
        text: 'Guia direto ao ponto, já mandei para o pelotão do meu bairro 🙌',
        likes: 12,
      },
    ],
    marks: 467,
    views: 2500,
  },
  {
    id: 2,
    author: 'Camila Aires',
    handle: '@camilaaires',
    avatar: '📸',
    verified: true,
    time: '10 de outubro de 2026 às 13:48',
    date: '10 de outubro de 2026 às 13:48',
    topic: 'Bate-papo',
    title: 'E se eu publicar uma foto sem legenda?',
    excerpt:
      'Meu post vai ter só a foto e uma ideia para desenvolver depois. Nada de texto longo: aqui a imagem fala primeiro, e a conversa rola nos comentários.',
    body: [
      'Meu post vai ter só a foto e uma ideia para desenvolver depois.',
      'Nada de legenda longa: aqui a imagem fala primeiro, e a conversa rola nos comentários. Acho que uma rede de conversa funciona melhor com pouco texto e muita troca — principalmente quando o assunto é fotografia de prova.',
      'E vocês, preferem fotos sem legenda ou o post completo com crédito e história?',
    ],
    reactions: [
      { emoji: '❤️', count: 68 },
      { emoji: '🔥', count: 12 },
    ],
    comments: [
      {
        id: 1,
        author: 'Helena Prado',
        avatar: '📷',
        time: '20 min',
        text: 'Prefiro a foto limpa! Se a imagem é boa, dispensa texto 📸',
        likes: 9,
      },
      {
        id: 2,
        author: 'Bruno Tavares',
        avatar: '🎬',
        time: '50 min',
        text: 'Crédito é inegociável, mas legenda longa eu corto toda 😂',
        likes: 5,
      },
    ],
    marks: 4,
    views: 984,
  },
  {
    id: 3,
    author: 'Bruno Tavares',
    handle: '@brunotav',
    avatar: '🎬',
    time: '30 s',
    date: '21 de outubro de 2026 às 09:40',
    topic: 'Bate-papo',
    title: 'Publico sem título? Preciso pensar em como deixar a edição do post levinha',
    excerpt:
      'Será que dá para publicar sem título? Preciso pensar bem em como deixar a edição prática, para não sobrecarregar a janela de criar post antes de subir o material da prova.',
    body: [
      'Será que dá para publicar sem título? Preciso pensar bem em como deixar a edição prática, para não sobrecarregar a janela de criação de post.',
      'Para fotógrafos de prova, cada minuto depois da corrida conta: o ideal é subir o material enquanto os memes da largada ainda estão quentes.',
      'Uma ideia: o título vira a primeira linha da legenda no card do feed, aí o fotógrafo não escreve a mesma coisa duas vezes.',
    ],
    reactions: [{ emoji: '❤️', count: 5 }],
    comments: [
      {
        id: 1,
        author: 'Ísis Cardoso',
        avatar: '📷',
        time: '2 min',
        text: 'Usar o primeiro parágrafo como título é ótima saída 👍',
        likes: 3,
      },
    ],
    marks: 1,
    views: 2,
  },
]

const localPosts: Post[] = []

export function addLocalPost(post: Post) {
  localPosts.push(post)
}

export function findPost(id: number): Post | undefined {
  return localPosts.find((p) => p.id === id) ?? posts.find((p) => p.id === id)
}

export function postsByAuthor(handle: string): Post[] {
  return posts.filter((p) => p.handle === handle)
}
