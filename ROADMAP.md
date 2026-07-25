# 🗺️ RS3 Companion App Roadmap

A living document tracking ideas, features, and improvements for future releases.

**Last Updated:** 2026-07-25  
**Current Version:** 1.1.1

---

## 🚀 Upcoming Features

### 1.0.0 - Jagex Event Tracker & Smart XP Calculations

**Priority:** High  
**Status:** Planning  
**Estimated Effort:** Medium

#### Overview
Since we already connect to the internet for GE price checks, add event detection to display current/ongoing Jagex events and automatically adjust XP calculations based on active event bonuses (e.g., Double XP Weekends).

#### Feature Details

**Event Detection:**
- Parse Jagex RSS feed: `https://secure.runescape.com/m=news/latest_news.rss`
- Monitor RuneScape Wiki DXP page: `https://runescape.wiki/w/Double_XP`
- Cache event data locally for 1 hour (reduce API calls)
- Display active events in a banner when detected

**Supported Event Types:**
- Double XP Weekends (Members: +100%, F2P: +20%)
- Bonus XP Weekends (variable multipliers)
- Holiday Events (Beach, Halloween, Christmas, Easter)
- Skill-specific events (e.g., "Smithing Week")
- Treasure Hunter promotions

**Smart XP Calculator Integration:**
- When an event is active, show an "Event XP" toggle in the XP Calculator
- Automatically multiply base XP rates by event bonus
- Display both normal and event XP rates side-by-side
- Add "Event-Adjusted Actions Needed" calculation
- Show event end date/countdown timer

**Money Making Integration:**
- Flag methods that are **disabled during events** (proteans, training dummies, MTX items)
- Highlight event-boosted methods with a special badge
- Show "Event Profit" estimates when applicable
- Add warning tooltips for MTX-dependent methods during DXP

**Technical Approach:**
```typescript
// Example service structure
interface JagexEvent {
  id: string;
  title: string;
  type: 'dxp' | 'bonus_xp' | 'holiday' | 'skill_specific' | 'promotion';
  startDate: Date;
  endDate: Date;
  xpMultiplier?: number; // 2.0 for DXP, 1.2 for F2P
  affectedSkills?: string[];
  disabledItems?: string[]; // Items disabled during event
  source: 'rss' | 'wiki' | 'manual';
}

// Event detection service
class EventService {
  async fetchEvents(): Promise<JagexEvent[]>
  getActiveEvents(): JagexEvent[]
  getNextPredictedDXP(): Date | null // Based on historical pattern
}
```

**Data Sources:**
1. **Primary:** Jagex RSS feed (official announcements)
2. **Secondary:** RuneScape Wiki (community-tracked events)
3. **Fallback:** Manual event calendar based on historical patterns (Feb/May/Aug/Nov)

**UI Implementation:**
- Small banner at top when event is active: "🎉 Double XP Weekend Active! Ends in 2d 14h"
- Event icon badge on affected skill cards
- Toggle in XP Calculator: "Include Event Bonuses"
- Warning badge on Money Making methods: "⚠️ Disabled during DXP"

**Challenges:**
- No official Jagex Events API (as of 2026)
- Events announced ~1 week before start
- Need to parse natural language from RSS/news
- Holiday events have variable dates

**Success Criteria:**
- [ ] Automatically detect Double XP Weekends within 24 hours of announcement
- [ ] Display active events prominently without user action
- [ ] XP Calculator shows event-adjusted calculations
- [ ] Money Making methods flag event-incompatible items
- [ ] Cache event data to minimize external requests

---

### 1.1.0 - Offline Quest Tracker

**Priority:** Medium  
**Status:** Idea  
**Estimated Effort:** Small

#### Overview
Add local quest completion tracking so players can mark quests as complete without relying on in-game state.

#### Feature Details
- localStorage-based quest completion state
- Checkboxes on quest cards
- Filter: "Show only incomplete quests"
- Export/import quest progress as JSON
- Sync between multiple character profiles

---

### 1.2.0 - Print-Friendly Mode

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Small

#### Overview
Add a print-optimized CSS mode so players can print specific guides for reference while playing.

#### Feature Details
- "Print Guide" button on skill detail pages
- Print-specific CSS (black text, white background, no animations)
- Include all training methods, locations, and tips
- Page breaks between sections
- QR code linking back to the live app

---

### 1.3.0 - Community Suggestions

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Small

#### Overview
Add a "Suggest a Method" button that opens a GitHub Issue template for community contributions.

#### Feature Details
- Pre-filled GitHub Issue templates for:
  - New money-making methods
  - Additional quest walkthroughs
  - Training method improvements
  - Bug reports
- Link to Discussions tab for general feedback
- "Report Issue" button in footer

---

### 1.4.0 - Old School RuneScape Support

**Priority:** Medium  
**Status:** Idea  
**Estimated Effort:** Large

#### Overview
Create a parallel data set for OSRS players, toggleable via a switch in the header.

#### Feature Details
- Separate OSRS data files (`skills-osrs.ts`, `quests-osrs.ts`)
- Toggle: "RS3" | "OSRS" in navigation
- OSRS-specific GE prices (via OSRS Wiki API)
- Different quest list (OSRS has ~160 quests vs RS3's 332)
- OSRS hiscores integration for character profiles
- Maintain single codebase, data-driven differences

---

### 1.5.0 - Mobile PWA (Progressive Web App)

**Priority:** Medium  
**Status:** Idea  
**Estimated Effort:** Medium

#### Overview
Add service worker and manifest.json so the app can be installed on mobile devices like a native app.

#### Feature Details
- `manifest.json` with app icons, theme colors
- Service worker for offline caching
- "Add to Home Screen" prompt
- Splash screen
- Push notifications for event announcements (optional)
- App store listing capability (iOS/Android)

---

### 1.6.0 - Advanced Character Profiles

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Small

#### Feature Details
- Import from RuneMetrics API (if CORS is resolved)
- Automatic skill level detection
- Profile sharing via URL (base64 encoded)
- Profile comparison tool
- XP goals tracker with progress bars
- "Time to Level" calculator based on current XP/hr

---

### 1.7.0 - Skill Synergy Visualizer

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Medium

#### Overview
Interactive graph showing how skills interconnect (e.g., Mining → Smithing → combat gear).

#### Feature Details
- Force-directed graph visualization (D3.js or similar)
- Click skill nodes to see training methods
- Highlight skill chains for specific goals (e.g., "Max combat" path)
- Show prerequisite quests for skill unlocks
- Export skill training plan as checklist

---

### 1.8.0 - Time Tracking

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Medium

#### Overview
Built-in timer to track actual time spent on training methods.

#### Feature Details
- Start/stop timer on training method cards
- Log actual XP gained per session
- Calculate real XP/hr vs theoretical
- Session history per character profile
- Export time logs as CSV

---

### 1.9.0 - Dark/Light Theme Toggle

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Small

#### Overview
Add theme switcher for users who prefer light mode or need accessibility options.

#### Feature Details
- Toggle button in header
- CSS custom properties for theming
- Respect system preference (`prefers-color-scheme`)
- Persist theme choice in localStorage
- High contrast mode option

---

### 2.0.0 - Multi-Language Support

**Priority:** Low  
**Status:** Idea  
**Estimated Effort:** Large

#### Overview
Internationalization (i18n) to support non-English RuneScape players.

#### Feature Details
- Language switcher (English, Portuguese, German, French, Spanish)
- Translation files for UI text
- Maintain English for proper nouns (skill names, item names)
- Community translation contributions
- RTL language support if needed

---

## 📊 Technical Debt & Improvements

### Performance
- [ ] Lazy load quest images/screenshots
- [ ] Virtual scrolling for large quest lists
- [ ] Preload critical fonts
- [ ] Optimize image sizes (current screenshots are large)

### Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Keyboard navigation improvements
- [ ] Screen reader testing
- [ ] Focus indicators on all buttons
- [ ] Reduced motion option for animations

### Testing
- [ ] Unit tests for service layer (price, player, quest catalog)
- [ ] Integration tests for critical user flows
- [ ] Cross-browser testing (Firefox, Safari, Edge)
- [ ] Mobile device testing matrix
- [ ] Automated Lighthouse CI checks

### Documentation
- [ ] Add JSDoc comments to all TypeScript files
- [ ] Create CONTRIBUTING.md with code style guide
- [ ] Architecture decision records (ADRs)
- [ ] Video tutorial for local development setup

### Code Quality
- [ ] Add ESLint + Prettier configuration
- [ ] TypeScript strict mode
- [ ] Component prop validation
- [ ] Error boundary components
- [ ] Structured logging service

---

## 🐛 Known Issues & Bugs

*(Currently none tracked. Add issues here as they're discovered.)*

---

## 💡 Backlog (Unsorted Ideas)

- [ ] **Skill Mastery Progress:** Track 200M XP progress per skill
- [ ] **Ironman Mode:** Filter money-making methods for ironman restrictions
- [ ] **Clue Scroll Helper:** Track clue scroll steps and solutions
- [ ] **Boss Guide:** Add PvM guides for major bosses (GWD, Nex, Telos, etc.)
- [ ] **Minigame Guides:** Separate section for minigame strategies
- [ ] **Daily/Weekly Checklist:** Customizable task list for daily activities
- [ ] **Inventory Calculator:** "What can I craft with these materials?"
- [ ] **GE Flipping Helper:** Track buy/sell margins for common items
- [ ] **Combat Simulator:** Calculate DPS for different gear setups
- [ ] **Quest Series Tracker:** Visual progress through multi-quest series
- [ ] **Achievement Diary Helper:** Track completion of achievement diaries
- [ ] **Skill Outfit Progress:** Track skilling outfit piece acquisition
- [ ] **Music Track Unlocker:** List of music tracks and how to unlock them
- [ ] **Pet Collection Tracker:** Track pet acquisition progress
- [ ] **Title Unlocks:** List of all titles and requirements

---

## 📅 Release Planning

### Versioning Strategy
- **Major (X.0.0):** Breaking changes, new sections (e.g., OSRS support)
- **Minor (1.X.0):** New features (e.g., event tracker, print mode)
- **Patch (1.1.X):** Bug fixes, small improvements, data updates

### Release Cadence
- **Patches:** As needed (weekly)
- **Minor releases:** Monthly
- **Major releases:** Quarterly or as features mature

---

## 🎯 Success Metrics

Track these metrics to measure app health:

- **GitHub Stars:** Target 100 stars by end of 2026
- **Live Demo Visits:** Track via GitHub Pages analytics (if enabled)
- **Community Contributions:** PRs, issues, discussions
- **Coffee Tips:** Buy Me a Coffee engagement
- **User Feedback:** Reddit/forum mentions and sentiment

---

## 📝 How to Contribute

1. Pick an item from this roadmap
2. Open a GitHub Issue to discuss implementation
3. Fork the repo and create a feature branch
4. Submit a Pull Request with tests and documentation
5. Link to the roadmap item in your PR description

---

*This roadmap is a living document. Priorities may shift based on community feedback and RuneScape game updates.*
