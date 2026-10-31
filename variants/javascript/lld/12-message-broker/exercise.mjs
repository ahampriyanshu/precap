// Learner workspace. Keep the public API; replace unfinished bodies.
export class MessageQueue {
  constructor() { throw new Error("Not implemented"); }
  publish(messageId, payload) { throw new Error("Not implemented"); }
  consume() { throw new Error("Not implemented"); }
}
export class MessageBroker {
  constructor(maxAttempts = 2) { throw new Error("Not implemented"); }
  publish(messageId, payload) { throw new Error("Not implemented"); }
  subscribe(groupId) { throw new Error("Not implemented"); }
  poll(groupId) { throw new Error("Not implemented"); }
  ack(groupId, messageId) { throw new Error("Not implemented"); }
  nack(groupId, messageId) { throw new Error("Not implemented"); }
  deadLetters(groupId) { throw new Error("Not implemented"); }
}
