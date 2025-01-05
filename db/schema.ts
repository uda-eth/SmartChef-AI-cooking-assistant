import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const favoriteRecipes = pgTable("favorite_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  weekStart: timestamp("week_start").notNull(),
  meals: jsonb("meals").notNull(),
});

// Define relationships
export const userRelations = relations(users, ({ many }) => ({
  ingredients: many(ingredients),
  recipes: many(recipes),
  mealPlans: many(mealPlans),
  favoriteRecipes: many(favoriteRecipes),
}));

export const recipeRelations = relations(recipes, ({ one }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
}));

export const ingredientRelations = relations(ingredients, ({ one }) => ({
  user: one(users, {
    fields: [ingredients.userId],
    references: [users.id],
  }),
}));

export const mealPlanRelations = relations(mealPlans, ({ one }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
}));

// Types and schemas
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;
export type SelectIngredient = typeof ingredients.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
export type SelectRecipe = typeof recipes.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;
export type SelectMealPlan = typeof mealPlans.$inferSelect;
export type InsertFavoriteRecipe = typeof favoriteRecipes.$inferInsert;
export type SelectFavoriteRecipe = typeof favoriteRecipes.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertIngredientSchema = createInsertSchema(ingredients);
export const selectIngredientSchema = createSelectSchema(ingredients);
export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);
export const insertFavoriteRecipeSchema = createInsertSchema(favoriteRecipes);
export const selectFavoriteRecipeSchema = createSelectSchema(favoriteRecipes);