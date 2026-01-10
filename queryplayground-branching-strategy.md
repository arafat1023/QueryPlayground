# QueryPlayground - Git Branching Strategy & Development Plan

> A structured approach to building QueryPlayground with feature branches, validation checklists, and merge order.

---

## Branch Flow Diagram

```
main (stable)
  │
  ├── 01-project-setup ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 02-pglite-integration ────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 03-mingo-mongodb ────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 04-monaco-editor ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 05-main-layout ───────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 06-schema-explorer ───────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 07-results-panel ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 08-query-execution ───────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 09-default-data ──────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 10-localstorage-persistence ──────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 11-import-export ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 12-query-history ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 13-gemini-integration ────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 14-ai-features ───────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 15-practice-mode ─────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  ├── 16-theme-polish ──────────────────────────────► merge to main
  │                                                         │
  │   ◄─────────────────────────────────────────────────────┘
  │
  └── 17-deployment ────────────────────────────────► merge to main
                                                            │
                                                            ▼
                                                    🚀 PRODUCTION
```

---

## Branch Details

---

### Branch 01: `01-project-setup`

**Create from:** `main` (empty)

**Purpose:** Initialize project with all dependencies and basic configuration

#### Tasks

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install core dependencies:
  ```bash
  pnpm add zustand lucide-react sonner react-resizable-panels
  pnpm add @tanstack/react-table
  pnpm add -D @types/node
  ```
- [ ] Setup folder structure (empty folders with .gitkeep)
- [ ] Configure path aliases in `tsconfig.json`
- [ ] Create base Tailwind config with custom colors
- [ ] Add basic CSS variables for theming
- [ ] Create placeholder `App.tsx` with "Hello QueryPlayground"
- [ ] Setup ESLint + Prettier config
- [ ] Create `.gitignore`

#### Files to Create

```
├── src/
│   ├── components/
│   │   ├── common/.gitkeep
│   │   ├── editor/.gitkeep
│   │   ├── layout/.gitkeep
│   │   ├── results/.gitkeep
│   │   ├── schema/.gitkeep
│   │   └── ai/.gitkeep
│   ├── db/
│   │   ├── postgres/.gitkeep
│   │   └── mongodb/.gitkeep
│   ├── hooks/.gitkeep
│   ├── services/.gitkeep
│   ├── store/.gitkeep
│   ├── types/
│   │   └── index.ts
│   ├── utils/.gitkeep
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── pnpm-lock.yaml
└── package.json
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 01-project-setup

### Build & Run
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts dev server successfully
- [ ] App loads in browser at localhost:5173
- [ ] No console errors in browser

### Configuration
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] Tailwind classes work (test with a colored div)
- [ ] Path aliases work (e.g., `@/components`)
- [ ] ESLint passes (`pnpm lint`)

### Code Quality
- [ ] All files have proper TypeScript types
- [ ] No `any` types used
- [ ] Folder structure matches plan
- [ ] README.md has basic project description

### Browser Testing
- [ ] Chrome: ✓
- [ ] Firefox: ✓
- [ ] Edge: ✓
```

---

### Branch 02: `02-pglite-integration`

**Create from:** `main` (after 01 merged)

**Purpose:** Integrate PGlite (PostgreSQL WASM) and create database service

#### Tasks

- [ ] Install PGlite:
  ```bash
  pnpm add @electric-sql/pglite
  ```
- [ ] Create PostgreSQL client service (`src/db/postgres/client.ts`)
- [ ] Create helper functions for query execution
- [ ] Create type definitions for query results
- [ ] Handle WASM loading with loading state
- [ ] Create test component to verify PGlite works
- [ ] Handle errors gracefully

#### Files to Create/Modify

```
src/
├── db/
│   └── postgres/
│       ├── client.ts        # PGlite initialization & singleton
│       ├── types.ts         # QueryResult, TableSchema types
│       └── helpers.ts       # formatResults, parseError
├── hooks/
│   └── usePostgres.ts       # React hook for PG operations
└── types/
    └── database.ts          # Shared database types
```

#### Key Code: `src/db/postgres/client.ts`

```typescript
import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

export async function getPostgresClient(): Promise<PGlite> {
  if (db) return db;
  
  if (!initPromise) {
    initPromise = PGlite.create('idb://queryplayground-pg');
  }
  
  db = await initPromise;
  return db;
}

export async function executePostgresQuery(sql: string): Promise<QueryResult> {
  const client = await getPostgresClient();
  const start = performance.now();
  
  try {
    const result = await client.query(sql);
    return {
      success: true,
      rows: result.rows,
      fields: result.fields,
      rowCount: result.rows.length,
      executionTime: performance.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: performance.now() - start,
    };
  }
}
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 02-pglite-integration

### Functionality Tests
- [ ] PGlite initializes without errors
- [ ] Can execute: `SELECT 1 + 1 AS result`
- [ ] Can execute: `CREATE TABLE test (id INT, name TEXT)`
- [ ] Can execute: `INSERT INTO test VALUES (1, 'hello')`
- [ ] Can execute: `SELECT * FROM test`
- [ ] Can execute: `DROP TABLE test`
- [ ] Error messages are captured and returned properly

### Loading States
- [ ] Loading indicator shows while WASM loads
- [ ] App doesn't crash if query runs before init complete

### Performance
- [ ] WASM loads in < 3 seconds (first load)
- [ ] Subsequent queries execute in < 100ms

### Error Handling
- [ ] Invalid SQL returns error message (not crash)
- [ ] Syntax errors are user-friendly
- [ ] Network issues handled (WASM fetch fail)

### Browser Testing
- [ ] Chrome: ✓
- [ ] Firefox: ✓
- [ ] Edge: ✓

### Code Quality
- [ ] No TypeScript errors
- [ ] All functions have return types
- [ ] Error types are properly defined
```

---

### Branch 03: `03-mingo-mongodb`

**Create from:** `main` (after 02 merged)

**Purpose:** Integrate Mingo for MongoDB-style query execution with in-memory storage

#### Tasks

- [ ] Install Mingo:
  ```bash
  pnpm add mingo
  ```
- [ ] Create in-memory collection store with IndexedDB persistence
- [ ] Create MongoDB query executor using Mingo
- [ ] Build query parser for `db.collection.method()` syntax
- [ ] Support operations:
  - `find()` with filters, projection, sort, limit, skip
  - `findOne()`
  - `insertOne()`, `insertMany()`
  - `updateOne()`, `updateMany()` (with $set, $inc, $unset, etc.)
  - `deleteOne()`, `deleteMany()`
  - `countDocuments()`
  - `aggregate()` pipeline (basic stages: $match, $group, $sort, $limit, $project)
- [ ] Handle MongoDB operators: `$gt`, `$lt`, `$gte`, `$lte`, `$eq`, `$ne`, `$in`, `$nin`, `$and`, `$or`, `$not`, `$exists`, `$regex`
- [ ] Create type definitions

#### Files to Create/Modify

```
src/
├── db/
│   └── mongodb/
│       ├── client.ts        # Collection store & initialization
│       ├── queryParser.ts   # Parse MongoDB query syntax
│       ├── queryExecutor.ts # Execute queries using Mingo
│       ├── operators.ts     # Custom operator extensions
│       └── types.ts         # MongoDB-specific types
├── hooks/
│   └── useMongoDB.ts        # React hook for Mongo operations
```

#### Key Code: `src/db/mongodb/queryExecutor.ts`

```typescript
import mingo from 'mingo';
import { Query, Aggregator } from 'mingo';

// In-memory collection store
const collections: Map<string, object[]> = new Map();

export function getCollection(name: string): object[] {
  if (!collections.has(name)) {
    collections.set(name, []);
  }
  return collections.get(name)!;
}

export function find(collectionName: string, filter: object = {}, options?: {
  projection?: object;
  sort?: object;
  limit?: number;
  skip?: number;
}) {
  const collection = getCollection(collectionName);
  let cursor = new Query(filter).find(collection);
  
  if (options?.sort) cursor = cursor.sort(options.sort);
  if (options?.skip) cursor = cursor.skip(options.skip);
  if (options?.limit) cursor = cursor.limit(options.limit);
  
  return cursor.all();
}

export function aggregate(collectionName: string, pipeline: object[]) {
  const collection = getCollection(collectionName);
  const agg = new Aggregator(pipeline);
  return agg.run(collection);
}

export function insertOne(collectionName: string, doc: object) {
  const collection = getCollection(collectionName);
  const newDoc = { ...doc, _id: doc._id || generateId() };
  collection.push(newDoc);
  return { insertedId: newDoc._id };
}

export function insertMany(collectionName: string, docs: object[]) {
  const collection = getCollection(collectionName);
  const newDocs = docs.map(doc => ({ ...doc, _id: doc._id || generateId() }));
  collection.push(...newDocs);
  return { insertedIds: newDocs.map(d => d._id) };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 03-mingo-mongodb

### Query Parser Tests
- [ ] Parses: `db.users.find({})`
- [ ] Parses: `db.users.find({ age: 25 })`
- [ ] Parses: `db.users.find({ age: { $gt: 25 } })`
- [ ] Parses: `db.users.find({ $and: [{ age: { $gt: 20 } }, { city: "NYC" }] })`
- [ ] Parses: `db.users.findOne({ _id: "123" })`
- [ ] Parses: `db.users.insertOne({ name: "John", age: 30 })`
- [ ] Parses: `db.users.insertMany([{ name: "A" }, { name: "B" }])`
- [ ] Parses: `db.users.updateOne({ _id: "1" }, { $set: { name: "New" } })`
- [ ] Parses: `db.users.deleteOne({ _id: "1" })`
- [ ] Parses: `db.users.countDocuments({ active: true })`
- [ ] Parses: `db.users.aggregate([{ $match: {} }, { $group: {} }])`

### Mingo Query Execution Tests
- [ ] `find()` returns matching documents
- [ ] `find()` with projection works
- [ ] `find()` with sort works
- [ ] `find()` with limit/skip works
- [ ] `findOne()` returns single document
- [ ] `insertOne()` adds document with _id
- [ ] `insertMany()` adds multiple documents
- [ ] `updateOne()` with $set works
- [ ] `updateMany()` updates all matching
- [ ] `deleteOne()` removes single document
- [ ] `deleteMany()` removes all matching
- [ ] `countDocuments()` returns correct count
- [ ] `aggregate()` pipeline works

### Operator Tests
- [ ] `$gt` works correctly
- [ ] `$lt` works correctly
- [ ] `$gte` works correctly
- [ ] `$lte` works correctly
- [ ] `$eq` works correctly
- [ ] `$ne` works correctly
- [ ] `$in` works correctly
- [ ] `$nin` works correctly
- [ ] `$and` works correctly
- [ ] `$or` works correctly
- [ ] `$not` works correctly
- [ ] `$exists` works correctly
- [ ] `$regex` works correctly

### Error Handling
- [ ] Invalid syntax returns clear error message
- [ ] Unknown collection returns empty array (not error)
- [ ] Invalid operator returns error
- [ ] Malformed JSON in query returns helpful error

### Integration
- [ ] Collections persist in memory during session
- [ ] Collections can be created dynamically
- [ ] Data can be cleared/reset

### Code Quality
- [ ] No TypeScript errors
- [ ] Mingo tree-shaking configured properly
- [ ] Parser is well-documented
- [ ] Edge cases handled
```

---

### Branch 04: `04-monaco-editor`

**Create from:** `main` (after 03 merged)

**Purpose:** Integrate Monaco Editor with SQL and MongoDB syntax highlighting

#### Tasks

- [ ] Install Monaco Editor:
  ```bash
  pnpm add @monaco-editor/react
  ```
- [ ] Create QueryEditor component
- [ ] Configure SQL syntax highlighting
- [ ] Configure MongoDB/JavaScript syntax highlighting
- [ ] Create custom themes (light/dark) for each database type
- [ ] Add keyboard shortcuts (Ctrl+Enter to run)
- [ ] Add basic auto-completion for keywords
- [ ] Handle editor resize

#### Files to Create/Modify

```
src/
├── components/
│   └── editor/
│       ├── QueryEditor.tsx      # Main editor component
│       ├── EditorToolbar.tsx    # Run, Save, Clear buttons
│       ├── sqlLanguage.ts       # SQL syntax config
│       ├── mongoLanguage.ts     # MongoDB syntax config
│       └── editorThemes.ts      # Custom color themes
├── store/
│   └── editorStore.ts           # Editor state (content, history)
```

#### Key Code: `src/components/editor/editorThemes.ts`

```typescript
export const sqlDarkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },    // SELECT, FROM, WHERE
    { token: 'operator.sql', foreground: 'D4D4D4' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'type', foreground: '4EC9B0' },                          // Table names
  ],
  colors: {
    'editor.background': '#1E1E1E',
  }
};

export const mongoDarkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },    // db, find, insert
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'delimiter.bracket', foreground: 'FFD700' },
    { token: 'identifier', foreground: '9CDCFE' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
  }
};
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 04-monaco-editor

### Editor Functionality
- [ ] Editor loads without errors
- [ ] Can type and edit text
- [ ] Line numbers display correctly
- [ ] Cursor works properly
- [ ] Selection works (mouse and keyboard)
- [ ] Copy/paste works

### Syntax Highlighting (SQL)
- [ ] Keywords highlighted (SELECT, FROM, WHERE, JOIN, etc.)
- [ ] Strings highlighted (single and double quotes)
- [ ] Numbers highlighted
- [ ] Comments highlighted (-- and /* */)
- [ ] Operators highlighted

### Syntax Highlighting (MongoDB)
- [ ] `db.` highlighted as keyword
- [ ] Method names highlighted (find, insertOne, etc.)
- [ ] JSON keys highlighted
- [ ] Strings highlighted
- [ ] Numbers highlighted
- [ ] Operators highlighted ($gt, $lt, etc.)

### Keyboard Shortcuts
- [ ] Ctrl+Enter triggers run callback
- [ ] Ctrl+S triggers save callback
- [ ] Standard editor shortcuts work (Ctrl+Z, Ctrl+C, etc.)

### Theming
- [ ] Light theme works for SQL
- [ ] Dark theme works for SQL
- [ ] Light theme works for MongoDB
- [ ] Dark theme works for MongoDB
- [ ] Theme switch is instant (no flicker)

### Responsive
- [ ] Editor resizes with container
- [ ] No horizontal scroll on small screens (wrapping works)

### Performance
- [ ] No lag when typing
- [ ] Large queries (100+ lines) don't slow down

### Code Quality
- [ ] No TypeScript errors
- [ ] Editor cleanup on unmount (no memory leaks)
```

---

### Branch 05: `05-main-layout`

**Create from:** `main` (after 04 merged)

**Purpose:** Create the main application layout with resizable panels

#### Tasks

- [ ] Create Header component (logo, DB switch, theme toggle)
- [ ] Create MainLayout with resizable panels
- [ ] Create Sidebar container (schema + history)
- [ ] Create main content area (editor + results)
- [ ] Implement panel resize (drag to resize)
- [ ] Save panel sizes to localStorage
- [ ] Create mobile-friendly layout (stacked)

#### Files to Create/Modify

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Top bar
│   │   ├── MainLayout.tsx       # Overall layout
│   │   ├── Sidebar.tsx          # Left panel container
│   │   └── ContentArea.tsx      # Right panel (editor + results)
│   └── common/
│       ├── Button.tsx
│       ├── Dropdown.tsx
│       ├── ThemeToggle.tsx
│       └── DatabaseSwitch.tsx
├── store/
│   └── uiStore.ts               # Theme, panel sizes, active DB
```

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│                  │  Editor                                  │
│  Sidebar         │                                          │
│  (resizable)     ├──────────────────────────────────────────┤
│                  │                                          │
│                  │  Results                                 │
│                  │  (resizable)                             │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 05-main-layout

### Layout Structure
- [ ] Header displays correctly
- [ ] Sidebar is on the left
- [ ] Editor and Results are stacked vertically on right
- [ ] All sections have proper borders/separation

### Resizable Panels
- [ ] Can drag to resize sidebar width
- [ ] Can drag to resize editor/results height
- [ ] Minimum widths/heights enforced
- [ ] Maximum widths/heights enforced
- [ ] Resize handle is visible and cursor changes

### Persistence
- [ ] Panel sizes save to localStorage
- [ ] Panel sizes restore on page reload

### Header Components
- [ ] Logo/title displays
- [ ] Database switch works (PostgreSQL/MongoDB)
- [ ] Theme toggle works (light/dark)
- [ ] Active database indicator visible

### Responsive Design
- [ ] Desktop (1920px): 3-column layout works
- [ ] Laptop (1366px): Layout still usable
- [ ] Tablet (768px): Sidebar collapses or stacks
- [ ] Mobile (375px): Single column, stacked

### Theme
- [ ] Light theme applies to all panels
- [ ] Dark theme applies to all panels
- [ ] No flash of wrong theme on load

### Code Quality
- [ ] No TypeScript errors
- [ ] Components are reusable
- [ ] Proper use of Tailwind classes
```

---

### Branch 06: `06-schema-explorer`

**Create from:** `main` (after 05 merged)

**Purpose:** Create schema explorer sidebar showing tables/collections and their structure

#### Tasks

- [ ] Create SchemaExplorer component
- [ ] Create TableList for PostgreSQL
- [ ] Create CollectionList for MongoDB
- [ ] Show columns/fields with types
- [ ] Add expand/collapse for tables
- [ ] Add click to insert table name into editor
- [ ] Show row/document count
- [ ] Add refresh button

#### Files to Create/Modify

```
src/
├── components/
│   └── schema/
│       ├── SchemaExplorer.tsx    # Main container
│       ├── TableList.tsx         # PostgreSQL tables
│       ├── TableItem.tsx         # Single table with columns
│       ├── CollectionList.tsx    # MongoDB collections
│       ├── CollectionItem.tsx    # Single collection with fields
│       └── ColumnItem.tsx        # Column/field display
├── hooks/
│   └── useSchema.ts              # Fetch schema from DB
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 06-schema-explorer

### PostgreSQL Mode
- [ ] Lists all tables
- [ ] Shows column names for each table
- [ ] Shows column types (VARCHAR, INT, etc.)
- [ ] Shows primary key indicator
- [ ] Shows foreign key indicator
- [ ] Expand/collapse works
- [ ] Shows row count per table

### MongoDB Mode
- [ ] Lists all collections
- [ ] Shows field names (inferred from documents)
- [ ] Shows field types (inferred)
- [ ] Expand/collapse works
- [ ] Shows document count per collection

### Interactions
- [ ] Click table name → inserts into editor
- [ ] Click column name → inserts into editor
- [ ] Hover shows tooltip with more info
- [ ] Right-click shows context menu (optional)

### Refresh
- [ ] Refresh button updates schema
- [ ] Loading indicator during refresh
- [ ] Schema updates after CREATE TABLE

### Empty States
- [ ] Shows "No tables yet" when empty
- [ ] Shows "No collections yet" when empty

### Code Quality
- [ ] No TypeScript errors
- [ ] Components are performant (virtualized if many tables)
```

---

### Branch 07: `07-results-panel`

**Create from:** `main` (after 06 merged)

**Purpose:** Create results panel with table view, JSON view, and export options

#### Tasks

- [ ] Create ResultsPanel container
- [ ] Create TableView using TanStack Table
- [ ] Create JsonView for MongoDB results
- [ ] Add view toggle (Table/JSON)
- [ ] Show execution time and row count
- [ ] Add pagination for large results
- [ ] Add column sorting
- [ ] Add copy row/cell
- [ ] Add export buttons (CSV, JSON)
- [ ] Show error messages nicely

#### Files to Create/Modify

```
src/
├── components/
│   └── results/
│       ├── ResultsPanel.tsx      # Main container
│       ├── ResultsToolbar.tsx    # Row count, time, export buttons
│       ├── TableView.tsx         # Tabular display
│       ├── JsonView.tsx          # JSON tree display
│       ├── ErrorDisplay.tsx      # Error message display
│       └── EmptyState.tsx        # "Run a query" placeholder
├── utils/
│   └── exportUtils.ts            # CSV/JSON export functions
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 07-results-panel

### Table View
- [ ] Displays rows and columns correctly
- [ ] Column headers show field names
- [ ] Handles NULL values gracefully
- [ ] Handles empty result set
- [ ] Handles single row
- [ ] Handles 1000+ rows (pagination)

### Pagination
- [ ] Shows page numbers
- [ ] Next/Previous buttons work
- [ ] Page size selector works (10, 25, 50, 100)
- [ ] Shows "Rows X-Y of Z"

### Sorting
- [ ] Click column header to sort
- [ ] Sort indicator (arrow) shows
- [ ] Sorts strings correctly
- [ ] Sorts numbers correctly
- [ ] Sorts dates correctly

### JSON View
- [ ] Displays JSON tree correctly
- [ ] Expand/collapse nodes
- [ ] Syntax highlighting
- [ ] Copy JSON button

### Export
- [ ] Export to CSV downloads file
- [ ] CSV is properly formatted (escaped commas, quotes)
- [ ] Export to JSON downloads file
- [ ] JSON is properly formatted (indented)

### Error Display
- [ ] Error message shows in red
- [ ] Error line number highlighted (if available)
- [ ] Doesn't crash on error

### Performance
- [ ] Renders 1000 rows without lag
- [ ] Virtual scrolling works (if implemented)

### Code Quality
- [ ] No TypeScript errors
- [ ] Proper memoization for performance
```

---

### Branch 08: `08-query-execution`

**Create from:** `main` (after 07 merged)

**Purpose:** Connect editor → database → results with full execution flow

#### Tasks

- [ ] Create unified query execution hook
- [ ] Connect Run button to execute query
- [ ] Route to correct database (PG or Mongo)
- [ ] Display results in results panel
- [ ] Display errors in results panel
- [ ] Add loading state during execution
- [ ] Add Ctrl+Enter keyboard shortcut
- [ ] Handle multi-statement queries (PostgreSQL)

#### Files to Create/Modify

```
src/
├── hooks/
│   └── useQueryExecution.ts     # Unified execution hook
├── store/
│   ├── dbStore.ts               # Active DB, results, errors
│   └── editorStore.ts           # Add execution trigger
├── components/
│   └── editor/
│       └── EditorToolbar.tsx    # Connect Run button
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 08-query-execution

### PostgreSQL Execution
- [ ] Simple SELECT works
- [ ] SELECT with WHERE works
- [ ] SELECT with JOIN works
- [ ] INSERT returns success message
- [ ] UPDATE returns affected rows
- [ ] DELETE returns affected rows
- [ ] CREATE TABLE works
- [ ] DROP TABLE works
- [ ] Multiple statements work (separated by ;)

### MongoDB Execution
- [ ] db.collection.find({}) works
- [ ] db.collection.find({ filter }) works
- [ ] db.collection.insertOne({}) works
- [ ] db.collection.updateOne({}, {}) works
- [ ] db.collection.deleteOne({}) works

### Error Handling
- [ ] SQL syntax error shows message
- [ ] MongoDB syntax error shows message
- [ ] Unknown table/collection shows error
- [ ] Error doesn't crash app

### Loading States
- [ ] Loading indicator during execution
- [ ] Run button disabled during execution
- [ ] Editor disabled during execution (optional)

### Keyboard Shortcuts
- [ ] Ctrl+Enter runs query
- [ ] Cmd+Enter runs query (Mac)

### Results Display
- [ ] Results update after execution
- [ ] Execution time shows
- [ ] Row count shows
- [ ] Previous results cleared on new execution

### Code Quality
- [ ] No TypeScript errors
- [ ] Execution is debounced (no double-clicks)
- [ ] Cleanup on component unmount
```

---

### Branch 09: `09-default-data`

**Create from:** `main` (after 08 merged)

**Purpose:** Add default sample data that loads on first visit

#### Tasks

- [ ] Create PostgreSQL sample data (users, products, orders, order_items)
- [ ] Create MongoDB sample data (users, posts, comments)
- [ ] Detect first visit (no localStorage key)
- [ ] Load default data on first visit
- [ ] Add "Reset to Default" button
- [ ] Show welcome message on first visit

#### Files to Create/Modify

```
src/
├── db/
│   ├── postgres/
│   │   └── defaultData.ts       # SQL statements for default data
│   └── mongodb/
│       └── defaultData.ts       # JSON for default collections
├── hooks/
│   └── useInitialData.ts        # First visit detection & loading
├── components/
│   └── common/
│       └── WelcomeModal.tsx     # First visit welcome
```

#### Default Data Specifications

**PostgreSQL:**
- users: 10 rows
- products: 15 rows
- orders: 20 rows
- order_items: 30 rows

**MongoDB:**
- users: 10 documents
- posts: 15 documents
- comments: 25 documents

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 09-default-data

### First Visit
- [ ] Clear localStorage, reload → default data loads
- [ ] Welcome modal/message shows on first visit
- [ ] Schema explorer shows default tables/collections
- [ ] Can run SELECT * FROM users immediately

### Default Data (PostgreSQL)
- [ ] users table has 10 rows
- [ ] products table has 15 rows
- [ ] orders table has 20 rows
- [ ] order_items table has 30 rows
- [ ] Foreign keys are valid
- [ ] Data is realistic/useful for practice

### Default Data (MongoDB)
- [ ] users collection has 10 documents
- [ ] posts collection has 15 documents
- [ ] comments collection has 25 documents
- [ ] References are valid (userId, postId)
- [ ] Data is realistic/useful for practice

### Reset to Default
- [ ] Reset button exists
- [ ] Confirmation dialog shows
- [ ] Reset clears user data
- [ ] Reset reloads default data
- [ ] Reset preserves user preferences (theme)

### Returning Visit
- [ ] Second visit → default data NOT reloaded
- [ ] User's custom tables preserved
- [ ] No welcome modal on return

### Code Quality
- [ ] No TypeScript errors
- [ ] Default data is well-structured
- [ ] Loading is fast (< 2 seconds)
```

---

### Branch 10: `10-localstorage-persistence`

**Create from:** `main` (after 09 merged)

**Purpose:** Implement auto-save and restore from localStorage

#### Tasks

- [ ] Create storage service with all keys
- [ ] Auto-save database state on changes
- [ ] Auto-save editor content on changes
- [ ] Auto-save preferences on changes
- [ ] Restore all state on app load
- [ ] Add "Clear All Data" button
- [ ] Add storage usage indicator
- [ ] Handle storage quota exceeded

#### Files to Create/Modify

```
src/
├── services/
│   └── storage.ts              # localStorage wrapper
├── hooks/
│   └── usePersistence.ts       # Auto-save logic
├── store/
│   └── (all stores)            # Add persistence middleware
├── components/
│   └── common/
│       └── StorageIndicator.tsx  # Shows usage
```

#### Storage Keys

```typescript
const STORAGE_KEYS = {
  // Database
  PG_STATE: 'qp_pg_state',
  MONGO_STATE: 'qp_mongo_state',
  
  // Editor
  EDITOR_CONTENT: 'qp_editor_content',
  SAVED_QUERIES: 'qp_saved_queries',
  
  // UI
  THEME: 'qp_theme',
  ACTIVE_DB: 'qp_active_db',
  PANEL_SIZES: 'qp_panel_sizes',
  
  // Meta
  FIRST_VISIT: 'qp_first_visit',
  VERSION: 'qp_version',
};
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 10-localstorage-persistence

### Auto-Save
- [ ] Create table → saved immediately
- [ ] Insert data → saved immediately
- [ ] Change editor content → saved on debounce
- [ ] Change theme → saved immediately
- [ ] Resize panels → saved immediately

### Restore
- [ ] Reload page → database state restored
- [ ] Reload page → editor content restored
- [ ] Reload page → theme restored
- [ ] Reload page → panel sizes restored
- [ ] Reload page → active database restored

### Clear All Data
- [ ] Clear button exists in settings/menu
- [ ] Confirmation dialog shows
- [ ] Clears all localStorage keys
- [ ] App resets to first-visit state
- [ ] Default data reloads

### Storage Indicator
- [ ] Shows current usage (X MB / 5 MB)
- [ ] Warns at 80% capacity
- [ ] Error handling at 100% capacity

### Error Handling
- [ ] Handles corrupted localStorage
- [ ] Handles quota exceeded
- [ ] Graceful fallback if storage unavailable

### Performance
- [ ] Saving doesn't block UI
- [ ] Debounce prevents excessive writes
- [ ] Large data doesn't slow down

### Code Quality
- [ ] No TypeScript errors
- [ ] Storage service is testable
- [ ] Proper error boundaries
```

---

### Branch 11: `11-import-export`

**Create from:** `main` (after 10 merged)

**Purpose:** Add data import (CSV, JSON) and export functionality

#### Tasks

- [ ] Create Import Data modal
- [ ] Parse CSV files
- [ ] Parse JSON files
- [ ] Create table/collection from imported data
- [ ] Add to existing table/collection
- [ ] Export table/collection to CSV
- [ ] Export table/collection to JSON
- [ ] Export entire workspace
- [ ] Import workspace

#### Files to Create/Modify

```
src/
├── components/
│   └── schema/
│       ├── ImportDataModal.tsx   # File upload UI
│       └── ExportMenu.tsx        # Export options
├── services/
│   ├── csvParser.ts              # CSV parsing logic
│   ├── jsonParser.ts             # JSON parsing logic
│   └── workspaceExport.ts        # Full workspace export
├── utils/
│   └── fileDownload.ts           # Trigger file downloads
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 11-import-export

### CSV Import
- [ ] Upload CSV file works
- [ ] Headers become column names
- [ ] Data types inferred correctly
- [ ] Handles quoted values
- [ ] Handles commas in values
- [ ] Handles empty values
- [ ] Creates table (PostgreSQL)
- [ ] Creates collection (MongoDB)

### JSON Import
- [ ] Upload JSON file works
- [ ] Array of objects → rows/documents
- [ ] Nested objects handled
- [ ] Creates table/collection

### Import Options
- [ ] Create new table/collection
- [ ] Append to existing
- [ ] Replace existing
- [ ] Preview data before import
- [ ] Edit column types before import

### CSV Export
- [ ] Table → CSV download
- [ ] Query results → CSV download
- [ ] Proper escaping
- [ ] UTF-8 encoding

### JSON Export
- [ ] Collection → JSON download
- [ ] Query results → JSON download
- [ ] Pretty printed
- [ ] UTF-8 encoding

### Workspace Export/Import
- [ ] Export all tables + collections
- [ ] Export queries
- [ ] Export preferences
- [ ] Import restores everything
- [ ] Version compatibility check

### Error Handling
- [ ] Invalid CSV shows error
- [ ] Invalid JSON shows error
- [ ] Too large file shows warning
- [ ] Import doesn't corrupt existing data

### Code Quality
- [ ] No TypeScript errors
- [ ] Streaming for large files
- [ ] Progress indicator for large imports
```

---

### Branch 12: `12-query-history`

**Create from:** `main` (after 11 merged)

**Purpose:** Add query history and saved queries functionality

#### Tasks

- [ ] Track all executed queries
- [ ] Store last 50 queries in history
- [ ] Display history in sidebar
- [ ] Click history item to load into editor
- [ ] Delete history items
- [ ] Clear all history
- [ ] Save/bookmark queries
- [ ] Saved queries panel
- [ ] Edit saved query name

#### Files to Create/Modify

```
src/
├── components/
│   └── sidebar/
│       ├── QueryHistory.tsx      # History list
│       ├── HistoryItem.tsx       # Single history entry
│       ├── SavedQueries.tsx      # Bookmarked queries
│       └── SaveQueryModal.tsx    # Name & save query
├── store/
│   └── historyStore.ts           # History & saved queries state
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 12-query-history

### Query History
- [ ] Executed query added to history
- [ ] History shows timestamp
- [ ] History shows query preview (truncated)
- [ ] History shows database type (PG/Mongo)
- [ ] History shows success/error status
- [ ] Click loads query into editor
- [ ] Delete single history item works
- [ ] Clear all history works
- [ ] Max 50 items in history

### Saved Queries
- [ ] "Save Query" button works
- [ ] Name input for saved query
- [ ] Saved queries persist to localStorage
- [ ] Click loads query into editor
- [ ] Edit saved query name
- [ ] Delete saved query
- [ ] Saved queries organized by DB type

### Persistence
- [ ] History survives page reload
- [ ] Saved queries survive page reload
- [ ] History cleared on "Clear All Data"
- [ ] Saved queries cleared on "Clear All Data"

### UI/UX
- [ ] History scrollable if many items
- [ ] Visual distinction between history and saved
- [ ] Empty states shown
- [ ] Keyboard navigation (optional)

### Code Quality
- [ ] No TypeScript errors
- [ ] Efficient updates (no full re-render)
- [ ] Proper timestamps (ISO format)
```

---

### Branch 13: `13-gemini-integration`

**Create from:** `main` (after 12 merged)

**Purpose:** Integrate Gemini API with API key management

#### Tasks

- [ ] Create Gemini service
- [ ] Create API key input UI
- [ ] Store API key in localStorage (with warning)
- [ ] Test API connection
- [ ] Handle rate limiting
- [ ] Handle API errors
- [ ] Show/hide API key toggle
- [ ] Remove API key option

#### Files to Create/Modify

```
src/
├── services/
│   └── gemini.ts                 # Gemini API wrapper
├── components/
│   └── ai/
│       ├── AIPanel.tsx           # Container for AI features
│       └── ApiKeyInput.tsx       # API key management UI
├── store/
│   └── aiStore.ts                # API key, loading states
├── hooks/
│   └── useGemini.ts              # React hook for API calls
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 13-gemini-integration

### API Key Management
- [ ] Input field for API key
- [ ] Show/hide toggle for API key
- [ ] Save to localStorage
- [ ] Warning about key storage shown
- [ ] Remove/delete API key works
- [ ] API key persists across sessions

### Connection Test
- [ ] "Test Connection" button
- [ ] Success indicator on valid key
- [ ] Error message on invalid key
- [ ] Loading state during test

### API Service
- [ ] Successfully calls Gemini API
- [ ] Handles API errors gracefully
- [ ] Rate limiting implemented (10 req/min)
- [ ] Timeout handling (30 seconds)
- [ ] Retries on temporary failure (optional)

### Error States
- [ ] Network error message
- [ ] Invalid API key message
- [ ] Rate limit message
- [ ] Quota exceeded message

### UI
- [ ] AI panel toggle in header
- [ ] API key section visible
- [ ] Clear visual state (connected/not connected)
- [ ] AI features disabled without key

### Code Quality
- [ ] No TypeScript errors
- [ ] API key not logged to console
- [ ] Proper cleanup on unmount
```

---

### Branch 14: `14-ai-features`

**Create from:** `main` (after 13 merged)

**Purpose:** Implement AI features (explain query, NL-to-query, validate)

#### Tasks

- [ ] Create query explanation feature
- [ ] Create natural language to query feature
- [ ] Create answer validation feature
- [ ] Create hint system
- [ ] Create prompt templates
- [ ] Handle streaming responses (optional)
- [ ] Copy generated query to editor

#### Files to Create/Modify

```
src/
├── components/
│   └── ai/
│       ├── QueryExplainer.tsx    # Explain query UI
│       ├── NLToQuery.tsx         # Natural language input
│       ├── AnswerValidator.tsx   # Check answer UI
│       └── HintPanel.tsx         # Progressive hints
├── services/
│   └── prompts.ts                # AI prompt templates
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 14-ai-features

### Query Explanation
- [ ] "Explain Query" button works
- [ ] Takes current editor content
- [ ] Returns step-by-step explanation
- [ ] Handles complex queries (JOINs, subqueries)
- [ ] Handles MongoDB queries
- [ ] Explanation is beginner-friendly
- [ ] Loading state shown

### Natural Language to Query
- [ ] Text input for description
- [ ] Generates valid SQL (PostgreSQL mode)
- [ ] Generates valid MongoDB query (MongoDB mode)
- [ ] Uses current schema context
- [ ] "Copy to Editor" button
- [ ] Loading state shown

### Answer Validation
- [ ] Compare user query to expected
- [ ] Returns correct/partial/incorrect
- [ ] Gives helpful feedback
- [ ] Doesn't reveal full answer
- [ ] Loading state shown

### Hint System
- [ ] Progressive hints (hint 1, 2, 3)
- [ ] Each hint more specific
- [ ] Doesn't give away answer
- [ ] "Show Solution" as last resort

### Error Handling
- [ ] API error shows message
- [ ] Rate limit shows cooldown
- [ ] Empty input handled

### Code Quality
- [ ] No TypeScript errors
- [ ] Prompts are well-structured
- [ ] Responses parsed correctly
```

---

### Branch 15: `15-practice-mode`

**Create from:** `main` (after 14 merged)

**Purpose:** Create practice mode with AI-generated questions

#### Tasks

- [ ] Create question generator UI
- [ ] Difficulty selector (Easy/Medium/Hard)
- [ ] Generate questions based on current schema
- [ ] Practice mode interface
- [ ] Question display
- [ ] Answer submission
- [ ] Progress tracking
- [ ] Results summary

#### Files to Create/Modify

```
src/
├── components/
│   └── ai/
│       ├── QuestionGenerator.tsx  # Generate questions UI
│       ├── PracticeMode.tsx       # Practice interface
│       ├── QuestionCard.tsx       # Single question display
│       ├── PracticeResults.tsx    # Summary after practice
│       └── DifficultySelector.tsx # Easy/Medium/Hard
├── store/
│   └── practiceStore.ts           # Questions, progress, score
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 15-practice-mode

### Question Generation
- [ ] "Generate Questions" button works
- [ ] Difficulty selector works
- [ ] Generates 5 questions by default
- [ ] Questions are relevant to schema
- [ ] Questions increase in difficulty correctly
- [ ] Loading state shown

### Question Quality
- [ ] Easy questions test basic SELECT
- [ ] Medium questions test JOINs, GROUP BY
- [ ] Hard questions test subqueries, CTEs
- [ ] Questions are clear and answerable
- [ ] Expected output is defined

### Practice Interface
- [ ] Shows question clearly
- [ ] Editor for writing answer
- [ ] Run & Check button
- [ ] Next/Previous question
- [ ] Progress indicator (3/5)
- [ ] Skip question option

### Feedback
- [ ] Correct answer celebration
- [ ] Incorrect answer feedback
- [ ] Hints available
- [ ] Show solution option
- [ ] Partial credit (optional)

### Progress & Results
- [ ] Track questions answered
- [ ] Track correct/incorrect
- [ ] End of practice summary
- [ ] Score displayed
- [ ] Option to retry

### Persistence
- [ ] Practice progress saved
- [ ] Can resume interrupted practice
- [ ] History of practice sessions

### Code Quality
- [ ] No TypeScript errors
- [ ] Smooth transitions
- [ ] Keyboard navigation (Enter to submit)
```

---

### Branch 16: `16-theme-polish`

**Create from:** `main` (after 15 merged)

**Purpose:** Final UI polish, animations, and theme refinement

#### Tasks

- [ ] Polish light theme colors
- [ ] Polish dark theme colors
- [ ] Add transitions/animations
- [ ] Add loading skeletons
- [ ] Improve error states
- [ ] Add tooltips
- [ ] Keyboard shortcuts guide
- [ ] Accessibility audit (a11y)
- [ ] Mobile responsiveness final pass

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 16-theme-polish

### Visual Polish
- [ ] Light theme is clean and professional
- [ ] Dark theme is easy on eyes
- [ ] Consistent spacing throughout
- [ ] Consistent typography
- [ ] Icons are aligned properly
- [ ] No visual glitches

### Animations
- [ ] Panel resize is smooth
- [ ] Modal open/close animated
- [ ] Button hover states
- [ ] Loading spinners
- [ ] Skeleton loaders
- [ ] No jank or stutter

### Accessibility
- [ ] All interactive elements focusable
- [ ] Tab order makes sense
- [ ] Focus indicators visible
- [ ] Screen reader tested (basic)
- [ ] Color contrast passes WCAG AA
- [ ] Alt text for images/icons

### Keyboard Shortcuts
- [ ] Shortcuts guide modal
- [ ] Ctrl+Enter runs query
- [ ] Ctrl+S saves query
- [ ] Ctrl+/ toggles comment
- [ ] Escape closes modals

### Responsive
- [ ] 1920px: Full layout
- [ ] 1366px: Full layout
- [ ] 1024px: Adjusted panels
- [ ] 768px: Sidebar collapsible
- [ ] 375px: Mobile-friendly

### Error States
- [ ] Empty states designed nicely
- [ ] Error messages styled
- [ ] 404-like states handled

### Code Quality
- [ ] No TypeScript errors
- [ ] CSS is organized
- [ ] No unused styles
- [ ] Animations are performant
```

---

### Branch 17: `17-deployment`

**Create from:** `main` (after 16 merged)

**Purpose:** Setup GitHub Pages deployment with CI/CD

#### Tasks

- [ ] Configure Vite for GitHub Pages (base path)
- [ ] Create GitHub Actions workflow
- [ ] Setup CNAME (if custom domain)
- [ ] Create production build
- [ ] Test production build locally
- [ ] Write README with usage instructions
- [ ] Add CONTRIBUTING.md
- [ ] Add LICENSE
- [ ] Create release tags

#### Files to Create/Modify

```
.github/
└── workflows/
    └── deploy.yml
vite.config.ts (update base)
README.md
CONTRIBUTING.md
LICENSE
```

#### GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Validation Checklist Before Merge

```markdown
## Pre-Merge Checklist: 17-deployment

### Build
- [ ] `pnpm build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build size < 2MB (excluding WASM)
- [ ] WASM files included

### Local Production Test
- [ ] `pnpm preview` works
- [ ] All features work in production build
- [ ] No console errors
- [ ] Assets load correctly
- [ ] Routing works (if applicable)

### GitHub Actions
- [ ] Workflow file valid YAML
- [ ] Workflow triggers on main push
- [ ] Build step succeeds
- [ ] Deploy step succeeds
- [ ] Site accessible at github.io URL

### Documentation
- [ ] README has project description
- [ ] README has features list
- [ ] README has usage instructions
- [ ] README has development setup
- [ ] README has contributing guide
- [ ] LICENSE file present

### Performance
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 85
- [ ] Lighthouse Best Practices > 85
- [ ] Lighthouse SEO > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s

### Browser Testing (Production)
- [ ] Chrome: ✓
- [ ] Firefox: ✓
- [ ] Safari: ✓
- [ ] Edge: ✓
- [ ] Mobile Chrome: ✓
- [ ] Mobile Safari: ✓

### Final Checks
- [ ] Site works without CORS errors
- [ ] PGlite WASM loads correctly
- [ ] Default data loads on first visit
- [ ] localStorage works correctly
- [ ] All AI features work (with API key)
```

---

## Quick Reference

### Branch Order & Dependencies

| Order | Branch | Depends On | Est. Time |
|-------|--------|------------|-----------|
| 1 | `01-project-setup` | - | 1 day |
| 2 | `02-pglite-integration` | 01 | 1 day |
| 3 | `03-mingo-mongodb` | 02 | 1.5 days |
| 4 | `04-monaco-editor` | 03 | 1.5 days |
| 5 | `05-main-layout` | 04 | 1 day |
| 6 | `06-schema-explorer` | 05 | 1 day |
| 7 | `07-results-panel` | 06 | 1 day |
| 8 | `08-query-execution` | 07 | 0.5 days |
| 9 | `09-default-data` | 08 | 1 day |
| 10 | `10-localstorage-persistence` | 09 | 1 day |
| 11 | `11-import-export` | 10 | 1 day |
| 12 | `12-query-history` | 11 | 1 day |
| 13 | `13-gemini-integration` | 12 | 1 day |
| 14 | `14-ai-features` | 13 | 1.5 days |
| 15 | `15-practice-mode` | 14 | 1.5 days |
| 16 | `16-theme-polish` | 15 | 1 day |
| 17 | `17-deployment` | 16 | 0.5 days |

**Total Estimated Time: ~18-20 days**

### Git Commands Reference

```bash
# Start new feature branch
git checkout main
git pull origin main
git checkout -b 01-project-setup

# Work on branch
git add .
git commit -m "feat: setup vite + react + typescript"

# Push branch
git push -u origin 01-project-setup

# Create PR (on GitHub)
# After review, merge to main

# Start next branch
git checkout main
git pull origin main
git checkout -b 02-pglite-integration
```

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

---

## Merge Rules

1. **Never merge directly to main** — Always use Pull Requests
2. **Run all validation checks** before requesting review
3. **Squash commits** when merging (clean history)
4. **Delete branch** after merge
5. **Tag releases** at major milestones (v0.1.0, v0.2.0, v1.0.0)

---

*Document Version: 1.0*
*Last Updated: January 2025*
