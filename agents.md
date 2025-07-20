# Repository Guidelines for Noodl

## Repository Structure
- Monorepo managed with **Lerna** and npm workspaces (`packages/*`).
- Main editor source in `packages/noodl-editor/src/editor/src`.
- Core UI component library in `packages/noodl-core-ui/src`.

## Tools & Versions
- Requires **Node.js 16–18** and npm >=6.
- Written primarily in **TypeScript** and **React**. Some packages use plain JavaScript.
- Styling is handled with **SCSS/CSS modules**.
- Unit tests use **Jest** with `ts-jest`.

## Development Scripts
- Install dependencies: `npm install`.
- Start development servers: `npm run dev`.
- Build editor & viewer: `npm start` or `npm run build:editor`.
- Run tests:
  - Platform package: `npm run test:platform`.
  - Editor package: `npm run test:editor`.

## Code Style
- Formatting enforced by **Prettier** (`prettier.config.js`). Key rules:
  - 2‑space indentation.
  - Semicolons are required.
  - Single quotes for strings.
  - `printWidth` 120.
  - No trailing commas.
  - Import order sorted using `@ianvs/prettier-plugin-sort-imports`.
- **ESLint** (`.eslintrc.js`) with recommended TypeScript and React rules.
- Run Prettier and ESLint before committing.

## TypeScript Notes
- The alias `TSFixme` is used as a temporary replacement for `any`. Prefer `unknown` whenever possible.
- Package paths are mapped via `tsconfig.json`. Common aliases include:
  - `@noodl-core-ui/*` → `packages/noodl-core-ui/src/*`
  - `@noodl-hooks/*` → `packages/noodl-editor/src/editor/src/hooks/*`
  - `@noodl-utils/*` → `packages/noodl-editor/src/editor/src/utils/*`
  - `@noodl-models/*` → `packages/noodl-editor/src/editor/src/models/*`

## Contributing Workflow
1. Create a feature branch from `work`.
2. Make changes following the style guides above.
3. Run `npm run test:editor` and `npm run test:platform` if relevant.
4. Commit with a clear message and open a PR.

