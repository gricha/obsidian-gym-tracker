# Obsidian Gym Tracker

A personal workout tracking plugin for Obsidian with progressive overload focus.

## Features

- **Log Workouts** - Quick modal to record exercises, sets, weights, and reps
- **Exercise Library** - 75+ pre-seeded exercises with descriptions, muscle groups, and alternatives
- **Progressive Overload Tracking** - Track your lifts over time
- **Agent-Friendly** - Documented markdown schema for AI assistant integration
- **Mobile Ready** - Works with Obsidian mobile via Sync

## Installation

### Manual Installation

1. Download the latest release (`main.js`, `manifest.json`, `styles.css`)
2. Create folder: `your-vault/.obsidian/plugins/obsidian-gym-tracker/`
3. Copy the files into that folder
4. Enable the plugin in Obsidian Settings → Community Plugins

### From Source

```bash
git clone https://github.com/gricha/obsidian-gym-tracker
cd obsidian-gym-tracker
npm install
npm run build
```

Then copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder.

## Usage

### First Time Setup

1. Open Settings → Gym Tracker
2. Click "Seed Library" to populate 75+ exercises
3. Configure your workout types (default: push/pull/legs/upper/lower/full-body)
4. Set your preferred weight unit (lbs/kg)

### Logging a Workout

1. Click the dumbbell icon in the ribbon, or use `Cmd/Ctrl+P` → "Log Workout"
2. Select the date and workout type
3. Click "Add Exercise" to search and add exercises
4. Enter weights and reps for each set
5. Click "Save Workout"

### Adding Custom Exercises

1. Use `Cmd/Ctrl+P` → "Add Exercise to Library"
2. Fill in the exercise details
3. The exercise will be available immediately

## Data Format

All data is stored as plain markdown with YAML frontmatter.

### Workout Files

Stored in `Workouts/` folder:

```markdown
---
date: 2026-01-20
type: push
---

## Exercises

### [[barbell-bench-press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
| 2   | 185    | 8    |     |
| 3   | 185    | 7    | 1   |
```

### Exercise Files

Stored in `Workouts/Exercises/`:

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
...
```

## AI/Agent Integration

The plugin is designed to work with AI assistants. See [SKILL.md](./SKILL.md) for the complete schema documentation that can be used to teach agents how to:

- Log workouts programmatically
- Add new exercises
- Query workout history
- Calculate weekly volume

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Workouts Folder | `Workouts` | Where workout logs are stored |
| Exercises Folder | `Workouts/Exercises` | Where exercise library lives |
| Weight Unit | `lbs` | Display unit for weights |
| Track RIR | `true` | Include RIR column in workouts |
| Workout Types | push, pull, legs, upper, lower, full-body | Available workout types |

## Development

```bash
# Install dependencies
npm install

# Build for development (with watch)
npm run dev

# Build for production
npm run build
```

## Roadmap

- [ ] Progression charts view
- [ ] Weekly volume dashboard
- [ ] Workout templates
- [ ] Rest timer
- [ ] PR tracking and celebrations

## License

MIT
