export type TriState = boolean | null;

export type PricingModel = 'Free & Open Source' | 'Free' | 'Freemium' | 'Paid';

export type ProjectStatus = 'Active' | 'Stale' | 'Discontinued';

export type DeviceCategory = 'First-Party' | 'Retro Handheld' | 'PC-Handheld';

export type Platform =
  | 'Android'
  | 'iOS'
  | 'iPadOS'
  | 'tvOS'
  | 'Linux'
  | 'Windows'
  | 'macOS'
  | (string & {});

export type ThemeSupportLevel = 'Rich' | 'Basic' | 'None';

export type ScoreValue = 1 | 2 | 3 | 4 | 5;

export interface FrontendItem {
  id: string;
  name: string;
  shortDesc: string;
  pricing: PricingModel;
  status: ProjectStatus;
  supportedPlatforms: Platform[];
  hasBuiltInScraper: TriState;
  themeSupport: ThemeSupportLevel;
  touchOptimized: TriState;
  gamepadOptimized: TriState;
  canReplaceHomeLauncher: TriState;
  dualScreenOptimized: TriState;
  logoUrl: string;
  coverImageUrl: string;
  screenshots?: string[];
  officialUrl?: string;
  downloadUrl?: string;
  githubRepo?: string;
}

export type FormFactor = 'Handheld' | 'Home' | 'Hybrid';

export interface CFWFeatures {
  portMaster?: TriState;
  sleepMode?: TriState;
  hdmiOut?: TriState;
  otaUpdate?: TriState;
  pluginLoader?: TriState;
  emuNandOrSandbox?: TriState;
}

export interface OSFirmwareItem {
  id: string;
  name: string;
  shortDesc: string;
  pricing: PricingModel;
  status: ProjectStatus;
  category: DeviceCategory;
  formFactor?: FormFactor;
  targetDevices: string[];
  baseSystem: string;
  exploitType?: string;
  defaultFrontend?: string;
  features?: CFWFeatures;
  logoUrl: string;
  coverImageUrl: string;
  screenshots?: string[];
  officialUrl?: string;
  downloadUrl?: string;
  githubRepo?: string;
}
