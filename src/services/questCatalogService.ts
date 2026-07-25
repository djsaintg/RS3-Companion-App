const CATALOG_KEY = 'rs3_quest_catalog_v1';
const CATALOG_UPDATED_KEY = 'rs3_quest_catalog_updated_v1';
const CATALOG_URL = 'https://runescape.wiki/cors/m=runemetrics/quests?user=Guttenchat';

export type CatalogDifficulty = 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';

export interface QuestCatalogEntry {
  title: string;
  membership: 'free' | 'members';
  difficulty: CatalogDifficulty;
  questPoints: number;
  kind: 'quest' | 'miniquest';
}

interface RuneMetricsQuest {
  title: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
}

const difficultyNames: CatalogDifficulty[] = ['Novice', 'Intermediate', 'Experienced', 'Master', 'Grandmaster'];

// Official 56-entry miniquest catalogue. Several entries do not include
// "(miniquest)" in RuneMetrics, so classifying by title is more reliable than QP.
const miniquestNames = new Set([
  'Bar Crawl (miniquest)', "Benedict's World Tour (miniquest)",
  "Boric's Task I (miniquest)", "Boric's Task II (miniquest)", "Boric's Task III (miniquest)",
  'Civil War I (miniquest)', 'Civil War II (miniquest)', 'Civil War III (miniquest)',
  'The Curse of Zaros (miniquest)', 'Damage Control (miniquest)', 'Desert Slayer Dungeon (miniquest)',
  "Doric's Task I (miniquest)", "Doric's Task II (miniquest)", "Doric's Task III (miniquest)",
  "Doric's Task IV (miniquest)", "Doric's Task V (miniquest)", "Doric's Task VI (miniquest)",
  "Doric's Task VII (miniquest)", "Doric's Task VIII (miniquest)", 'Enter the Abyss (miniquest)',
  'Eye for an Eye (miniquest)', 'Father and Son (miniquest)', 'Final Destination (miniquest)',
  'Flag Fall (miniquest)', 'From Tiny Acorns (miniquest)', "The General's Shadow (miniquest)",
  'Ghosts from the Past (miniquest)', 'A Guild of Our Own (miniquest)', 'Harbinger (miniquest)',
  'Head of the Family (miniquest)', 'Helping Laniakea (miniquest)', "Hopespear's Will (miniquest)",
  'The Hunt for Surok (miniquest)', 'In Memory of the Myreque (miniquest)', 'Jed Hunter (miniquest)',
  "Koschei's Troubles (miniquest)", 'Lair of Tarn Razorlor (miniquest)', 'Lost Her Marbles (miniquest)',
  'The Lost Toys (miniquest)', 'Mahjarrat Memories (miniquest)', 'Nadir (saga)',
  'One Foot in the Grave (miniquest)', 'Purple Cat (miniquest)', 'Rebuilding Edgeville (miniquest)',
  'Sheep Shearer (miniquest)', 'Spiritual Enlightenment (miniquest)', 'Tales of Nomad (miniquest)',
  'Tales of the God Wars (miniquest)', "Thok It To 'Em (saga)", 'Thok Your Block Off (saga)',
  "Three's Company (saga)", 'Tortle Combat (miniquest)', "Tuai Leit's Own (miniquest)",
  'Vengeance (saga)', "Wandering Ga'al (miniquest)", "Witch's Potion (miniquest)",
]);

function normalize(raw: RuneMetricsQuest): QuestCatalogEntry {
  const title = raw.title.trim();
  return {
    title,
    membership: raw.members ? 'members' : 'free',
    difficulty: difficultyNames[Math.min(Math.max(raw.difficulty ?? 0, 0), 4)],
    questPoints: raw.questPoints ?? 0,
    kind: miniquestNames.has(title) ? 'miniquest' : 'quest',
  };
}

export function getCachedQuestCatalog(): QuestCatalogEntry[] {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore invalid local data */ }
  return [];
}

export function getQuestCatalogUpdatedAt(): string | null {
  return localStorage.getItem(CATALOG_UPDATED_KEY);
}

export async function refreshQuestCatalog(): Promise<QuestCatalogEntry[]> {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`Quest catalogue request failed (${response.status})`);

  const payload = await response.json() as { quests?: RuneMetricsQuest[] };
  if (!Array.isArray(payload.quests) || payload.quests.length === 0) {
    throw new Error('RuneMetrics returned an empty quest catalogue');
  }

  const seen = new Set<string>();
  const catalog = payload.quests
    .map(normalize)
    .filter(entry => {
      const key = entry.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  // Do not replace a valid offline catalogue with a partial upstream response.
  if (catalog.length < 332) {
    throw new Error(`Incomplete quest catalogue received (${catalog.length}/332)`);
  }

  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  localStorage.setItem(CATALOG_UPDATED_KEY, new Date().toISOString());
  return catalog;
}

export function questWikiUrl(title: string, quickGuide = false): string {
  const cleanTitle = title.replace(/\s+\((miniquest|saga)\)$/i, quickGuide ? ' ($1)' : ' ($1)');
  const page = `${cleanTitle}${quickGuide ? '/Quick guide' : ''}`.replace(/ /g, '_');
  return `https://runescape.wiki/w/${encodeURIComponent(page).replace(/%2F/g, '/')}`;
}