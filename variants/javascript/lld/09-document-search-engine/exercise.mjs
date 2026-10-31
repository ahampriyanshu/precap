// Learner workspace. Keep the public API; replace unfinished bodies.
export function tokenize(text) { throw new Error("Not implemented"); }
export class SearchEngine {
  constructor() { throw new Error("Not implemented"); }
  add(docId, text) { throw new Error("Not implemented"); }
  get(docId) { throw new Error("Not implemented"); }
  update(docId, text) { throw new Error("Not implemented"); }
  delete(docId) { throw new Error("Not implemented"); }
  search(term, limit = 10) { throw new Error("Not implemented"); }
  searchPhrase(phrase, limit = 10) { throw new Error("Not implemented"); }
  stats() { throw new Error("Not implemented"); }
}
