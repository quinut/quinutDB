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

export interface ItemRatings {
  adoption: ScoreValue;  // 대중성 & 생태계 규모 (1: 소수/신생 ~ 5: 사실상 표준)
  easeOfUse: ScoreValue; // 설정 난이도 & 편의성 (1: CLI/수동설정 ~ 5: 원클릭 완벽)
  activity: ScoreValue;  // 업데이트 활성도 (1: 방치/EOL ~ 5: 활발한 유지보수)
}

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
  ratings: ItemRatings;
  logoUrl: string;
  coverImageUrl: string;
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
  ratings: ItemRatings;
  logoUrl: string;
  coverImageUrl: string;
  officialUrl?: string;
  downloadUrl?: string;
  githubRepo?: string;
}
