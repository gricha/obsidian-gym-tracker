# Gym Tracker Skill

This skill teaches agents how to interact with the Gym Tracker workout system in Obsidian.

## Overview

The Gym Tracker stores workout data as markdown files with YAML frontmatter. There are two types of files:

1. **Exercise Library** - Individual exercise definitions in `Workouts/Exercises/`
2. **Workout Logs** - Daily workout records in `Workouts/`

## File Locations

- **Workouts folder**: `Workouts/`
- **Exercises folder**: `Workouts/Exercises/`
- **Workout file naming**: `YYYY-MM-DD-{type}.md` (e.g., `2026-01-20-push.md`)
- **Exercise file naming**: `{exercise-id}.md` (e.g., `barbell-bench-press.md`)

## Exercise File Format

Each exercise is a markdown file with this structure:

```markdown
---
id: barbell-bench-press
name: Barbell Bench Press
muscles:
  primary: [chest]
  secondary: [triceps, shoulders]
type: compound
equipment: barbell
alternatives: [dumbbell-bench-press, machine-chest-press]
---

## How to Perform
1. Lie flat on bench with feet firmly planted
2. Grip bar slightly wider than shoulder width
3. Unrack and lower bar to mid-chest with control
4. Press up explosively, locking out at top

## Cues
- Retract shoulder blades and maintain arch
- "Bend the bar" to engage lats
```

### Exercise Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique kebab-case identifier, matches filename |
| `name` | string | Yes | Display name |
| `muscles.primary` | string[] | Yes | Primary muscles worked |
| `muscles.secondary` | string[] | No | Secondary muscles worked |
| `type` | `compound` \| `isolation` | Yes | Exercise type |
| `equipment` | string | Yes | Equipment needed |
| `alternatives` | string[] | No | IDs of alternative exercises |

### Valid Muscle Groups
`chest`, `back`, `shoulders`, `biceps`, `triceps`, `forearms`, `quads`, `hamstrings`, `glutes`, `calves`, `abs`, `traps`, `lats`

### Valid Equipment Types
`barbell`, `dumbbell`, `cable`, `machine`, `bodyweight`, `kettlebell`, `bands`, `ez-bar`, `smith-machine`, `other`

## Workout File Format

Each workout is a markdown file with this structure:

```markdown
---
date: 2026-01-20
type: push
duration: 65
---

## Exercises

### [[barbell-bench-press]]
| Set | Weight | Reps | RPE |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
| 2   | 185    | 8    |     |
| 3   | 185    | 7    | 9   |

### [[overhead-press]]
| Set | Weight | Reps | RPE |
|-----|--------|------|-----|
| 1   | 95     | 10   |     |
| 2   | 95     | 9    |     |
| 3   | 95     | 8    | 8.5 |
```

### Workout Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `type` | string | Yes | Workout type (push, pull, legs, etc.) |
| `duration` | number | No | Duration in minutes |
| `notes` | string | No | Any notes about the workout |

### Exercise Table Format

Each exercise section starts with `### [[exercise-id]]` followed by a markdown table:

```markdown
### [[exercise-id]]
| Set | Weight | Reps | RPE |
|-----|--------|------|-----|
| 1   | {weight} | {reps} | {rpe?} |
```

- **Set**: Sequential number starting at 1
- **Weight**: Weight used (in user's preferred unit, typically lbs)
- **Reps**: Number of repetitions completed
- **RPE**: Rate of Perceived Exertion (1-10 scale, optional)

## Common Agent Tasks

### Log a Workout

To create a new workout entry:

1. Create file at `Workouts/YYYY-MM-DD-{type}.md`
2. Add frontmatter with date and type
3. For each exercise, add a section with the exercise link and set table

Example:
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
| 2   | 185    | 8    |     |
| 3   | 185    | 7    | 9   |
```

### Add a New Exercise

1. Create file at `Workouts/Exercises/{exercise-id}.md`
2. Add frontmatter with required fields
3. Optionally add description in body

Example:
```markdown
---
id: skull-crushers
name: Skull Crushers
muscles:
  primary: [triceps]
  secondary: []
type: isolation
equipment: ez-bar
alternatives: [overhead-tricep-extension, tricep-pushdown]
---

## How to Perform
1. Lie on bench, hold bar above chest
2. Lower bar to forehead by bending elbows
3. Extend back up
```

### Query Workout History

To find progression for an exercise, search workout files for the exercise ID and extract set data from tables.

### Calculate Weekly Volume

Count total sets per muscle group across workouts in a 7-day window. Map exercises to muscle groups using the exercise library.

## Workout Types

Default types (configurable by user):
- `push` - Chest, shoulders, triceps
- `pull` - Back, biceps
- `legs` - Quads, hamstrings, glutes, calves
- `upper` - All upper body
- `lower` - All lower body
- `full-body` - Everything

## Tips for Agents

1. **Always use exercise IDs** in workout files, not display names
2. **Verify exercise exists** in library before adding to workout
3. **Use consistent date format** (YYYY-MM-DD)
4. **RPE is optional** - only include if user provides it
5. **Weight unit** depends on user preference (check settings or ask)
6. **Progressive overload** - when suggesting workouts, reference recent history to suggest appropriate weights
