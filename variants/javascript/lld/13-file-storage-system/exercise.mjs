// Learner workspace. Keep the public API; replace unfinished bodies.
export class FileCatalog {
  constructor() { throw new Error("Not implemented"); }
  upload(name, size) { throw new Error("Not implemented"); }
  get(name) { throw new Error("Not implemented"); }
}
export class FileStorage {
  constructor(quota) { throw new Error("Not implemented"); }
  advanceTo(timestamp) { throw new Error("Not implemented"); }
  upload(name, size, ttl = null) { throw new Error("Not implemented"); }
  get(name) { throw new Error("Not implemented"); }
  copy(source, destination) { throw new Error("Not implemented"); }
  delete(name) { throw new Error("Not implemented"); }
  usage() { throw new Error("Not implemented"); }
  search(prefix, limit = 10) { throw new Error("Not implemented"); }
}
