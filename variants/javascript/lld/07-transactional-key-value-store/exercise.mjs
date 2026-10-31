// Learner workspace. Keep the public API; replace unfinished bodies.
export class KeyValueStore {
  constructor() { throw new Error("Not implemented"); }
  set(key, value) { throw new Error("Not implemented"); }
  get(key) { throw new Error("Not implemented"); }
  delete(key) { throw new Error("Not implemented"); }
}
export class TransactionalStore {
  constructor() { throw new Error("Not implemented"); }
  set(key, value) { throw new Error("Not implemented"); }
  get(key) { throw new Error("Not implemented"); }
  delete(key) { throw new Error("Not implemented"); }
  begin() { throw new Error("Not implemented"); }
  commit() { throw new Error("Not implemented"); }
  rollback() { throw new Error("Not implemented"); }
  depth() { throw new Error("Not implemented"); }
  snapshot(prefix = "") { throw new Error("Not implemented"); }
}
