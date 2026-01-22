import { Plugin, Notice, TFile } from "obsidian";
import { GymTrackerSettings, DEFAULT_SETTINGS } from "./types";
import { ExerciseLibrary } from "./data/exerciseLibrary";
import { WorkoutParser } from "./data/workoutParser";
import { ProgramParser } from "./data/programParser";
import { TemplateLibrary } from "./data/templateLibrary";
import { LogWorkoutModal } from "./ui/LogWorkoutModal";
import { AddExerciseModal } from "./ui/AddExerciseModal";
import { CreateTemplateModal } from "./ui/CreateTemplateModal";
import { GymTrackerSettingsTab } from "./ui/SettingsTab";
import { SEED_EXERCISES } from "./data/seedExercises";

export default class GymTrackerPlugin extends Plugin {
  settings!: GymTrackerSettings;
  exerciseLibrary!: ExerciseLibrary;
  workoutParser!: WorkoutParser;
  programParser!: ProgramParser;
  templateLibrary!: TemplateLibrary;

  async onload() {
    await this.loadSettings();

    // Initialize data layer
    this.exerciseLibrary = new ExerciseLibrary(this.app, this.settings);
    this.workoutParser = new WorkoutParser(this.app, this.settings);
    this.programParser = new ProgramParser(this.app, this.settings);
    this.templateLibrary = new TemplateLibrary(this.app, this.settings);

    // Load exercise library and templates
    await this.exerciseLibrary.loadAll();
    await this.templateLibrary.loadAll();

    // Add ribbon icons
    this.addRibbonIcon("dumbbell", "Log Workout", () => {
      new LogWorkoutModal(
        this.app,
        this.settings,
        this.exerciseLibrary,
        this.workoutParser,
        this.templateLibrary,
      ).open();
    });

    // Add commands
    this.addCommand({
      id: "log-workout",
      name: "Log Workout",
      callback: () => {
        new LogWorkoutModal(
          this.app,
          this.settings,
          this.exerciseLibrary,
          this.workoutParser,
          this.templateLibrary,
        ).open();
      },
    });

    this.addCommand({
      id: "create-template",
      name: "Create Workout Template",
      callback: () => {
        new CreateTemplateModal(
          this.app,
          this.settings,
          this.exerciseLibrary,
          this.templateLibrary,
          async () => {
            await this.templateLibrary.loadAll();
          },
        ).open();
      },
    });

    this.addCommand({
      id: "add-exercise",
      name: "Add Exercise to Library",
      callback: () => {
        new AddExerciseModal(this.app, this.settings, this.exerciseLibrary, async () => {
          await this.exerciseLibrary.loadAll();
        }).open();
      },
    });

    this.addCommand({
      id: "seed-exercises",
      name: "Seed Exercise Library",
      callback: async () => {
        await this.seedExerciseLibrary();
      },
    });

    this.addCommand({
      id: "generate-next-workout",
      name: "Generate Next Workout",
      callback: async () => {
        await this.generateNextWorkout();
      },
    });

    // Add settings tab
    this.addSettingTab(new GymTrackerSettingsTab(this.app, this));

    // Auto-seed on first run if library is empty
    if (!this.settings.seeded && this.exerciseLibrary.getAll().length === 0) {
      // Don't auto-seed, let user do it manually from settings
      console.log("Gym Tracker: Exercise library is empty. Use settings to seed it.");
    }
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async seedExerciseLibrary() {
    const notice = new Notice("Seeding exercise library...", 0);

    try {
      // Ensure folders exist
      const workoutsFolder = this.app.vault.getAbstractFileByPath(this.settings.workoutsFolder);
      if (!workoutsFolder) {
        await this.app.vault.createFolder(this.settings.workoutsFolder);
      }

      const exercisesFolder = this.app.vault.getAbstractFileByPath(this.settings.exercisesFolder);
      if (!exercisesFolder) {
        await this.app.vault.createFolder(this.settings.exercisesFolder);
      }

      let created = 0;
      let skipped = 0;

      for (const exercise of SEED_EXERCISES) {
        // Check if already exists
        const existing = this.exerciseLibrary.getById(exercise.id);
        if (existing) {
          skipped++;
          continue;
        }

        // Check if file already exists
        const filePath = `${this.settings.exercisesFolder}/${exercise.id}.md`;
        const existingFile = this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile) {
          skipped++;
          continue;
        }

        await this.exerciseLibrary.createExercise(exercise);
        created++;
      }

      this.settings.seeded = true;
      await this.saveSettings();

      // Reload library
      await this.exerciseLibrary.loadAll();

      notice.hide();
      new Notice(`Exercise library seeded! Created: ${created}, Skipped: ${skipped}`);
    } catch (e) {
      notice.hide();
      console.error("Failed to seed exercise library", e);
      new Notice("Failed to seed exercise library. Check console for details.");
    }
  }

  async generateNextWorkout() {
    const notice = new Notice("Generating next workout...", 0);

    try {
      // Find active program
      const programFile = await this.programParser.findActiveProgram();
      if (!programFile) {
        notice.hide();
        new Notice(
          `No program found. Create a program.md file in ${this.settings.workoutsFolder}/`,
        );
        return;
      }

      // Parse program
      const program = await this.programParser.parseProgramFile(programFile);
      if (!program) {
        notice.hide();
        new Notice("Failed to parse program file. Check format.");
        return;
      }

      // Load workout history
      const workoutHistory = await this.workoutParser.loadAllWorkouts();

      // Generate today's date
      const today = new Date().toISOString().split("T")[0]!;

      // Generate suggestion
      const suggestion = this.programParser.generateWorkoutSuggestion(
        program,
        workoutHistory,
        today,
      );
      if (!suggestion) {
        notice.hide();
        new Notice(`No workout template found for type in program.`);
        return;
      }

      // Generate workout content
      const content = this.programParser.generateSuggestedWorkoutContent(suggestion);

      // Ensure workouts folder exists
      const workoutsFolder = this.app.vault.getAbstractFileByPath(this.settings.workoutsFolder);
      if (!workoutsFolder) {
        await this.app.vault.createFolder(this.settings.workoutsFolder);
      }

      // Create the workout file
      const fileName = `${suggestion.date}-${suggestion.type}.md`;
      const filePath = `${this.settings.workoutsFolder}/${fileName}`;

      // Check if file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        notice.hide();
        new Notice(`Workout file already exists: ${fileName}`);
        // Open the existing file
        await this.app.workspace.getLeaf().openFile(existingFile);
        return;
      }

      // Create new file
      const file = await this.app.vault.create(filePath, content);

      notice.hide();
      new Notice(`Created ${suggestion.type} workout for ${suggestion.date}`);

      // Open the new file
      await this.app.workspace.getLeaf().openFile(file);
    } catch (e) {
      notice.hide();
      console.error("Failed to generate workout", e);
      new Notice("Failed to generate workout. Check console for details.");
    }
  }
}
