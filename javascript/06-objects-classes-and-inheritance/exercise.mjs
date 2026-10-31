export class Document {
  constructor(id, title) { throw new Error("Not implemented"); }
  setTitle(title) { throw new Error("Not implemented"); }
  snapshot() { throw new Error("Not implemented"); }
}
export class VersionedDocument extends Document {
  constructor(id, title) { super(id, title); throw new Error("Not implemented"); }
  setTitle(title) { throw new Error("Not implemented"); }
  snapshot() { throw new Error("Not implemented"); }
}
