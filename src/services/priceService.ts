const API_BASE = 'https://api.weirdgloop.org/exchange/history/rs/latest';
const CACHE_KEY = 'rs3_ge_prices';
const CACHE_TIMESTAMP_KEY = 'rs3_ge_prices_timestamp';

export interface PriceData {
  id: string;
  timestamp: string;
  price: number;
  volume: number | null;
}

export interface PriceCache {
  [itemName: string]: PriceData;
}

// All items we need prices for across money-making methods
export const TRACKED_ITEMS = [
  // F2P items
  'Cowhide', 'Raw beef', 'Bones', 'Feather', 'Raw chicken',
  'Iron ore', 'Coal', 'Runite ore', 'Luminite',
  'Raw lobster', 'Raw swordfish', 'Raw tuna',
  'Rune bar', 'Rune arrowheads', 'Rune dart tip',
  'Water rune', 'Air rune', 'Fire rune', 'Nature rune', 'Law rune',
  'Yew logs', 'Magic logs', 'Oak logs', 'Willow logs',
  'Gold ore', 'Silver ore', 'Gold bar',
  'Cooked lobster', 'Swordfish', 'Big bones', 'Headless arrow',
  'Arrow shaft', 'Bronze bar', 'Iron bar', 'Steel bar',
  'Adamantite ore', 'Mithril ore',
  // Members items
  'Ranarr seed', 'Clean ranarr', 'Grimy ranarr', 'Snape grass',
  'Prayer potion (4)', 'Super restore (4)',
  'Raw shark', 'Shark', 'Raw sailfish',
  'Dragon bones', 'Frost dragon bones',
  'Blood rune', 'Soul rune', 'Death rune', 'Astral rune',
  'Uncut dragonstone', 'Dragonstone',
  'Black dragonhide', 'Royal dragonhide',
  'Elder logs', 'Elder rune bar',
  'Snapdragon seed', 'Clean snapdragon',
  'Torstol seed', 'Clean torstol',
  'Overload (4)', 'Super attack (4)', 'Super strength (4)',
  'Incandescent energy', 'Luminous energy', 'Radiant energy',
  'Red chinchompa', 'Grenwall spikes',
  'Crystal triskelion fragment 1',
  'Croesus flake',
  'Necrite ore', 'Phasmatite', 'Banite ore',
  'Light animica', 'Dark animica',
  'Orichalcite ore', 'Drakolith',
  'Spirit shard',
  'Polar kebbit fur', 'Raw beast meat',
  'Vis wax',
];

export function getCachedPrices(): PriceCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('Failed to read price cache:', e);
  }
  return {};
}

export function getCacheTimestamp(): string | null {
  return localStorage.getItem(CACHE_TIMESTAMP_KEY);
}

export function getCacheAge(): string {
  const ts = getCacheTimestamp();
  if (!ts) return 'Never updated';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function savePrices(prices: PriceCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(prices));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to save price cache:', e);
  }
}

export function getPrice(itemName: string): number | null {
  const cache = getCachedPrices();
  return cache[itemName]?.price ?? null;
}

export function formatGp(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return `${amount}`;
}

export async function fetchAllPrices(
  onProgress?: (done: number, total: number) => void
): Promise<PriceCache> {
  const allPrices: PriceCache = { ...getCachedPrices() };
  const batchSize = 50; // API allows up to 100 items per request
  const batches: string[][] = [];

  for (let i = 0; i < TRACKED_ITEMS.length; i += batchSize) {
    batches.push(TRACKED_ITEMS.slice(i, i + batchSize));
  }

  let done = 0;

  for (const batch of batches) {
    try {
      const names = batch.map(n => encodeURIComponent(n)).join('|');
      const response = await fetch(`${API_BASE}?name=${names}`, {
        headers: {
          'User-Agent': 'RS3SkillingGuide/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        for (const [name, info] of Object.entries(data)) {
          allPrices[name] = info as PriceData;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch batch:', batch[0], '...', e);
    }

    done += batch.length;
    onProgress?.(Math.min(done, TRACKED_ITEMS.length), TRACKED_ITEMS.length);

    // Small delay between batches to be nice to the API
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  savePrices(allPrices);
  return allPrices;
}
