/** Pedagogical carousel — bag-of-papers metaphor (ported from V1 ChanceExplanationSlides). */
export const DRAW_CHANCES_HELP_SLIDE_COUNT = 5

export interface DrawChancesHelpSlide {
  imageSrc: string
  imageAlt: string
}

export const DRAW_CHANCES_HELP_SLIDES: readonly DrawChancesHelpSlide[] = [
  {
    imageSrc: '/img/slide-1.jpg',
    imageAlt: 'Noms dans un sac — tirage au sort',
  },
  {
    imageSrc: '/img/slide-2.jpg',
    imageAlt: 'Chances égales si tout le monde part de zéro',
  },
  {
    imageSrc: '/img/slide-3.jpg',
    imageAlt: 'Taille des papiers selon l’historique de la saison',
  },
  {
    imageSrc: '/img/slide-4.jpg',
    imageAlt: 'Plus gros papier, plus de chances',
  },
  {
    imageSrc: '/img/slide-5.jpg',
    imageAlt: 'Plusieurs tirages sans remettre le papier',
  },
]
