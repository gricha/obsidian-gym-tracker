import { App, TFile, parseYaml, stringifyYaml } from "obsidian";
import {
  Program,
  ProgramWorkout,
  ProgramExercise,
  GymTrackerSettings,
  Workout,
  WorkoutSuggestion,
  ExerciseSuggestion,
  WorkoutSet,
} from "../types";

export class ProgramParser {
  private app: App;
  private settings: GymTrackerSettings;

  constructor(app: App, settings: GymTrackerSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Parse a program markdown file into a Program object
   */
  async parseProgramFile(file: TFile): Promise<Program | null> {
    const content = await this.app.vault.read(file);
    return this.parseProgramContent(content);
  }

  /**
   * Parse program content from markdown string
   *
   * Expected format:
   * ---
   * name: My PPL Program
   * split: [push, pull, legs]
   * started: 2026-01-20
   * ---
   *
   * ## Push
   *
   * | Exercise | Sets | Reps | Progression |
   * |----------|------|------|-------------|
   * | [[barbell-bench-press]] | 4 | 6-8 | +5lbs at 4x8 |
   */
  parseProgramContent(content: string): Program | null {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    try {
      const frontmatter = parseYaml(frontmatterMatch[1] ?? "") as Record<string, unknown>;
      const body = content.slice(frontmatterMatch[0].length);

      const workouts = this.parseWorkoutSections(body);

      return {
        name: (frontmatter.name as string) ?? "Unnamed Program",
        split: (frontmatter.split as string[]) ?? [],
        started: frontmatter.started as string | undefined,
        workouts,
      };
    } catch (e) {
      console.error("Failed to parse program file", e);
      return null;
    }
  }

  /**
   * Parse workout sections from program body
   * Each section starts with ## WorkoutType and contains an exercise table
   */
  private parseWorkoutSections(body: string): ProgramWorkout[] {
    const workouts: ProgramWorkout[] = [];

    // Match workout sections: ## Type followed by table
    const sectionPattern = /##\s+([^\n]+)\n([\s\S]*?)(?=\n##\s|$)/g;

    let match;
    while ((match = sectionPattern.exec(body)) !== null) {
      const type = (match[1] ?? "").trim().toLowerCase().replace(/\s+/g, "-");
      const tableContent = match[2] ?? "";

      const exercises = this.parseProgramExerciseTable(tableContent);

      if (exercises.length > 0) {
        workouts.push({ type, exercises });
      }
    }

    return workouts;
  }

  /**
   * Parse a program exercise table
   *
   * Expected format:
   * | Exercise | Sets | Reps | Progression |
   * |----------|------|------|-------------|
   * | [[barbell-bench-press]] | 4 | 6-8 | +5lbs at 4x8 |
   */
  private parseProgramExerciseTable(tableContent: string): ProgramExercise[] {
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
          // Parse header to determine column order
          inTable = true;
          columnIndexes = this.parseHeaderColumns(cells);
          continue;
        }
        if (!headerParsed) {
          headerParsed = true;
          continue; // Skip separator row
        }

        // Parse data row
        const exerciseCell = cells[columnIndexes.exercise] ?? "";
        const exerciseId = this.extractExerciseId(exerciseCell);

        if (exerciseId) {
          const setsStr = cells[columnIndexes.sets] ?? "0";
          const repsStr = cells[columnIndexes.reps] ?? "";
          const progressionStr =
            columnIndexes.progression < cells.length
              ? (cells[columnIndexes.progression] ?? "")
              : "";

          exercises.push({
            exerciseId,
            sets: parseInt(setsStr) || 0,
            reps: repsStr.trim() || "0",
            progression: progressionStr.trim() || undefined,
          });
        }
      } else if (inTable && trimmed !== "") {
        // End of table if we hit non-table content
        break;
      }
    }

    return exercises;
  }

  /**
   * Parse header row to determine column indexes
   */
  private parseHeaderColumns(cells: string[]): {
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

  /**
   * Extract exercise ID from cell content
   * Supports: [[exercise-id]], [[exercise-id|Display Name]], or plain text
   */
  private extractExerciseId(cell: string): string | null {
    // Match [[id]] or [[id|name]]
    const linkMatch = cell.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    if (linkMatch) {
      return linkMatch[1] ?? null;
    }

    // Plain text - convert to kebab case
    const trimmed = cell.trim();
    if (trimmed) {
      return this.toKebabCase(trimmed);
    }

    return null;
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Generate markdown content for a program
   */
  generateProgramContent(program: Program): string {
    const frontmatter: Record<string, unknown> = {
      name: program.name,
      split: program.split,
    };

    if (program.started) {
      frontmatter.started = program.started;
    }

    let content = `---\n${stringifyYaml(frontmatter)}---\n`;

    for (const workout of program.workouts) {
      content += `\n## ${this.capitalizeType(workout.type)}\n\n`;
      content += this.generateProgramExerciseTable(workout.exercises);
    }

    return content;
  }

  private capitalizeType(type: string): string {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Generate a program exercise table
   */
  private generateProgramExerciseTable(exercises: ProgramExercise[]): string {
    let table = "| Exercise | Sets | Reps | Progression |\n";
    table += "|----------|------|------|-------------|\n";

    for (const exercise of exercises) {
      const progression = exercise.progression ?? "";
      table += `| [[${exercise.exerciseId}]] | ${exercise.sets} | ${exercise.reps} | ${progression} |\n`;
    }

    return table;
  }

  /**
   * Find the active program file in the workouts folder
   * Returns the most recently modified .program.md file or program.md
   */
  async findActiveProgram(): Promise<TFile | null> {
    const folder = this.app.vault.getAbstractFileByPath(this.settings.workoutsFolder);
    if (!folder) {
      return null;
    }

    const files = this.app.vault.getMarkdownFiles().filter((f) => {
      return (
        f.path.startsWith(this.settings.workoutsFolder) &&
        (f.name.endsWith(".program.md") || f.name === "program.md")
      );
    });

    if (files.length === 0) {
      return null;
    }

    // Return most recently modified
    files.sort((a, b) => b.stat.mtime - a.stat.mtime);
    return files[0] ?? null;
  }

  /**
   * Determine the next workout type based on split rotation and workout history
   */
  getNextWorkoutType(program: Program, workoutHistory: Workout[]): string {
    if (program.split.length === 0) {
      return program.workouts[0]?.type ?? "workout";
    }

    if (workoutHistory.length === 0) {
      return program.split[0] ?? "workout";
    }

    // Find the last workout that matches a split type
    const lastWorkout = workoutHistory.find((w) => program.split.includes(w.type));

    if (!lastWorkout) {
      return program.split[0] ?? "workout";
    }

    // Find position in split rotation and return next
    const currentIndex = program.split.indexOf(lastWorkout.type);
    const nextIndex = (currentIndex + 1) % program.split.length;
    return program.split[nextIndex] ?? program.split[0] ?? "workout";
  }

  /**
   * Get the last performance for an exercise from workout history
   */
  getLastPerformance(
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

  /**
   * Calculate suggested weight based on last performance and progression rule
   */
  calculateSuggestedWeight(
    lastPerformance: { date: string; sets: WorkoutSet[] } | undefined,
    targetSets: number,
    targetReps: string,
    progression?: string,
  ): number {
    if (!lastPerformance || lastPerformance.sets.length === 0) {
      return 0; // No history, user needs to set initial weight
    }

    // Get the weight used in last session (use first set as baseline)
    const lastWeight = lastPerformance.sets[0]?.weight ?? 0;
    const lastSets = lastPerformance.sets;

    // Parse target reps (e.g., "6-8" -> max of 8)
    const maxTargetReps = this.parseMaxReps(targetReps);

    // Check if progression criteria is met
    if (progression && this.shouldProgress(lastSets, targetSets, maxTargetReps, progression)) {
      return lastWeight + this.parseProgressionIncrement(progression);
    }

    return lastWeight;
  }

  /**
   * Parse max reps from rep range string (e.g., "6-8" -> 8, "10" -> 10, "AMRAP" -> 0)
   */
  private parseMaxReps(reps: string): number {
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

  /**
   * Check if progression criteria is met
   * Example progression: "+5lbs at 4x8" means increase if completed 4 sets of 8 reps
   */
  private shouldProgress(
    lastSets: WorkoutSet[],
    targetSets: number,
    maxTargetReps: number,
    progression: string,
  ): boolean {
    // Parse progression rule (e.g., "+5lbs at 4x8" or "+2.5kg at 3x10")
    const progressionMatch = progression.match(/at\s+(\d+)\s*[x×]\s*(\d+)/i);

    if (!progressionMatch) {
      // No specific criteria, don't auto-progress
      return false;
    }

    const requiredSets = parseInt(progressionMatch[1] ?? "0") || targetSets;
    const requiredReps = parseInt(progressionMatch[2] ?? "0") || maxTargetReps;

    // Check if all sets met or exceeded the required reps
    const qualifyingSets = lastSets.filter((s) => s.reps >= requiredReps);

    return qualifyingSets.length >= requiredSets;
  }

  /**
   * Parse the weight increment from progression string
   * Example: "+5lbs at 4x8" -> 5, "+2.5kg at 3x10" -> 2.5
   */
  private parseProgressionIncrement(progression: string): number {
    const incrementMatch = progression.match(/\+\s*([\d.]+)/);
    if (incrementMatch) {
      return parseFloat(incrementMatch[1] ?? "0") || 0;
    }
    return 0;
  }

  /**
   * Generate a workout suggestion based on program and history
   */
  generateWorkoutSuggestion(
    program: Program,
    workoutHistory: Workout[],
    date: string,
  ): WorkoutSuggestion | null {
    const nextType = this.getNextWorkoutType(program, workoutHistory);

    // Find the program workout template for this type
    const programWorkout = program.workouts.find((w) => w.type === nextType);
    if (!programWorkout) {
      return null;
    }

    const exercises: ExerciseSuggestion[] = programWorkout.exercises.map((pe) => {
      const lastPerformance = this.getLastPerformance(pe.exerciseId, workoutHistory);
      const suggestedWeight = this.calculateSuggestedWeight(
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

  /**
   * Generate pre-filled workout markdown from a suggestion
   */
  generateSuggestedWorkoutContent(suggestion: WorkoutSuggestion): string {
    const frontmatter: Record<string, unknown> = {
      date: suggestion.date,
      type: suggestion.type,
    };

    let content = `---\n${stringifyYaml(frontmatter)}---\n\n`;
    content += `> Generated from program: **${suggestion.programName}**\n\n`;
    content += `## Exercises\n\n`;

    for (const exercise of suggestion.exercises) {
      content += `### [[${exercise.exerciseId}]]\n`;
      content += this.generateSuggestedSetTable(exercise);
      content += "\n";
    }

    return content;
  }

  /**
   * Generate a pre-filled set table based on exercise suggestion
   */
  private generateSuggestedSetTable(exercise: ExerciseSuggestion): string {
    const showRPE = this.settings.showRPE;

    let table = showRPE
      ? "| Set | Weight | Reps | RPE |\n|-----|--------|------|-----|\n"
      : "| Set | Weight | Reps |\n|-----|--------|------|\n";

    // Add progression hint as comment if applicable
    if (exercise.progression && exercise.lastPerformance) {
      table =
        `<!-- Target: ${exercise.targetSets}x${exercise.targetReps}, Progression: ${exercise.progression} -->\n` +
        table;
    }

    // Pre-fill rows with suggested weight
    const weightStr = exercise.suggestedWeight > 0 ? exercise.suggestedWeight.toString() : "";
    const targetRepsDisplay = this.parseMaxReps(exercise.targetReps) || "";

    for (let i = 1; i <= exercise.targetSets; i++) {
      table += showRPE
        ? `| ${i} | ${weightStr} | ${targetRepsDisplay} |  |\n`
        : `| ${i} | ${weightStr} | ${targetRepsDisplay} |\n`;
    }

    // Add last performance info as comment
    if (exercise.lastPerformance) {
      const lastSetsStr = exercise.lastPerformance.sets
        .map((s) => `${s.weight}x${s.reps}`)
        .join(", ");
      table += `<!-- Last (${exercise.lastPerformance.date}): ${lastSetsStr} -->\n`;
    }

    return table;
  }
}
