import { useState } from 'react';
import type { Skill, TrainingMethod } from '../data/skills';

interface SkillDetailProps {
  skill: Skill;
  onBack: () => void;
}

function LocationBlock({ method }: { method: TrainingMethod }) {
  const [expanded, setExpanded] = useState(true);

  if (!method.location) return null;

  return (
    <div className="mt-1.5">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors">
        <span>📍</span>
        <span className="underline decoration-cyan-500/30 underline-offset-2">{expanded ? 'Hide location' : 'Show location'}</span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="mt-1 text-[11px] text-cyan-200/70 bg-cyan-500/[0.04] border border-cyan-500/10 rounded-lg px-2.5 py-2 leading-relaxed">
          📍 {method.location}
        </div>
      )}
    </div>
  );
}

export default function SkillDetail({ skill, onBack }: SkillDetailProps) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4 group cursor-pointer">
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="text-sm font-medium">Back to Skills</span>
      </button>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${skill.color}15`, border: `2px solid ${skill.color}40` }}>{skill.icon}</div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-cinzel">{skill.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider" style={{ background: `${skill.color}15`, color: skill.color }}>{skill.category}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${skill.membership === 'free' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-violet-500/15 text-violet-400'}`}>{skill.membership === 'free' ? '🆓 Free-to-Play' : '⭐ Members Only'}</span>
            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-white/5 text-gray-300">Max: {skill.maxLevel}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">{skill.description}</p>

      {/* Map toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${showMap ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-aurora-card text-gray-500 border-aurora-border hover:text-white hover:border-aurora-border-light'}`}>
          🗺️ {showMap ? 'Hide World Map' : 'Show World Map'}
        </button>
        <span className="text-[10px] text-gray-600">Opens the RS Wiki interactive map inline</span>
      </div>

      {showMap && (
        <div className="mb-6 rounded-xl overflow-hidden border border-aurora-border animate-fadeIn">
          <iframe
            src="https://mejrs.github.io/rs3/"
            title="RS3 World Map"
            className="w-full h-[400px] md:h-[500px] bg-aurora-deep"
            sandbox="allow-scripts allow-same-origin"
          />
          <div className="bg-aurora-card px-3 py-1.5 text-[10px] text-gray-500 flex items-center justify-between">
            <span>RS3 Interactive Map — pan & zoom to find locations</span>
            <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-white cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {/* Training Methods — card layout for location visibility */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2 font-cinzel"><span className="text-xl">📊</span> Training Methods</h3>
        <div className="space-y-3">
          {skill.trainingMethods.map((method, index) => (
            <div key={index} className={`rounded-xl border border-aurora-border p-4 hover:border-cyan-500/15 transition-colors ${index % 2 === 0 ? 'bg-aurora-deep' : 'bg-aurora-card'}`}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold" style={{ background: `${skill.color}15`, color: skill.color }}>{method.levelRange}</span>
                <h4 className="text-white font-semibold text-sm">{method.method}</h4>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                <span className="text-emerald-400 font-mono">⚡ {method.xpPerHour} XP/hr</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  method.afk === 'Fully AFK' || method.afk === 'AFK' || method.afk === 'Fully Passive' ? 'bg-emerald-500/10 text-emerald-400' :
                  method.afk === 'Semi-AFK' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                }`}>{method.afk}</span>
                <span className={`${
                  method.cost === 'Free' ? 'text-emerald-400' : method.cost === 'Low' ? 'text-cyan-400' :
                  method.cost.includes('Medium') ? 'text-yellow-400' :
                  method.cost === 'Profit' || method.cost.includes('profitable') || method.cost.includes('Profit') ? 'text-emerald-400' : 'text-red-400'
                }`}>💰 {method.cost}</span>
              </div>
              {method.notes && <p className="text-gray-400 text-xs mb-1">{method.notes}</p>}

              {/* Location block — always visible, detailed */}
              <LocationBlock method={method} />
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2 font-cinzel"><span className="text-xl">💡</span> Pro Tips</h3>
        <div className="grid gap-2">
          {skill.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 bg-aurora-card border border-aurora-border rounded-lg p-3 hover:border-violet-500/15 transition-colors">
              <span className="text-cyan-500 mt-0.5 shrink-0">▸</span>
              <span className="text-gray-300 text-sm leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {skill.relatedSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2 font-cinzel"><span className="text-xl">🔗</span> Related Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skill.relatedSkills.map((related, index) => (
              <span key={index} className="text-sm px-3 py-1.5 rounded-lg bg-aurora-card border border-aurora-border text-gray-300">{related}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
