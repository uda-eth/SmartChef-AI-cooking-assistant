import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time").notNull(),
  servings: integer("servings").notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  weekStart: timestamp("week_start").notNull(),
  meals: jsonb("meals").notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  ingredients: many(ingredients),
  mealPlans: many(mealPlans),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;
export type SelectIngredient = typeof ingredients.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
export type SelectRecipe = typeof recipes.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;
export type SelectMealPlan = typeof mealPlans.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertIngredientSchema = createInsertSchema(ingredients);
export const selectIngredientSchema = createSelectSchema(ingredients);
export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);
