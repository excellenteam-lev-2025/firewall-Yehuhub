import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

export const ipTable = pgTable("ip", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  value: text().unique().notNull(),
  mode: text().notNull(),
  active: boolean().notNull().default(true),
});

export const portTable = pgTable("port", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  value: integer().unique().notNull(),
  mode: text().notNull(),
  active: boolean().notNull().default(true),
});

export const urlTable = pgTable("url", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  value: text().unique().notNull(),
  mode: text().notNull(),
  active: boolean().notNull().default(true),
});
