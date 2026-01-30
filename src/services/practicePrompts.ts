import type { DatabaseMode } from '@/types/editor';
import type { PracticeDifficulty } from '@/types/practice';
import type { PostgresTableSchema } from '@/db/postgres/types';
import type { MongoCollectionSchema } from '@/db/mongodb/types';

interface PracticePromptOptions {
  schema: PostgresTableSchema[] | MongoCollectionSchema[];
  database: DatabaseMode;
  difficulty: PracticeDifficulty;
  count: number;
}

function formatPostgresSchema(tables: PostgresTableSchema[]): string {
  if (tables.length === 0) return 'No tables available.';
  return tables
    .map((table) => {
      const columns = table.columns
        .map((col) => {
          const flags = [col.isPrimaryKey ? 'PK' : null, col.isForeignKey ? 'FK' : null]
            .filter(Boolean)
            .join(',');
          const flagText = flags ? ` (${flags})` : '';
          return `- ${col.name}: ${col.type}${flagText}`;
        })
        .join('\n');
      const rowCount = typeof table.rowCount === 'number' ? ` (rows: ${table.rowCount})` : '';
      return `Table ${table.name}${rowCount}\n${columns}`;
    })
    .join('\n\n');
}

function formatMongoSchema(collections: MongoCollectionSchema[]): string {
  if (collections.length === 0) return 'No collections available.';
  return collections
    .map((collection) => {
      const fields = collection.fields
        .map((field) => `- ${field.name}: ${field.type}`)
        .join('\n');
      return `Collection ${collection.name} (docs: ${collection.count})\n${fields}`;
    })
    .join('\n\n');
}

export function buildPracticePrompt({ schema, database, difficulty, count }: PracticePromptOptions): string {
  const schemaText =
    database === 'postgresql'
      ? formatPostgresSchema(schema as PostgresTableSchema[])
      : formatMongoSchema(schema as MongoCollectionSchema[]);

  const dbLabel = database === 'postgresql' ? 'PostgreSQL' : 'MongoDB';

  return [
    `You are a database tutor generating ${count} ${difficulty} practice questions for ${dbLabel}.`,
    'Use ONLY the tables/collections and fields in the provided schema.',
    'Rules:',
    '- Questions must be answerable with a single read-only query.',
    '- SQL: use SELECT or WITH ... SELECT only. Do NOT use INSERT/UPDATE/DELETE/DDL.',
    '- MongoDB: use db.collection.find(...) or db.collection.aggregate([...]) only.',
    '- Provide exactly 3 hints per question, progressively more specific.',
    '- Provide the expectedQuery for each question (the reference solution).',
    '- Output valid JSON only. No markdown, no code fences.',
    'Required JSON format:',
    '{ "questions": [ { "id": "q1", "difficulty": "easy", "prompt": "...", "expectedQuery": "...", "hints": ["...","...","..."] } ] }',
    '',
    'Schema:',
    schemaText,
  ].join('\n');
}
