import { ThemeAccent } from '../types/vpn';

export interface ThemeColors {
  name: string;
  nameAr: string;
  primary: string;
  primaryLight: string;
  rgb: string;
  shades: {
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  glowClass: string;
  borderClass: string;
  borderActiveClass: string;
  textClass: string;
  textLightClass: string;
  bgSoftClass: string;
  bgDeepClass: string;
  bgGlow: string;
  auraBgClass: string;
  solidBgClass: string;
  solidHoverClass: string;
  solidTextClass: string;
  swatchClass: string;
  buttonClass: string;
  activeTabClass: string;
  orbCoreConnected: string;
  orbOuterIdle: string;
  orbOuterConnected: string;
}

export const THEMES: Record<ThemeAccent, ThemeColors> = {
  teal: {
    name: 'Ocean Teal',
    nameAr: 'الفيروزي المحيطي',
    primary: '#14b8a6',
    primaryLight: '#2dd4bf',
    rgb: '20, 184, 166',
    shades: {
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    glowClass: 'cyber-glow-accent',
    borderClass: 'border-teal-500/35 hover:border-teal-500/65',
    borderActiveClass: 'border-teal-400',
    textClass: 'text-teal-400',
    textLightClass: 'text-teal-300',
    bgSoftClass: 'bg-teal-500/15',
    bgDeepClass: 'bg-teal-950/35',
    bgGlow: 'from-teal-500/20 to-transparent',
    auraBgClass: 'bg-teal-500/25',
    solidBgClass: 'bg-teal-500',
    solidHoverClass: 'hover:bg-teal-400',
    solidTextClass: 'text-slate-950',
    swatchClass: 'bg-[#14b8a6]',
    buttonClass: 'bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold',
    activeTabClass: 'bg-teal-500/20 text-teal-300 border-b-2 border-teal-400',
    orbCoreConnected: 'bg-gradient-to-b from-teal-950/90 to-slate-950',
    orbOuterIdle: 'bg-gradient-to-b from-slate-800 to-[#051a1b] border-2 border-teal-500/50 hover:border-teal-400 shadow-[0_15px_40px_rgba(0,0,0,0.7)]',
    orbOuterConnected: 'bg-gradient-to-b from-slate-900 to-[#042426] border-2 border-teal-400 shadow-[0_0_50px_rgba(20,184,166,0.5)]',
  },
  cyan: {
    name: 'Cyber Cyan',
    nameAr: 'السماوي النيوني',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    rgb: '6, 182, 212',
    shades: {
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
    glowClass: 'cyber-glow-accent',
    borderClass: 'border-cyan-500/35 hover:border-cyan-500/65',
    borderActiveClass: 'border-cyan-400',
    textClass: 'text-cyan-400',
    textLightClass: 'text-cyan-300',
    bgSoftClass: 'bg-cyan-500/15',
    bgDeepClass: 'bg-cyan-950/35',
    bgGlow: 'from-cyan-500/20 to-transparent',
    auraBgClass: 'bg-cyan-500/25',
    solidBgClass: 'bg-cyan-500',
    solidHoverClass: 'hover:bg-cyan-400',
    solidTextClass: 'text-slate-950',
    swatchClass: 'bg-[#06b6d4]',
    buttonClass: 'bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold',
    activeTabClass: 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400',
    orbCoreConnected: 'bg-gradient-to-b from-cyan-950/90 to-slate-950',
    orbOuterIdle: 'bg-gradient-to-b from-slate-800 to-[#061822] border-2 border-cyan-500/50 hover:border-cyan-400 shadow-[0_15px_40px_rgba(0,0,0,0.7)]',
    orbOuterConnected: 'bg-gradient-to-b from-slate-900 to-[#04232d] border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.5)]',
  },
  blue: {
    name: 'Royal Sapphire',
    nameAr: 'الأزرق الياقوتي',
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    rgb: '59, 130, 246',
    shades: {
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    glowClass: 'cyber-glow-accent',
    borderClass: 'border-blue-500/40 hover:border-blue-500/70',
    borderActiveClass: 'border-blue-400',
    textClass: 'text-blue-400',
    textLightClass: 'text-blue-300',
    bgSoftClass: 'bg-blue-500/15',
    bgDeepClass: 'bg-blue-950/35',
    bgGlow: 'from-blue-500/20 to-transparent',
    auraBgClass: 'bg-blue-500/25',
    solidBgClass: 'bg-blue-500',
    solidHoverClass: 'hover:bg-blue-400',
    solidTextClass: 'text-white',
    swatchClass: 'bg-[#3b82f6]',
    buttonClass: 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold',
    activeTabClass: 'bg-blue-600 text-white shadow-md',
    orbCoreConnected: 'bg-gradient-to-b from-blue-950/90 to-slate-950',
    orbOuterIdle: 'bg-gradient-to-b from-slate-800 to-[#07132a] border-2 border-blue-500/50 hover:border-blue-400 shadow-[0_15px_40px_rgba(0,0,0,0.7)]',
    orbOuterConnected: 'bg-gradient-to-b from-slate-900 to-[#061c3d] border-2 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.5)]',
  },
  yellow: {
    name: 'Solar Gold',
    nameAr: 'الأصفر الذهبي',
    primary: '#eab308',
    primaryLight: '#facc15',
    rgb: '234, 179, 8',
    shades: {
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006',
    },
    glowClass: 'cyber-glow-accent',
    borderClass: 'border-yellow-500/40 hover:border-yellow-400/75',
    borderActiveClass: 'border-yellow-400',
    textClass: 'text-yellow-400',
    textLightClass: 'text-yellow-300',
    bgSoftClass: 'bg-yellow-500/15',
    bgDeepClass: 'bg-yellow-950/35',
    bgGlow: 'from-yellow-500/20 to-transparent',
    auraBgClass: 'bg-yellow-500/25',
    solidBgClass: 'bg-yellow-500',
    solidHoverClass: 'hover:bg-yellow-400',
    solidTextClass: 'text-slate-950',
    swatchClass: 'bg-[#eab308]',
    buttonClass: 'bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-bold',
    activeTabClass: 'bg-yellow-500/20 text-yellow-300 border-b-2 border-yellow-400',
    orbCoreConnected: 'bg-gradient-to-b from-yellow-950/90 to-slate-950',
    orbOuterIdle: 'bg-gradient-to-b from-slate-800 to-[#1f1804] border-2 border-yellow-500/50 hover:border-yellow-400 shadow-[0_15px_40px_rgba(0,0,0,0.7)]',
    orbOuterConnected: 'bg-gradient-to-b from-slate-900 to-[#2e2305] border-2 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.5)]',
  },
  white: {
    name: 'Pure White',
    nameAr: 'الأبيض النقي',
    primary: '#f8fafc',
    primaryLight: '#ffffff',
    rgb: '248, 250, 252',
    shades: {
      200: '#ffffff',
      300: '#f8fafc',
      400: '#f1f5f9',
      500: '#e2e8f0',
      600: '#cbd5e1',
      700: '#94a3b8',
      800: '#334155',
      900: '#1e293b',
      950: '#0f172a',
    },
    glowClass: 'cyber-glow-accent',
    borderClass: 'border-white/30 hover:border-white/60',
    borderActiveClass: 'border-white',
    textClass: 'text-white',
    textLightClass: 'text-slate-100',
    bgSoftClass: 'bg-white/15',
    bgDeepClass: 'bg-slate-800/70',
    bgGlow: 'from-white/15 to-transparent',
    auraBgClass: 'bg-white/20',
    solidBgClass: 'bg-white',
    solidHoverClass: 'hover:bg-slate-200',
    solidTextClass: 'text-slate-950',
    swatchClass: 'bg-white border border-slate-300',
    buttonClass: 'bg-gradient-to-r from-white to-slate-200 hover:from-slate-100 hover:to-white text-slate-950 font-bold',
    activeTabClass: 'bg-white/15 text-white border-b-2 border-white',
    orbCoreConnected: 'bg-gradient-to-b from-slate-800/95 to-slate-950',
    orbOuterIdle: 'bg-gradient-to-b from-slate-800 to-[#0f172a] border-2 border-white/45 hover:border-white shadow-[0_15px_40px_rgba(0,0,0,0.7)]',
    orbOuterConnected: 'bg-gradient-to-b from-slate-800 to-[#1e293b] border-2 border-white shadow-[0_0_50px_rgba(255,255,255,0.45)]',
  },
};
