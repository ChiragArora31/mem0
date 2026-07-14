/// <reference types="jest" />

import type { VectorStoreResult } from "../src/types";

const CAMEL_CASE_ENTITY_KEYS = ["userId", "agentId", "runId"];
const BACKEND_ONLY_KEYS = ["embedding", "vector", "__vector_score"];

interface ResultContractInput {
  id: string;
  payload: Record<string, unknown>;
  get: VectorStoreResult | null;
  list: VectorStoreResult[];
  search: VectorStoreResult[];
}

function findResult(
  results: VectorStoreResult[],
  id: string,
  operation: "list" | "search",
): VectorStoreResult {
  const result = results.find((candidate) => candidate.id === id);
  expect(result).toBeDefined();
  if (!result) {
    throw new Error(`${operation}() did not return vector ${id}`);
  }
  return result;
}

function expectCanonicalResult(
  result: VectorStoreResult,
  id: string,
  payload: Record<string, unknown>,
): void {
  expect(result.id).toBe(id);
  expect(result.payload).toEqual(payload);

  for (const key of [...CAMEL_CASE_ENTITY_KEYS, ...BACKEND_ONLY_KEYS]) {
    expect(result.payload).not.toHaveProperty(key);
  }

  if (result.score !== undefined) {
    expect(Number.isFinite(result.score)).toBe(true);
  }
}

export function expectVectorStoreResultContract({
  id,
  payload,
  get,
  list,
  search,
}: ResultContractInput): void {
  expect(get).not.toBeNull();
  if (!get) {
    throw new Error(`get() did not return vector ${id}`);
  }

  expectCanonicalResult(get, id, payload);
  expectCanonicalResult(findResult(list, id, "list"), id, payload);
  expectCanonicalResult(findResult(search, id, "search"), id, payload);
}
