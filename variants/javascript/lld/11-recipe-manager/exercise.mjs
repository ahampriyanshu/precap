// Learner workspace. Keep the public API; replace unfinished bodies.
export class RecipeDraft {
  constructor(name, ingredients, steps) { throw new Error("Not implemented"); }
  snapshot() { throw new Error("Not implemented"); }
}
export class RecipeManager {
  constructor() { throw new Error("Not implemented"); }
  addUser(userId, permissions) { throw new Error("Not implemented"); }
  add(userId, name, ingredients, steps) { throw new Error("Not implemented"); }
  update(userId, recipeId, name, ingredients, steps) { throw new Error("Not implemented"); }
  get(userId, recipeId, version = null) { throw new Error("Not implemented"); }
  history(userId, recipeId) { throw new Error("Not implemented"); }
  rollback(userId, recipeId, version) { throw new Error("Not implemented"); }
  byIngredient(userId, ingredient) { throw new Error("Not implemented"); }
}
