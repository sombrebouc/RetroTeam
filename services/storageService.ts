
import { RetroCard, ActionItem, RetroConfig, RetroZone } from '../types';
import { AVAILABLE_FONTS } from '../constants';

// Clés de stockage (On garde les mêmes pour ne pas perdre vos données actuelles)
const KEYS = {
  USER: 'retro_user',
  EMAIL: 'retro_user_email', // Nouvelle clé
  CARDS: 'retro_cards',
  ZONES: 'retro_zones',
  PREV_ACTIONS: 'retro_prev_actions',
  NEW_ACTIONS: 'retro_new_actions',
  TITLE: 'retro_title',
  TITLE_COLOR: 'retro_title_color',
  COLOR: 'retro_color',
  CANVAS: 'retro_canvas_color',
  FONT: 'retro_font',
  BG_IMAGE: 'retro_bg_image'
};

// Valeurs par défaut
const DEFAULT_CONFIG: RetroConfig = {
  title: 'Ma Rétrospective',
  accentColor: '#3B82F6',
  canvasColor: '#ffffff',
  fontFamily: AVAILABLE_FONTS[0].value,
  backgroundImage: null,
  titleColor: '#ffffff'
};

// Simulation d'un délai réseau (optionnel, pour tester l'UX de chargement)
const simulateNetwork = () => new Promise(resolve => setTimeout(resolve, 50)); 

export const storageService = {
  
  // --- USER ---
  async getUser(): Promise<string | null> {
    await simulateNetwork();
    return localStorage.getItem(KEYS.USER);
  },

  async saveUser(name: string): Promise<void> {
    localStorage.setItem(KEYS.USER, name);
  },

  async getUserEmail(): Promise<string | null> {
    await simulateNetwork();
    return localStorage.getItem(KEYS.EMAIL);
  },

  async saveUserEmail(email: string): Promise<void> {
    localStorage.setItem(KEYS.EMAIL, email);
  },

  // --- CARDS ---
  async getCards(): Promise<RetroCard[]> {
    await simulateNetwork();
    const data = localStorage.getItem(KEYS.CARDS);
    return data ? JSON.parse(data) : [];
  },

  async saveCards(cards: RetroCard[]): Promise<void> {
    localStorage.setItem(KEYS.CARDS, JSON.stringify(cards));
  },

  // --- ZONES ---
  async getZones(): Promise<RetroZone[]> {
    await simulateNetwork();
    const data = localStorage.getItem(KEYS.ZONES);
    return data ? JSON.parse(data) : [];
  },

  async saveZones(zones: RetroZone[]): Promise<void> {
    localStorage.setItem(KEYS.ZONES, JSON.stringify(zones));
  },

  // --- ACTIONS ---
  async getPrevActions(): Promise<ActionItem[]> {
    await simulateNetwork();
    const data = localStorage.getItem(KEYS.PREV_ACTIONS);
    return data ? JSON.parse(data) : [];
  },

  async savePrevActions(actions: ActionItem[]): Promise<void> {
    localStorage.setItem(KEYS.PREV_ACTIONS, JSON.stringify(actions));
  },

  async getNewActions(): Promise<ActionItem[]> {
    await simulateNetwork();
    const data = localStorage.getItem(KEYS.NEW_ACTIONS);
    return data ? JSON.parse(data) : [];
  },

  async saveNewActions(actions: ActionItem[]): Promise<void> {
    localStorage.setItem(KEYS.NEW_ACTIONS, JSON.stringify(actions));
  },

  // --- CONFIG (Settings) ---
  async getConfig(): Promise<RetroConfig> {
    await simulateNetwork();
    return {
      title: localStorage.getItem(KEYS.TITLE) || DEFAULT_CONFIG.title,
      accentColor: localStorage.getItem(KEYS.COLOR) || DEFAULT_CONFIG.accentColor,
      canvasColor: localStorage.getItem(KEYS.CANVAS) || DEFAULT_CONFIG.canvasColor,
      fontFamily: localStorage.getItem(KEYS.FONT) || DEFAULT_CONFIG.fontFamily,
      backgroundImage: localStorage.getItem(KEYS.BG_IMAGE) || DEFAULT_CONFIG.backgroundImage,
      titleColor: localStorage.getItem(KEYS.TITLE_COLOR) || DEFAULT_CONFIG.titleColor
    };
  },

  async saveConfig(config: RetroConfig): Promise<void> {
    localStorage.setItem(KEYS.TITLE, config.title);
    localStorage.setItem(KEYS.COLOR, config.accentColor);
    localStorage.setItem(KEYS.CANVAS, config.canvasColor);
    localStorage.setItem(KEYS.FONT, config.fontFamily);
    if (config.titleColor) localStorage.setItem(KEYS.TITLE_COLOR, config.titleColor);
    
    if (config.backgroundImage) {
        try {
            localStorage.setItem(KEYS.BG_IMAGE, config.backgroundImage);
        } catch (e) {
            console.warn("Image trop lourde pour le localStorage");
        }
    } else {
        localStorage.removeItem(KEYS.BG_IMAGE);
    }
  },

  // --- UTILS ---
  async clearAll(): Promise<void> {
    // On efface tout sauf l'utilisateur et son email
    const user = localStorage.getItem(KEYS.USER);
    const email = localStorage.getItem(KEYS.EMAIL);
    localStorage.clear();
    if (user) localStorage.setItem(KEYS.USER, user);
    if (email) localStorage.setItem(KEYS.EMAIL, email);
  }
};