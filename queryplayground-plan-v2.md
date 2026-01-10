# QueryPlayground - Project Plan v2

> A browser-based SQL & NoSQL query practice platform with AI-powered learning assistance.

---

## 1. Project Overview

### What It Does
A client-side playground where users can practice PostgreSQL and MongoDB queries with:
- **Pre-loaded sample data** (ready to query immediately)
- **AI-powered practice questions** (via user's own Gemini API key)
- **Full localStorage persistence** (save progress, clear when needed)

### Key Principles
- Zero setup — works immediately with default data
- No backend — everything runs in browser
- BYOK (Bring Your Own Key) — users provide their Gemini API key
- GitHub Pages deployable

---

## 2. Core Features

### 2.1 Data Management

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   DEFAULT   │  │   IMPORT    │  │   CREATE NEW        │  │
│  │   DATA      │  │   DATA      │  │                     │  │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤  │
│  │ Pre-loaded  │  │ CSV upload  │  │ SQL: CREATE TABLE   │  │
│  │ on first    │  │ JSON upload │  │ Mongo: Visual UI    │  │
│  │ visit       │  │             │  │ or JSON schema      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │    localStorage     │                        │
│              │    (IndexedDB)      │                        │
│              ├─────────────────────┤                        │
│              │ • Tables/Collections│                        │
│              │ • User data         │                        │
│              │ • Query history     │                        │
│              │ • Saved queries     │                        │
│              │ • Gemini API key    │                        │
│              │ • Preferences       │                        │
│              └─────────────────────┘                        │
│                                                             │
│              [💾 Auto-Save]    [🗑️ Clear All Data]          │
│              [📤 Export]       [🔄 Reset to Default]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Default Data (Loaded on First Visit)

**PostgreSQL Mode:**
- `users` table (10 rows)
- `products` table (15 rows)
- `orders` table (20 rows)
- `order_items` table (30 rows)

**MongoDB Mode:**
- `users` collection (10 documents)
- `posts` collection (15 documents)
- `comments` collection (25 documents)

### 2.2 Query Editor with Syntax Highlighting

```
┌─────────────────────────────────────────────────────────────┐
│  [PostgreSQL ▼]                              [🌙 Dark Mode] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1 │ SELECT                                                │
│   2 │   u.name,                                             │
│   3 │   COUNT(o.id) AS order_count,                         │
│   4 │   SUM(o.total) AS total_spent                         │
│   5 │ FROM users u                                          │
│   6 │ LEFT JOIN orders o ON u.id = o.user_id                │
│   7 │ WHERE u.created_at > '2024-01-01'                     │
│   8 │ GROUP BY u.id, u.name                                 │
│   9 │ HAVING COUNT(o.id) > 2                                │
│  10 │ ORDER BY total_spent DESC;                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [▶ Run Query]  [💾 Save]  [🧹 Clear]  [⌨️ Ctrl+Enter]      │
└─────────────────────────────────────────────────────────────┘
```

#### Syntax Highlighting Themes

| Token Type | PostgreSQL Color | MongoDB Color |
|------------|------------------|---------------|
| Keywords | `#569CD6` (blue) | `#C586C0` (purple) |
| Functions | `#DCDCAA` (yellow) | `#DCDCAA` (yellow) |
| Strings | `#CE9178` (orange) | `#CE9178` (orange) |
| Numbers | `#B5CEA8` (green) | `#B5CEA8` (green) |
| Operators | `#D4D4D4` (gray) | `#D4D4D4` (gray) |
| Tables/Collections | `#4EC9B0` (teal) | `#4EC9B0` (teal) |
| Comments | `#6A9955` (green) | `#6A9955` (green) |

**Visual Distinction:**
- PostgreSQL: Blue-themed keywords (SELECT, FROM, WHERE)
- MongoDB: Purple-themed methods (find, aggregate, insertOne)
- Clear mode indicator badge in editor

### 2.3 Gemini AI Integration (BYOK)

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI Assistant                              [Settings ⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔑 Gemini API Key: ••••••••••••••••  [Show] [Save]  │    │
│  │    Model: gemini-2.5-flash                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   AI FEATURES                        │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  📝 Generate Questions                               │    │
│  │     Based on current tables, generate practice       │    │
│  │     questions (Easy / Medium / Hard)                 │    │
│  │     [Generate 5 Questions]                           │    │
│  │                                                      │    │
│  │  💬 Natural Language to Query                        │    │
│  │     "Show me users who spent more than $100"         │    │
│  │     [Convert to SQL]                                 │    │
│  │                                                      │    │
│  │  📖 Explain Query                                    │    │
│  │     Paste a query and get detailed explanation       │    │
│  │     [Explain Current Query]                          │    │
│  │                                                      │    │
│  │  ✅ Validate Answer                                  │    │
│  │     Check if your query matches expected result      │    │
│  │     [Check My Answer]                                │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### AI Features Detail

| Feature | Description | Gemini Prompt Strategy |
|---------|-------------|------------------------|
| **Generate Questions** | Creates practice problems based on table schema | Send schema + ask for questions at difficulty level |
| **NL to Query** | Convert plain English to SQL/MongoDB | Send schema + natural language description |
| **Explain Query** | Break down query step by step | Send query + ask for beginner-friendly explanation |
| **Validate Answer** | Compare user query output with expected | Send question + user query + expected result |
| **Hint System** | Progressive hints for stuck users | Send question + user's attempt + ask for hint |

#### API Key Management

```typescript
// Stored in localStorage (encrypted display only)
interface AISettings {
  apiKey: string;          // User's Gemini API key
  model: 'gemini-2.5-flash';
  enabled: boolean;
}

// API call (client-side)
async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

---

## 3. User Interface

### 3.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  QueryPlayground          [PostgreSQL ▼]  [🤖 AI]  [⚙️]  [🌙]          │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                    │
│  SCHEMA EXPLORER   │   QUERY EDITOR                                     │
│  ────────────────  │   ───────────────────────────────────────────────  │
│                    │                                                    │
│  📁 Tables         │   SELECT * FROM users                              │
│    ├─ 👤 users     │   WHERE age > 25                                   │
│    │   ├─ id       │   ORDER BY name;                                   │
│    │   ├─ name     │                                                    │
│    │   ├─ email    │                                                    │
│    │   └─ age      │   [▶ Run]  [💾 Save]  [📝 AI Questions]            │
│    ├─ 📦 products  │                                                    │
│    └─ 🛒 orders    ├────────────────────────────────────────────────────┤
│                    │                                                    │
│  ────────────────  │   RESULTS                         Rows: 5 | 12ms  │
│  [+ New Table]     │   ───────────────────────────────────────────────  │
│  [📥 Import]       │   ┌────┬──────────┬─────────────────┬─────┐       │
│  [🔄 Reset]        │   │ id │ name     │ email           │ age │       │
│                    │   ├────┼──────────┼─────────────────┼─────┤       │
│  ────────────────  │   │ 1  │ Alice    │ alice@mail.com  │ 28  │       │
│                    │   │ 2  │ Bob      │ bob@mail.com    │ 32  │       │
│  QUERY HISTORY     │   │ 3  │ Charlie  │ charlie@m.com   │ 45  │       │
│  ────────────────  │   └────┴──────────┴─────────────────┴─────┘       │
│  • SELECT * FROM.. │                                                    │
│  • INSERT INTO...  │   [📋 Copy]  [📤 Export CSV]  [📤 Export JSON]    │
│  • UPDATE users... │                                                    │
│                    │                                                    │
├────────────────────┴────────────────────────────────────────────────────┤
│  💾 Auto-saved to browser   │   [🗑️ Clear All Data]   │   [GitHub ⭐]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 AI Practice Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 Practice Mode                                    [Back to Editor]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Question 3 of 5                                          [Easy] 🟢     │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  📝 Write a query to find all users who have placed more than           │
│     2 orders and spent a total of more than $100.                       │
│                                                                         │
│  Expected columns: name, order_count, total_spent                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ -- Write your query here                                        │    │
│  │ SELECT                                                          │    │
│  │   u.name,                                                       │    │
│  │   COUNT(o.id) AS order_count                                    │    │
│  │ FROM users u                                                    │    │
│  │ JOIN orders o ON u.id = o.user_id                               │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  [▶ Run & Check]     [💡 Hint]     [📖 Show Solution]     [⏭️ Skip]    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  💡 Hint 1: You need to use GROUP BY and HAVING clauses                 │
│                                                                         │
│  ❌ Your query is missing the total_spent column and HAVING clause      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Persistence

### 4.1 Storage Structure

```typescript
// localStorage keys
const STORAGE_KEYS = {
  // Database state
  PG_TABLES: 'qp_pg_tables',        // PostgreSQL tables + data
  MONGO_COLLECTIONS: 'qp_mongo_collections', // MongoDB collections + data
  
  // User preferences
  THEME: 'qp_theme',                 // 'light' | 'dark'
  ACTIVE_DB: 'qp_active_db',         // 'postgresql' | 'mongodb'
  EDITOR_SETTINGS: 'qp_editor',      // font size, tab size, etc.
  
  // AI settings
  GEMINI_API_KEY: 'qp_gemini_key',   // encrypted/encoded
  AI_ENABLED: 'qp_ai_enabled',
  
  // History
  QUERY_HISTORY: 'qp_query_history', // last 50 queries
  SAVED_QUERIES: 'qp_saved_queries', // bookmarked queries
  
  // Practice progress
  PRACTICE_PROGRESS: 'qp_practice',  // completed questions
  
  // Meta
  FIRST_VISIT: 'qp_first_visit',     // for loading default data
  VERSION: 'qp_version',             // for migrations
};
```

### 4.2 Auto-Save Logic

```typescript
// Auto-save on every data change
function usePersistence() {
  const saveToStorage = debounce((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, 500); // 500ms debounce
  
  // Load on mount
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
    
    if (isFirstVisit) {
      // Load default data
      loadDefaultPostgresData();
      loadDefaultMongoData();
      localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'false');
    } else {
      // Restore from localStorage
      restoreFromStorage();
    }
  }, []);
  
  return { saveToStorage };
}
```

### 4.3 Clear & Reset Options

| Action | What it does |
|--------|--------------|
| **Clear All Data** | Removes everything, fresh start (empty) |
| **Reset to Default** | Removes user data, reloads default tables |
| **Clear Query History** | Only clears history, keeps tables |
| **Export Workspace** | Downloads JSON with all data |
| **Import Workspace** | Restores from exported JSON |

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT APPLICATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        ZUSTAND STORES                            │    │
│  ├─────────────┬─────────────┬──────────────┬─────────────────────┤    │
│  │ dbStore     │ editorStore │ uiStore      │ aiStore             │    │
│  │ • tables    │ • content   │ • theme      │ • apiKey            │    │
│  │ • activeDb  │ • history   │ • panels     │ • questions         │    │
│  │ • results   │ • saved     │ • modals     │ • loading           │    │
│  └─────────────┴─────────────┴──────────────┴─────────────────────┘    │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       PERSISTENCE LAYER                          │    │
│  │                     (localStorage + IndexedDB)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│         ┌──────────────────────────┼──────────────────────────┐         │
│         ▼                          ▼                          ▼         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │     PGlite      │    │     Mingo      │    │   Gemini API    │      │
│  │   (PostgreSQL   │    │   (MongoDB      │    │   (External)    │      │
│  │     WASM)       │    │    Simulation)  │    │                 │      │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Tech Stack

### Core

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Storage | localStorage + IndexedDB (via idb-keyval) |

### Database Engines

| Database | Library |
|----------|---------|
| PostgreSQL | `@electric-sql/pglite` |
| MongoDB-like | `mingo` |

### UI Components

| Component | Library |
|-----------|---------|
| Code Editor | `@monaco-editor/react` |
| Data Table | `@tanstack/react-table` |
| Icons | `lucide-react` |
| Resizable Panels | `react-resizable-panels` |
| Toasts | `sonner` |

### AI Integration

| Service | Details |
|---------|---------|
| Gemini API | `gemini-2.5-flash` model |
| Auth | User-provided API key (BYOK) |
| Rate Limiting | Client-side throttle (10 req/min) |

---

## 7. Project Structure

```
queryplayground/
├── public/
│   ├── favicon.svg
│   └── default-data/
│       ├── postgres-schema.sql
│       ├── postgres-seed.sql
│       └── mongo-seed.json
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── QueryEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── SyntaxHighlighter.ts
│   │   │
│   │   ├── results/
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── TableView.tsx
│   │   │   └── JsonView.tsx
│   │   │
│   │   ├── schema/
│   │   │   ├── SchemaExplorer.tsx
│   │   │   ├── TableItem.tsx
│   │   │   ├── CreateTableModal.tsx
│   │   │   └── ImportDataModal.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx
│   │   │   ├── ApiKeyInput.tsx
│   │   │   ├── QuestionGenerator.tsx
│   │   │   ├── QueryExplainer.tsx
│   │   │   └── PracticeMode.tsx
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── db/
│   │   ├── postgres/
│   │   │   ├── client.ts
│   │   │   ├── defaultData.ts
│   │   │   └── helpers.ts
│   │   │
│   │   └── mongodb/
│   │       ├── client.ts
│   │       ├── queryParser.ts
│   │       ├── queryExecutor.ts  # Mingo-based query execution
│   │       └── defaultData.ts
│   │
│   ├── services/
│   │   ├── gemini.ts           # Gemini API wrapper
│   │   ├── storage.ts          # localStorage helpers
│   │   └── export.ts           # Export/Import utilities
│   │
│   ├── store/
│   │   ├── dbStore.ts
│   │   ├── editorStore.ts
│   │   ├── uiStore.ts
│   │   └── aiStore.ts
│   │
│   ├── hooks/
│   │   ├── useDatabase.ts
│   │   ├── usePersistence.ts
│   │   ├── useGemini.ts
│   │   └── useQueryExecution.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 8. Default Sample Data

### PostgreSQL Tables

```sql
-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INT,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, age, city) VALUES
  ('Alice Johnson', 'alice@example.com', 28, 'New York'),
  ('Bob Smith', 'bob@example.com', 35, 'Los Angeles'),
  ('Charlie Brown', 'charlie@example.com', 42, 'Chicago'),
  ('Diana Ross', 'diana@example.com', 31, 'Houston'),
  ('Eve Wilson', 'eve@example.com', 24, 'Phoenix'),
  ('Frank Miller', 'frank@example.com', 45, 'Philadelphia'),
  ('Grace Lee', 'grace@example.com', 29, 'San Antonio'),
  ('Henry Davis', 'henry@example.com', 38, 'San Diego'),
  ('Ivy Chen', 'ivy@example.com', 26, 'Dallas'),
  ('Jack Taylor', 'jack@example.com', 33, 'San Jose');

-- PRODUCTS TABLE
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0
);

INSERT INTO products (name, category, price, stock) VALUES
  ('Laptop Pro', 'Electronics', 1299.99, 50),
  ('Wireless Mouse', 'Electronics', 29.99, 200),
  ('USB-C Hub', 'Electronics', 49.99, 150),
  ('Mechanical Keyboard', 'Electronics', 149.99, 75),
  ('Monitor 27"', 'Electronics', 399.99, 30),
  ('Desk Chair', 'Furniture', 299.99, 40),
  ('Standing Desk', 'Furniture', 599.99, 25),
  ('Notebook Pack', 'Stationery', 12.99, 500),
  ('Pen Set', 'Stationery', 8.99, 300),
  ('Desk Lamp', 'Furniture', 45.99, 100),
  ('Webcam HD', 'Electronics', 79.99, 80),
  ('Headphones', 'Electronics', 199.99, 60),
  ('Mouse Pad XL', 'Accessories', 19.99, 250),
  ('Cable Organizer', 'Accessories', 14.99, 180),
  ('Phone Stand', 'Accessories', 24.99, 120);

-- ORDERS TABLE
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER_ITEMS TABLE
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Sample orders and items...
```

### MongoDB Collections

```json
{
  "users": [
    {
      "_id": "u001",
      "username": "alice_j",
      "email": "alice@example.com",
      "profile": {
        "fullName": "Alice Johnson",
        "age": 28,
        "city": "New York",
        "bio": "Software developer"
      },
      "followers": 1250,
      "following": 340,
      "isVerified": true,
      "createdAt": "2023-01-15T10:30:00Z"
    }
    // ... more users
  ],
  "posts": [
    {
      "_id": "p001",
      "userId": "u001",
      "content": "Just launched my new project! 🚀",
      "likes": 342,
      "tags": ["tech", "launch", "coding"],
      "comments": 28,
      "isPublic": true,
      "createdAt": "2024-06-15T14:20:00Z"
    }
    // ... more posts
  ],
  "comments": [
    {
      "_id": "c001",
      "postId": "p001",
      "userId": "u002",
      "text": "Congratulations! This looks amazing!",
      "likes": 15,
      "createdAt": "2024-06-15T14:35:00Z"
    }
    // ... more comments
  ]
}
```

---

## 9. Gemini API Integration

### 9.1 Prompt Templates

```typescript
const PROMPTS = {
  generateQuestions: (schema: string, difficulty: string, count: number) => `
You are a database instructor. Based on the following database schema, generate ${count} ${difficulty} level practice questions.

Schema:
${schema}

For each question:
1. Write a clear problem statement
2. Specify expected output columns
3. Provide the correct SQL query (hidden from student initially)

Format as JSON array:
[
  {
    "id": 1,
    "difficulty": "${difficulty}",
    "question": "...",
    "expectedColumns": ["col1", "col2"],
    "solution": "SELECT ...",
    "hint": "Think about..."
  }
]
`,

  explainQuery: (query: string, dbType: string) => `
Explain this ${dbType} query step by step for a beginner:

${query}

Break down:
1. What each clause does
2. The order of execution
3. What the final result will look like
`,

  naturalLanguageToQuery: (schema: string, description: string, dbType: string) => `
Convert this natural language request to a ${dbType} query.

Schema:
${schema}

Request: "${description}"

Return only the query, no explanation.
`,

  validateAnswer: (question: string, userQuery: string, solution: string) => `
Compare the student's query to the expected solution.

Question: ${question}
Student's Query: ${userQuery}
Expected Solution: ${solution}

Respond with:
1. Is it correct? (yes/partial/no)
2. If not correct, what's wrong?
3. Helpful hint without giving away the answer
`
};
```

### 9.2 API Service

```typescript
// src/services/gemini.ts
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class GeminiService {
  private apiKey: string;
  private requestCount = 0;
  private lastRequestTime = 0;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateContent(prompt: string): Promise<string> {
    // Rate limiting: max 10 requests per minute
    await this.throttle();
    
    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  
  private async throttle(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRequestTime < 6000) { // 10 req/min = 1 req/6sec
      await new Promise(resolve => 
        setTimeout(resolve, 6000 - (now - this.lastRequestTime))
      );
    }
    this.lastRequestTime = Date.now();
  }
}
```

---

## 10. Development Timeline

### Week 1: Foundation & Core
| Day | Tasks |
|-----|-------|
| 1 | Project setup: Vite + React + TypeScript + Tailwind |
| 2 | Integrate PGlite, test queries, load default data |
| 3 | Integrate Mingo, MongoDB query parser |
| 4 | Monaco Editor with SQL/MongoDB syntax highlighting |
| 5 | Build main layout (resizable panels) |

### Week 2: Features & Persistence
| Day | Tasks |
|-----|-------|
| 1 | Schema explorer component |
| 2 | Results panel (table view, JSON view) |
| 3 | localStorage persistence (auto-save, restore) |
| 4 | Import/Export data (CSV, JSON) |
| 5 | Query history & saved queries |

### Week 3: AI Integration & Polish
| Day | Tasks |
|-----|-------|
| 1 | Gemini API service, API key management |
| 2 | Question generator feature |
| 3 | Query explainer & NL-to-query features |
| 4 | Practice mode UI |
| 5 | Testing, bug fixes, dark mode polish |

### Week 4: Deploy & Documentation
| Day | Tasks |
|-----|-------|
| 1-2 | GitHub Actions CI/CD, deploy to GitHub Pages |
| 3 | README, usage documentation |
| 4 | Performance optimization, Lighthouse audit |
| 5 | Final testing, launch! |

---

## 11. Future Enhancements

| Phase | Feature |
|-------|---------|
| v1.1 | More sample datasets (HR, Library, Hospital) |
| v1.2 | Query performance analysis (EXPLAIN) |
| v1.3 | Shareable workspace via URL (encoded state) |
| v1.4 | Multiple AI providers (OpenAI, Claude) |
| v2.0 | Interactive tutorials & guided learning paths |
| v2.1 | Leaderboard & achievements |
| v2.2 | PWA support (offline mode) |

---

## 12. Success Metrics

- [ ] Loads with default data in < 3 seconds
- [ ] Query execution < 500ms (typical queries)
- [ ] Works offline after first load
- [ ] Lighthouse score > 85
- [ ] Zero data loss (persistence works reliably)

---

*Last Updated: January 2025*
*Project: QueryPlayground v2*
