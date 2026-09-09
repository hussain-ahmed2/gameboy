# Plan: Project Setup & Theme

## Goal
Configure the project foundation: port 4000, testing frameworks, DMG theme, and directory scaffolding for the TypeScript game engine.

## Changes

### 1. package.json
- Add dev script with port 4000: `"dev": "next dev -p 4000"`
- Add start script with port 4000: `"start": "next start -p 4000"`
- Add test scripts: `test`, `test:run`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `test:all`
- Add devDependencies: vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/dom, vite-tsconfig-paths, @playwright/test, @testing-library/jest-dom

### 2. vitest.config.mts
- jsdom environment
- React plugin
- tsconfig paths
- Coverage config with v8 provider

### 3. playwright.config.ts
- baseURL: http://localhost:4000
- webServer runs `pnpm dev`
- Chromium browser
- Screenshots on failure

### 4. src/app/globals.css
- DMG palette via `@theme inline`
- CSS variables for: shell, bezel, LCD colors, buttons, D-pad, LED, background
- Press Start 2P pixel font variable

### 5. src/app/layout.tsx
- Add Press Start 2P font from next/font/google
- Update metadata title/description
- Keep Geist Mono for UI elements

### 6. Directory scaffolding
```
src/
├── app/
├── engine/
│   ├── core/
│   ├── api/
│   └── games/
│       ├── registry.ts
│       ├── pong/
│       ├── snake/
│       └── platformer/
├── features/
│   ├── ui/
│   │   ├── shell/
│   │   ├── screen/
│   │   ├── controls/
│   │   ├── toolbar/
│   │   └── status/
│   └── store/
├── hooks/
├── lib/
└── tests/
    ├── fixtures/
    └── e2e/
```

## Verification
- `pnpm dev` starts on port 4000
- `pnpm test` runs vitest (even with 0 tests)
- `npx playwright install chromium` completes
- Theme colors are available as Tailwind utilities