import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Draft(String name, List<String> ingredients, List<String> steps) {}
    public record Recipe(String id, int version, String name, List<String> ingredients, List<String> steps) {}
    public static class RecipeDraft {
        public RecipeDraft(String name, List<String> ingredients, List<String> steps) { throw new UnsupportedOperationException("Implement this stage"); }
        public Draft snapshot() { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class RecipeManager {
        public RecipeManager() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean addUser(String userId, List<String> permissions) { throw new UnsupportedOperationException("Implement this stage"); }
        public String add(String userId, String name, List<String> ingredients, List<String> steps) { throw new UnsupportedOperationException("Implement this stage"); }
        public Integer update(String userId, String recipeId, String name, List<String> ingredients, List<String> steps) { throw new UnsupportedOperationException("Implement this stage"); }
        public Recipe get(String userId, String recipeId, Integer version) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Recipe> history(String userId, String recipeId) { throw new UnsupportedOperationException("Implement this stage"); }
        public Integer rollback(String userId, String recipeId, int version) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<String> byIngredient(String userId, String ingredient) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
