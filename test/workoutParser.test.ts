import { describe, it, expect } from "vitest";

// We'll test the pure parsing logic by extracting it from the class
// This tests the markdown parsing without needing the Obsidian API

interface WorkoutSet {
  weight: number;
  reps: number;
  rir?: number;
}

interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

interface Workout {
  date: string;
  type: string;
  duration?: number;
  exercises: WorkoutExercise[];
  notes?: string;
}

// Pure functions extracted for testing
function parseYamlFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  // Simple YAML parser for our use case
  const lines = (match[1] ?? "").split("\n");
  const result: Record<string, unknown> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();

      // Handle numbers
      if (/^\d+$/.test(value)) {
        result[key] = parseInt(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSetTable(tableContent: string): WorkoutSet[] {
  const sets: WorkoutSet[] = [];
  const lines = tableContent.trim().split("\n");

  let inTable = false;
  let headerParsed = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        continue; // Skip header row
      }
      if (!headerParsed) {
        headerParsed = true;
        continue; // Skip separator row
      }

      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);

      if (cells.length >= 3) {
        const weight = parseFloat(cells[1] ?? "0") || 0;
        const reps = parseInt(cells[2] ?? "0") || 0;
        const rir = cells[3] ? parseFloat(cells[3]) : undefined;

        if (weight > 0 || reps > 0) {
          sets.push({ weight, reps, rir: isNaN(rir as number) ? undefined : rir });
        }
      }
    } else if (inTable) {
      break;
    }
  }

  return sets;
}

function parseExerciseTables(body: string): WorkoutExercise[] {
  const exercises: WorkoutExercise[] = [];

  // Match exercise headers and their tables
  const exercisePattern = /###\s+(?:\[\[([^\]|]+)(?:\|[^\]]+)?\]\]|([^\n]+))\n([\s\S]*?)(?=###|$)/g;

  let match;
  while ((match = exercisePattern.exec(body)) !== null) {
    const exerciseId = match[1] ?? toKebabCase((match[2] ?? "").trim());
    const tableContent = match[3] ?? "";

    const sets = parseSetTable(tableContent);

    if (sets.length > 0) {
      exercises.push({
        exerciseId,
        sets,
      });
    }
  }

  return exercises;
}

function parseWorkoutContent(content: string): Workout | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = parseYamlFrontmatter(content);
  if (!frontmatter) return null;

  const body = content.slice(frontmatterMatch[0].length);
  const exercises = parseExerciseTables(body);

  return {
    date: frontmatter.date as string,
    type: frontmatter.type as string,
    duration: frontmatter.duration as number | undefined,
    exercises,
    notes: frontmatter.notes as string | undefined,
  };
}

function generateSetTable(sets: WorkoutSet[], showRIR: boolean = true): string {
  let table = showRIR
    ? "| Set | Weight | Reps | RIR |\n|-----|--------|------|-----|\n"
    : "| Set | Weight | Reps |\n|-----|--------|------|\n";

  sets.forEach((set, index) => {
    const rirCell = set.rir !== undefined ? set.rir.toString() : "";
    table += showRIR
      ? `| ${index + 1} | ${set.weight} | ${set.reps} | ${rirCell} |\n`
      : `| ${index + 1} | ${set.weight} | ${set.reps} |\n`;
  });

  return table;
}

// Tests
describe("Workout Parser", () => {
  describe("parseYamlFrontmatter", () => {
    it("parses basic frontmatter", () => {
      const content = `---
date: 2026-01-20
type: push
duration: 65
---

# Content`;

      const result = parseYamlFrontmatter(content);
      expect(result).toEqual({
        date: "2026-01-20",
        type: "push",
        duration: 65,
      });
    });

    it("returns null for content without frontmatter", () => {
      const content = `# No frontmatter here`;
      expect(parseYamlFrontmatter(content)).toBeNull();
    });
  });

  describe("toKebabCase", () => {
    it("converts exercise names to kebab case", () => {
      expect(toKebabCase("Bench Press")).toBe("bench-press");
      expect(toKebabCase("Barbell Bench Press")).toBe("barbell-bench-press");
      expect(toKebabCase("T-Bar Row")).toBe("t-bar-row");
      expect(toKebabCase("Farmer's Walk")).toBe("farmer-s-walk");
    });
  });

  describe("parseSetTable", () => {
    it("parses a standard set table", () => {
      const table = `| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
| 2   | 185    | 8    |     |
| 3   | 185    | 7    | 9   |`;

      const sets = parseSetTable(table);
      expect(sets).toEqual([
        { weight: 185, reps: 8, rir: undefined },
        { weight: 185, reps: 8, rir: undefined },
        { weight: 185, reps: 7, rir: 9 },
      ]);
    });

    it("parses table without RIR column", () => {
      const table = `| Set | Weight | Reps |
|-----|--------|------|
| 1   | 100    | 10   |
| 2   | 100    | 9    |`;

      const sets = parseSetTable(table);
      expect(sets).toEqual([
        { weight: 100, reps: 10, rir: undefined },
        { weight: 100, reps: 9, rir: undefined },
      ]);
    });

    it("handles decimal weights and RIR", () => {
      const table = `| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 102.5  | 5    | 8.5 |`;

      const sets = parseSetTable(table);
      expect(sets).toEqual([{ weight: 102.5, reps: 5, rir: 8.5 }]);
    });

    it("skips rows with zero weight and reps", () => {
      const table = `| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 0      | 0    |     |
| 2   | 185    | 8    |     |`;

      const sets = parseSetTable(table);
      expect(sets).toHaveLength(1);
      expect(sets[0]).toEqual({ weight: 185, reps: 8, rir: undefined });
    });
  });

  describe("parseExerciseTables", () => {
    it("parses exercises with wiki links", () => {
      const body = `
## Exercises

### [[barbell-bench-press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |

### [[overhead-press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 95     | 10   |     |
`;

      const exercises = parseExerciseTables(body);
      expect(exercises).toHaveLength(2);
      expect(exercises[0]?.exerciseId).toBe("barbell-bench-press");
      expect(exercises[1]?.exerciseId).toBe("overhead-press");
    });

    it("parses exercises with display names in wiki links", () => {
      const body = `
### [[barbell-bench-press|Bench Press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
`;

      const exercises = parseExerciseTables(body);
      expect(exercises[0]?.exerciseId).toBe("barbell-bench-press");
    });

    it("parses plain text exercise names", () => {
      const body = `
### Bench Press
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
`;

      const exercises = parseExerciseTables(body);
      expect(exercises[0]?.exerciseId).toBe("bench-press");
    });
  });

  describe("parseWorkoutContent", () => {
    it("parses a complete workout file", () => {
      const content = `---
date: 2026-01-20
type: push
duration: 65
---

## Exercises

### [[barbell-bench-press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 185    | 8    |     |
| 2   | 185    | 8    |     |
| 3   | 185    | 7    | 9   |

### [[overhead-press]]
| Set | Weight | Reps | RIR |
|-----|--------|------|-----|
| 1   | 95     | 10   |     |
| 2   | 95     | 9    |     |
| 3   | 95     | 8    | 8.5 |
`;

      const workout = parseWorkoutContent(content);

      expect(workout).not.toBeNull();
      expect(workout!.date).toBe("2026-01-20");
      expect(workout!.type).toBe("push");
      expect(workout!.duration).toBe(65);
      expect(workout!.exercises).toHaveLength(2);

      expect(workout!.exercises[0]?.exerciseId).toBe("barbell-bench-press");
      expect(workout!.exercises[0]?.sets).toHaveLength(3);

      expect(workout!.exercises[1]?.exerciseId).toBe("overhead-press");
      expect(workout!.exercises[1]?.sets).toHaveLength(3);
    });

    it("returns null for invalid content", () => {
      const content = `# No frontmatter`;
      expect(parseWorkoutContent(content)).toBeNull();
    });
  });

  describe("generateSetTable", () => {
    it("generates table with RIR", () => {
      const sets: WorkoutSet[] = [
        { weight: 185, reps: 8 },
        { weight: 185, reps: 7, rir: 9 },
      ];

      const table = generateSetTable(sets, true);

      expect(table).toContain("| Set | Weight | Reps | RIR |");
      expect(table).toContain("| 1 | 185 | 8 |  |");
      expect(table).toContain("| 2 | 185 | 7 | 9 |");
    });

    it("generates table without RIR", () => {
      const sets: WorkoutSet[] = [{ weight: 100, reps: 10 }];

      const table = generateSetTable(sets, false);

      expect(table).toContain("| Set | Weight | Reps |");
      expect(table).not.toContain("RIR");
      expect(table).toContain("| 1 | 100 | 10 |");
    });
  });
});

describe("Exercise ID generation", () => {
  it("handles various exercise name formats", () => {
    const testCases = [
      ["Bench Press", "bench-press"],
      ["Barbell Bench Press", "barbell-bench-press"],
      ["T-Bar Row", "t-bar-row"],
      ["21s Bicep Curl", "21s-bicep-curl"],
      ["Cable Fly (High to Low)", "cable-fly-high-to-low"],
    ];

    for (const [input, expected] of testCases) {
      expect(toKebabCase(input!)).toBe(expected);
    }
  });
});

describe("Roundtrip: parse -> generate -> parse", () => {
  it("workout survives roundtrip", () => {
    const original: Workout = {
      date: "2026-01-20",
      type: "push",
      exercises: [
        {
          exerciseId: "barbell-bench-press",
          sets: [
            { weight: 185, reps: 8 },
            { weight: 185, reps: 8 },
            { weight: 185, reps: 7, rir: 9 },
          ],
        },
      ],
    };

    // Generate markdown
    let content = `---
date: ${original.date}
type: ${original.type}
---

## Exercises

`;
    for (const exercise of original.exercises) {
      content += `### [[${exercise.exerciseId}]]\n`;
      content += generateSetTable(exercise.sets, true);
      content += "\n";
    }

    // Parse it back
    const parsed = parseWorkoutContent(content);

    expect(parsed).not.toBeNull();
    expect(parsed!.date).toBe(original.date);
    expect(parsed!.type).toBe(original.type);
    expect(parsed!.exercises).toHaveLength(1);
    expect(parsed!.exercises[0]?.exerciseId).toBe("barbell-bench-press");
    expect(parsed!.exercises[0]?.sets).toHaveLength(3);
    expect(parsed!.exercises[0]?.sets[2]?.rir).toBe(9);
  });
});
