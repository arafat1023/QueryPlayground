# QueryPlayground - AI Assistant Context

## Project Overview
Browser-based SQL & NoSQL query practice platform with AI learning. Zero setup, pure client-side, BYOK (Bring Your Own Gemini API key).

## Documentation (Read First)
- **[queryplayground-plan-v2.md](./queryplayground-plan-v2.md)** - Full architecture, features, data structure, AI prompts
- **[queryplayground-branching-strategy.md](./queryplayground-branching-strategy.md)** - 17 feature branches with validation checklists

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State**: Zustand
- **PostgreSQL**: `@electric-sql/pglite` (WASM, IndexedDB persistence)
- **MongoDB**: `mingo` (in-memory simulation)
- **Editor**: Monaco Editor
- **AI**: Gemini 2.5 Flash (user-provided API key)

## Architecture
```
React App
  └─ Zustand Stores (db, editor, ui, ai)
       └─ localStorage/IndexedDB
            ├─ PGlite (PostgreSQL)
            └─ Mingo (MongoDB)
```

## Development Workflow

### Branch Strategy
17 sequential feature branches (`01-project-setup` → `17-deployment`). Each merges to `main` after validation.

### Git Commands
```bash
git checkout main && git pull
git checkout -b 01-project-setup
# work, commit, push, create PR
# after merge: delete branch, start next
```

### Commit Convention
```
feat: | fix: | docs: | refactor: | test: | chore:
```

## Key Implementation Details

### Storage Keys (localStorage)
```typescript
PG_TABLES: 'qp_pg_tables'
MONGO_COLLECTIONS: 'qp_mongo_collections'
THEME: 'qp_theme'
ACTIVE_DB: 'qp_active_db'
GEMINI_API_KEY: 'qp_gemini_key'
QUERY_HISTORY: 'qp_query_history'
```

### Query Flow
1. User types in Monaco Editor
2. Ctrl+Enter → `useQueryExecution` routes to PGlite or Mingo
3. Results displayed in ResultsPanel

### AI Integration
- Rate limited: 10 req/min
- Prompts: `services/prompts.ts`
- User's key stored in localStorage (client-side only)

## Code Guidelines
- TypeScript strict mode (no `any`)
- Use Zustand for state
- Debounce localStorage writes (500ms)
- Handle errors gracefully (toast, don't crash)

## Before Making Changes
1. Check `queryplayground-branching-strategy.md` for branch requirements
2. Run validation checklist
3. Ensure no TypeScript errors

## Success Metrics
- Loads < 3 seconds
- Queries < 500ms
- Works offline after first load
- Lighthouse > 85
