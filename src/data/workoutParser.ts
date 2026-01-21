import { App, TFile, TFolder, parseYaml, stringifyYaml } from "obsidian";
import { Workout, WorkoutExercise, WorkoutSet, GymTrackerSettings } from "../types";

export class WorkoutParser {
  private app: App;
  private settings: GymTrackerSettings;

  constructor(app: App, settings: GymTrackerSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Parse a workout markdown file into a Workout object
   */
  async parseWorkoutFile(file: TFile): Promise<Workout | null> {
    const content = await this.app.vault.read(file);
    return this.parseWorkoutContent(content);
  }

  parseWorkoutContent(content: string): Workout | null {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    try {
      const frontmatter = parseYaml(frontmatterMatch[1] ?? "") as Record<string, unknown>;
      const body = content.slice(frontmatterMatch[0].length);

      const exercises = this.parseExerciseTables(body);

      return {
        date: frontmatter.date as string,
        type: frontmatter.type as string,
        duration: frontmatter.duration as number | undefined,
        exercises,
        notes: frontmatter.notes as string | undefined,
      };
    } catch (e) {
      console.error("Failed to parse workout file", e);
      return null;
    }
  }

  /**
   * Parse exercise tables from the workout body
   * Format expected:
   * ### [[exercise-id|Exercise Name]]
   * | Set | Weight | Reps | RPE |
   * |-----|--------|------|-----|
   * | 1   | 185    | 8    |     |
   */
  private parseExerciseTables(body: string): WorkoutExercise[] {
    const exercises: WorkoutExercise[] = [];

    // Match exercise headers and their tables
    // Supports both [[id|name]] and [[id]] and plain ### Name formats
    const exercisePattern =
      /###\s+(?:\[\[([^\]|]+)(?:\|[^\]]+)?\]\]|([^\n]+))\n([\s\S]*?)(?=###|$)/g;

    let match;
    while ((match = exercisePattern.exec(body)) !== null) {
      const exerciseId = match[1] ?? this.toKebabCase((match[2] ?? "").trim());
      const tableContent = match[3] ?? "";

      const sets = this.parseSetTable(tableContent);

      if (sets.length > 0) {
        exercises.push({
          exerciseId,
          sets,
        });
      }
    }

    return exercises;
  }

  /**
   * Parse a markdown table into sets
   */
  private parseSetTable(tableContent: string): WorkoutSet[] {
    const sets: WorkoutSet[] = [];
    const lines = tableContent.trim().split("\n");

    // Find table rows (skip header and separator)
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
          continue; // Skip separator row (|-----|)
        }

        // Parse data row
        const cells = trimmed
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c);

        if (cells.length >= 3) {
          const weight = parseFloat(cells[1] ?? "0") || 0;
          const reps = parseInt(cells[2] ?? "0") || 0;
          const rpe = cells[3] ? parseFloat(cells[3]) : undefined;

          if (weight > 0 || reps > 0) {
            sets.push({ weight, reps, rpe });
          }
        }
      } else if (inTable) {
        // End of table
        break;
      }
    }

    return sets;
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Generate markdown content for a workout
   */
  generateWorkoutContent(workout: Workout): string {
    const frontmatter: Record<string, unknown> = {
      date: workout.date,
      type: workout.type,
    };

    if (workout.duration) {
      frontmatter.duration = workout.duration;
    }
    if (workout.notes) {
      frontmatter.notes = workout.notes;
    }

    let content = `---\n${stringifyYaml(frontmatter)}---\n\n## Exercises\n\n`;

    for (const exercise of workout.exercises) {
      content += `### [[${exercise.exerciseId}]]\n`;
      content += this.generateSetTable(exercise.sets);
      content += "\n";
    }

    return content;
  }

  /**
   * Generate a markdown table for sets
   */
  private generateSetTable(sets: WorkoutSet[]): string {
    const showRPE = this.settings.showRPE;

    let table = showRPE
      ? "| Set | Weight | Reps | RPE |\n|-----|--------|------|-----|\n"
      : "| Set | Weight | Reps |\n|-----|--------|------|\n";

    sets.forEach((set, index) => {
      const rpeCell = set.rpe !== undefined ? set.rpe.toString() : "";
      table += showRPE
        ? `| ${index + 1} | ${set.weight} | ${set.reps} | ${rpeCell} |\n`
        : `| ${index + 1} | ${set.weight} | ${set.reps} |\n`;
    });

    return table;
  }

  /**
   * Save a workout to a markdown file
   */
  async saveWorkout(workout: Workout): Promise<TFile> {
    const folderPath = this.settings.workoutsFolder;

    // Ensure folder exists
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const fileName = `${workout.date}-${workout.type}.md`;
    const filePath = `${folderPath}/${fileName}`;

    const content = this.generateWorkoutContent(workout);

    // Check if file already exists
    const existing = this.app.vault.getAbstractFileByPath(filePath);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      return existing;
    }

    return await this.app.vault.create(filePath, content);
  }

  /**
   * Load all workouts from the workouts folder
   */
  async loadAllWorkouts(): Promise<Workout[]> {
    const workouts: Workout[] = [];
    const folder = this.app.vault.getAbstractFileByPath(this.settings.workoutsFolder);

    if (!(folder instanceof TFolder)) {
      return workouts;
    }

    for (const file of folder.children) {
      if (file instanceof TFile && file.extension === "md") {
        // Skip exercises subfolder files
        if (file.path.startsWith(this.settings.exercisesFolder)) {
          continue;
        }

        const workout = await this.parseWorkoutFile(file);
        if (workout) {
          workouts.push(workout);
        }
      }
    }

    // Sort by date descending
    workouts.sort((a, b) => b.date.localeCompare(a.date));

    return workouts;
  }

  /**
   * Get progression data for a specific exercise
   */
  async getExerciseProgression(
    exerciseId: string,
  ): Promise<{ date: string; maxWeight: number; maxReps: number; totalVolume: number }[]> {
    const workouts = await this.loadAllWorkouts();
    const progression: { date: string; maxWeight: number; maxReps: number; totalVolume: number }[] =
      [];

    for (const workout of workouts) {
      const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise && exercise.sets.length > 0) {
        const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
        const maxReps = Math.max(...exercise.sets.map((s) => s.reps));
        const totalVolume = exercise.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

        progression.push({
          date: workout.date,
          maxWeight,
          maxReps,
          totalVolume,
        });
      }
    }

    // Sort by date ascending for charts
    progression.sort((a, b) => a.date.localeCompare(b.date));

    return progression;
  }
}
