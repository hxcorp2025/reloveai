# RELOVE AI - Breakup Recovery Coach

## Overview

RELOVE AI is a production-ready full-stack application that provides AI-powered breakup recovery coaching through rule-based responses and OpenAI integration. The platform offers personalized daily guidance, text rewriting assistance, and decision support tools to help users navigate post-breakup recovery in a healthy and constructive manner.

The application combines deterministic rule-based logic for consistent, reliable guidance with optional OpenAI integration for complex situations requiring nuanced responses. This hybrid approach ensures both cost-effectiveness and intelligent adaptability to user needs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom design tokens for responsive, maintainable styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: Local state with localStorage persistence for user convenience

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout for type safety and better developer experience
- **API Design**: Four main endpoints serving specific coaching functions:
  - Daily Action Selection (`/api/select_daily_action`)
  - SafeText Rewriter (`/api/safetext_rewrite`) 
  - Greenlight Check (`/api/greenlight`)
  - AI Agent Passthrough (`/api/agent`)
- **Business Logic**: Rule-based engines for deterministic coaching responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Validation**: Zod schemas for runtime type checking and data validation

### Data Storage Solutions
- **Database**: Drizzle ORM configured for PostgreSQL with Neon Database serverless provider
- **Schema Management**: Type-safe database schema definitions in shared directory
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Client Storage**: localStorage for form persistence and user preferences
- **No User Authentication**: Stateless design focused on immediate value delivery

### Authentication and Authorization Mechanisms
- **Approach**: Stateless application without user authentication requirements
- **Session Management**: Minimal session handling for form persistence only
- **CORS Configuration**: Configurable origins for development and production environments
- **Security**: Input validation and sanitization through Zod schemas

### Core Business Logic
- **Rule Engines**: Deterministic logic for coaching recommendations based on user scenarios
- **Hybrid AI**: Optional OpenAI integration (GPT-5) for complex situations requiring nuanced responses
- **Text Analysis**: Pattern matching for identifying risky communication behaviors
- **Scenario-Based Responses**: Contextual guidance based on breakup stage and emotional state
- **Mission System**: Structured activity recommendations across self-care, growth, social, and physical categories

## External Dependencies

### Third-Party Services
- **OpenAI API**: GPT-5 integration for advanced conversational AI capabilities
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage

### Development and Deployment Tools
- **Replit Integration**: Development environment plugins for enhanced development experience
- **Vite Plugins**: Runtime error overlay and development tooling
- **ESBuild**: Production bundling for server-side code

### UI and Styling Libraries
- **Radix UI**: Accessible component primitives for form controls and interactive elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Consistent icon set for UI elements
- **Font Awesome**: Additional icons for specific branding needs

### Testing and Quality Assurance
- **Vitest**: Fast unit testing framework for business logic validation
- **TypeScript**: Compile-time type checking across frontend and backend
- **ESLint & Prettier**: Code quality and formatting standards

### Package Management and Build Tools
- **npm**: Package management with lockfile for reproducible builds
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Autoprefixer**: CSS vendor prefix handling for browser compatibility