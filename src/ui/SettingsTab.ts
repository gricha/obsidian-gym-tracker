import { App, PluginSettingTab, Setting } from "obsidian";
import GymTrackerPlugin from "../main";

export class GymTrackerSettingsTab extends PluginSettingTab {
  plugin: GymTrackerPlugin;

  constructor(app: App, plugin: GymTrackerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Gym Tracker Settings" });

    // Workouts folder
    new Setting(containerEl)
      .setName("Workouts Folder")
      .setDesc("Folder where workout logs are stored")
      .addText((text) => {
        text.setValue(this.plugin.settings.workoutsFolder);
        text.setPlaceholder("Workouts");
        text.onChange(async (value) => {
          this.plugin.settings.workoutsFolder = value || "Workouts";
          await this.plugin.saveSettings();
        });
      });

    // Exercises folder
    new Setting(containerEl)
      .setName("Exercises Folder")
      .setDesc("Folder where exercise library is stored")
      .addText((text) => {
        text.setValue(this.plugin.settings.exercisesFolder);
        text.setPlaceholder("Workouts/Exercises");
        text.onChange(async (value) => {
          this.plugin.settings.exercisesFolder = value || "Workouts/Exercises";
          await this.plugin.saveSettings();
        });
      });

    // Weight unit
    new Setting(containerEl)
      .setName("Weight Unit")
      .setDesc("Unit for weights")
      .addDropdown((dropdown) => {
        dropdown.addOption("lbs", "Pounds (lbs)");
        dropdown.addOption("kg", "Kilograms (kg)");
        dropdown.setValue(this.plugin.settings.weightUnit);
        dropdown.onChange(async (value) => {
          this.plugin.settings.weightUnit = value as "kg" | "lbs";
          await this.plugin.saveSettings();
        });
      });

    // Show RPE
    new Setting(containerEl)
      .setName("Track RPE")
      .setDesc("Include RPE (Rate of Perceived Exertion) column in workouts")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.showRPE);
        toggle.onChange(async (value) => {
          this.plugin.settings.showRPE = value;
          await this.plugin.saveSettings();
        });
      });

    // Workout types
    containerEl.createEl("h3", { text: "Workout Types" });
    containerEl.createEl("p", {
      text: "Define the types of workouts you do (e.g., push, pull, legs)",
      cls: "setting-item-description",
    });

    const typesContainer = containerEl.createDiv({ cls: "gym-tracker-workout-types" });

    this.plugin.settings.workoutTypes.forEach((type, index) => {
      new Setting(typesContainer)
        .addText((text) => {
          text.setValue(type);
          text.onChange(async (value) => {
            this.plugin.settings.workoutTypes[index] = value;
            await this.plugin.saveSettings();
          });
        })
        .addExtraButton((btn) => {
          btn.setIcon("cross");
          btn.setTooltip("Remove");
          btn.onClick(async () => {
            this.plugin.settings.workoutTypes.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          });
        });
    });

    new Setting(typesContainer).addButton((btn) => {
      btn.setButtonText("+ Add Workout Type");
      btn.onClick(async () => {
        this.plugin.settings.workoutTypes.push("");
        await this.plugin.saveSettings();
        this.display();
      });
    });

    // Seed exercise library
    containerEl.createEl("h3", { text: "Exercise Library" });

    new Setting(containerEl)
      .setName("Seed Exercise Library")
      .setDesc("Populate the exercise library with ~100 common exercises")
      .addButton((btn) => {
        btn.setButtonText(this.plugin.settings.seeded ? "Re-seed Library" : "Seed Library");
        btn.onClick(async () => {
          await this.plugin.seedExerciseLibrary();
          this.display();
        });
      });

    if (this.plugin.settings.seeded) {
      containerEl.createEl("p", {
        text: "✓ Exercise library has been seeded.",
        cls: "gym-tracker-seeded-notice",
      });
    }
  }
}
