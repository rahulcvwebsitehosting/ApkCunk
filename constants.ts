import { AppCategory, AppSubCategory, AppData, ModType } from './types';

export const MOCK_APPS: AppData[] = [
  {
    id: '1',
    packageId: 'com.blockcraft.game',
    name: 'BlockCraft 3D',
    developer: 'Fun Games Ltd',
    iconUrl: 'https://picsum.photos/id/10/200/200',
    shortDescription: 'Build your own city in this amazing 3D simulation game.',
    fullDescription: '<p><b>BlockCraft 3D</b> is a building game where you can create your own city.</p><p>Features:</p><ul><li>Build anything you want</li><li>Multiplayer mode</li><li>Cool graphics</li></ul>',
    category: AppCategory.GAMES,
    subCategory: AppSubCategory.STRATEGY,
    rating: 4.5,
    ratingCount: 12500,
    installs: '10M+',
    currentVersion: '2.14.5',
    updatedDate: '2024-05-15',
    requiresAndroid: '5.0 and up',
    screenshots: [
      'https://picsum.photos/id/101/800/450',
      'https://picsum.photos/id/102/800/450',
      'https://picsum.photos/id/103/800/450'
    ],
    tags: ['Building', 'Simulation', 'Multiplayer'],
    versions: [
      {
        id: 'v1-mod',
        versionName: '2.14.5',
        versionCode: 2145,
        label: 'v2.14.5 - Mod Unlimited Gems',
        modType: ModType.UNLIMITED_MONEY,
        size: '65 MB',
        uploadDate: '2024-05-16',
        md5: 'a1b2c3d4e5f6',
        downloads: 54320,
        virusScanStatus: 'clean',
        fileUrl: '#'
      },
      {
        id: 'v1-orig',
        versionName: '2.14.5',
        versionCode: 2145,
        label: 'v2.14.5 - Original',
        modType: ModType.ORIGINAL,
        size: '64 MB',
        uploadDate: '2024-05-15',
        md5: 'f6e5d4c3b2a1',
        downloads: 1200,
        virusScanStatus: 'clean',
        fileUrl: '#'
      }
    ]
  },
  {
    id: '2',
    packageId: 'com.stream.music',
    name: 'StreamMusic',
    developer: 'Music Corp',
    iconUrl: 'https://picsum.photos/id/20/200/200',
    shortDescription: 'Listen to your favorite songs without limits.',
    fullDescription: '<p>Listen to music anywhere, anytime.</p>',
    category: AppCategory.APPS,
    subCategory: AppSubCategory.SOCIAL,
    rating: 4.8,
    ratingCount: 89000,
    installs: '100M+',
    currentVersion: '8.9.12',
    updatedDate: '2024-05-18',
    requiresAndroid: '6.0 and up',
    screenshots: [
      'https://picsum.photos/id/120/800/450',
      'https://picsum.photos/id/121/800/450'
    ],
    tags: ['Music', 'Audio', 'Streaming'],
    versions: [
      {
        id: 'v2-mod',
        versionName: '8.9.12',
        versionCode: 8912,
        label: 'v8.9.12 - Premium Unlocked',
        modType: ModType.PREMIUM_UNLOCKED,
        size: '42 MB',
        uploadDate: '2024-05-19',
        md5: '998877665544',
        downloads: 150000,
        virusScanStatus: 'clean',
        fileUrl: '#'
      }
    ]
  },
    {
    id: '3',
    packageId: 'com.rpg.legends',
    name: 'RPG Legends',
    developer: 'Quest Studio',
    iconUrl: 'https://picsum.photos/id/30/200/200',
    shortDescription: 'An epic role playing adventure awaits you.',
    fullDescription: 'Enter a world of magic and monsters.',
    category: AppCategory.GAMES,
    subCategory: AppSubCategory.RPG,
    rating: 4.2,
    ratingCount: 3400,
    installs: '1M+',
    currentVersion: '1.0.4',
    updatedDate: '2024-05-10',
    requiresAndroid: '7.0 and up',
    screenshots: [
      'https://picsum.photos/id/130/800/450'
    ],
    tags: ['RPG', 'Fantasy'],
    versions: [
      {
        id: 'v3-mod',
        versionName: '1.0.4',
        versionCode: 104,
        label: 'v1.0.4 - God Mode',
        modType: ModType.GOD_MODE,
        size: '120 MB',
        uploadDate: '2024-05-11',
        md5: '123123123',
        downloads: 8500,
        virusScanStatus: 'clean',
        fileUrl: '#'
      }
    ]
  }
];

export const CATEGORIES = [
  { name: 'Games', icon: 'Gamepad2' },
  { name: 'Apps', icon: 'Smartphone' },
  { name: 'Tools', icon: 'Wrench' },
];
