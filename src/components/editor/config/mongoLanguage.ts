import type { Monaco } from '@monaco-editor/react';

/**
 * Configure MongoDB language (JavaScript-based) for Monaco Editor
 * Uses built-in JavaScript language with MongoDB-specific configuration
 */
export function configureMongoLanguage(monaco: Monaco): void {
  // Set language configuration for JavaScript
  monaco.languages.setLanguageConfiguration('javascript', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
  });
}

/**
 * MongoDB keywords for reference
 * These are highlighted naturally by JavaScript syntax highlighting
 */
export const MONGODB_KEYWORDS = {
  // Collection methods
  methods: [
    'find',
    'findOne',
    'insertOne',
    'insertMany',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'replaceOne',
    'aggregate',
    'countDocuments',
    'estimatedDocumentCount',
    'distinct',
    'bulkWrite',
  ],
  // Query operators
  operators: [
    '$eq',
    '$ne',
    '$gt',
    '$gte',
    '$lt',
    '$lte',
    '$in',
    '$nin',
    '$and',
    '$or',
    '$not',
    '$nor',
    '$exists',
    '$type',
    '$all',
    '$size',
    '$elemMatch',
    '$regex',
    '$expr',
    '$mod',
    '$set',
    '$unset',
    '$inc',
    '$mul',
    '$push',
    '$pull',
    '$pop',
  ],
  // Aggregation stages
  aggregation: [
    '$match',
    '$group',
    '$project',
    '$sort',
    '$limit',
    '$skip',
    '$lookup',
    '$unwind',
    '$addFields',
    '$count',
    '$facet',
  ],
};
