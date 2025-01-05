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
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generateMealPlan, suggestRecipeSubstitutions } from "./openai";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Ingredient management
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

  // Meal planning
  app.post("/api/meal-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.userId, req.user.id));

    const mealPlan = await generateMealPlan({
      ingredients: userIngredients,
      preferences: req.body.preferences,
    });

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

    const [currentPlan] = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, req.user.id))
      .orderBy(mealPlans.weekStart, "desc")
      .limit(1);

    res.json(currentPlan);
  });

  // Recipe substitutions
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

  // Favorite recipes
  app.post("/api/recipes/favorite/:recipeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipeId = parseInt(req.params.recipeId);
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
      .select()
      .from(favoriteRecipes)
      .where(eq(favoriteRecipes.userId, req.user.id))
      .leftJoin(recipes, eq(favoriteRecipes.recipeId, recipes.id));

    res.json(favorites);
  });

  // PDF Generation
  app.get("/api/meal-plan/pdf", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const [currentPlan] = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, req.user.id))
      .orderBy(mealPlans.weekStart, "desc")
      .limit(1);

    if (!currentPlan) {
      return res.status(404).send("No meal plan found");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=meal-plan-${currentPlan.weekStart}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Weekly Meal Plan", { align: "center" });
    doc.moveDown();

    const meals = (currentPlan.meals as any).meals;
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