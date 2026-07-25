import { useState, useMemo, useEffect, useCallback } from 'react';
import { skills, getF2PSkills, getMembersSkills } from './data/skills';
import type { Skill, SkillCategory } from './data/skills';
import SkillCard from './components/SkillCard';
import SkillDetail from './components/SkillDetail';
import XPCalculator from './components/XPCalculator';
import SearchBar from './components/SearchBar';
import MoneyMakingGuide from './components/MoneyMakingGuide';
import QuestGuide from './components/QuestGuide';
import { fetchAllPrices, getCacheAge, getCacheTimestamp } from './services/priceService';
import type { PriceCache } from './services/priceService';
import { getActiveProfile, getAllProfiles, saveProfile, deleteProfile, setActiveProfileName, buildProfile, getDefaultLevels, ALL_SKILLS } from './services/playerService';
import type { PlayerProfile } from './services/playerService';

type MainSection = 'skills' | 'money' | 'quests';
type SkillTab = 'free' | 'members';
type CategoryFilter = 'All' | SkillCategory;

const categories: CategoryFilter[] = ['All', 'Combat', 'Gathering', 'Artisan', 'Support', 'Elite'];
const categoryIcons: Record<string, string> = { All: '🌟', Combat: '⚔️', Gathering: '⛏️', Artisan: '🔨', Support: '🏃', Elite: '⚙️' };

function App() {
  const [section, setSection] = useState<MainSection>('skills');
  const [mainTab, setMainTab] = useState<SkillTab>('free');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);

  // Prices
  const [prices, setPrices] = useState<PriceCache>({});
  const [priceStatus, setPriceStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [priceProgress, setPriceProgress] = useState({ done: 0, total: 0 });
  const [cacheAge, setCacheAge] = useState(getCacheAge());
  const [showPriceBanner, setShowPriceBanner] = useState(false);

  // Player profiles
  const [profile, setProfile] = useState<PlayerProfile | null>(getActiveProfile());
  const [allProfiles, setAllProfiles] = useState<PlayerProfile[]>(getAllProfiles());
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLevels, setEditLevels] = useState<Record<string, number>>(getDefaultLevels());
  const [profileError, setProfileError] = useState('');
  const [editingProfile, setEditingProfile] = useState<string | null>(null); // name of profile being edited

  useEffect(() => {
    const ts = getCacheTimestamp();
    if (!ts || Date.now() - new Date(ts).getTime() > 4 * 3600000) setShowPriceBanner(true);
    try { const c = localStorage.getItem('rs3_ge_prices'); if (c) setPrices(JSON.parse(c)); } catch { /* */ }
  }, []);

  const refreshPrices = useCallback(async () => {
    setPriceStatus('loading');
    try {
      const r = await fetchAllPrices((d, t) => setPriceProgress({ done: d, total: t }));
      setPrices(r); setPriceStatus('done'); setCacheAge(getCacheAge()); setShowPriceBanner(false);
      setTimeout(() => setPriceStatus('idle'), 3000);
    } catch { setPriceStatus('error'); setTimeout(() => setPriceStatus('idle'), 4000); }
  }, []);

  const handleSaveProfile = () => {
    const name = editName.trim();
    if (!name) { setProfileError('Enter a character name'); return; }
    if (name.length > 12) { setProfileError('RSN can\'t exceed 12 characters'); return; }
    const p = buildProfile(name, editLevels);
    const result = saveProfile(p);
    if (!result.ok) { setProfileError(result.error ?? 'Failed'); return; }
    setProfile(p);
    setAllProfiles(getAllProfiles());
    setProfileError('');
    setEditingProfile(null);
    setEditName('');
    setEditLevels(getDefaultLevels());
  };

  const handleSwitchProfile = (name: string) => {
    setActiveProfileName(name);
    setProfile(getActiveProfile());
  };

  const handleDeleteProfile = (name: string) => {
    deleteProfile(name);
    setAllProfiles(getAllProfiles());
    setProfile(getActiveProfile());
  };

  const startEditProfile = (p: PlayerProfile) => {
    setEditingProfile(p.name);
    setEditName(p.name);
    const levels: Record<string, number> = {};
    ALL_SKILLS.forEach(s => { levels[s] = p.skills[s]?.level ?? 1; });
    setEditLevels(levels);
  };

  const startNewProfile = () => {
    setEditingProfile('__new__');
    setEditName('');
    setEditLevels(getDefaultLevels());
    setProfileError('');
  };

  // Skills
  const filteredSkills = useMemo(() => {
    const b = mainTab === 'free' ? getF2PSkills() : getMembersSkills();
    return b.filter(s => {
      const mc = categoryFilter === 'All' || s.category === categoryFilter;
      const ms = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return mc && ms;
    });
  }, [mainTab, categoryFilter, searchQuery]);

  const availCats = useMemo(() => {
    const b = mainTab === 'free' ? getF2PSkills() : getMembersSkills();
    const cats = new Set(b.map(s => s.category));
    return categories.filter(c => c === 'All' || cats.has(c as SkillCategory));
  }, [mainTab]);

  const handleSectionChange = (s: MainSection) => { setSection(s); setSelectedSkill(null); setSearchQuery(''); setCategoryFilter('All'); };

  return (
    <div className="min-h-screen bg-aurora-deep text-gray-200">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px] aurora-glow-1" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[100px] aurora-glow-2" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[130px] aurora-glow-3" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      {/* Price banners */}
      {showPriceBanner && priceStatus !== 'loading' && (
        <div className="relative bg-gradient-to-r from-cyan-900/20 to-violet-900/20 border-b border-cyan-500/15">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm"><span className="text-cyan-400">📡</span><span className="text-cyan-200/80">Market prices may be outdated.</span><span className="text-cyan-500/40 text-xs">Last: {cacheAge}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={refreshPrices} className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-medium border border-cyan-500/20 cursor-pointer transition-colors">Refresh Now</button>
              <button onClick={() => setShowPriceBanner(false)} className="text-cyan-500/30 hover:text-cyan-400 cursor-pointer p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}
      {priceStatus === 'loading' && (
        <div className="relative bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-blue-500/15">
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="text-cyan-200/70">Fetching GE prices…</span><span className="text-cyan-400 font-mono text-xs">{priceProgress.done}/{priceProgress.total}</span></div>
            <div className="mt-1.5 h-1 bg-blue-900/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${priceProgress.total > 0 ? (priceProgress.done / priceProgress.total) * 100 : 0}%` }} /></div>
          </div>
        </div>
      )}
      {priceStatus === 'done' && <div className="relative bg-emerald-900/15 border-b border-emerald-500/15"><div className="max-w-7xl mx-auto px-4 py-2 text-sm flex items-center gap-2"><span className="text-emerald-400">✅</span><span className="text-emerald-300/70">Prices updated — saved offline.</span></div></div>}
      {priceStatus === 'error' && <div className="relative bg-red-900/15 border-b border-red-500/15"><div className="max-w-7xl mx-auto px-4 py-2 text-sm flex items-center gap-2"><span>⚠️</span><span className="text-red-300/70">Some prices failed. Using cached data.</span></div></div>}

      {/* Header */}
      <header className="relative border-b border-aurora-border bg-aurora-deep/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20">📜</div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-cinzel aurora-text">RS3 Guide</h1>
                  <p className="text-[10px] text-gray-500">{skills.length} Skills • Offline Reference</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowPlayerPanel(!showPlayerPanel); setEditingProfile(null); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${profile ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-aurora-card text-gray-500 border-aurora-border hover:text-white'}`}>
                  👤 {profile ? profile.name : 'Characters'}
                  {allProfiles.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">{allProfiles.length}/20</span>}
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 mr-1"><div className={`w-1.5 h-1.5 rounded-full ${Object.keys(prices).length > 0 ? 'bg-emerald-500' : 'bg-gray-600'}`} />{cacheAge}</div>
                <button onClick={refreshPrices} disabled={priceStatus === 'loading'} className="px-2.5 py-2 rounded-lg text-xs bg-aurora-card text-gray-500 border border-aurora-border hover:text-white hover:border-aurora-border-light transition-all cursor-pointer disabled:opacity-50">
                  <svg className={`w-3.5 h-3.5 ${priceStatus === 'loading' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => setShowCalculator(!showCalculator)} className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${showCalculator ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-aurora-card text-gray-500 border-aurora-border hover:text-white'}`}>🧮</button>
              </div>
            </div>
            <nav className="flex gap-1 -mb-3">
              {([{ id: 'skills' as MainSection, label: 'Skills', icon: '⚡' }, { id: 'money' as MainSection, label: 'Money Making', icon: '💰' }, { id: 'quests' as MainSection, label: 'Quests', icon: '📜' }]).map(item => (
                <button key={item.id} onClick={() => handleSectionChange(item.id)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all cursor-pointer border-b-2 ${section === item.id ? 'bg-aurora-card text-cyan-400 border-cyan-500' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-aurora-card/50'}`}>
                  <span className="flex items-center gap-1.5"><span>{item.icon}</span><span>{item.label}</span></span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Player Panel */}
      {showPlayerPanel && (
        <div className="relative z-40">
          <div className="absolute inset-x-0 top-0 bg-aurora-base/95 backdrop-blur-xl border-b border-aurora-border shadow-xl shadow-black/30 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="flex items-start justify-between mb-4">
                <div><h3 className="text-lg font-bold text-white font-cinzel">👤 Characters ({allProfiles.length}/20)</h3><p className="text-xs text-gray-500 mt-0.5">Create up to 20 character profiles. Set your levels to filter money-making methods.</p></div>
                <button onClick={() => setShowPlayerPanel(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* Profile list */}
              {allProfiles.length > 0 && editingProfile === null && (
                <div className="mb-4 space-y-2">
                  {allProfiles.map(p => (
                    <div key={p.name} className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${profile?.name === p.name ? 'bg-violet-500/8 border-violet-500/20' : 'bg-aurora-card border-aurora-border'}`}>
                      <button onClick={() => handleSwitchProfile(p.name)} className="flex-1 text-left cursor-pointer min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm truncate">{p.name}</span>
                          {profile?.name === p.name && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Active</span>}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Total Level: {p.totalLevel}</p>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => startEditProfile(p)} className="text-xs text-cyan-500 hover:text-cyan-400 px-2 py-1 cursor-pointer">Edit</button>
                        <button onClick={() => handleDeleteProfile(p.name)} className="text-xs text-red-500/50 hover:text-red-400 px-2 py-1 cursor-pointer">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit form */}
              {editingProfile !== null ? (
                <div className="border border-aurora-border rounded-xl p-4 bg-aurora-deep">
                  <h4 className="text-sm font-semibold text-white mb-3">{editingProfile === '__new__' ? 'New Character' : `Edit: ${editingProfile}`}</h4>
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 block mb-1">Character Name (RSN)</label>
                    <input type="text" maxLength={12} value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g. Guttenchat" className="w-full sm:w-64 bg-aurora-card border border-aurora-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Set your skill levels:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 mb-3">
                    {ALL_SKILLS.map(s => (
                      <div key={s}>
                        <label className="text-[9px] text-gray-500 block mb-0.5 truncate">{s}</label>
                        <input type="number" min={1} max={120} value={editLevels[s] ?? 1} onChange={e => setEditLevels(prev => ({ ...prev, [s]: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) }))} className="bg-aurora-card border border-aurora-border rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-cyan-500/40" />
                      </div>
                    ))}
                  </div>
                  {profileError && <p className="text-xs text-red-400 mb-2">⚠ {profileError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-medium cursor-pointer hover:from-cyan-500 hover:to-violet-500 transition-all">Save Character</button>
                    <button onClick={() => { setEditingProfile(null); setProfileError(''); }} className="px-4 py-2 rounded-lg bg-aurora-card border border-aurora-border text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={startNewProfile} disabled={allProfiles.length >= 20} className="px-4 py-2 rounded-lg bg-aurora-card border border-aurora-border text-cyan-400 text-sm font-medium cursor-pointer hover:border-cyan-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+ Add Character</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {showCalculator && <div className="mb-6 animate-fadeIn"><XPCalculator /></div>}
        {section === 'money' && <MoneyMakingGuide prices={prices} profile={profile} />}
        {section === 'quests' && <QuestGuide />}
        {section === 'skills' && (
          <>
            {selectedSkill ? <SkillDetail skill={selectedSkill} onBack={() => setSelectedSkill(null)} /> : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex bg-aurora-deep rounded-xl p-1 border border-aurora-border">
                    <button onClick={() => { setMainTab('free'); setCategoryFilter('All'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${mainTab === 'free' ? 'bg-emerald-600/12 text-emerald-400 border border-emerald-500/25' : 'text-gray-400 hover:text-white'}`}><span className="flex items-center gap-2">🆓 F2P<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{getF2PSkills().length}</span></span></button>
                    <button onClick={() => { setMainTab('members'); setCategoryFilter('All'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${mainTab === 'members' ? 'bg-violet-600/12 text-violet-400 border border-violet-500/25' : 'text-gray-400 hover:text-white'}`}><span className="flex items-center gap-2">⭐ Members<span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">{getMembersSkills().length}</span></span></button>
                  </div>
                  <div className="w-full sm:w-64"><SearchBar value={searchQuery} onChange={setSearchQuery} /></div>
                </div>
                <div className={`rounded-xl p-4 mb-6 border aurora-shimmer ${mainTab === 'free' ? 'bg-emerald-500/[0.02] border-emerald-500/12' : 'bg-violet-500/[0.02] border-violet-500/12'}`}>
                  {mainTab === 'free' ? <div><h2 className="text-base font-bold text-emerald-400 mb-1 font-cinzel">Free-to-Play Skills</h2><p className="text-sm text-gray-400">{getF2PSkills().length} skills available to all players. Train to max level.</p></div>
                  : <div><h2 className="text-base font-bold text-violet-400 mb-1 font-cinzel">Members-Only Skills</h2><p className="text-sm text-gray-400">{getMembersSkills().length} skills requiring membership. F2P capped at level 5 (Arch/Necro to 20).</p></div>}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {availCats.map(cat => <button key={cat} onClick={() => setCategoryFilter(cat)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${categoryFilter === cat ? 'bg-cyan-500/12 text-cyan-400 border border-cyan-500/25' : 'bg-aurora-card text-gray-400 border border-aurora-border hover:text-white'}`}><span>{categoryIcons[cat]}</span>{cat}</button>)}
                </div>
                <p className="text-xs text-gray-600 mb-3">Showing {filteredSkills.length} of {(mainTab === 'free' ? getF2PSkills() : getMembersSkills()).length} skills</p>
                {filteredSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filteredSkills.map(skill => <SkillCard key={skill.name} skill={skill} onSelect={setSelectedSkill} />)}</div>
                ) : <div className="text-center py-16"><div className="text-4xl mb-4">🔍</div><h3 className="text-lg font-semibold text-gray-300">No skills found</h3></div>}
                <div className="mt-10 mb-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4 font-cinzel flex items-center gap-2"><span>📋</span> XP Milestones</h3>
                  <div className="overflow-x-auto rounded-xl border border-aurora-border">
                    <table className="w-full text-sm"><thead><tr className="bg-aurora-card text-gray-300"><th className="text-left p-3 font-semibold">Level</th><th className="text-left p-3 font-semibold">Total XP</th><th className="text-left p-3 font-semibold">XP to Next</th></tr></thead>
                    <tbody>{[{l:1,x:0},{l:10,x:1154},{l:20,x:4470},{l:30,x:13363},{l:40,x:37224},{l:50,x:101333},{l:60,x:273742},{l:70,x:737627},{l:80,x:1986068},{l:90,x:5346332},{l:92,x:6517253},{l:99,x:13034431},{l:110,x:38737661},{l:120,x:104273167}].map((r,i,a)=><tr key={r.l} className={`border-t border-aurora-border hover:bg-cyan-500/[0.02] ${i%2===0?'bg-aurora-deep':'bg-aurora-base'}`}><td className="p-3 text-cyan-400 font-bold">{r.l}</td><td className="p-3 text-white font-mono">{r.x.toLocaleString()}</td><td className="p-3 text-gray-500 font-mono">{i<a.length-1?`+${(a[i+1].x-r.x).toLocaleString()}`:'—'}</td></tr>)}</tbody></table>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Level 92 is halfway to 99. Max XP: 200,000,000.</p>
                </div>
                <div className="mt-8 border-t border-aurora-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-aurora-card rounded-xl p-4 border border-aurora-border"><h4 className="text-cyan-400 font-semibold mb-2">⚡ XP Boosting</h4><ul className="space-y-1 text-xs text-gray-400"><li>• Double XP Weekends (quarterly)</li><li>• Skill outfits (6%)</li><li>• Clan Avatar (3-6%)</li><li>• Pulse Cores</li></ul></div>
                  <div className="bg-aurora-card rounded-xl p-4 border border-aurora-border"><h4 className="text-cyan-400 font-semibold mb-2">🎯 Priority</h4><ul className="space-y-1 text-xs text-gray-400"><li>• Combat → Slayer access</li><li>• Prayer 43+ (protection)</li><li>• Herblore 96+ (Overloads)</li><li>• Invention (gear perks)</li></ul></div>
                  <div className="bg-aurora-card rounded-xl p-4 border border-aurora-border"><h4 className="text-cyan-400 font-semibold mb-2">💰 Profitable</h4><ul className="space-y-1 text-xs text-gray-400"><li>• Slayer (best money)</li><li>• Runecrafting (blood/soul)</li><li>• Mining & Smithing</li><li>• Farming herb runs</li></ul></div>
                </div>
              </>
            )}
          </>
        )}
        <footer className="mt-8 text-center text-xs text-gray-600 pb-6 border-t border-aurora-border pt-4">
          <p>Created by <a href="https://github.com/djsaintg" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">djsaintg</a> • Built by <a href="https://www.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-400">Claude (Anthropic)</a></p>
          <p className="mt-1">Data from <a href="https://runescape.wiki/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-400">runescape.wiki</a> • Prices via <a href="https://api.weirdgloop.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-400">WeirdGloop API</a> • Map by <a href="https://mejrs.github.io/rs3/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-400">mejrs</a></p>
          <p className="mt-1">RuneScape ® is a trademark of Jagex Ltd. This is an unofficial fan-made guide.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
