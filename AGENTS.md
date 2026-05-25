# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**Chaos Notes** is a personal task management application built with Angular 21. It implements a unique urgency-based organization system inspired by chaos theory and GTD (Getting Things Done) principles. Tasks are organized into four urgency tiers (Now, Soon, Later, Someday) plus an uncategorized "Braindump" section for quick capture.

### Core Technologies

- **Angular 21**: Modern standalone component architecture with signals
- **Dexie.js**: IndexedDB wrapper for client-side persistence
- **WebAwesome**: Web component library for UI elements
- **Vitest**: Unit testing framework
- **TypeScript 5.9**: Type-safe development

### Architecture Highlights

- **Standalone Components**: No NgModules, using Angular's modern standalone API
- **Signal-based Reactivity**: Leveraging Angular signals for reactive state management
- **IndexedDB Storage**: All data persisted locally using Dexie with schema versioning
- **Service Layer**: Clean separation with `NoteService` and `SettingsService`
- **Custom Elements**: WebAwesome components integrated via `CUSTOM_ELEMENTS_SCHEMA`

## Building and Running

### Prerequisites
- Node.js v20.19+ or v22.12+
- npm (bundled with Node.js)
- Angular CLI: `npm install -g @angular/cli`

### Development Commands

```bash
# Install dependencies
npm install

# Start development server (accessible on network via 0.0.0.0)
npm start
# Opens at http://localhost:4200/

# Build for production
npm build
# Output in dist/

# Run unit tests
npm test

# Watch mode for development
npm run watch
```

## Development Conventions

### Component Structure
- Use standalone components with explicit imports
- Include `CUSTOM_ELEMENTS_SCHEMA` when using WebAwesome components
- Prefer signals over traditional observables for local state
- Use `toSignal()` to bridge RxJS observables to signals

### Data Layer
- **Database**: `ChaosDb` extends Dexie with versioned schema
- **Services**: Inject `CHAOS_DB` token, expose observables that auto-refresh
- **Models**: TypeScript interfaces in `db.ts` (Note, Settings, etc.)
- **Persistence**: All mutations mark records as `dirty: true` and update `updated_at`

### State Management Pattern
```typescript
// Services expose observables
watchByTier(tier: UrgencyTier): Observable<Note[]>

// Components convert to signals
notes = toSignal(this.noteService.watchByTier('now'), { initialValue: [] })

// Computed values derive from signals
showNudge = computed(() => this.notes().length > this.settings().nowSoftLimit)
```

### Urgency Tier System
Tasks flow through four tiers:
- **Now**: Current focus (soft limit: 5 items, configurable)
- **Soon**: Next up (displays fuzzy count labels)
- **Later**: Deferred but planned
- **Someday**: Aspirational backlog
- **Braindump**: Uncategorized quick captures (`urgency_tier: null`)

### Testing
- Unit tests use Vitest with `fake-indexeddb` for database mocking
- Test files: `*.spec.ts` alongside source files
- Run tests: `npm test`

### Styling
- WebAwesome CSS design tokens (colors, spacing, typography)
- Component-scoped styles using Angular's `styles` property
- Theme switching via `ThemeService` (light/dark mode)

### Code Quality
- Prettier configured (`.prettierrc`)
- EditorConfig for consistent formatting (`.editorconfig`)
- TypeScript strict mode enabled

## Bob Shell Skills

This project includes custom Bob Shell skills in `.agents/skills/` for specialized workflows:
- **tdd**: Test-driven development guidance
- **prototype**: Rapid prototyping patterns
- **webawesome**: WebAwesome component reference
- **improve-codebase-architecture**: Architecture refactoring
- And more specialized skills for various development scenarios

Refer to individual `SKILL.md` files in `.agents/skills/` for detailed instructions on each skill.

## Key Files

- `src/app/db.ts`: Database schema and models
- `src/app/note.service.ts`: Core CRUD operations for tasks
- `src/app/settings.service.ts`: User preferences management
- `src/app/main-view/main-view.component.ts`: Primary UI with tier sections
- `src/app/app.routes.ts`: Routing configuration (main view + settings)
- `angular.json`: Build configuration and asset management

## Notes for AI Assistants

- When modifying database schema, increment version in `ChaosDb` constructor
- WebAwesome components are web components; use kebab-case tags (e.g., `<wa-button>`)
- The app is fully client-side; no backend API exists
- Soft archive pattern: `archived_at` timestamp instead of hard delete
- Settings are singleton record with `id: 'singleton'`
- All paths should be absolute when using tools
