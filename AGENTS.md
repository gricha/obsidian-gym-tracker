# Agent Instructions

## Validation

**Always run `npm run validate` before committing changes.** This runs:

1. `format:check` - Verify code formatting (oxfmt)
2. `lint` - Check for errors and suspicious code (oxlint)
3. `typecheck` - TypeScript strict mode compilation
4. `test` - Unit tests (vitest)

If validation fails, fix the issues before committing. Use `npm run format` to auto-fix formatting and `npm run lint:fix` for auto-fixable lint issues.

## Code Style

- **TypeScript strict mode** - All strict flags enabled, no `any` types
- **Early returns** - Fail fast, avoid deep nesting
- **Self-documenting code** - Minimal comments, clear naming
- **Fight entropy** - Leave code better than you found it

## Dependencies

**Prefer not adding new dependencies.** Before adding a dependency:

1. Check if the functionality can be implemented simply
2. Consider the maintenance burden and bundle size
3. Prefer well-maintained, minimal packages if needed

Current core dependencies are intentionally minimal:
- `obsidian` - Plugin API (required)
- `esbuild` - Bundler
- `typescript` - Type checking
- `oxlint`/`oxfmt` - Linting and formatting
- `vitest` - Testing

## Architecture

This is an Obsidian plugin for workout tracking. Key concepts:

- **Exercise Library** (`src/data/exerciseLibrary.ts`) - CRUD for exercise definitions stored as markdown files
- **Workout Parser** (`src/data/workoutParser.ts`) - Parse/generate workout markdown with YAML frontmatter and set tables
- **Seed Exercises** (`src/data/seedExercises.ts`) - ~75 pre-built exercises with descriptions and alternatives
- **UI Modals** (`src/ui/`) - Obsidian modals for logging workouts and adding exercises

### Data Format

Workouts are stored as markdown files:
```markdown
---
date: 2026-01-20
type: push
---

## Exercises

### [[barbell-bench-press]]
| Set | Weight | Reps | RPE |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
```

Exercises are stored as individual markdown files with YAML frontmatter. See `SKILL.md` for the complete schema documentation.

## Testing

- **Unit tests only** - Test pure logic without Obsidian API mocking
- **Test data integrity** - Validate seed exercise references and schema
- **Run tests before committing** - Part of `npm run validate`

Add tests for:
- New parsing/generation logic
- Data transformations
- Exercise library operations

## Constraints

- No adding Obsidian commands without discussion
- No complex UI changes without design review
- No skipping failing tests
- Keep bundle size minimal (it's loaded in Obsidian)
- Maintain backward compatibility with existing workout/exercise files
