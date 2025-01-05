import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { pgTable, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

const isDevelopment = process.env.NODE_ENV === 'development';

// Schema for SQLite (Development)
export const sqliteUsers = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Schema for PostgreSQL (Production)
export const pgUsers = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Use appropriate schema based on environment
export const users = isDevelopment ? sqliteUsers : pgUsers;


// Schema for SQLite (Development)
export const sqliteMealPlans = sqliteTable('meal_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Schema for PostgreSQL (Production)
export const pgMealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Use appropriate schema based on environment
export const mealPlans = isDevelopment ? sqliteMealPlans : pgMealPlans;


// Schema for SQLite (Development)
export const sqliteRecipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mealPlanId: integer('meal_plan_id').notNull(),
  name: text('name').notNull(),
  ingredients: text('ingredients').notNull(),
  instructions: text('instructions').notNull(),
  difficulty: integer('difficulty').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Schema for PostgreSQL (Production)
export const pgRecipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  mealPlanId: integer('meal_plan_id').notNull(),
  name: text('name').notNull(),
  ingredients: text('ingredients').notNull(),
  instructions: text('instructions').notNull(),
  difficulty: integer('difficulty').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Use appropriate schema based on environment
export const recipes = isDevelopment ? sqliteRecipes : pgRecipes;


// Zod schemas for type validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);
export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MealPlan = typeof mealPlans.$inferSelect;
export type NewMealPlan = typeof mealPlans.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;