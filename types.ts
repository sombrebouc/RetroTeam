
export enum ColumnType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  CONTINUE = 'CONTINUE',
}

export interface RetroCard {
  id: string;
  text: string;
  column: ColumnType;
  votes: number;
  isRevealed: boolean;
  author?: string;
  x?: number; // Position X sur le canvas (null si dans la zone de préparation)
  y?: number; // Position Y sur le canvas
}

export interface RetroZone {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // Hex code or tailwind class reference
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  cardBg: string; // Fallback or distinct color
  textColor: string;
  accentColor: string;
}

export interface RetroConfig {
  title: string;
  accentColor: string;
  canvasColor: string;
  fontFamily: string;
  backgroundImage: string | null;
  titleColor?: string;
}

export type RetroState = {
  cards: RetroCard[];
  zones: RetroZone[];
  previousActions: ActionItem[];
  newActions: ActionItem[];
  config: RetroConfig;
};