// MongoDB-specific type definitions for Mingo

export interface MongoQueryResult {
  success: boolean;
  data?: unknown[];
  count?: number;
  error?: string;
  executionTime: number;
}

export interface MongoDocument {
  _id?: string | ObjectId;
  [key: string]: unknown;
}

export interface ObjectId {
  $oid: string;
}

export interface MongoCollectionSchema {
  name: string;
  fields: MongoFieldSchema[];
  count: number;
}

export interface MongoFieldSchema {
  name: string;
  type: string;
}

// Query options
export interface FindOptions {
  projection?: Record<string, number | string | boolean>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

// Update operators
export interface UpdateOperators {
  $set?: Record<string, unknown>;
  $unset?: Record<string, string | number>;
  $inc?: Record<string, number>;
  $push?: Record<string, unknown>;
  $pull?: Record<string, unknown>;
  $mul?: Record<string, number>;
  $min?: Record<string, unknown>;
  $max?: Record<string, unknown>;
  $rename?: Record<string, string>;
}

// Aggregation pipeline stages
export type PipelineStage =
  | { $match: Record<string, unknown> }
  | { $group: Record<string, unknown> }
  | { $sort: Record<string, 1 | -1> }
  | { $limit: number }
  | { $skip: number }
  | { $project: Record<string, unknown> }
  | { $unwind: string }
  | { $count: string };

export interface InsertResult {
  acknowledged: boolean;
  insertedId: string;
}

export interface InsertManyResult {
  acknowledged: boolean;
  insertedIds: string[];
}

export interface UpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}
