import type { DatabaseMode } from '@/types/editor';
import type { PostgresTableSchema } from '@/db/postgres/types';
import type { MongoCollectionSchema } from '@/db/mongodb/types';

export type SchemaData = PostgresTableSchema[] | MongoCollectionSchema[];

export function formatSchemaForPrompt(schema: SchemaData, dbType: DatabaseMode): string {
  if (!schema || schema.length === 0) {
    return 'No schema available.';
  }

  if (dbType === 'postgresql') {
    const tables = schema as PostgresTableSchema[];
    return tables
      .map((table) => {
        const columnLines = table.columns
          .map((column) => {
            const flags = [
              column.isPrimaryKey ? 'PK' : null,
              column.isForeignKey ? 'FK' : null,
              column.nullable ? 'nullable' : 'not null',
            ]
              .filter(Boolean)
              .join(', ');
            return `- ${column.name}: ${column.type} (${flags})`;
          })
          .join('\n');
        const rowInfo = table.rowCount !== undefined ? ` rows: ${table.rowCount}` : '';
        return `Table ${table.name}${rowInfo}\n${columnLines}`;
      })
      .join('\n\n');
  }

  const collections = schema as MongoCollectionSchema[];
  return collections
    .map((collection) => {
      const fieldLines = collection.fields
        .map((field) => `- ${field.name}: ${field.type}`)
        .join('\n');
      return `Collection ${collection.name} (count: ${collection.count})\n${fieldLines}`;
    })
    .join('\n\n');
}

export const PROMPTS = {
  explainQuery: (query: string, dbType: DatabaseMode) => `Explain this ${dbType} query step by step for a beginner.\n\nQuery:\n${query}\n\nFocus on:\n1. What each clause or stage does\n2. The order of execution\n3. What the final result looks like\n`,

  naturalLanguageToQuery: (
    schemaText: string,
    description: string,
    dbType: DatabaseMode
  ) => `Convert this natural language request to a ${dbType} query.\n\nSchema:\n${schemaText}\n\nRequest: "${description}"\n\nReturn only the query.`,

  validateAnswer: (
    schemaText: string,
    question: string,
    userQuery: string,
    dbType: DatabaseMode
  ) => `You are a database instructor. Evaluate the student's ${dbType} query.\n\nSchema:\n${schemaText}\n\nQuestion:\n${question}\n\nStudent Query:\n${userQuery}\n\nRespond in JSON with these keys:\n- correctness: one of "yes", "partial", "no"\n- issues: short list of problems (array of strings)\n- hint: a helpful hint without giving away the full answer\n`,

  hint: (
    schemaText: string,
    question: string,
    userAttempt: string,
    previousHints: string[]
  ) => `Provide the next helpful hint for the student without giving away the full answer.\n\nSchema:\n${schemaText}\n\nQuestion:\n${question}\n\nStudent Attempt:\n${userAttempt}\n\nPrevious hints:\n${previousHints.length ? previousHints.map((hint, index) => `${index + 1}. ${hint}`).join('\n') : 'None'}\n`,
};
