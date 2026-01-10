export interface ParsedQuery {
  collection: string;
  operation: MongoOperation;
  args: Record<string, unknown>;
}

export type MongoOperation =
  | 'find'
  | 'findOne'
  | 'insertOne'
  | 'insertMany'
  | 'updateOne'
  | 'updateMany'
  | 'deleteOne'
  | 'deleteMany'
  | 'countDocuments'
  | 'aggregate';

/**
 * Parse MongoDB-style query string
 * Supports syntax like: db.users.find({ age: { $gt: 25 } })
 */
export function parseMongoQuery(query: string): ParsedQuery | null {
  try {
    // Remove leading/trailing whitespace and semicolons
    const cleaned = query.trim().replace(/;$/, '');

    // Match pattern: db.collection.method(args...)
    const match = cleaned.match(
      /db\.(\w+)\.(find|findOne|insertOne|insertMany|updateOne|updateMany|deleteOne|deleteMany|countDocuments|aggregate)\((.*)\)$/s
    );

    if (!match) {
      return null;
    }

    const [, collection, operation, argsStr] = match;

    return {
      collection,
      operation: operation as MongoOperation,
      args: parseArguments(argsStr, operation as MongoOperation),
    };
  } catch {
    return null;
  }
}

/**
 * Parse arguments based on operation type
 */
function parseArguments(argsStr: string, operation: MongoOperation): Record<string, unknown> {
  const args: Record<string, unknown> = {};

  switch (operation) {
    case 'find':
    case 'findOne': {
      // find(filter, options)
      const parts = splitArguments(argsStr);
      args.filter = parts[0] ? parseJSON(parts[0]) : {};
      args.options = parts[1] ? parseJSON(parts[1]) : undefined;
      break;
    }

    case 'insertOne': {
      // insertOne(document)
      args.document = parseJSON(argsStr);
      break;
    }

    case 'insertMany': {
      // insertMany([documents])
      args.documents = parseJSON(argsStr);
      break;
    }

    case 'updateOne':
    case 'updateMany': {
      // updateOne(filter, update, options)
      const parts = splitArguments(argsStr);
      args.filter = parts[0] ? parseJSON(parts[0]) : {};
      args.update = parts[1] ? parseJSON(parts[1]) : {};
      args.options = parts[2] ? parseJSON(parts[2]) : undefined;
      break;
    }

    case 'deleteOne':
    case 'deleteMany': {
      // deleteOne(filter)
      args.filter = parseJSON(argsStr);
      break;
    }

    case 'countDocuments': {
      // countDocuments(filter)
      args.filter = parseJSON(argsStr);
      break;
    }

    case 'aggregate': {
      // aggregate([pipeline])
      args.pipeline = parseJSON(argsStr);
      break;
    }
  }

  return args;
}

/**
 * Split arguments by comma, respecting nested objects/arrays
 */
function splitArguments(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      current += char;
      if (char === stringChar && str[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (char === '{' || char === '[') {
      depth++;
      current += char;
    } else if (char === '}' || char === ']') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Safe JSON parse with error handling
 */
function parseJSON(str: string): unknown {
  try {
    // Handle single-quoted strings by converting to double quotes
    const normalized = str.replace(/'/g, '"');
    return JSON.parse(normalized);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique ObjectId
 */
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18);
  return timestamp + random.padStart(16, '0');
}
