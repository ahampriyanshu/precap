// Learner workspace. Keep the public API; replace unfinished bodies.
export class RecordStore {
  constructor() { throw new Error("Not implemented"); }
  set(key, field, value) { throw new Error("Not implemented"); }
  get(key, field) { throw new Error("Not implemented"); }
  scan(key, prefix = "") { throw new Error("Not implemented"); }
}
export class TemporalDatabase {
  constructor() { throw new Error("Not implemented"); }
  set(ts, key, field, value, ttl = null) { throw new Error("Not implemented"); }
  get(ts, key, field) { throw new Error("Not implemented"); }
  delete(ts, key, field) { throw new Error("Not implemented"); }
  compareAndSet(ts, key, field, expected, value, ttl = null) { throw new Error("Not implemented"); }
  scan(ts, key, prefix = "") { throw new Error("Not implemented"); }
  getAt(ts, key, field, at) { throw new Error("Not implemented"); }
}
