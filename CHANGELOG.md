# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Project by:** djsaintg (concept & direction) · Claude/Anthropic (development)

---

## [1.1.1] — 2026-07-25

### Added
- Added **GitHub Pages deployment** workflow for automatic live demo hosting.
- Added **screenshots** to the README (Skills, Money Making, Quest sections).
- Added **live demo link** and deployment status badge to README header.
- Included `package-lock.json` in the repository for reproducible builds.

---

## [1.1.0] — 2026-07-25

### Added
- Expanded the Quest section to the complete **332-entry RuneMetrics catalogue**.
- Added all **276 quests and 56 miniquests**, with exact miniquest classification.
- Added Quest, Miniquest, F2P, Members, difficulty, and full-text filters.
- Added automatic catalogue refresh through the RuneScape Wiki CORS proxy.
- Added persistent local catalogue caching for offline browsing after refresh.
- Added verified RuneScape Wiki quick guides in an inline iframe so guides stay in one window.
- Preserved the existing hand-authored offline walkthroughs and clearly labels them.

---

## [1.0.0] — 2025-07-25

### 🎉 Initial Release

#### ⚡ Skilling Guide
- Complete training guides for all **29 RS3 skills** (17 F2P + 12 Members)
- Training methods with level ranges, XP/hour, AFK rating, cost, and notes
- **Detailed inline location data** for every training method — includes directions, nearby banks, landmarks, and how to get there
- F2P vs Members tab separation with category filters (Combat, Gathering, Artisan, Support, Elite)
- **Embedded RS3 World Map** via iframe — toggle open/closed without leaving the page
- XP milestone reference table (levels 1–120)
- Searchable skill list

#### 💰 Money Making Guide
- **12 F2P methods** including: Killing Cows, Polar Kebbits, Mining Iron/Runite, Smithing Rune, Crafting Water Runes, Fishing Lobsters, Making Headless Arrows, High Alchemy, and more
- **15 Members methods** including: Herb Runs, Daily Vis Wax, Slayer, Blood/Soul Rune crafting, Incandescent Energy, Animica Mining, Elder Rune Bars, Red Chinchompas, Big Game Hunter, Necromancy Runes, and more
- Step-by-step guides for each method
- **Live Grand Exchange prices** via WeirdGloop API — tracks 70+ items
- Estimated revenue/hour calculated from live prices
- Prices cached in `localStorage` for offline use
- Sort by profit, name, or effort level
- Category and search filters

#### 👤 Character Profiles
- Save up to **20 character profiles** (matching Jagex account limit)
- Manual skill level entry for all 29 skills
- Switch between characters instantly
- Money-making methods **auto-filter** by active character's skill levels
- "Qualified" / "Requirements not met" badges on methods
- Detailed skill-check breakdown on method detail pages
- All profile data persisted in `localStorage`

#### 📜 Quest Guide
- **22 F2P quests** with full walkthroughs (Cook's Assistant through Shield of Arrav)
- **11 key Members quests** (Plague's End, Desert Treasure, The World Wakes, Temple at Senntisten, Smoking Kills, Lunar Diplomacy, While Guthix Sleeps, River of Blood, City of Senntisten, Curse of the Black Stone, Children of Mah)
- Skill requirements, Quest Points, difficulty ratings, quest length
- Step-by-step walkthrough for each quest
- Rewards and pro tips
- Difficulty filter and search
- Quest series tags (Elf Series, Mahjarrat Series, etc.)
- Link to full RS Wiki guide for each quest

#### 🧮 XP Calculator
- Calculate XP needed between any two levels (1–120)
- Actions needed based on XP per action
- Visual progress bar with percentage

#### 🌌 Design
- **Aurora borealis dark theme** — deep navy/black with animated cyan, violet, and emerald glow effects
- Cinzel serif font for headings (fantasy RPG feel)
- Responsive design for mobile and desktop
- Smooth fade-in animations
- Custom scrollbars matching the theme

#### 🛠️ Technical
- Single-file HTML build via `vite-plugin-singlefile` — works offline from a single file
- React 19 + Vite 7 + Tailwind CSS 4
- TypeScript throughout
- `launch_rs3skills.sh` one-click launcher for Linux/macOS
- Grand Exchange API integration with graceful offline fallback
