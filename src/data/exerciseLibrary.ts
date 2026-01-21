import { App, TFile, TFolder, parseYaml, stringifyYaml } from 'obsidian';
import { Exercise, GymTrackerSettings } from '../types';

export class ExerciseLibrary {
  private app: App;
  private settings: GymTrackerSettings;
  private cache: Map<string, Exercise> = new Map();

  constructor(app: App, settings: GymTrackerSettings) {
    this.app = app;
    this.settings = settings;
  }

  async loadAll(): Promise<Map<string, Exercise>> {
    this.cache.clear();
    const folder = this.app.vault.getAbstractFileByPath(this.settings.exercisesFolder);
    
    if (!(folder instanceof TFolder)) {
      return this.cache;
    }

    for (const file of folder.children) {
      if (file instanceof TFile && file.extension === 'md') {
        const exercise = await this.parseExerciseFile(file);
        if (exercise) {
          this.cache.set(exercise.id, exercise);
        }
      }
    }

    return this.cache;
  }

  async parseExerciseFile(file: TFile): Promise<Exercise | null> {
    const content = await this.app.vault.read(file);
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      return null;
    }

    try {
      const frontmatter = parseYaml(frontmatterMatch[1]);
      
      // Extract description from body (everything after frontmatter)
      const body = content.slice(frontmatterMatch[0].length).trim();
      
      return {
        id: frontmatter.id || file.basename,
        name: frontmatter.name || file.basename,
        muscles: {
          primary: frontmatter.muscles?.primary || [],
          secondary: frontmatter.muscles?.secondary || [],
        },
        type: frontmatter.type || 'isolation',
        equipment: frontmatter.equipment || 'other',
        alternatives: frontmatter.alternatives || [],
        description: body || undefined,
      };
    } catch (e) {
      console.error(`Failed to parse exercise file: ${file.path}`, e);
      return null;
    }
  }

  async createExercise(exercise: Exercise): Promise<TFile> {
    const folderPath = this.settings.exercisesFolder;
    
    // Ensure folder exists
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const filePath = `${folderPath}/${exercise.id}.md`;
    
    const frontmatter = stringifyYaml({
      id: exercise.id,
      name: exercise.name,
      muscles: exercise.muscles,
      type: exercise.type,
      equipment: exercise.equipment,
      alternatives: exercise.alternatives,
    });

    const content = `---\n${frontmatter}---\n\n${exercise.description || ''}`;
    
    const file = await this.app.vault.create(filePath, content);
    this.cache.set(exercise.id, exercise);
    
    return file;
  }

  getById(id: string): Exercise | undefined {
    return this.cache.get(id);
  }

  getAll(): Exercise[] {
    return Array.from(this.cache.values());
  }

  getAllByMuscle(muscle: string): Exercise[] {
    return this.getAll().filter(
      (e) => e.muscles.primary.includes(muscle) || e.muscles.secondary.includes(muscle)
    );
  }

  search(query: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.id.toLowerCase().includes(lowerQuery) ||
        e.muscles.primary.some((m) => m.toLowerCase().includes(lowerQuery)) ||
        e.equipment.toLowerCase().includes(lowerQuery)
    );
  }
}
