import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import PDFDocument from "pdfkit";
import {
  ingredients,
  mealPlans,
  recipes,
  favoriteRecipes,
  insertIngredientSchema,
  insertMealPlanSchema,
  users,
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generateMealPlan, suggestRecipeSubstitutions } from "./openai";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Check onboarding status
  app.get("/api/onboarding/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    res.json({ hasCompletedOnboarding: user.hasCompletedOnboarding });
  });

  app.post("/api/onboarding/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    await db
      .update(users)
      .set({ hasCompletedOnboarding: true })
      .where(eq(users.id, req.user.id));

    res.json({ message: "Onboarding completed" });
  });

  // Ingredient management with user isolation
  app.get("/api/ingredients", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.userId, req.user.id));

    res.json(userIngredients);
  });

  app.post("/api/ingredients", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const result = insertIngredientSchema.safeParse({
      ...req.body,
      userId: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const newIngredient = await db.insert(ingredients).values(result.data).returning();
    res.json(newIngredient[0]);
  });

  // Meal planning with user isolation
  app.post("/api/meal-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    // Only get ingredients for the current user
    const userIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.userId, req.user.id));

    const mealPlan = await generateMealPlan({
      ingredients: userIngredients,
      preferences: req.body.preferences,
    });

    // Delete any existing meal plans for this user
    await db.delete(mealPlans).where(eq(mealPlans.userId, req.user.id));

    const result = await db
      .insert(mealPlans)
      .values({
        userId: req.user.id,
        weekStart: new Date(),
        meals: mealPlan,
      })
      .returning();

    res.json(result[0]);
  });

  app.get("/api/meal-plan/current", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const currentPlan = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, req.user.id))
      .orderBy(mealPlans.weekStart, "desc")
      .limit(1);

    if (!currentPlan || currentPlan.length === 0) {
      return res.json(null);
    }

    res.json(currentPlan[0]);
  });

  // Recipe substitutions with user isolation
  app.post("/api/recipe/substitutions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.userId, req.user.id));

    const substitutions = await suggestRecipeSubstitutions(
      req.body.recipe,
      userIngredients
    );

    res.json(substitutions);
  });

  // Recipe management with user isolation
  app.post("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const newRecipe = await db
      .insert(recipes)
      .values({ ...req.body, userId: req.user.id })
      .returning();

    res.json(newRecipe[0]);
  });

  app.get("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, req.user.id));

    res.json(userRecipes);
  });

  // Favorite recipes with user isolation
  app.post("/api/recipes/favorite/:recipeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipeId = parseInt(req.params.recipeId);

    // Check if recipe exists and belongs to user
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe || recipe.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if already favorited by this user
    const existing = await db
      .select()
      .from(favoriteRecipes)
      .where(
        and(
          eq(favoriteRecipes.userId, req.user.id),
          eq(favoriteRecipes.recipeId, recipeId)
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    await db.insert(favoriteRecipes).values({
      userId: req.user.id,
      recipeId,
    });

    res.json({ message: "Recipe added to favorites" });
  });

  app.delete("/api/recipes/favorite/:recipeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipeId = parseInt(req.params.recipeId);
    await db
      .delete(favoriteRecipes)
      .where(
        and(
          eq(favoriteRecipes.userId, req.user.id),
          eq(favoriteRecipes.recipeId, recipeId)
        )
      );

    res.json({ message: "Recipe removed from favorites" });
  });

  app.get("/api/recipes/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const favorites = await db
      .select({
        id: recipes.id,
        name: recipes.name,
        instructions: recipes.instructions,
        ingredients: recipes.ingredients,
        imageUrl: recipes.imageUrl,
        prepTime: recipes.prepTime,
        servings: recipes.servings,
        difficulty: recipes.difficulty,
        favoriteId: favoriteRecipes.id,
      })
      .from(favoriteRecipes)
      .where(eq(favoriteRecipes.userId, req.user.id))
      .innerJoin(recipes, eq(favoriteRecipes.recipeId, recipes.id));

    res.json(favorites);
  });

  // PDF Generation with user isolation
  app.get("/api/meal-plan/pdf", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const currentPlan = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, req.user.id))
      .orderBy(mealPlans.weekStart, "desc")
      .limit(1);

    if (!currentPlan || currentPlan.length === 0) {
      return res.status(404).send("No meal plan found");
    }

    const plan = currentPlan[0];

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=meal-plan-${plan.weekStart}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Weekly Meal Plan", { align: "center" });
    doc.moveDown();

    const meals = (plan.meals as any).meals;
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    meals.forEach((meal: any, index: number) => {
      doc.fontSize(16).text(`${days[index]}: ${meal.name}`);
      doc.fontSize(12).text(`Difficulty: ${meal.difficulty}`);
      doc.fontSize(12).text(`Prep Time: ${meal.prepTime} minutes`);
      doc.moveDown(0.5);
    });

    doc.end();
  });

  const httpServer = createServer(app);
  return httpServer;
}