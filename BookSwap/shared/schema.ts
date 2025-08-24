import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Books table
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  author: varchar("author").notNull(),
  genre: varchar("genre").notNull(),
  condition: varchar("condition").notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exchange requests table
export const exchangeRequests = pgTable("exchange_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  bookId: varchar("book_id").notNull().references(() => books.id),
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  sentRequests: many(exchangeRequests, { relationName: "requester" }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  owner: one(users, {
    fields: [books.ownerId],
    references: [users.id],
  }),
  exchangeRequests: many(exchangeRequests),
}));

export const exchangeRequestsRelations = relations(exchangeRequests, ({ one }) => ({
  requester: one(users, {
    fields: [exchangeRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  book: one(books, {
    fields: [exchangeRequests.bookId],
    references: [books.id],
  }),
}));

// Zod schemas for validation
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExchangeRequestSchema = createInsertSchema(exchangeRequests).omit({
  id: true,
  requesterId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type ExchangeRequest = typeof exchangeRequests.$inferSelect;
export type InsertExchangeRequest = z.infer<typeof insertExchangeRequestSchema>;

// Book with owner info
export type BookWithOwner = Book & {
  owner: User;
};

// Exchange request with related data
export type ExchangeRequestWithDetails = ExchangeRequest & {
  requester: User;
  book: BookWithOwner;
};
