# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Ezia vBeta (formerly DeepSite v2) is an AI-powered business companion platform that helps users create and manage their online presence. Built on top of DeepSite v2's web development capabilities, Ezia vBeta introduces a multi-agent system led by Ezia, an AI Project Manager, who coordinates specialized AI agents for market analysis, marketing, competition analysis, social media, business development, and continuous improvement.

The platform is a Next.js 15 application with TypeScript, designed to provide comprehensive business support without requiring users to invest hundreds of hours.

## Development Commands

### Essential Commands
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Common Development Tasks
- Run development server: `npm run dev` (opens on http://localhost:3000)
- Build and test production: `npm run build && npm run start`
- Check linting issues: `npm run lint`
- Install dependencies: `npm install`

Note: There are no test commands configured. If tests are added, update this section.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS v4, Radix UI components
- **Editor**: Monaco Editor (VS Code's editor)
- **State**: TanStack Query for server state, React hooks for local state
- **Database**: MongoDB with Mongoose
- **Auth**: JWT tokens in HTTP-only cookies
- **AI**: Multiple providers via Hugging Face Inference API

### Directory Structure
- `/app` - Next.js App Router pages and API routes
  - `(public)` - Public routes (home, projects listing)
  - `api` - API endpoints for AI, auth, and projects
  - `auth` - Authentication pages
  - `projects` - Project-specific pages
- `/components` - React components
  - `editor` - Main code editor components
  - `contexts` - App and user context providers
  - `ui` - Reusable UI components (shadcn/ui based)
  - `space` - AI interaction components
- `/lib` - Utilities and configurations
  - API clients, auth utilities, AI prompts, MongoDB connection
- `/models` - MongoDB schemas
- `/hooks` - Custom React hooks

### Key Architectural Patterns

#### AI Integration
The app supports multiple AI providers (Fireworks, Nebius, SambaNova, etc.) with streaming responses. Main AI endpoint: `app/api/ask-ai/route.ts` handles both initial generation and follow-up modifications.

#### Authentication Flow
1. JWT tokens stored in HTTP-only cookies
2. Server-side user fetching in root layout
3. Automatic token injection via axios interceptors
4. Fallback to default tokens for anonymous users

#### Editor Architecture
The main editor (`components/editor/index.tsx`) features:
- Split-pane layout with Monaco Editor and live preview
- AI chat integration for code modifications
- History tracking for undo/redo
- Element selection mode for targeted edits

#### API Client Pattern
Two axios instances in `lib/api.ts`:
- `api`: Client-side requests to Next.js API routes
- `apiServer`: Server-side requests to external API

### Environment Variables
Essential environment variables (create `.env.local` for development):
- `MONGODB_URI` - MongoDB connection string
- `NEXT_APP_API_URL` - External API URL
- `HF_TOKEN` - Hugging Face API token
- `DEFAULT_HF_TOKEN` - Fallback token for anonymous users

### Development Guidelines

#### When Adding New Features
1. Follow existing patterns in the codebase
2. Use TypeScript strict mode - ensure proper typing
3. For UI components, check existing components in `/components/ui`
4. For API routes, follow the pattern in `/app/api`
5. Use TanStack Query for server state management

#### Code Style
- TypeScript with strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- Follow Next.js App Router conventions

#### Common Patterns
- Use `useUser` hook for authentication state
- Use `useEditor` hook for editor state management
- API calls should go through the configured axios instances
- MongoDB models are in `/models` directory

### Deployment
The app is containerized with Docker and designed for deployment on Hugging Face Spaces. The Dockerfile uses Node.js 20 Alpine image for production builds.

## Ezia vBeta Specific Guidelines

### Multi-Agent System Architecture
Ezia vBeta extends DeepSite v2 with a sophisticated multi-agent system. Key principles:

1. **No Hardcoding**: All agent configurations, prompts, and behaviors must be externalized
2. **No Fallbacks**: Explicit error handling for all agent interactions
3. **Minimal Modification**: Build around existing DeepSite v2 infrastructure

### Agent Hierarchy
- **Ezia**: Main AI Project Manager, coordinates all other agents
- **Team Chiefs**: Named agents who manage specialized agent teams
- **Specialist Agents**: Domain-specific agents for various business tasks

### Key Development Rules for Ezia vBeta
1. Agent communications should be asynchronous
2. All agent decisions must be auditable
3. User always interacts through Ezia, never directly with other agents
4. Maintain clear separation between DeepSite's web development features and Ezia's business features
5. See `/docs/EZIA_PROJECT.md` for complete project documentation