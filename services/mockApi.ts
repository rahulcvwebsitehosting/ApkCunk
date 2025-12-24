import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_APPS } from '../constants';
import { AppData, AppCategory } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'apkcunk_db_v1';

// Initialize state from LocalStorage to persist uploads, fallback to MOCK_APPS
const loadApps = (): AppData[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Failed to load apps from storage", e);
    }
    return [...MOCK_APPS];
};

// Local mutable state for the session
let currentApps = loadApps();

// Helper to safely get API Key without crashing if process is undefined
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
};

export const api = {
  getFeaturedApps: async (): Promise<AppData[]> => {
    await delay(500);
    return currentApps;
  },

  getLatestApps: async (): Promise<AppData[]> => {
    await delay(500);
    // Return sorted by date
    return [...currentApps].sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());
  },

  getAppById: async (id: string): Promise<AppData | undefined> => {
    await delay(300);
    return currentApps.find(app => app.id === id);
  },

  searchApps: async (query: string): Promise<AppData[]> => {
    await delay(400);
    const lowerQ = query.toLowerCase();
    return currentApps.filter(app => 
      app.name.toLowerCase().includes(lowerQ) || 
      app.packageId.toLowerCase().includes(lowerQ) ||
      app.developer.toLowerCase().includes(lowerQ)
    );
  },

  // Add a new app to the store and persist to localStorage
  addApp: async (newApp: AppData): Promise<void> => {
    await delay(800);
    // Prepend to list so it shows up first
    currentApps = [newApp, ...currentApps];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentApps));
    } catch (e) {
        console.error("Failed to persist app to storage", e);
    }
  },

  // Real scraping via Gemini AI + CORS Proxy Fallback
  fetchMetadataFromPlay: async (input: string): Promise<Partial<AppData>> => {
    let packageId = input;
    let url = input;

    // 1. URL/ID Parsing
    try {
        if (!input.startsWith('http')) {
            url = `https://play.google.com/store/apps/details?id=${input}&hl=en&gl=US`;
        } else {
            const u = new URL(input);
            packageId = u.searchParams.get('id') || input;
            if (!u.searchParams.has('hl')) u.searchParams.set('hl', 'en');
            if (!u.searchParams.has('gl')) u.searchParams.set('gl', 'US');
            url = u.toString();
        }
    } catch(e) {
        console.error("URL Parsing Error", e);
    }

    // 2. ATTEMPT 1: Google Gemini AI (Smart Scraping)
    const apiKey = getApiKey();
    if (apiKey) {
        try {
            console.log("Attempting AI Fetch for:", packageId);
            const ai = new GoogleGenAI({ apiKey: apiKey });
            
            // We use gemini-3-flash-preview for speed + search tools
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the Google Play Store app with package ID "${packageId}".
                           Task:
                           1. Search Google for the official Play Store page for "${packageId}".
                           2. Extract the exact App Name and Developer.
                           3. CRITICAL: Find the official high-resolution App Icon URL from the Play Store page.
                              It MUST be the one starting with "https://play-lh.googleusercontent.com" or "https://lh3.googleusercontent.com".
                              Do NOT return a generic icon. If you can't find the Play Store one, find the highest quality official icon from a trusted tech site.
                           4. Extract a short description and a full description (HTML allowed).
                           5. Find the current version, rating, and install count.
                           6. Return JSON matching the schema.`,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            developer: { type: Type.STRING },
                            iconUrl: { type: Type.STRING, description: "Official play store icon URL (play-lh.googleusercontent.com)" },
                            shortDescription: { type: Type.STRING },
                            fullDescription: { type: Type.STRING },
                            rating: { type: Type.NUMBER },
                            installs: { type: Type.STRING },
                            currentVersion: { type: Type.STRING },
                            updatedDate: { type: Type.STRING },
                            screenshots: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["name", "developer", "iconUrl"]
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                if (data.name) {
                    return {
                        packageId,
                        name: data.name,
                        developer: data.developer,
                        iconUrl: data.iconUrl,
                        shortDescription: data.shortDescription || 'No description available',
                        fullDescription: data.fullDescription || '<p>No description available</p>',
                        category: AppCategory.GAMES,
                        rating: data.rating || 4.5,
                        ratingCount: 1000,
                        installs: data.installs || '1M+',
                        currentVersion: data.currentVersion || 'Latest',
                        updatedDate: data.updatedDate || new Date().toISOString().split('T')[0],
                        requiresAndroid: '5.0+',
                        screenshots: data.screenshots || []
                    };
                }
            }
        } catch (e) {
            console.warn("AI Metadata Fetch failed, falling back to proxy...", e);
        }
    }

    // 3. ATTEMPT 2: CORS Proxy (AllOrigins) with Timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Strict Timeout

        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Proxy error');
        const json = await response.json();

        if (json.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(json.contents, 'text/html');

            const name = doc.querySelector('h1')?.textContent || '';
            const developer = doc.querySelector('a[href*="/store/apps/dev"]')?.textContent || 
                              doc.querySelector('.Vbfug a span')?.textContent || 
                              'Unknown';
            
            // IMPROVED ICON SELECTOR
            let iconUrl = '';
            // 1. Try generic icon alt
            const imgAlt = doc.querySelector('img[alt="Icon image"]');
            if (imgAlt) {
                iconUrl = imgAlt.getAttribute('src') || imgAlt.getAttribute('data-src') || imgAlt.getAttribute('srcset')?.split(' ')[0] || '';
            }
            
            // 2. Try common class T75of (often used for icons/screenshots) - The icon is usually the first one or distinct by size
            if (!iconUrl || !iconUrl.startsWith('http')) {
                 const imgs = Array.from(doc.querySelectorAll('img[src*="play-lh.googleusercontent.com"]'));
                 // Usually the icon is small square, screenshots are rectangular.
                 // We take the one that looks like an icon (often first relevant image)
                 if (imgs.length > 0) {
                     iconUrl = imgs[0].getAttribute('src') || '';
                 }
            }
            
            // Clean up icon url if it came from proxy as relative
            if (iconUrl && !iconUrl.startsWith('http')) {
                // If it is protocol relative (//play-lh...)
                if (iconUrl.startsWith('//')) {
                    iconUrl = 'https:' + iconUrl;
                } else {
                    iconUrl = ''; // Invalid
                }
            }

            if (name) {
                const descContainer = doc.querySelector('div[itemprop="description"]') || doc.querySelector('[data-g-id="description"]');
                const fullDescription = descContainer?.innerHTML || '<p>Description unavailable.</p>';
                const shortDescription = descContainer?.textContent?.substring(0, 150) + '...' || '';
                
                return {
                    packageId,
                    name,
                    developer,
                    iconUrl: iconUrl || `https://ui-avatars.com/api/?name=${name}&background=random`,
                    category: AppCategory.GAMES,
                    rating: 4.5,
                    ratingCount: 100,
                    installs: '1M+',
                    currentVersion: 'Latest',
                    updatedDate: new Date().toISOString().split('T')[0],
                    requiresAndroid: '5.0+',
                    screenshots: [],
                    shortDescription,
                    fullDescription
                };
            }
        }
    } catch (e) {
        console.warn("Proxy Fetch failed or timed out", e);
    }

    // 4. Fallback (Mock) - Final Resort
    const simpleName = packageId.split('.').pop() || 'App';
    const formattedName = simpleName.charAt(0).toUpperCase() + simpleName.slice(1);

    return {
      packageId,
      name: `${formattedName} (Simulated)`,
      developer: 'Unknown Developer',
      iconUrl: `https://ui-avatars.com/api/?name=${formattedName}&background=random`,
      shortDescription: 'Could not fetch real data (AI and Proxy failed). This is placeholder data.',
      fullDescription: '<p><b>Note:</b> Real metadata fetching failed. Please enter details manually.</p>',
      category: AppCategory.GAMES,
      rating: 4.5,
      ratingCount: 1000,
      installs: '10M+',
      currentVersion: '1.0.0',
      updatedDate: new Date().toISOString().split('T')[0],
      requiresAndroid: '5.0 and up',
      screenshots: [
          `https://picsum.photos/seed/${packageId}1/800/450`, 
          `https://picsum.photos/seed/${packageId}2/800/450`
      ],
    };
  }
};