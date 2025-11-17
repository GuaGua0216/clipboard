# Repository Guidelines

## Project Structure & Module Organization
- React renderer lives in `src` (`main.tsx` bootstraps, `App.tsx` UI, shared components in `components/`, Firebase setup in `firebase/`, styles in `App.css`/`index.css`).
- Electron main process is in `electron/main.ts`, with `preload.ts` bridging renderer APIs; type helpers sit in `electron/electron-env.d.ts`.
- Static assets are served from `public/`; build outputs land in `dist/` (renderer) and `dist-electron/` (packaged electron entry).
- Config entry points: `vite.config.ts` for bundling, `tailwind.config.js` for styling, `tsconfig*.json` for TypeScript, and `electron-builder.json5` for packaging metadata.

## Build, Test, and Development Commands
- `npm install` — install dependencies (run once before development).
- `npm run dev` — start Vite dev server with HMR for the renderer; use alongside an Electron runner if needed.
- `npm run lint` — run ESLint across `ts/tsx` files, failing on warnings unused disables.
- `npm run build` — type-check (`tsc`), build renderer (`vite build`), then package Electron app via `electron-builder`.
- `npm run preview` — serve the production renderer build for quick checks before packaging.

## Coding Style & Naming Conventions
- TypeScript + React with hooks; prefer functional components. Keep files and components in `PascalCase`, hooks/utilities in `camelCase`, and avoid default exports for shared components.
- Follow ESLint defaults in repo (2-space indentation, semicolons standard). Treat lint warnings as errors.
- Use Tailwind utility classes for styling; centralize shared styles in `App.css`/`index.css` when utilities are insufficient.

## Testing Guidelines
- No automated tests are present yet; add new tests alongside features. Favor Vitest + React Testing Library; place files as `*.test.tsx` next to the code under test. Keep fast, isolated tests that mock Firebase/network calls.

## Commit & Pull Request Guidelines
- Commit messages in history are short and descriptive (often bullet-like, sometimes numbered); keep the first line under ~72 chars and focus on user-visible changes. Include brief English summaries when possible to aid collaborators.
- For PRs, describe the change, note UI impacts (screenshots/GIFs for visible tweaks), reference related issues/tasks, and list manual test steps. Ensure `npm run lint` (and future tests) pass before requesting review.

## Security & Configuration
- Store secrets (e.g., Firebase keys) in environment variables with `VITE_` prefixes so Vite can expose them to the renderer; do not commit `.env` files or service credentials.
- Review preload/main process changes carefully to avoid exposing unsafe Node APIs to the renderer; only expose whitelisted channels via the preload bridge.
