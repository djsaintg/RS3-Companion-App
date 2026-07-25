import { useState } from 'react';

const xpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(xp / 4);
};

export default function XPCalculator() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(99);
  const [xpPerAction, setXpPerAction] = useState(100);

  const currentXP = xpForLevel(currentLevel);
  const targetXP = xpForLevel(targetLevel);
  const xpNeeded = Math.max(0, targetXP - currentXP);
  const actionsNeeded = xpPerAction > 0 ? Math.ceil(xpNeeded / xpPerAction) : 0;

  return (
    <div className="bg-aurora-card border border-aurora-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2 font-cinzel"><span className="text-xl">🧮</span> XP Calculator</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-medium">Current Level</label>
          <input type="number" min={1} max={119} value={currentLevel} onChange={(e) => setCurrentLevel(Math.min(119, Math.max(1, parseInt(e.target.value) || 1)))} className="w-full bg-aurora-deep border border-aurora-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-medium">Target Level</label>
          <input type="number" min={2} max={120} value={targetLevel} onChange={(e) => setTargetLevel(Math.min(120, Math.max(2, parseInt(e.target.value) || 2)))} className="w-full bg-aurora-deep border border-aurora-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-medium">XP per Action</label>
          <input type="number" min={1} value={xpPerAction} onChange={(e) => setXpPerAction(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-aurora-deep border border-aurora-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-aurora-deep rounded-lg p-3 border border-aurora-border"><div className="text-xs text-gray-500 mb-1">Current XP</div><div className="text-cyan-400 font-mono text-sm font-bold">{currentXP.toLocaleString()}</div></div>
        <div className="bg-aurora-deep rounded-lg p-3 border border-aurora-border"><div className="text-xs text-gray-500 mb-1">Target XP</div><div className="text-cyan-400 font-mono text-sm font-bold">{targetXP.toLocaleString()}</div></div>
        <div className="bg-aurora-deep rounded-lg p-3 border border-aurora-border"><div className="text-xs text-gray-500 mb-1">XP Remaining</div><div className="text-emerald-400 font-mono text-sm font-bold">{xpNeeded.toLocaleString()}</div></div>
        <div className="bg-aurora-deep rounded-lg p-3 border border-aurora-border"><div className="text-xs text-gray-500 mb-1">Actions Needed</div><div className="text-violet-400 font-mono text-sm font-bold">{actionsNeeded.toLocaleString()}</div></div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Level {currentLevel}</span><span>{((currentXP / targetXP) * 100).toFixed(1)}%</span><span>Level {targetLevel}</span></div>
        <div className="h-2.5 bg-aurora-deep rounded-full overflow-hidden border border-aurora-border">
          <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-600 via-violet-500 to-cyan-400" style={{ width: `${Math.min(100, (currentXP / targetXP) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
