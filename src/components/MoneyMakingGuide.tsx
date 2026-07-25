import { useState, useMemo } from 'react';
import { getF2PMethods, getMembersMethods } from '../data/moneyMaking';
import type { MoneyMethod, MoneyCategory } from '../data/moneyMaking';
import { getPrice, formatGp } from '../services/priceService';
import { meetsRequirements } from '../services/playerService';
import type { PriceCache } from '../services/priceService';
import type { PlayerProfile } from '../services/playerService';

const categories: ('All' | MoneyCategory)[] = ['All', 'Combat', 'Skilling', 'Gathering', 'Processing', 'Daily', 'Other'];
const catIcons: Record<string, string> = { All: '🌟', Combat: '⚔️', Skilling: '📊', Gathering: '⛏️', Processing: '🔧', Daily: '📅', Other: '💡' };

interface Props {
  prices: PriceCache;
  profile: PlayerProfile | null;
}

export default function MoneyMakingGuide({ prices, profile }: Props) {
  const [tab, setTab] = useState<'free' | 'members'>('free');
  const [cat, setCat] = useState<'All' | MoneyCategory>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MoneyMethod | null>(null);
  const [sortBy, setSortBy] = useState<'profit' | 'name' | 'intensity'>('profit');
  const [filterByPlayer, setFilterByPlayer] = useState(true);

  const base = tab === 'free' ? getF2PMethods() : getMembersMethods();

  const filtered = useMemo(() => {
    let list = base.filter(m => {
      const mc = cat === 'All' || m.category === cat;
      const ms = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
      const mp = !filterByPlayer || !profile || meetsRequirements(profile, m.skills).met;
      return mc && ms && mp;
    });
    if (sortBy === 'profit') list = [...list].sort((a, b) => b.gpPerHourHigh - a.gpPerHourHigh);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => ({ Low: 0, Medium: 1, High: 2 }[a.intensity] - { Low: 0, Medium: 1, High: 2 }[b.intensity]));
    return list;
  }, [base, cat, search, sortBy, filterByPlayer, profile]);

  const availCats = useMemo(() => {
    const s = new Set(base.map(m => m.category));
    return categories.filter(c => c === 'All' || s.has(c as MoneyCategory));
  }, [base]);

  const totalUnfiltered = base.filter(m => {
    const mc = cat === 'All' || m.category === cat;
    const ms = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }).length;

  const livePrice = (item: string) => prices[item]?.price ?? getPrice(item);

  if (selected) {
    const reqResult = profile ? meetsRequirements(profile, selected.skills) : null;
    return (
      <div className="animate-fadeIn">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4 group cursor-pointer">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="text-sm font-medium">Back to Methods</span>
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0">💰</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white font-cinzel">{selected.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selected.membership === 'free' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-violet-500/15 text-violet-400'}`}>
                {selected.membership === 'free' ? '🆓 F2P' : '⭐ Members'}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-semibold">{selected.category}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">{selected.gpPerHour} GP/hr</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selected.intensity === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : selected.intensity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{selected.intensity} Intensity</span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{selected.description}</p>

        {/* Player Requirements Check */}
        {reqResult && reqResult.details.length > 0 && (
          <div className={`rounded-xl p-3 mb-4 border ${reqResult.met ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
              <span>{reqResult.met ? '✅' : '❌'}</span>
              <span className={reqResult.met ? 'text-emerald-400' : 'text-red-400'}>
                {reqResult.met ? `${profile!.name} meets all requirements!` : `${profile!.name} doesn't meet all requirements`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reqResult.details.map((d, i) => (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-lg font-mono ${d.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {d.skill}: {d.actual}/{d.required} {d.met ? '✓' : '✗'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-6">
          <span><span className="text-gray-500">Skills:</span> {selected.skills}</span>
          <span><span className="text-gray-500">Quests:</span> {selected.questReqs}</span>
        </div>

        {/* Steps */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-3 font-cinzel flex items-center gap-2"><span>📝</span> Step-by-Step</h3>
          <ol className="space-y-2">
            {selected.steps.map((s, i) => (
              <li key={i} className="flex gap-3 bg-aurora-card border border-aurora-border rounded-lg p-3 hover:border-cyan-500/15 transition-colors">
                <span className="w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-300 text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Live Prices */}
        {selected.drops.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 font-cinzel flex items-center gap-2"><span>📈</span> Items & Live GE Prices</h3>
            <div className="overflow-x-auto rounded-xl border border-aurora-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-aurora-card text-gray-300">
                  <th className="text-left p-3 font-semibold">Item</th>
                  <th className="text-left p-3 font-semibold">Qty / Hour</th>
                  <th className="text-left p-3 font-semibold">GE Price</th>
                  <th className="text-left p-3 font-semibold">Est. Revenue</th>
                </tr></thead>
                <tbody>
                  {selected.drops.map((d, i) => {
                    const p = livePrice(d.item);
                    const isInput = d.qtyPerHour.startsWith('Input');
                    const qtyMatch = d.qtyPerHour.match(/(\d[\d,]*)/);
                    const qty = qtyMatch ? parseInt(qtyMatch[1].replace(/,/g, '')) : null;
                    const rev = p && qty ? p * qty : null;
                    return (
                      <tr key={i} className={`border-t border-aurora-border hover:bg-cyan-500/[0.03] ${i % 2 === 0 ? 'bg-aurora-deep' : 'bg-aurora-base'}`}>
                        <td className="p-3 text-white font-medium">
                          <a href={`https://runescape.wiki/w/${d.item.replace(/ /g, '_')}`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">{d.item}</a>
                        </td>
                        <td className="p-3 text-gray-400 font-mono text-xs">{d.qtyPerHour}</td>
                        <td className="p-3">{p ? <span className="text-emerald-400 font-mono text-xs">{formatGp(p)} gp</span> : <span className="text-gray-600 text-xs">—</span>}</td>
                        <td className="p-3">{rev ? <span className={`font-mono text-xs font-bold ${isInput ? 'text-red-400' : 'text-emerald-400'}`}>{isInput ? '-' : ''}{formatGp(rev)}</span> : <span className="text-gray-600 text-xs">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">Prices from Grand Exchange API • Refresh via header button</p>
          </div>
        )}

        {/* Tips */}
        <div>
          <h3 className="text-lg font-bold text-cyan-400 mb-3 font-cinzel flex items-center gap-2"><span>💡</span> Tips</h3>
          <div className="grid gap-2">
            {selected.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-aurora-card border border-aurora-border rounded-lg p-3">
                <span className="text-cyan-500 mt-0.5 shrink-0">▸</span><span className="text-gray-300 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-aurora-deep rounded-xl p-1 border border-aurora-border">
          <button onClick={() => { setTab('free'); setCat('All'); setSearch(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'free' ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/25' : 'text-gray-400 hover:text-white'}`}>
            <span className="flex items-center gap-2">🆓 F2P <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{getF2PMethods().length}</span></span>
          </button>
          <button onClick={() => { setTab('members'); setCat('All'); setSearch(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'members' ? 'bg-violet-600/15 text-violet-400 border border-violet-500/25' : 'text-gray-400 hover:text-white'}`}>
            <span className="flex items-center gap-2">⭐ Members <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">{getMembersMethods().length}</span></span>
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search methods..." className="w-full bg-aurora-deep border border-aurora-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/40 transition-colors" />
        </div>
      </div>

      {/* Description */}
      <div className={`rounded-xl p-4 mb-6 border ${tab === 'free' ? 'bg-emerald-500/[0.03] border-emerald-500/15' : 'bg-violet-500/[0.03] border-violet-500/15'}`}>
        {tab === 'free' ? (
          <div><h2 className="text-base font-bold text-emerald-400 mb-1 font-cinzel">F2P Money Making</h2><p className="text-sm text-gray-400">Methods available without membership. Great for building capital or earning a bond.</p></div>
        ) : (
          <div><h2 className="text-base font-bold text-violet-400 mb-1 font-cinzel">Members Money Making</h2><p className="text-sm text-gray-400">Members-only methods with significantly higher profit potential — many earn 5-40M+ GP/hr.</p></div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {availCats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${cat === c ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'bg-aurora-card text-gray-400 border border-aurora-border hover:text-white hover:border-aurora-border-light'}`}>
            <span>{catIcons[c]}</span>{c}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {profile && (
            <button onClick={() => setFilterByPlayer(!filterByPlayer)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${filterByPlayer ? 'bg-violet-500/15 text-violet-400 border-violet-500/25' : 'bg-aurora-card text-gray-500 border-aurora-border'}`}>
              👤 {filterByPlayer ? `For ${profile.name}` : 'Show All'}
            </button>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'profit'|'name'|'intensity')} className="bg-aurora-deep border border-aurora-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/40 cursor-pointer">
            <option value="profit">Highest Profit</option>
            <option value="name">Name</option>
            <option value="intensity">Easiest First</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Showing {filtered.length}{profile && filterByPlayer ? ` of ${totalUnfiltered} (filtered for ${profile.name})` : ''} methods
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map(m => {
            const reqRes = profile ? meetsRequirements(profile, m.skills) : null;
            return (
              <button key={m.id} onClick={() => setSelected(m)} className="group bg-aurora-card border border-aurora-border rounded-xl p-4 text-left hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer w-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">💰</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{m.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">{m.category}</span>
                      {reqRes && !reqRes.met && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">⚠ Reqs not met</span>}
                      {reqRes && reqRes.met && reqRes.details.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">✓ Qualified</span>}
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">{m.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">{m.gpPerHour} GP/hr</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.intensity === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : m.intensity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{m.intensity} effort</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/8 text-cyan-400">{m.skills}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">{profile && filterByPlayer ? `No methods match ${profile.name}'s skills` : 'No methods found'}</h3>
          <p className="text-sm text-gray-500">{profile && filterByPlayer ? 'Try disabling the player filter or leveling up!' : 'Try adjusting your search or filters'}</p>
          {profile && filterByPlayer && <button onClick={() => setFilterByPlayer(false)} className="mt-3 px-4 py-2 rounded-lg bg-aurora-card border border-aurora-border text-cyan-400 text-sm cursor-pointer hover:border-cyan-500/30 transition-colors">Show All Methods</button>}
        </div>
      )}
    </>
  );
}
