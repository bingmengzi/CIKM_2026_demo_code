import type { AssetItem } from '@/types'

export const mockAssets: AssetItem[] = [
  // Activity 1 assets
  {
    id: 'a1_bg',
    activityId: 1,
    name: 'Background',
    imageUrl: 'https://placehold.co/200x120/e8f4fd/1e293b?text=BG+Grid',
    prompt: 'Subtle grid background with light blue tone, educational math worksheet style, clean and minimal',
    category: 'background',
  },
  {
    id: 'a1_bar_blue',
    activityId: 1,
    name: 'Fraction Bar (Blue)',
    imageUrl: 'https://placehold.co/200x120/3b82f6/ffffff?text=Blue+Bar',
    prompt: 'Blue horizontal fraction bar segment, flat design, rounded corners, gradient from light to dark blue, transparent background',
    category: 'interactive',
  },
  {
    id: 'a1_bar_orange',
    activityId: 1,
    name: 'Fraction Bar (Orange)',
    imageUrl: 'https://placehold.co/200x120/f97316/ffffff?text=Orange+Bar',
    prompt: 'Orange horizontal fraction bar segment, flat design, rounded corners, gradient from light to dark orange, transparent background',
    category: 'interactive',
  },
  // Activity 2 assets
  {
    id: 'a2_bg',
    activityId: 2,
    name: 'Background',
    imageUrl: 'https://placehold.co/200x120/f3e8ff/1e293b?text=BG+Purple',
    prompt: 'Soft purple gradient background with subtle star pattern, encouraging learning atmosphere',
    category: 'background',
  },
  {
    id: 'a2_mascot',
    activityId: 2,
    name: 'Mascot Character',
    imageUrl: 'https://placehold.co/200x120/fbbf24/1e293b?text=Mascot',
    prompt: 'Cute cartoon owl teacher mascot, holding a pointer, friendly expression, flat illustration style, transparent background',
    category: 'static',
  },
  {
    id: 'a2_star',
    activityId: 2,
    name: 'Star Reward',
    imageUrl: 'https://placehold.co/200x120/fbbf24/1e293b?text=Star',
    prompt: 'Golden star reward icon, cartoon style with shine effect, flat design, transparent background',
    category: 'static',
  },
  // Activity 3 assets
  {
    id: 'a3_bg',
    activityId: 3,
    name: 'Background',
    imageUrl: 'https://placehold.co/200x120/fef3c7/1e293b?text=BG+Gold',
    prompt: 'Warm golden gradient background with subtle confetti pattern, celebration and challenge atmosphere',
    category: 'background',
  },
  {
    id: 'a3_timer',
    activityId: 3,
    name: 'Timer Icon',
    imageUrl: 'https://placehold.co/200x120/ef4444/ffffff?text=Timer',
    prompt: 'Cartoon countdown timer, red circular design with clock hands, urgent but playful, transparent background',
    category: 'static',
  },
  {
    id: 'a3_trophy',
    activityId: 3,
    name: 'Trophy',
    imageUrl: 'https://placehold.co/200x120/fbbf24/1e293b?text=Trophy',
    prompt: 'Golden trophy cup with number 1, cartoon celebration style, sparkle effects, transparent background',
    category: 'static',
  },
  {
    id: 'a3_confetti',
    activityId: 3,
    name: 'Confetti',
    imageUrl: 'https://placehold.co/200x120/8b5cf6/ffffff?text=Confetti',
    prompt: 'Colorful confetti particles scattered, celebration effect, various shapes and colors, transparent background',
    category: 'static',
  },
]
