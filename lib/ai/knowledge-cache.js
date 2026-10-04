let cache = {at: 0, docs: null};

export function readKnowledgeCache(maxAgeMs = 8000) {
  if (cache.docs && Date.now() - cache.at < maxAgeMs) return cache.docs;
  return null;
}

export function writeKnowledgeCache(docs) {
  cache = {at: Date.now(), docs};
  return docs;
}

export function invalidateAiKnowledge() {
  cache = {at: 0, docs: null};
}
