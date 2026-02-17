import { Theme, ColumnType } from './types';

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Standard Pro',
    background: 'bg-slate-100',
    cardBg: 'bg-white',
    textColor: 'text-slate-800',
    accentColor: 'blue',
  },
  {
    id: 'ocean',
    name: 'Océan',
    background: 'bg-gradient-to-br from-blue-100 to-cyan-200',
    cardBg: 'bg-white/80',
    textColor: 'text-blue-900',
    accentColor: 'cyan',
  },
  {
    id: 'forest',
    name: 'Forêt Zen',
    background: 'bg-gradient-to-br from-green-100 to-emerald-200',
    cardBg: 'bg-white/90',
    textColor: 'text-emerald-900',
    accentColor: 'emerald',
  },
  {
    id: 'sunset',
    name: 'Coucher de Soleil',
    background: 'bg-gradient-to-br from-orange-100 to-rose-200',
    cardBg: 'bg-white/90',
    textColor: 'text-rose-900',
    accentColor: 'rose',
  },
  {
    id: 'dark',
    name: 'Mode Sombre',
    background: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    textColor: 'text-slate-100',
    accentColor: 'indigo',
  },
];

export const COLUMN_CONFIG = {
  [ColumnType.POSITIVE]: {
    title: 'Ce qui a été positif',
    icon: 'fa-smile',
    color: 'text-green-600',
    borderColor: 'border-green-400',
    placeholder: 'Ex: Bonne communication, livraison à temps...',
  },
  [ColumnType.NEGATIVE]: {
    title: 'Ce qui a été négatif',
    icon: 'fa-frown',
    color: 'text-red-600',
    borderColor: 'border-red-400',
    placeholder: 'Ex: Bugs en prod, specs floues...',
  },
  [ColumnType.CONTINUE]: {
    title: 'À continuer',
    icon: 'fa-sync-alt',
    color: 'text-blue-600',
    borderColor: 'border-blue-400',
    placeholder: 'Ex: Daily meeting de 15min, code review...',
  },
};

// Couleurs certifiées accessibles (contraste suffisant avec le blanc)
export const ACCESSIBLE_ACCENT_COLORS = [
    { name: 'Bleu Royal', value: '#2563EB' },   // Tailwind blue-600
    { name: 'Émeraude', value: '#059669' },     // Tailwind emerald-600
    { name: 'Violet Profond', value: '#7C3AED' }, // Tailwind violet-600
    { name: 'Rose Vif', value: '#DB2777' },     // Tailwind pink-600
    { name: 'Orange Brûlé', value: '#EA580C' }, // Tailwind orange-600
    { name: 'Gris Ardoise', value: '#475569' }, // Tailwind slate-600
];

export const AVAILABLE_FONTS = [
    { name: 'Inter (Standard)', value: 'Inter, sans-serif' },
    { name: 'Marqueur (Permanent)', value: '"Permanent Marker", cursive' },
    { name: 'Cartoon (Chewy)', value: '"Chewy", system-ui' },
    { name: 'Manuscrit (Patrick Hand)', value: '"Patrick Hand", cursive' },
    { name: 'Affiche Film (Oswald)', value: '"Oswald", sans-serif' },
    { name: 'Gros Titre (Luckiest Guy)', value: '"Luckiest Guy", cursive' },
    { name: 'Impact (Anton)', value: '"Anton", sans-serif' },
    { name: 'Arrondi (Fredoka)', value: '"Fredoka", sans-serif' },
    { name: 'Comic (Le vrai !)', value: '"Comic Neue", cursive' },
];