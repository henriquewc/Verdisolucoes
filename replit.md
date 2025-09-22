# Sistema de Acompanhamento de Atividades

## Overview

This is a comprehensive task management and CRM system built for managing client activities, proposals, and business workflows. The system provides functionality for tracking recurring activities (monthly/annual), managing client relationships, generating proposals, and maintaining business configurations. It features a modern React frontend with a Node.js/Express backend and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query v5** for server state management, caching, and data fetching
- **shadcn/ui** component library with Radix UI primitives for consistent, accessible UI components
- **Tailwind CSS** for utility-first styling with custom design system variables
- **React Hook Form** with Zod validation for robust form handling and validation

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **JWT authentication** with HTTP-only cookies for secure session management
- **RESTful API design** with consistent error handling and request/response patterns
- **Middleware chain** for authentication, authorization, and request logging
- **File upload handling** for activity attachments and documents

### Data Storage Solutions
- **PostgreSQL** as the primary database with UUID primary keys
- **Drizzle ORM** for type-safe database queries and schema management
- **Database migrations** managed through drizzle-kit for version control
- **Connection pooling** with SSL support for production deployments

### Authentication and Authorization
- **Simple admin-only authentication** with hardcoded credentials (admin/admin123)
- **JWT tokens** with configurable expiration stored in HTTP-only cookies
- **Protected routes** on both frontend and backend with proper middleware
- **Session management** with automatic token refresh capabilities

### Key Business Domain Models

#### Client Management
- Complete client profiles with documents, addresses, and utility company credentials
- Activity history tracking per client
- Active/inactive status management

#### Activity Management
- Recurring task system (monthly/annual intervals)
- Status calculation based on due dates (pending, due soon, overdue, completed)
- File attachment support for documentation
- Responsible person assignment

#### CRM System
- Lead pipeline management with customizable stages
- Lead tracking from initial contact to conversion
- Historical activity logging for lead interactions
- Lead statistics and conversion metrics

#### Proposal System
- Solar energy proposal calculations with equipment and pricing
- City-based pricing with configurable profit margins
- Payment terms and financing options
- PDF generation for client presentations

#### Configuration System
- Global system settings (labor costs, tax percentages)
- Equipment catalogs (solar panel wattages)
- Geographic pricing (city-based rates)
- Payment terms and conditions management

### External Dependencies

- **Recharts** for data visualization and analytics dashboards
- **date-fns** with Portuguese localization for date handling
- **jsPDF** for PDF document generation
- **Lucide React** for consistent iconography
- **nanoid** for generating unique identifiers
- **Zod** for runtime type validation and schema definition

The system uses modern development practices including TypeScript throughout, ESM modules, and a monorepo structure with shared schema definitions between frontend and backend.