export interface PlayerSkill {
  level: number;
}

export interface PlayerProfile {
  name: string;
  totalLevel: number;
  skills: Record<string, PlayerSkill>;
  createdAt: string;
}

const PROFILES_KEY = 'rs3_player_profiles';
const ACTIVE_KEY = 'rs3_active_profile';
const MAX_PROFILES = 20;

export const ALL_SKILLS = [
  'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged',
  'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing',
  'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility',
  'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction',
  'Summoning', 'Dungeoneering', 'Divination', 'Invention', 'Archaeology', 'Necromancy',
];

export function getDefaultLevels(): Record<string, number> {
  const levels: Record<string, number> = {};
  ALL_SKILLS.forEach(s => { levels[s] = s === 'Constitution' ? 10 : 1; });
  return levels;
}

// ---- Multi-profile storage ----

export function getAllProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveAllProfiles(profiles: PlayerProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileName(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveProfileName(name: string | null) {
  if (name) localStorage.setItem(ACTIVE_KEY, name);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function getActiveProfile(): PlayerProfile | null {
  const name = getActiveProfileName();
  if (!name) return null;
  return getAllProfiles().find(p => p.name === name) ?? null;
}

export function saveProfile(profile: PlayerProfile): { ok: boolean; error?: string } {
  const all = getAllProfiles();
  const idx = all.findIndex(p => p.name.toLowerCase() === profile.name.toLowerCase());
  if (idx >= 0) {
    all[idx] = profile; // update existing
  } else {
    if (all.length >= MAX_PROFILES) {
      return { ok: false, error: `Maximum of ${MAX_PROFILES} profiles reached. Delete one first.` };
    }
    all.push(profile);
  }
  saveAllProfiles(all);
  setActiveProfileName(profile.name);
  return { ok: true };
}

export function deleteProfile(name: string) {
  const all = getAllProfiles().filter(p => p.name !== name);
  saveAllProfiles(all);
  if (getActiveProfileName() === name) {
    setActiveProfileName(all.length > 0 ? all[0].name : null);
  }
}

export function buildProfile(name: string, levels: Record<string, number>): PlayerProfile {
  const skills: Record<string, PlayerSkill> = {};
  let totalLevel = 0;
  for (const [skillName, level] of Object.entries(levels)) {
    skills[skillName] = { level };
    totalLevel += level;
  }
  return { name, totalLevel, skills, createdAt: new Date().toISOString() };
}

// ---- Skill-check helpers ----

export function getSkillLevel(profile: PlayerProfile | null, skillName: string): number {
  if (!profile) return 0;
  const normalized = skillName.toLowerCase();
  for (const [name, data] of Object.entries(profile.skills)) {
    if (name.toLowerCase() === normalized) return data.level;
  }
  if (normalized === 'combat') {
    const g = (s: string) => profile.skills[s]?.level ?? 1;
    const base = Math.max(g('Attack') + g('Strength'), g('Magic') * 2, g('Ranged') * 2);
    return Math.floor((1.3 * base + g('Defence') + g('Constitution') + Math.floor(g('Prayer') / 2) + Math.floor(g('Summoning') / 2)) / 4) + 1;
  }
  return 0;
}

export function meetsRequirements(profile: PlayerProfile | null, reqString: string): { met: boolean; details: { skill: string; required: number; actual: number; met: boolean }[] } {
  if (!profile) return { met: false, details: [] };
  if (!reqString || reqString === 'None' || reqString === 'none') return { met: true, details: [] };

  const reqs = reqString.split(/[,&]/);
  const details: { skill: string; required: number; actual: number; met: boolean }[] = [];
  let allMet = true;

  for (const req of reqs) {
    const match = req.trim().match(/(\d+)\+?\s+(\w[\w\s]*)/);
    if (match) {
      const required = parseInt(match[1]);
      const skill = match[2].trim();
      const actual = getSkillLevel(profile, skill);
      const met = actual >= required;
      if (!met) allMet = false;
      details.push({ skill, required, actual, met });
    }
  }

  return { met: allMet, details };
}
