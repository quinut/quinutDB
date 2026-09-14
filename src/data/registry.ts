import { ItemRatings } from '../types';

export interface FrontendInput {
  name: string;
  url: string;
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
  url: string;
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

export const rawFrontends: FrontendInput[] = [];

export const rawOSFirmwares: OSFirmwareInput[] = [];
