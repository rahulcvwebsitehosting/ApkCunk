export enum AppCategory {
  GAMES = 'Games',
  APPS = 'Apps',
  TOOLS = 'Tools',
}

export enum AppSubCategory {
  ACTION = 'Action',
  RPG = 'RPG',
  STRATEGY = 'Strategy',
  SOCIAL = 'Social',
  PRODUCTIVITY = 'Productivity',
  UTILITIES = 'Utilities',
}

export enum ModType {
  ORIGINAL = 'Original',
  UNLIMITED_MONEY = 'Unlimited Money',
  PREMIUM_UNLOCKED = 'Premium Unlocked',
  AD_FREE = 'Ad-Free',
  GOD_MODE = 'God Mode'
}

export interface AppVersion {
  id: string;
  versionName: string;
  versionCode: number;
  label: string; // e.g., "v1.2.3 - Mod Money"
  modType: ModType;
  size: string; // e.g., "45 MB"
  uploadDate: string;
  md5: string;
  downloads: number;
  virusScanStatus: 'clean' | 'flagged' | 'pending';
  fileUrl: string; // Mock URL
}

export interface AppData {
  id: string;
  packageId: string;
  name: string;
  developer: string;
  iconUrl: string;
  shortDescription: string;
  fullDescription: string; // HTML allowed
  category: AppCategory;
  subCategory: AppSubCategory;
  rating: number;
  ratingCount: number;
  installs: string;
  currentVersion: string;
  updatedDate: string;
  requiresAndroid: string;
  screenshots: string[];
  versions: AppVersion[];
  tags: string[];
}

export interface AdminStats {
  totalDownloads: number;
  activeUsers: number;
  totalApps: number;
  serverLoad: number;
}
