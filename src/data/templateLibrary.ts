import { App, TFile, TFolder, parseYaml, stringifyYaml } from "obsidian";
import { WorkoutTemplate, TemplateExercise, GymTrackerSettings } from "../types";

export class TemplateLibrary {
  private app: App;
  private settings: GymTrackerSettings;
  private cache: Map<string, WorkoutTemplate> = new Map();

  constructor(app: App, settings: GymTrackerSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Load all templates from the templates folder into cache
   */
  async loadAll(): Promise<Map<string, WorkoutTemplate>> {
    this.cache.clear();

    const folder = this.app.vault.getAbstractFileByPath(this.settings.templatesFolder);
    if (!(folder instanceof TFolder)) {
      return this.cache;
    }

    for (const file of folder.children) {
      if (file instanceof TFile && file.extension === "md") {
        const template = await this.parseTemplateFile(file);
        if (template) {
          this.cache.set(template.id, template);
        }
      }
    }

    return this.cache;
  }

  /**
   * Parse a template markdown file into a WorkoutTemplate object
   */
  async parseTemplateFile(file: TFile): Promise<WorkoutTemplate | null> {
    const content = await this.app.vault.read(file);
    return this.parseTemplateContent(content, file.basename);
  }

  /**
   * Parse template content from markdown string
   *
   * Expected format:
   * ---
   * name: Pull-A
   * type: pull
   * ---
   *
   * ## Exercises
   *
   * | Exercise | Sets | Reps |
   * |----------|------|------|
   * | [[barbell-row]] | 4 | 6-8 |
   */
  parseTemplateContent(content: string, id: string): WorkoutTemplate | null {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    try {
      const frontmatter = parseYaml(frontmatterMatch[1] ?? "") as Record<string, unknown>;
      const body = content.slice(frontmatterMatch[0].length);

      const exercises = this.parseExerciseTable(body);

      return {
        id,
        name: (frontmatter.name as string) ?? id,
        type: (frontmatter.type as string) ?? "",
        exercises,
      };
    } catch (e) {
      console.error("Failed to parse template file", e);
      return null;
    }
  }

  /**
   * Parse exercise table from template body
   *
   * Expected format:
   * | Exercise | Sets | Reps |
   * |----------|------|------|
   * | [[barbell-row]] | 4 | 6-8 |
   */
  private parseExerciseTable(body: string): TemplateExercise[] {
    const exercises: TemplateExercise[] = [];
    const lines = body.trim().split("\n");

    let inTable = false;
    let headerParsed = false;
    let columnIndexes = { exercise: 0, sets: 1, reps: 2 };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const cells = trimmed
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c);

        if (!inTable) {
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

          exercises.push({
            exerciseId,
            sets: parseInt(setsStr) || 3,
            reps: repsStr.trim() || "8-12",
          });
        }
      } else if (inTable && trimmed !== "" && !trimmed.startsWith("#")) {
        // End of table if we hit non-table content (except headers)
        break;
      }
    }

    return exercises;
  }

  /**
   * Parse header row to determine column indexes
   */
  private parseHeaderColumns(cells: string[]): { exercise: number; sets: number; reps: number } {
    const indexes = { exercise: 0, sets: 1, reps: 2 };

    cells.forEach((cell, index) => {
      const lower = cell.toLowerCase();
      if (lower.includes("exercise")) {
        indexes.exercise = index;
      } else if (lower.includes("set")) {
        indexes.sets = index;
      } else if (lower.includes("rep")) {
        indexes.reps = index;
      }
    });

    return indexes;
  }

  /**
   * Extract exercise ID from cell content
   * Supports: [[exercise-id]], [[exercise-id|Display Name]], or plain text
   */
  private extractExerciseId(cell: string): string | null {
    const linkMatch = cell.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    if (linkMatch) {
      return linkMatch[1] ?? null;
    }

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
   * Generate markdown content for a template
   */
  generateTemplateContent(template: WorkoutTemplate): string {
    const frontmatter: Record<string, unknown> = {
      name: template.name,
      type: template.type,
    };

    let content = `---\n${stringifyYaml(frontmatter)}---\n\n`;
    content += `## Exercises\n\n`;
    content += this.generateExerciseTable(template.exercises);

    return content;
  }

  /**
   * Generate a template exercise table
   */
  private generateExerciseTable(exercises: TemplateExercise[]): string {
    let table = "| Exercise | Sets | Reps |\n";
    table += "|----------|------|------|\n";

    for (const exercise of exercises) {
      table += `| [[${exercise.exerciseId}]] | ${exercise.sets} | ${exercise.reps} |\n`;
    }

    return table;
  }

  /**
   * Create a new template file
   */
  async createTemplate(template: WorkoutTemplate): Promise<TFile> {
    const folderPath = this.settings.templatesFolder;

    // Ensure folder exists
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const fileName = `${template.id}.md`;
    const filePath = `${folderPath}/${fileName}`;

    const content = this.generateTemplateContent(template);

    // Check if file already exists
    const existing = this.app.vault.getAbstractFileByPath(filePath);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      this.cache.set(template.id, template);
      return existing;
    }

    const file = await this.app.vault.create(filePath, content);
    this.cache.set(template.id, template);
    return file;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    const filePath = `${this.settings.templatesFolder}/${id}.md`;
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file instanceof TFile) {
      await this.app.vault.delete(file);
      this.cache.delete(id);
    }
  }

  /**
   * Get a template by ID from cache
   */
  getById(id: string): WorkoutTemplate | undefined {
    return this.cache.get(id);
  }

  /**
   * Get all templates from cache
   */
  getAll(): WorkoutTemplate[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get templates by workout type
   */
  getByType(type: string): WorkoutTemplate[] {
    return this.getAll().filter((t) => t.type === type);
  }
}
