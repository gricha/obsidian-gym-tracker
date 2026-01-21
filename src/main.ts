import { Plugin, Notice } from "obsidian";
import { GymTrackerSettings, DEFAULT_SETTINGS } from "./types";
import { ExerciseLibrary } from "./data/exerciseLibrary";
import { WorkoutParser } from "./data/workoutParser";
import { LogWorkoutModal } from "./ui/LogWorkoutModal";
import { AddExerciseModal } from "./ui/AddExerciseModal";
import { GymTrackerSettingsTab } from "./ui/SettingsTab";
import { SEED_EXERCISES } from "./data/seedExercises";

export default class GymTrackerPlugin extends Plugin {
  settings!: GymTrackerSettings;
  exerciseLibrary!: ExerciseLibrary;
  workoutParser!: WorkoutParser;

  async onload() {
    await this.loadSettings();

    // Initialize data layer
    this.exerciseLibrary = new ExerciseLibrary(this.app, this.settings);
    this.workoutParser = new WorkoutParser(this.app, this.settings);

    // Load exercise library
    await this.exerciseLibrary.loadAll();

    // Add ribbon icons
    this.addRibbonIcon("dumbbell", "Log Workout", () => {
      new LogWorkoutModal(this.app, this.settings, this.exerciseLibrary, this.workoutParser).open();
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
}
