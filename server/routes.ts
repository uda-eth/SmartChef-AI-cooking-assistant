import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  ingredients,
  mealPlans,
  recipes,
  insertIngredientSchema,
  insertMealPlanSchema,
} from "@db/schema";
import { eq } from "drizzle-orm";
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

  const httpServer = createServer(app);
  return httpServer;
}
