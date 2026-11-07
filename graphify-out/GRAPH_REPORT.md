# Graph Report - website-scanner  (2026-11-05)

## Corpus Check
- Corpus is ~5,323 words - fits in a single context window. You may not need a graph.

## Summary
- 127 nodes · 192 edges · 15 communities (9 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `UpgradeSimulationPanel()` - 10 edges
3. `ResultsDashboard()` - 7 edges
4. `react` - 7 edges
5. `Scanner()` - 6 edges
6. `Finding` - 6 edges
7. `ThemeToggle()` - 5 edges
8. `ScanResult` - 5 edges
9. `normalizeUrl()` - 5 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `ThemeToggle()`  [EXTRACTED]
  app/layout.tsx → components/ThemeToggle.tsx
- `Home()` --calls--> `Scanner()`  [EXTRACTED]
  app/page.tsx → components/Scanner.tsx
- `Home()` --calls--> `UpgradeSimulationPanel()`  [EXTRACTED]
  app/page.tsx → components/UpgradeSimulationPanel.tsx
- `SearchBar()` --calls--> `normalizeUrl()`  [EXTRACTED]
  components/SearchBar.tsx → lib/url.ts
- `POST()` --calls--> `analyzeUrl()`  [EXTRACTED]
  app/api/scan/route.ts → lib/analyzer.ts

## Import Cycles
- None detected.

## Communities (15 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (17): POST(), ScanRequest, AnalyzeResult, analyzeUrl(), BASELINE_DETECTORS, cache, CATEGORY_ORDER, Detector (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (10): geistMono, geistSans, metadata, RootLayout(), Home(), instant, ThemeToggle(), nextConfig (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (12): computePerformanceScore(), computeSecurityScore(), computeSeoScore(), MetricRing(), MetricRingProps, ResultsDashboard(), ScoreCard(), Scanner() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (9): CATEGORY_ORDER_INDEX, computeArchitectureCompletion(), computePerformanceCompletion(), computeSecurityCompletion(), computeSeoCompletion(), GaugeRing(), GaugeRingProps, SectionItem() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (7): dependencies, react@19.3.0, react-dom@19.3.0, name, private, version, react-dom

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (7): devDependencies, tailwindcss@^4, @types/node@^20, @types/react@^19, tailwindcss, @types/node, @types/react

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.3, eslint, eslint-config-next

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **1 isolated node(s):** `Next.js project bootstrapped with create-next-app`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 46 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.