import { useEffect, useMemo, useState } from 'react';
import { quests as detailedQuests } from '../data/quests';
import type { Quest, QuestDifficulty } from '../data/quests';
import { getCachedQuestCatalog, getQuestCatalogUpdatedAt, questWikiUrl, refreshQuestCatalog } from '../services/questCatalogService';
import type { QuestCatalogEntry } from '../services/questCatalogService';

type KindFilter = 'all' | 'quest' | 'miniquest';
type GuideQuest = Quest & { hasOfflineGuide: boolean };

const difficulties: ('All' | QuestDifficulty)[] = ['All', 'Novice', 'Intermediate', 'Experienced', 'Master', 'Grandmaster'];
const diffColors: Record<string, string> = {
  Novice: 'text-emerald-400 bg-emerald-500/10', Intermediate: 'text-cyan-400 bg-cyan-500/10',
  Experienced: 'text-yellow-400 bg-yellow-500/10', Master: 'text-orange-400 bg-orange-500/10',
  Grandmaster: 'text-red-400 bg-red-500/10', Special: 'text-violet-400 bg-violet-500/10',
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function catalogToQuest(entry: QuestCatalogEntry): GuideQuest {
  return {
    id: slug(entry.title), name: entry.title, membership: entry.membership,
    difficulty: entry.difficulty, questPoints: entry.questPoints,
    length: entry.kind === 'miniquest' ? 'Miniquest' : 'See quest journal', skills: [],
    rewards: ['See the in-game overview or embedded Wiki guide'],
    description: `${entry.kind === 'miniquest' ? 'Miniquest' : 'Quest'} catalogue entry from the official RuneMetrics list.`,
    startPoint: 'Use the embedded quick guide below for the verified start point and route.',
    walkthrough: [
      'Review the requirements and required-item table in the embedded quick guide.',
      'Set the activity active in the in-game Quest List to mark its starting area on your world map.',
      'Follow the embedded guide here and use the in-game journal to confirm each stage.',
      'Return here after completion and continue with the next entry in its series.',
    ],
    tips: [
      'The Wiki guide stays inside this window, so a separate tab is not required.',
      'The catalogue itself is cached offline after the first successful refresh.',
    ],
    kind: entry.kind, hasOfflineGuide: false,
  };
}

export default function QuestGuide() {
  const [tab, setTab] = useState<'free' | 'members'>('free');
  const [kind, setKind] = useState<KindFilter>('all');
  const [diff, setDiff] = useState<'All' | QuestDifficulty>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GuideQuest | null>(null);
  const [catalog, setCatalog] = useState<QuestCatalogEntry[]>(getCachedQuestCatalog());
  const [catalogStatus, setCatalogStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [showEmbeddedGuide, setShowEmbeddedGuide] = useState(true);

  const loadCatalog = async () => {
    setCatalogStatus('loading');
    try { setCatalog(await refreshQuestCatalog()); setCatalogStatus('idle'); }
    catch { setCatalogStatus('error'); }
  };

  useEffect(() => { if (catalog.length === 0) void loadCatalog(); }, []);

  const allQuests = useMemo<GuideQuest[]>(() => {
    const detailed = new Map(detailedQuests.map(q => [
      q.name.toLowerCase(), { ...q, kind: q.kind ?? 'quest', hasOfflineGuide: true } as GuideQuest,
    ]));
    if (!catalog.length) return [...detailed.values()];
    return catalog.map(entry => detailed.get(entry.title.toLowerCase()) ?? catalogToQuest(entry));
  }, [catalog]);

  const counts = useMemo(() => ({
    total: allQuests.length,
    free: allQuests.filter(q => q.membership === 'free').length,
    members: allQuests.filter(q => q.membership === 'members').length,
    quests: allQuests.filter(q => (q.kind ?? 'quest') === 'quest').length,
    miniquests: allQuests.filter(q => q.kind === 'miniquest').length,
  }), [allQuests]);

  const filtered = useMemo(() => allQuests.filter(q => {
    const query = search.toLowerCase();
    return q.membership === tab && (kind === 'all' || (q.kind ?? 'quest') === kind) &&
      (diff === 'All' || q.difficulty === diff) &&
      (!query || q.name.toLowerCase().includes(query) || q.description.toLowerCase().includes(query) || q.seriesTag?.toLowerCase().includes(query));
  }), [allQuests, tab, kind, diff, search]);

  const updatedAt = getQuestCatalogUpdatedAt();

  if (selected) {
    return (
      <div className="animate-fadeIn">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-4 group cursor-pointer">
          <span className="group-hover:-translate-x-1 transition-transform">←</span><span className="text-sm">Back to all {counts.total} entries</span>
        </button>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl shrink-0">{selected.kind === 'miniquest' ? '🧭' : '📜'}</div>
          <div>
            <h2 className="text-2xl font-bold text-white font-cinzel">{selected.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className={`text-xs px-3 py-1 rounded-full ${selected.membership === 'free' ? 'bg-emerald-500/12 text-emerald-400' : 'bg-violet-500/12 text-violet-400'}`}>{selected.membership === 'free' ? 'F2P' : 'Members'}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${diffColors[selected.difficulty]}`}>{selected.difficulty}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300">{selected.kind === 'miniquest' ? 'Miniquest' : `${selected.questPoints} QP`}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${selected.hasOfflineGuide ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>{selected.hasOfflineGuide ? 'Full offline guide' : 'Embedded quick guide'}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-4">{selected.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-aurora-card border border-aurora-border rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Start Point</div><div className="text-sm text-white">{selected.startPoint}</div></div>
          <div className="bg-aurora-card border border-aurora-border rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Requirements</div><div className="text-sm text-white">{selected.skills.length ? selected.skills.join(', ') : 'See embedded guide'}</div></div>
        </div>
        <h3 className="text-lg font-bold text-cyan-400 mb-3 font-cinzel">Walkthrough</h3>
        <ol className="space-y-2 mb-6">
          {selected.walkthrough.map((step, i) => <li key={i} className="flex gap-3 bg-aurora-card border border-aurora-border rounded-lg p-3"><span className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span><span className="text-gray-300 text-sm leading-relaxed">{step}</span></li>)}
        </ol>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button onClick={() => setShowEmbeddedGuide(!showEmbeddedGuide)} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs cursor-pointer">{showEmbeddedGuide ? 'Hide' : 'Show'} Wiki quick guide</button>
          <span className="text-[10px] text-gray-600">Loaded inline; uncached pages require internet.</span>
        </div>
        {showEmbeddedGuide && <div className="rounded-xl overflow-hidden border border-aurora-border bg-white mb-6"><iframe src={questWikiUrl(selected.name, true)} title={`${selected.name} quick guide`} className="w-full h-[650px]" sandbox="allow-scripts allow-same-origin allow-popups" /></div>}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl p-4 mb-5 border border-violet-500/15 bg-violet-500/[0.025] aurora-shimmer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div><h2 className="text-base font-bold text-violet-400 font-cinzel">Complete Quest Catalogue</h2><p className="text-sm text-gray-400 mt-1">{counts.total} in-game entries: {counts.quests} quests and {counts.miniquests} miniquests. Bundled detailed guides are preserved; every other entry has an inline Wiki quick guide.</p>{updatedAt && <p className="text-[10px] text-gray-600 mt-1">Catalogue cached {new Date(updatedAt).toLocaleString()} for offline listing.</p>}</div>
          <button onClick={loadCatalog} disabled={catalogStatus === 'loading'} className="shrink-0 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs cursor-pointer disabled:opacity-50">{catalogStatus === 'loading' ? 'Refreshing…' : 'Refresh 332-entry catalogue'}</button>
        </div>
        {catalogStatus === 'error' && <p className="text-xs text-red-400 mt-2">Refresh failed. The saved offline catalogue remains available.</p>}
      </div>
      <div className="flex flex-col lg:flex-row gap-3 justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab('free')} className={`px-4 py-2 rounded-lg text-sm border cursor-pointer ${tab === 'free' ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25' : 'bg-aurora-card text-gray-400 border-aurora-border'}`}>F2P ({counts.free})</button>
          <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-lg text-sm border cursor-pointer ${tab === 'members' ? 'bg-violet-500/12 text-violet-400 border-violet-500/25' : 'bg-aurora-card text-gray-400 border-aurora-border'}`}>Members ({counts.members})</button>
          {(['all', 'quest', 'miniquest'] as KindFilter[]).map(value => <button key={value} onClick={() => setKind(value)} className={`px-3 py-2 rounded-lg text-xs border cursor-pointer capitalize ${kind === value ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-aurora-card text-gray-500 border-aurora-border'}`}>{value === 'all' ? 'All types' : value}</button>)}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all quests…" className="w-full lg:w-72 bg-aurora-deep border border-aurora-border rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">{difficulties.map(value => <button key={value} onClick={() => setDiff(value)} className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer ${diff === value ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-aurora-card text-gray-500 border-aurora-border'}`}>{value}</button>)}</div>
      <p className="text-xs text-gray-600 mb-3">Showing {filtered.length} entries</p>
      <div className="grid gap-2">
        {filtered.map(q => <button key={`${q.kind}-${q.id}`} onClick={() => { setSelected(q); setShowEmbeddedGuide(!q.hasOfflineGuide); }} className="group bg-aurora-card border border-aurora-border rounded-xl p-3 text-left hover:border-violet-500/30 transition-all cursor-pointer w-full"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-violet-500/8 border border-violet-500/15 flex items-center justify-center shrink-0">{q.kind === 'miniquest' ? '🧭' : '📜'}</div><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-white font-semibold text-sm">{q.name}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full ${diffColors[q.difficulty]}`}>{q.difficulty}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{q.kind === 'miniquest' ? 'Miniquest' : `${q.questPoints} QP`}</span>{q.hasOfflineGuide && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Offline guide</span>}</div><p className="text-[11px] text-gray-500 mt-1 truncate">{q.description}</p></div><span className="text-gray-600 group-hover:text-violet-400">›</span></div></button>)}
      </div>
    </>
  );
}