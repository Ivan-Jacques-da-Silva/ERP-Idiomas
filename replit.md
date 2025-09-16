# Overview

EduManage is a comprehensive school management system designed specifically for language schools. The system provides role-based access control for different user types (admins, teachers, secretaries, financial staff, students, and developers) to manage educational operations including student enrollment, staff management, class scheduling, and course administration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Component Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

The frontend follows a component-based architecture with:
- Layout components for consistent page structure
- Reusable UI components in the `components/ui` directory
- Page components for different application views
- Custom hooks for authentication and other shared logic

## Backend Architecture

**Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API endpoints with proper error handling

The backend uses a service layer pattern with:
- Database layer using Drizzle ORM for schema management and queries
- Storage service layer for business logic abstraction
- Route handlers for API endpoints
- Middleware for authentication and request logging

## Database Schema

The system uses a role-based access control model with the following core entities:
- **Users**: Central user management with role-based permissions (developer, admin, secretary, financial, teacher, student)
- **Units**: Physical locations or branches of the school
- **Staff**: Employee records linked to user accounts
- **Students**: Student records with enrollment information
- **Courses**: Course definitions and curriculum
- **Classes**: Specific class instances with scheduling
- **Lessons**: Individual lesson records
- **Sessions**: Authentication session storage (required for Replit Auth)

The schema uses PostgreSQL enums for role management and includes proper foreign key relationships between entities.

## Authentication & Authorization

**Authentication Provider**: Replit Auth with OIDC
- Session-based authentication with secure HTTP-only cookies
- Automatic user provisioning on first login
- Role-based access control throughout the application
- Protected routes requiring authentication

Different user roles have different access levels:
- **Developer**: Full system access for development purposes
- **Admin**: Complete administrative access
- **Secretary**: Student and enrollment management
- **Financial**: Financial operations access
- **Teacher**: Class and student management within assigned classes
- **Student**: Limited access to personal academic information

## Development Environment

**Build System**: Vite with hot module replacement for development
- TypeScript for type safety across the entire codebase
- ESLint and Prettier for code quality (implied by project structure)
- Drizzle Kit for database migrations and schema management
- Development and production build configurations

The project uses a monorepo structure with shared types and schemas between frontend and backend through the `shared` directory.

# External Dependencies

## Database & Infrastructure
- **Neon Database**: PostgreSQL database hosting with serverless architecture
- **Replit Platform**: Development environment and deployment platform

## Authentication & Session Management
- **Replit Auth**: OIDC-based authentication service
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Component Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **TanStack Query**: Data fetching and caching library for React
- **Zod**: Schema validation library for runtime type checking
- **React Hook Form**: Form state management with validation

## Build & Development
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking for JavaScript
- **Wouter**: Lightweight routing library for React