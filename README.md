# QueryPlayground

Browser-based SQL & NoSQL query practice platform with AI-powered learning assistance.

## Features

- **Dual Database Support**: Practice PostgreSQL and MongoDB queries in one interface
- **Pre-loaded Data**: Ready-to-use sample datasets (zero setup required)
- **AI Learning Assistant**: Generate practice questions, explain queries, convert natural language to queries (requires your own Gemini API key)
- **Full Persistence**: All data saved to browser localStorage
- **Syntax Highlighting**: Monaco Editor with database-specific themes
- **Import/Export**: CSV and JSON data support

## Tech Stack

- React 18 + TypeScript + Vite
- PostgreSQL: `@electric-sql/pglite` (WASM)
- MongoDB: `mingo` (in-memory)
- Monaco Editor + Tailwind CSS + Zustand

## Quick Start

```bash
pnpm install
pnpm dev
```

## Documentation

- **[Project Plan v2](./queryplayground-plan-v2.md)** - Architecture, features, and timeline
- **[Branching Strategy](./queryplayground-branching-strategy.md)** - Development workflow with 17 feature branches

## Key Principles

- Zero setup — works immediately with default data
- No backend — everything runs in browser
- BYOK — users provide their own Gemini API key
- GitHub Pages deployable

## License

MIT
