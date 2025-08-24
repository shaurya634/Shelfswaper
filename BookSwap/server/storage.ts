import {
  users,
  books,
  exchangeRequests,
  type User,
  type UpsertUser,
  type Book,
  type InsertBook,
  type BookWithOwner,
  type ExchangeRequest,
  type InsertExchangeRequest,
  type ExchangeRequestWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Book operations
  getAllBooks(): Promise<BookWithOwner[]>;
  getBookById(id: string): Promise<BookWithOwner | undefined>;
  getBooksByOwner(ownerId: string): Promise<BookWithOwner[]>;
  createBook(book: InsertBook, ownerId: string): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  
  // Exchange request operations
  createExchangeRequest(request: InsertExchangeRequest, requesterId: string): Promise<ExchangeRequest>;
  getExchangeRequestsByRequester(requesterId: string): Promise<ExchangeRequestWithDetails[]>;
  getExchangeRequestsByBookOwner(ownerId: string): Promise<ExchangeRequestWithDetails[]>;
  updateExchangeRequestStatus(id: string, status: string): Promise<ExchangeRequest>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Book operations
  async getAllBooks(): Promise<BookWithOwner[]> {
    const result = await db
      .select()
      .from(books)
      .leftJoin(users, eq(books.ownerId, users.id))
      .where(eq(books.isAvailable, true))
      .orderBy(desc(books.createdAt));

    return result.map(row => ({
      ...row.books,
      owner: row.users!,
    }));
  }

  async getBookById(id: string): Promise<BookWithOwner | undefined> {
    const [result] = await db
      .select()
      .from(books)
      .leftJoin(users, eq(books.ownerId, users.id))
      .where(eq(books.id, id));

    if (!result) return undefined;

    return {
      ...result.books,
      owner: result.users!,
    };
  }

  async getBooksByOwner(ownerId: string): Promise<BookWithOwner[]> {
    const result = await db
      .select()
      .from(books)
      .leftJoin(users, eq(books.ownerId, users.id))
      .where(eq(books.ownerId, ownerId))
      .orderBy(desc(books.createdAt));

    return result.map(row => ({
      ...row.books,
      owner: row.users!,
    }));
  }

  async createBook(book: InsertBook, ownerId: string): Promise<Book> {
    const [newBook] = await db
      .insert(books)
      .values({ ...book, ownerId })
      .returning();
    return newBook;
  }

  async updateBook(id: string, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db
      .update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Exchange request operations
  async createExchangeRequest(request: InsertExchangeRequest, requesterId: string): Promise<ExchangeRequest> {
    const [newRequest] = await db
      .insert(exchangeRequests)
      .values({ ...request, requesterId })
      .returning();
    return newRequest;
  }

  async getExchangeRequestsByRequester(requesterId: string): Promise<ExchangeRequestWithDetails[]> {
    const result = await db
      .select()
      .from(exchangeRequests)
      .leftJoin(users, eq(exchangeRequests.requesterId, users.id))
      .leftJoin(books, eq(exchangeRequests.bookId, books.id))
      .where(eq(exchangeRequests.requesterId, requesterId))
      .orderBy(desc(exchangeRequests.createdAt));

    return result.map(row => ({
      ...row.exchange_requests,
      requester: row.users!,
      book: {
        ...row.books!,
        owner: row.users!,
      },
    }));
  }

  async getExchangeRequestsByBookOwner(ownerId: string): Promise<ExchangeRequestWithDetails[]> {
    const result = await db
      .select()
      .from(exchangeRequests)
      .leftJoin(users, eq(exchangeRequests.requesterId, users.id))
      .leftJoin(books, eq(exchangeRequests.bookId, books.id))
      .where(eq(books.ownerId, ownerId))
      .orderBy(desc(exchangeRequests.createdAt));

    return result.map(row => ({
      ...row.exchange_requests,
      requester: row.users!,
      book: {
        ...row.books!,
        owner: row.users!,
      },
    }));
  }

  async updateExchangeRequestStatus(id: string, status: string): Promise<ExchangeRequest> {
    const [updatedRequest] = await db
      .update(exchangeRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(exchangeRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const storage = new DatabaseStorage();
