import { describe, it, expect } from "vitest";

// Types for testing
interface WorkoutSet {
  weight: number;
  reps: number;
  rpe?: number;
}

interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

interface Workout {
  date: string;
  type: string;
  exercises: WorkoutExercise[];
}

interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  progression?: string;
}

interface ProgramWorkout {
  type: string;
  exercises: ProgramExercise[];
}

interface Program {
  name: string;
  split: string[];
  started?: string;
  workouts: ProgramWorkout[];
}

interface ExerciseSuggestion {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  suggestedWeight: number;
  lastPerformance?: { date: string; sets: WorkoutSet[] };
  progression?: string;
}

interface WorkoutSuggestion {
  date: string;
  type: string;
  programName: string;
  exercises: ExerciseSuggestion[];
}

// Pure functions extracted for testing (mirroring programParser.ts)
function parseYamlFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = (match[1] ?? "").split("\n");
  const result: Record<string, unknown> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle arrays [a, b, c]
      if (value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1);
        result[key] = inner.split(",").map((s) => s.trim());
      } else if (/^\d+$/.test(value)) {
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

function extractExerciseId(cell: string): string | null {
  const linkMatch = cell.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
  if (linkMatch) {
    return linkMatch[1] ?? null;
  }
  const trimmed = cell.trim();
  if (trimmed) {
    return toKebabCase(trimmed);
  }
  return null;
}

function parseHeaderColumns(cells: string[]): {
  exercise: number;
  sets: number;
  reps: number;
  progression: number;
} {
  const indexes = { exercise: 0, sets: 1, reps: 2, progression: 3 };

  cells.forEach((cell, index) => {
    const lower = cell.toLowerCase();
    if (lower.includes("exercise")) {
      indexes.exercise = index;
    } else if (lower.includes("set")) {
      indexes.sets = index;
    } else if (lower.includes("rep")) {
      indexes.reps = index;
    } else if (lower.includes("progression") || lower.includes("progress")) {
      indexes.progression = index;
    }
  });

  return indexes;
}

function parseProgramExerciseTable(tableContent: string): ProgramExercise[] {
  const exercises: ProgramExercise[] = [];
  const lines = tableContent.trim().split("\n");

  let inTable = false;
  let headerParsed = false;
  let columnIndexes = { exercise: 0, sets: 1, reps: 2, progression: 3 };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);

      if (!inTable) {
        inTable = true;
        columnIndexes = parseHeaderColumns(cells);
        continue;
      }
      if (!headerParsed) {
        headerParsed = true;
        continue;
      }

      const exerciseCell = cells[columnIndexes.exercise] ?? "";
      const exerciseId = extractExerciseId(exerciseCell);

      if (exerciseId) {
        const setsStr = cells[columnIndexes.sets] ?? "0";
        const repsStr = cells[columnIndexes.reps] ?? "";
        const progressionStr =
          columnIndexes.progression < cells.length ? (cells[columnIndexes.progression] ?? "") : "";

        exercises.push({
          exerciseId,
          sets: parseInt(setsStr) || 0,
          reps: repsStr.trim() || "0",
          progression: progressionStr.trim() || undefined,
        });
      }
    } else if (inTable && trimmed !== "") {
      break;
    }
  }

  return exercises;
}

function parseWorkoutSections(body: string): ProgramWorkout[] {
  const workouts: ProgramWorkout[] = [];
  const sectionPattern = /##\s+([^\n]+)\n([\s\S]*?)(?=\n##\s|$)/g;

  let match;
  while ((match = sectionPattern.exec(body)) !== null) {
    const type = (match[1] ?? "").trim().toLowerCase().replace(/\s+/g, "-");
    const tableContent = match[2] ?? "";

    const exercises = parseProgramExerciseTable(tableContent);

    if (exercises.length > 0) {
      workouts.push({ type, exercises });
    }
  }

  return workouts;
}

function parseProgramContent(content: string): Program | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = parseYamlFrontmatter(content);
  if (!frontmatter) return null;

  const body = content.slice(frontmatterMatch[0].length);
  const workouts = parseWorkoutSections(body);

  return {
    name: (frontmatter.name as string) ?? "Unnamed Program",
    split: (frontmatter.split as string[]) ?? [],
    started: frontmatter.started as string | undefined,
    workouts,
  };
}

function getNextWorkoutType(program: Program, workoutHistory: Workout[]): string {
  if (program.split.length === 0) {
    return program.workouts[0]?.type ?? "workout";
  }

  if (workoutHistory.length === 0) {
    return program.split[0] ?? "workout";
  }

  const lastWorkout = workoutHistory.find((w) => program.split.includes(w.type));

  if (!lastWorkout) {
    return program.split[0] ?? "workout";
  }

  const currentIndex = program.split.indexOf(lastWorkout.type);
  const nextIndex = (currentIndex + 1) % program.split.length;
  return program.split[nextIndex] ?? program.split[0] ?? "workout";
}

function getLastPerformance(
  exerciseId: string,
  workoutHistory: Workout[],
): { date: string; sets: WorkoutSet[] } | undefined {
  for (const workout of workoutHistory) {
    const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      return {
        date: workout.date,
        sets: exercise.sets,
      };
    }
  }
  return undefined;
}

function parseMaxReps(reps: string): number {
  const rangeMatch = reps.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return parseInt(rangeMatch[2] ?? "0") || 0;
  }
  const singleMatch = reps.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1] ?? "0") || 0;
  }
  return 0;
}

function parseProgressionIncrement(progression: string): number {
  const incrementMatch = progression.match(/\+\s*([\d.]+)/);
  if (incrementMatch) {
    return parseFloat(incrementMatch[1] ?? "0") || 0;
  }
  return 0;
}

function shouldProgress(
  lastSets: WorkoutSet[],
  targetSets: number,
  maxTargetReps: number,
  progression: string,
): boolean {
  const progressionMatch = progression.match(/at\s+(\d+)\s*[x×]\s*(\d+)/i);

  if (!progressionMatch) {
    return false;
  }

  const requiredSets = parseInt(progressionMatch[1] ?? "0") || targetSets;
  const requiredReps = parseInt(progressionMatch[2] ?? "0") || maxTargetReps;

  const qualifyingSets = lastSets.filter((s) => s.reps >= requiredReps);

  return qualifyingSets.length >= requiredSets;
}

function calculateSuggestedWeight(
  lastPerformance: { date: string; sets: WorkoutSet[] } | undefined,
  targetSets: number,
  targetReps: string,
  progression?: string,
): number {
  if (!lastPerformance || lastPerformance.sets.length === 0) {
    return 0;
  }

  const lastWeight = lastPerformance.sets[0]?.weight ?? 0;
  const lastSets = lastPerformance.sets;
  const maxTargetReps = parseMaxReps(targetReps);

  if (progression && shouldProgress(lastSets, targetSets, maxTargetReps, progression)) {
    return lastWeight + parseProgressionIncrement(progression);
  }

  return lastWeight;
}

function generateWorkoutSuggestion(
  program: Program,
  workoutHistory: Workout[],
  date: string,
): WorkoutSuggestion | null {
  const nextType = getNextWorkoutType(program, workoutHistory);
  const programWorkout = program.workouts.find((w) => w.type === nextType);

  if (!programWorkout) {
    return null;
  }

  const exercises: ExerciseSuggestion[] = programWorkout.exercises.map((pe) => {
    const lastPerformance = getLastPerformance(pe.exerciseId, workoutHistory);
    const suggestedWeight = calculateSuggestedWeight(
      lastPerformance,
      pe.sets,
      pe.reps,
      pe.progression,
    );

    return {
      exerciseId: pe.exerciseId,
      targetSets: pe.sets,
      targetReps: pe.reps,
      suggestedWeight,
      lastPerformance,
      progression: pe.progression,
    };
  });

  return {
    date,
    type: nextType,
    programName: program.name,
    exercises,
  };
}

// Tests
describe("Program Parser", () => {
  describe("parseYamlFrontmatter with arrays", () => {
    it("parses frontmatter with array values", () => {
      const content = `---
name: My PPL Program
split: [push, pull, legs]
started: 2026-01-20
---

# Content`;

      const result = parseYamlFrontmatter(content);
      expect(result).toEqual({
        name: "My PPL Program",
        split: ["push", "pull", "legs"],
        started: "2026-01-20",
      });
    });
  });

  describe("extractExerciseId", () => {
    it("extracts ID from wiki link", () => {
      expect(extractExerciseId("[[barbell-bench-press]]")).toBe("barbell-bench-press");
    });

    it("extracts ID from wiki link with display name", () => {
      expect(extractExerciseId("[[barbell-bench-press|Bench Press]]")).toBe("barbell-bench-press");
    });

    it("converts plain text to kebab case", () => {
      expect(extractExerciseId("Bench Press")).toBe("bench-press");
    });

    it("returns null for empty string", () => {
      expect(extractExerciseId("")).toBeNull();
    });
  });

  describe("parseHeaderColumns", () => {
    it("parses standard header", () => {
      const cells = ["Exercise", "Sets", "Reps", "Progression"];
      const indexes = parseHeaderColumns(cells);
      expect(indexes).toEqual({ exercise: 0, sets: 1, reps: 2, progression: 3 });
    });

    it("handles different column order", () => {
      const cells = ["Sets", "Exercise", "Progression", "Reps"];
      const indexes = parseHeaderColumns(cells);
      expect(indexes.exercise).toBe(1);
      expect(indexes.sets).toBe(0);
      expect(indexes.reps).toBe(3);
      expect(indexes.progression).toBe(2);
    });

    it("handles Progress instead of Progression", () => {
      const cells = ["Exercise", "Sets", "Reps", "Progress"];
      const indexes = parseHeaderColumns(cells);
      expect(indexes.progression).toBe(3);
    });
  });

  describe("parseProgramExerciseTable", () => {
    it("parses a standard program exercise table", () => {
      const table = `| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-bench-press]] | 4 | 6-8 | +5lbs at 4x8 |
| [[incline-dumbbell-press]] | 3 | 8-10 | +2.5lbs at 3x10 |
| [[cable-fly]] | 3 | 12-15 |  |`;

      const exercises = parseProgramExerciseTable(table);

      expect(exercises).toHaveLength(3);
      expect(exercises[0]).toEqual({
        exerciseId: "barbell-bench-press",
        sets: 4,
        reps: "6-8",
        progression: "+5lbs at 4x8",
      });
      expect(exercises[1]).toEqual({
        exerciseId: "incline-dumbbell-press",
        sets: 3,
        reps: "8-10",
        progression: "+2.5lbs at 3x10",
      });
      expect(exercises[2]).toEqual({
        exerciseId: "cable-fly",
        sets: 3,
        reps: "12-15",
        progression: undefined,
      });
    });

    it("parses table without progression column", () => {
      const table = `| Exercise | Sets | Reps |
|----------|------|------|
| [[barbell-squat]] | 5 | 5 |`;

      const exercises = parseProgramExerciseTable(table);

      expect(exercises).toHaveLength(1);
      expect(exercises[0]).toEqual({
        exerciseId: "barbell-squat",
        sets: 5,
        reps: "5",
        progression: undefined,
      });
    });

    it("handles plain text exercise names", () => {
      const table = `| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| Bench Press | 4 | 8 | +5lbs at 4x8 |`;

      const exercises = parseProgramExerciseTable(table);

      expect(exercises[0]?.exerciseId).toBe("bench-press");
    });
  });

  describe("parseWorkoutSections", () => {
    it("parses multiple workout sections", () => {
      const body = `

## Push

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-bench-press]] | 4 | 6-8 | +5lbs at 4x8 |

## Pull

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-row]] | 4 | 6-8 | +5lbs at 4x8 |

## Legs

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-squat]] | 5 | 5 | +5lbs at 5x5 |
`;

      const workouts = parseWorkoutSections(body);

      expect(workouts).toHaveLength(3);
      expect(workouts[0]?.type).toBe("push");
      expect(workouts[1]?.type).toBe("pull");
      expect(workouts[2]?.type).toBe("legs");
    });

    it("converts multi-word section names to kebab case", () => {
      const body = `

## Upper Body

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-bench-press]] | 4 | 8 |  |
`;

      const workouts = parseWorkoutSections(body);

      expect(workouts[0]?.type).toBe("upper-body");
    });
  });

  describe("parseProgramContent", () => {
    it("parses a complete program file", () => {
      const content = `---
name: My PPL Program
split: [push, pull, legs]
started: 2026-01-20
---

## Push

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-bench-press]] | 4 | 6-8 | +5lbs at 4x8 |
| [[overhead-press]] | 3 | 8-10 | +2.5lbs at 3x10 |

## Pull

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-row]] | 4 | 6-8 | +5lbs at 4x8 |
| [[lat-pulldown]] | 3 | 10-12 |  |

## Legs

| Exercise | Sets | Reps | Progression |
|----------|------|------|-------------|
| [[barbell-squat]] | 5 | 5 | +5lbs at 5x5 |
| [[romanian-deadlift]] | 3 | 8-10 | +5lbs at 3x10 |
`;

      const program = parseProgramContent(content);

      expect(program).not.toBeNull();
      expect(program!.name).toBe("My PPL Program");
      expect(program!.split).toEqual(["push", "pull", "legs"]);
      expect(program!.started).toBe("2026-01-20");
      expect(program!.workouts).toHaveLength(3);
      expect(program!.workouts[0]?.exercises).toHaveLength(2);
    });

    it("returns null for content without frontmatter", () => {
      const content = `# No frontmatter here`;
      expect(parseProgramContent(content)).toBeNull();
    });

    it("provides default name for unnamed programs", () => {
      const content = `---
split: [push, pull]
---

## Push

| Exercise | Sets | Reps |
|----------|------|------|
| [[bench-press]] | 4 | 8 |
`;

      const program = parseProgramContent(content);
      expect(program!.name).toBe("Unnamed Program");
    });
  });
});

describe("Next Workout Logic", () => {
  describe("getNextWorkoutType", () => {
    const program: Program = {
      name: "PPL",
      split: ["push", "pull", "legs"],
      workouts: [],
    };

    it("returns first split type when no history", () => {
      expect(getNextWorkoutType(program, [])).toBe("push");
    });

    it("returns next type in rotation after push", () => {
      const history: Workout[] = [{ date: "2026-01-20", type: "push", exercises: [] }];
      expect(getNextWorkoutType(program, history)).toBe("pull");
    });

    it("returns next type in rotation after pull", () => {
      const history: Workout[] = [
        { date: "2026-01-21", type: "pull", exercises: [] },
        { date: "2026-01-20", type: "push", exercises: [] },
      ];
      expect(getNextWorkoutType(program, history)).toBe("legs");
    });

    it("wraps around to first type after legs", () => {
      const history: Workout[] = [
        { date: "2026-01-22", type: "legs", exercises: [] },
        { date: "2026-01-21", type: "pull", exercises: [] },
        { date: "2026-01-20", type: "push", exercises: [] },
      ];
      expect(getNextWorkoutType(program, history)).toBe("push");
    });

    it("skips non-matching workout types in history", () => {
      const history: Workout[] = [
        { date: "2026-01-22", type: "cardio", exercises: [] },
        { date: "2026-01-21", type: "pull", exercises: [] },
      ];
      expect(getNextWorkoutType(program, history)).toBe("legs");
    });

    it("handles program with no split defined", () => {
      const noSplitProgram: Program = {
        name: "Full Body",
        split: [],
        workouts: [{ type: "full-body", exercises: [] }],
      };
      expect(getNextWorkoutType(noSplitProgram, [])).toBe("full-body");
    });
  });

  describe("getLastPerformance", () => {
    it("finds the most recent performance of an exercise", () => {
      const history: Workout[] = [
        {
          date: "2026-01-22",
          type: "push",
          exercises: [
            {
              exerciseId: "barbell-bench-press",
              sets: [{ weight: 190, reps: 8 }],
            },
          ],
        },
        {
          date: "2026-01-19",
          type: "push",
          exercises: [
            {
              exerciseId: "barbell-bench-press",
              sets: [{ weight: 185, reps: 8 }],
            },
          ],
        },
      ];

      const result = getLastPerformance("barbell-bench-press", history);

      expect(result).toEqual({
        date: "2026-01-22",
        sets: [{ weight: 190, reps: 8 }],
      });
    });

    it("returns undefined when exercise not found", () => {
      const history: Workout[] = [
        {
          date: "2026-01-22",
          type: "push",
          exercises: [
            {
              exerciseId: "overhead-press",
              sets: [{ weight: 95, reps: 10 }],
            },
          ],
        },
      ];

      expect(getLastPerformance("barbell-bench-press", history)).toBeUndefined();
    });

    it("returns undefined for empty history", () => {
      expect(getLastPerformance("barbell-bench-press", [])).toBeUndefined();
    });
  });
});

describe("Progression Logic", () => {
  describe("parseMaxReps", () => {
    it("parses rep range", () => {
      expect(parseMaxReps("6-8")).toBe(8);
      expect(parseMaxReps("10-12")).toBe(12);
    });

    it("parses single rep value", () => {
      expect(parseMaxReps("5")).toBe(5);
      expect(parseMaxReps("10")).toBe(10);
    });

    it("returns 0 for AMRAP", () => {
      expect(parseMaxReps("AMRAP")).toBe(0);
    });
  });

  describe("parseProgressionIncrement", () => {
    it("parses weight increment in lbs", () => {
      expect(parseProgressionIncrement("+5lbs at 4x8")).toBe(5);
    });

    it("parses weight increment in kg", () => {
      expect(parseProgressionIncrement("+2.5kg at 3x10")).toBe(2.5);
    });

    it("returns 0 for no increment", () => {
      expect(parseProgressionIncrement("linear")).toBe(0);
    });
  });

  describe("shouldProgress", () => {
    it("returns true when all sets meet criteria", () => {
      const sets: WorkoutSet[] = [
        { weight: 185, reps: 8 },
        { weight: 185, reps: 8 },
        { weight: 185, reps: 8 },
        { weight: 185, reps: 8 },
      ];
      expect(shouldProgress(sets, 4, 8, "+5lbs at 4x8")).toBe(true);
    });

    it("returns false when not enough qualifying sets", () => {
      const sets: WorkoutSet[] = [
        { weight: 185, reps: 8 },
        { weight: 185, reps: 8 },
        { weight: 185, reps: 7 },
        { weight: 185, reps: 6 },
      ];
      expect(shouldProgress(sets, 4, 8, "+5lbs at 4x8")).toBe(false);
    });

    it("returns false when no progression rule", () => {
      const sets: WorkoutSet[] = [
        { weight: 185, reps: 10 },
        { weight: 185, reps: 10 },
      ];
      expect(shouldProgress(sets, 3, 10, "linear progression")).toBe(false);
    });

    it("handles × symbol in progression rule", () => {
      const sets: WorkoutSet[] = [
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 },
      ];
      expect(shouldProgress(sets, 3, 10, "+2.5kg at 3×10")).toBe(true);
    });
  });

  describe("calculateSuggestedWeight", () => {
    it("returns 0 when no history", () => {
      expect(calculateSuggestedWeight(undefined, 4, "6-8", "+5lbs at 4x8")).toBe(0);
    });

    it("returns same weight when progression criteria not met", () => {
      const lastPerformance = {
        date: "2026-01-20",
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 7 },
          { weight: 185, reps: 6 },
          { weight: 185, reps: 6 },
        ],
      };
      expect(calculateSuggestedWeight(lastPerformance, 4, "6-8", "+5lbs at 4x8")).toBe(185);
    });

    it("increases weight when progression criteria met", () => {
      const lastPerformance = {
        date: "2026-01-20",
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 8 },
          { weight: 185, reps: 8 },
          { weight: 185, reps: 8 },
        ],
      };
      expect(calculateSuggestedWeight(lastPerformance, 4, "6-8", "+5lbs at 4x8")).toBe(190);
    });

    it("handles no progression rule", () => {
      const lastPerformance = {
        date: "2026-01-20",
        sets: [{ weight: 100, reps: 12 }],
      };
      expect(calculateSuggestedWeight(lastPerformance, 3, "10-12", undefined)).toBe(100);
    });
  });
});

describe("Workout Suggestion Generation", () => {
  const program: Program = {
    name: "PPL Program",
    split: ["push", "pull", "legs"],
    workouts: [
      {
        type: "push",
        exercises: [
          {
            exerciseId: "barbell-bench-press",
            sets: 4,
            reps: "6-8",
            progression: "+5lbs at 4x8",
          },
          {
            exerciseId: "overhead-press",
            sets: 3,
            reps: "8-10",
            progression: "+2.5lbs at 3x10",
          },
        ],
      },
      {
        type: "pull",
        exercises: [
          {
            exerciseId: "barbell-row",
            sets: 4,
            reps: "6-8",
            progression: "+5lbs at 4x8",
          },
        ],
      },
      {
        type: "legs",
        exercises: [
          {
            exerciseId: "barbell-squat",
            sets: 5,
            reps: "5",
            progression: "+5lbs at 5x5",
          },
        ],
      },
    ],
  };

  it("generates suggestion for first workout with no history", () => {
    const suggestion = generateWorkoutSuggestion(program, [], "2026-01-20");

    expect(suggestion).not.toBeNull();
    expect(suggestion!.date).toBe("2026-01-20");
    expect(suggestion!.type).toBe("push");
    expect(suggestion!.programName).toBe("PPL Program");
    expect(suggestion!.exercises).toHaveLength(2);
    expect(suggestion!.exercises[0]?.exerciseId).toBe("barbell-bench-press");
    expect(suggestion!.exercises[0]?.suggestedWeight).toBe(0); // No history
  });

  it("generates suggestion with weight from history", () => {
    const history: Workout[] = [
      {
        date: "2026-01-19",
        type: "push",
        exercises: [
          {
            exerciseId: "barbell-bench-press",
            sets: [
              { weight: 185, reps: 7 },
              { weight: 185, reps: 7 },
              { weight: 185, reps: 6 },
              { weight: 185, reps: 6 },
            ],
          },
        ],
      },
    ];

    const suggestion = generateWorkoutSuggestion(program, history, "2026-01-22");

    expect(suggestion!.type).toBe("pull"); // Next in rotation
  });

  it("suggests increased weight when progression criteria met", () => {
    const history: Workout[] = [
      {
        date: "2026-01-21",
        type: "legs",
        exercises: [],
      },
      {
        date: "2026-01-20",
        type: "pull",
        exercises: [],
      },
      {
        date: "2026-01-19",
        type: "push",
        exercises: [
          {
            exerciseId: "barbell-bench-press",
            sets: [
              { weight: 185, reps: 8 },
              { weight: 185, reps: 8 },
              { weight: 185, reps: 8 },
              { weight: 185, reps: 8 },
            ],
          },
        ],
      },
    ];

    const suggestion = generateWorkoutSuggestion(program, history, "2026-01-22");

    expect(suggestion!.type).toBe("push");
    expect(suggestion!.exercises[0]?.suggestedWeight).toBe(190); // 185 + 5
    expect(suggestion!.exercises[0]?.lastPerformance?.date).toBe("2026-01-19");
  });

  it("returns null for workout type not in program", () => {
    const smallProgram: Program = {
      name: "Push Only",
      split: ["push"],
      workouts: [], // No workout templates
    };

    const suggestion = generateWorkoutSuggestion(smallProgram, [], "2026-01-20");
    expect(suggestion).toBeNull();
  });
});
