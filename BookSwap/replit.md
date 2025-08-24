# Overview

ShelfSwap is a book exchange platform that allows users to discover, upload, and exchange books with fellow readers. The application features user authentication, book catalog management, and exchange request functionality. Users can browse available books, upload their own collection, and request exchanges with other readers. The platform is built with a modern full-stack architecture using React on the frontend and Express.js on the backend, with PostgreSQL as the database.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript, utilizing modern tools and libraries:
- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom color scheme for a warm, book-themed design
- **Component Library**: Radix UI components wrapped in a custom design system (shadcn/ui)
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with reusable UI components, custom hooks for data fetching, and page-level components for different routes.

## Backend Architecture
The server-side uses Express.js with TypeScript in ESM format:
- **Framework**: Express.js with middleware for JSON parsing, session handling, and authentication
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Handling**: Multer for image upload processing with local file storage
- **API Design**: RESTful API endpoints for CRUD operations on books and exchange requests

## Authentication System
Integration with Replit's authentication service:
- **Provider**: Replit Auth using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Protected Routes**: Middleware to ensure authentication for API endpoints
- **User Management**: Automatic user creation/updates on authentication

## Database Design
PostgreSQL database with Drizzle ORM schema:
- **Users Table**: Stores user profile information from Replit Auth
- **Books Table**: Contains book metadata, ownership, and availability status
- **Exchange Requests Table**: Manages book exchange requests between users
- **Sessions Table**: Required for Replit Auth session storage

Key relationships:
- Books belong to users (one-to-many)
- Exchange requests reference books and users (many-to-many through requests)

## File Storage
Local file system storage for book cover images:
- **Upload Directory**: `/uploads` folder with multer configuration
- **File Validation**: Image-only uploads with 10MB size limit
- **Naming Convention**: Timestamped unique filenames to prevent conflicts
- **Static Serving**: Express static middleware serves uploaded files

# External Dependencies

## Authentication Service
- **Replit Auth**: OpenID Connect integration for user authentication and session management
- **Required Environment Variables**: `REPLIT_DOMAINS`, `ISSUER_URL`, `SESSION_SECRET`, `REPL_ID`

## Database Service
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Connection**: @neondatabase/serverless with WebSocket support
- **Environment Variable**: `DATABASE_URL` for database connection string

## Development Tools
- **Replit Integration**: Vite plugins for runtime error overlay and development banner
- **Build Pipeline**: ESBuild for server bundling, Vite for client bundling