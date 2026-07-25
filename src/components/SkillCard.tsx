import type { Skill } from '../data/skills';

interface SkillCardProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
}

export default function SkillCard({ skill, onSelect }: SkillCardProps) {
  return (
    <button
      onClick={() => onSelect(skill)}
      className="group relative bg-aurora-card border border-aurora-border rounded-xl p-4 text-left transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer w-full"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${skill.color}12`, border: `1px solid ${skill.color}30` }}
        >
          {skill.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-base truncate">{skill.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${skill.color}12`, color: skill.color }}>{skill.category}</span>
            <span className="text-xs text-gray-500">Max: {skill.maxLevel}</span>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">{skill.description}</p>
    </button>
  );
}
