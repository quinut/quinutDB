import { ItemRatings } from '../types';

export interface FrontendInput {
  name: string;
  url: string; // GitHub repo ("owner/repo"), GitHub URL, or official website URL
  shortDesc?: string;
  pricing?: 'Free & Open Source' | 'Free' | 'Freemium' | 'Paid';
  supportedPlatforms?: ('Android' | 'iOS' | 'Linux' | 'Windows' | 'macOS')[];
  themeSupport?: 'Rich' | 'Basic' | 'None';
  hasBuiltInScraper?: boolean | null;
  touchOptimized?: boolean | null;
  gamepadOptimized?: boolean | null;
  canReplaceHomeLauncher?: boolean | null;
  ratings?: ItemRatings;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface OSFirmwareInput {
  name: string;
  url: string; // GitHub repo ("owner/repo"), GitHub URL, or website URL
  category: 'First-Party' | 'Retro Handheld' | 'PC-Handheld';
  targetDevices: string[];
  baseSystem: string;
  shortDesc?: string;
  pricing?: 'Free & Open Source' | 'Free' | 'Freemium' | 'Paid';
  exploitType?: string;
  defaultFrontend?: string;
  ratings?: ItemRatings;
  logoUrl?: string;
  coverImageUrl?: string;
}

export const rawFrontends: FrontendInput[] = [
  {
    name: 'Daijishō',
    url: 'https://github.com/TapiocaFox/Daijishou',
    supportedPlatforms: ['Android'],
    hasBuiltInScraper: true,
    themeSupport: 'Rich',
    touchOptimized: true,
    gamepadOptimized: true,
    canReplaceHomeLauncher: true
  },
  {
    name: 'ES-DE',
    url: 'https://gitlab.com/es-de/emulationstation-de',
    supportedPlatforms: ['Android', 'Linux', 'Windows', 'macOS'],
    pricing: 'Paid',
    hasBuiltInScraper: true,
    themeSupport: 'Rich',
    touchOptimized: false,
    gamepadOptimized: true,
    canReplaceHomeLauncher: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'
  }
];

export const rawOSFirmwares: OSFirmwareInput[] = [
  {
    name: 'Atmosphère',
    url: 'https://github.com/Atmosphere-NX/Atmosphere',
    category: 'First-Party',
    targetDevices: ['Switch', 'Switch OLED', 'Switch Lite'],
    baseSystem: 'Horizon OS Patch (Fusée / exosphère)',
    exploitType: 'Fusee-gelee / Modchip (HWFLY/Picofly)',
    defaultFrontend: 'Horizon Home Menu'
  },
  {
    name: 'Freeboot / RGH',
    url: 'https://www.se7ensins.com/forums/forums/jtag-rgh.180/',
    shortDesc: 'Custom NAND image and reset glitch hack (RGH) environment granting unrestricted execution on Xbox 360 hardware.',
    category: 'First-Party',
    targetDevices: ['Xbox 360'],
    baseSystem: 'Freeboot / Xenon Kernel Mod',
    exploitType: 'Modchip (RGH 1.2 / RGH 3.0)',
    defaultFrontend: 'Aurora',
    pricing: 'Free',
    coverImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Knulli',
    url: 'https://github.com/knulli-cfw/distribution',
    category: 'Retro Handheld',
    targetDevices: ['Anbernic RG35XX Plus', 'RG35XX H', 'RG40XX H', 'TrimUI Smart Pro'],
    baseSystem: 'Buildroot Linux (Batocera Fork)',
    exploitType: 'SD Boot',
    defaultFrontend: 'ES-DE'
  }
];
