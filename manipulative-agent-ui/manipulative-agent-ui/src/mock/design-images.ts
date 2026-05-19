import type { DesignImage } from '@/types'

export const designImages: DesignImage[] = [
  {
    id: 'home',
    label: 'Home Page',
    imageUrl: 'https://placehold.co/960x540/1e293b/e2e8f0?text=Home+Page+Design',
    prompt: 'Educational app home page with friendly cartoon style, title "Fraction Comparison", three activity cards with colorful icons, gradient blue-purple background, child-friendly typography, 1920x1080',
  },
  {
    id: 'activity_1',
    label: 'Activity 1 — Exploration',
    imageUrl: 'https://placehold.co/960x540/1e3a5f/e2e8f0?text=Activity+1+Exploration',
    prompt: 'Interactive fraction bar comparison interface, two horizontal bars side by side, blue and orange colors, slider controls below each bar, clean minimal UI, white background with subtle grid, educational app style, 1920x1080',
  },
  {
    id: 'activity_2',
    label: 'Activity 2 — Practice',
    imageUrl: 'https://placehold.co/960x540/3b1e5f/e2e8f0?text=Activity+2+Practice',
    prompt: 'Fraction comparison quiz interface, two fraction displays with question mark between them, choose greater/less/equal buttons, progress bar at top showing 3/10, encouraging mascot character, pastel purple theme, 1920x1080',
  },
  {
    id: 'activity_3',
    label: 'Activity 3 — Challenge',
    imageUrl: 'https://placehold.co/960x540/5f3b1e/e2e8f0?text=Activity+3+Challenge',
    prompt: 'Advanced fraction challenge mode, number line with draggable fraction markers, timer display, score counter, animated confetti ready, golden warm color theme, competitive yet friendly UI, 1920x1080',
  },
]
