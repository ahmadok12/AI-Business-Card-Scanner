import type { BusinessCard, MediaItem, AppSettings } from '../types';

const DB_NAME = 'CardScannerAppDB';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
  geminiModel: 'gemini-3-flash-preview',
  defaultBlockName: 'Networking / Leads',
  autoCaptureEnabled: false,
  autoCaptureHoldTime: 1.2,
  theme: 'light'
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cards')) {
        const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
        cardStore.createIndex('createdAt', 'createdAt', { unique: false });
        cardStore.createIndex('blockName', 'blockName', { unique: false });
      }
      if (!db.objectStoreNames.contains('media')) {
        const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
        mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
        mediaStore.createIndex('type', 'type', { unique: false });
        mediaStore.createIndex('cardId', 'cardId', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCards(): Promise<BusinessCard[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cards', 'readonly');
    const store = tx.objectStore('cards');
    const request = store.getAll();
    request.onsuccess = () => {
      const cards = (request.result as BusinessCard[]) || [];
      cards.sort((a, b) => b.createdAt - a.createdAt);
      resolve(cards);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCardById(id: string): Promise<BusinessCard | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cards', 'readonly');
    const store = tx.objectStore('cards');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCard(card: BusinessCard): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cards', 'readwrite');
    const store = tx.objectStore('cards');
    const request = store.put(card);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCard(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['cards', 'media'], 'readwrite');
    const cardStore = tx.objectStore('cards');
    cardStore.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readonly');
    const store = tx.objectStore('media');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = (request.result as MediaItem[]) || [];
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaItem(item: MediaItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readwrite');
    const store = tx.objectStore('media');
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readwrite');
    const store = tx.objectStore('media');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get('app_settings');
    request.onsuccess = () => {
      if (request.result && request.result.settings) {
        // Upgrade legacy model if saved as 1.5-flash
        const loaded = request.result.settings;
        if (loaded.geminiModel === 'gemini-1.5-flash' || !loaded.geminiModel) {
          loaded.geminiModel = 'gemini-3-flash-preview';
        }
        if (!loaded.geminiApiKey || !loaded.geminiApiKey.trim()) {
          loaded.geminiApiKey = loaded.geminiApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
        }
        resolve({ ...DEFAULT_SETTINGS, ...loaded });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };
    request.onerror = () => resolve(DEFAULT_SETTINGS);
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put({ id: 'app_settings', settings });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllDatabase(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['cards', 'media'], 'readwrite');
    tx.objectStore('cards').clear();
    tx.objectStore('media').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function seedDemoData(): Promise<void> {
  const now = Date.now();
  const sampleCards: BusinessCard[] = [
    {
      id: 'demo-card-1',
      name: 'Sarah Jenkins',
      title: 'Principal Product Architect',
      company: 'Apex Innovations Inc.',
      phone: '+1 (555) 234-5678',
      secondaryPhone: '+1 (555) 987-6543',
      email: 'sarah.jenkins@apexinnovations.io',
      website: 'https://apexinnovations.io',
      address: '742 Silicon Boulevard, Suite 400, San Francisco, CA 94105',
      socialLinks: 'linkedin.com/in/sarah-jenkins-tech',
      notes: 'Met at Tech Summit 2026. Interested in our enterprise AI OCR solutions.',
      blockName: 'Tech Summit 2026',
      tags: ['VIP', 'Enterprise', 'AI/ML'],
      createdAt: now - 3600000 * 2,
      updatedAt: now - 3600000 * 2
    },
    {
      id: 'demo-card-2',
      name: 'Dr. Marcus Vance',
      title: 'Chief Medical Officer & Co-Founder',
      company: 'BioHealth Diagnostics',
      phone: '+1 (555) 876-5432',
      email: 'm.vance@biohealthdiag.org',
      website: 'https://biohealthdiag.org',
      address: '120 Harvard Medical Way, Boston, MA 02115',
      socialLinks: 'twitter.com/DrMarcusVance',
      notes: 'Discussed health informatics integration. Requested follow-up meeting next Tuesday.',
      blockName: 'Medical Partners',
      tags: ['Healthcare', 'Lead', 'Follow-up'],
      createdAt: now - 3600000 * 12,
      updatedAt: now - 3600000 * 12
    },
    {
      id: 'demo-card-3',
      name: 'Elena Rostova',
      title: 'Managing Director & Partner',
      company: 'Vanguard Global Capital',
      phone: '+1 (555) 345-6789',
      email: 'elena.rostova@vanguardgc.com',
      website: 'https://vanguardgc.com',
      address: '350 Park Avenue, 28th Floor, New York, NY 10022',
      socialLinks: 'linkedin.com/in/elena-rostova-vc',
      notes: 'Venture investor looking for series A B2B mobile tools.',
      blockName: 'Investors',
      tags: ['Investor', 'Series A', 'Priority'],
      createdAt: now - 3600000 * 24,
      updatedAt: now - 3600000 * 24
    }
  ];

  for (const card of sampleCards) {
    await saveCard(card);
  }

  const sampleMedia: MediaItem[] = [
    {
      id: 'demo-media-1',
      type: 'text',
      title: 'Meeting Memo - Apex Innovations',
      blockName: 'Tech Summit 2026',
      textContent: 'Key discussion points with Sarah Jenkins: Scaling mobile field agents and require on-device edge card scanner with instant speech-to-text voice memos.',
      cardId: 'demo-card-1',
      cardName: 'Sarah Jenkins',
      createdAt: now - 3600000 * 1
    },
    {
      id: 'demo-media-2',
      type: 'text',
      title: 'Quick Follow-up Task: Dr. Marcus',
      blockName: 'Medical Partners',
      textContent: 'Send integration documentation and HIPAA compliance overview before next Tuesday 10 AM EST.',
      cardId: 'demo-card-2',
      cardName: 'Dr. Marcus Vance',
      createdAt: now - 3600000 * 10
    }
  ];

  for (const media of sampleMedia) {
    await saveMediaItem(media);
  }
}

const MAX_FREE_SCANS = 10;
const DEVICE_ID_KEY = 'cardscanner_device_id';
const SCANS_COUNT_KEY = 'cardscanner_scans_used';
const PRO_STATUS_KEY = 'cardscanner_is_pro';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getUsageStats(): { scansUsed: number; maxFreeScans: number; isProUser: boolean; deviceId: string } {
  const deviceId = getDeviceId();
  const rawCount = localStorage.getItem(SCANS_COUNT_KEY);
  const scansUsed = rawCount ? parseInt(rawCount, 10) : 0;
  const isProUser = localStorage.getItem(PRO_STATUS_KEY) === 'true';

  return {
    scansUsed: isNaN(scansUsed) ? 0 : scansUsed,
    maxFreeScans: MAX_FREE_SCANS,
    isProUser,
    deviceId
  };
}

export function incrementScansUsed(): { scansUsed: number; remaining: number; limitReached: boolean } {
  const current = getUsageStats();
  if (current.isProUser) {
    return { scansUsed: current.scansUsed, remaining: 9999, limitReached: false };
  }
  const newCount = current.scansUsed + 1;
  localStorage.setItem(SCANS_COUNT_KEY, newCount.toString());
  const remaining = Math.max(0, MAX_FREE_SCANS - newCount);
  return {
    scansUsed: newCount,
    remaining,
    limitReached: newCount >= MAX_FREE_SCANS
  };
}

export function setProUserStatus(status: boolean): void {
  localStorage.setItem(PRO_STATUS_KEY, status ? 'true' : 'false');
}

export function resetScansForTesting(): void {
  localStorage.removeItem(SCANS_COUNT_KEY);
}
