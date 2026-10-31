// Learner workspace. Keep the public API; replace unfinished bodies.
export class PriorityQueue {
  constructor() { throw new Error("Not implemented"); }
  add(name, priority) { throw new Error("Not implemented"); }
  pop() { throw new Error("Not implemented"); }
}
export class TaskScheduler {
  constructor() { throw new Error("Not implemented"); }
  addTask(name, priority) { throw new Error("Not implemented"); }
  addWorker(workerId, capacity) { throw new Error("Not implemented"); }
  dispatch(ts, workerId, lease) { throw new Error("Not implemented"); }
  complete(ts, taskId, token) { throw new Error("Not implemented"); }
  getTask(ts, taskId) { throw new Error("Not implemented"); }
  active(ts, workerId) { throw new Error("Not implemented"); }
}
