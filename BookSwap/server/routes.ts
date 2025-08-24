import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookSchema, insertExchangeRequestSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req: any, file: Express.Multer.File, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const book = await storage.getBookById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.get('/api/my-books', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const books = await storage.getBooksByOwner(userId);
      res.json(books);
    } catch (error) {
      console.error("Error fetching user books:", error);
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.post('/api/books', isAuthenticated, upload.single('cover'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookData = insertBookSchema.parse(req.body);
      
      let coverImageUrl = null;
      if (req.file) {
        coverImageUrl = `/uploads/${req.file.filename}`;
      }

      const book = await storage.createBook(
        { ...bookData, coverImageUrl },
        userId
      );
      
      res.status(201).json(book);
    } catch (error: any) {
      console.error("Error creating book:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put('/api/books/:id', isAuthenticated, upload.single('cover'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = req.params.id;
      
      // Check if user owns the book
      const existingBook = await storage.getBookById(bookId);
      if (!existingBook || existingBook.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this book" });
      }

      const bookData = insertBookSchema.partial().parse(req.body);
      
      let coverImageUrl = existingBook.coverImageUrl;
      if (req.file) {
        coverImageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedBook = await storage.updateBook(bookId, { ...bookData, coverImageUrl });
      res.json(updatedBook);
    } catch (error: any) {
      console.error("Error updating book:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete('/api/books/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = req.params.id;
      
      // Check if user owns the book
      const existingBook = await storage.getBookById(bookId);
      if (!existingBook || existingBook.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this book" });
      }

      await storage.deleteBook(bookId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Exchange request routes
  app.post('/api/exchange-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertExchangeRequestSchema.parse(req.body);
      
      // Check if book exists and is available
      const book = await storage.getBookById(requestData.bookId);
      if (!book || !book.isAvailable) {
        return res.status(400).json({ message: "Book is not available for exchange" });
      }
      
      // Check if user is not requesting their own book
      if (book.ownerId === userId) {
        return res.status(400).json({ message: "You cannot request your own book" });
      }

      const exchangeRequest = await storage.createExchangeRequest(requestData, userId);
      res.status(201).json(exchangeRequest);
    } catch (error: any) {
      console.error("Error creating exchange request:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exchange request" });
    }
  });

  app.get('/api/my-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getExchangeRequestsByRequester(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching exchange requests:", error);
      res.status(500).json({ message: "Failed to fetch exchange requests" });
    }
  });

  app.get('/api/incoming-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getExchangeRequestsByBookOwner(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      res.status(500).json({ message: "Failed to fetch incoming requests" });
    }
  });

  app.put('/api/exchange-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const requestId = req.params.id;
      const { status } = req.body;
      
      if (!['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedRequest = await storage.updateExchangeRequestStatus(requestId, status);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating exchange request:", error);
      res.status(500).json({ message: "Failed to update exchange request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
