import { App, Modal, Setting, Notice, FuzzySuggestModal } from "obsidian";
import { Exercise, WorkoutTemplate, TemplateExercise, GymTrackerSettings } from "../types";
import { ExerciseLibrary } from "../data/exerciseLibrary";
import { TemplateLibrary } from "../data/templateLibrary";

interface TemplateExerciseEntry {
  exercise: Exercise;
  sets: number;
  reps: string;
}

export class CreateTemplateModal extends Modal {
  private settings: GymTrackerSettings;
  private exerciseLibrary: ExerciseLibrary;
  private templateLibrary: TemplateLibrary;
  private onSave: () => void;

  private name: string = "";
  private id: string = "";
  private workoutType: string;
  private exercises: TemplateExerciseEntry[] = [];

  private exerciseListEl: HTMLElement | null = null;

  constructor(
    app: App,
    settings: GymTrackerSettings,
    exerciseLibrary: ExerciseLibrary,
    templateLibrary: TemplateLibrary,
    onSave: () => void,
  ) {
    super(app);
    this.settings = settings;
    this.exerciseLibrary = exerciseLibrary;
    this.templateLibrary = templateLibrary;
    this.onSave = onSave;
    this.workoutType = settings.workoutTypes[0] ?? "push";
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("gym-tracker-modal");

    contentEl.createEl("h2", { text: "Create Workout Template" });

    // Template name
    new Setting(contentEl)
      .setName("Template Name")
      .setDesc("Display name (e.g., Pull-A, Push Heavy)")
      .addText((text) => {
        text.setPlaceholder("e.g., Pull-A");
        text.onChange((value) => {
          this.name = value;
          // Auto-generate ID from name
          if (!this.id || this.id === this.toKebabCase(this.name.slice(0, -1))) {
            this.id = this.toKebabCase(value);
            const idInput = contentEl.querySelector(".gym-tracker-id-input") as HTMLInputElement;
            if (idInput) {
              idInput.value = this.id;
            }
          }
        });
      });

    // Template ID
    new Setting(contentEl)
      .setName("Template ID")
      .setDesc("Unique identifier (kebab-case). Used for filename.")
      .addText((text) => {
        text.inputEl.addClass("gym-tracker-id-input");
        text.setPlaceholder("e.g., pull-a");
        text.onChange((value) => {
          this.id = this.toKebabCase(value);
        });
      });

    // Workout type dropdown
    new Setting(contentEl)
      .setName("Workout Type")
      .setDesc("Category for this template")
      .addDropdown((dropdown) => {
        this.settings.workoutTypes.forEach((type) => {
          dropdown.addOption(type, type.charAt(0).toUpperCase() + type.slice(1));
        });
        dropdown.setValue(this.workoutType);
        dropdown.onChange((value) => {
          this.workoutType = value;
        });
      });

    // Exercise list container
    contentEl.createEl("h3", { text: "Exercises" });
    this.exerciseListEl = contentEl.createDiv({ cls: "gym-tracker-exercise-list" });

    // Add exercise button
    new Setting(contentEl).addButton((btn) => {
      btn
        .setButtonText("+ Add Exercise")
        .setCta()
        .onClick(() => {
          this.openExercisePicker();
        });
    });

    // Save/Cancel buttons
    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText("Cancel").onClick(() => {
          this.close();
        });
      })
      .addButton((btn) => {
        btn
          .setButtonText("Create Template")
          .setCta()
          .onClick(() => {
            this.saveTemplate();
          });
      });

    this.renderExerciseList();
  }

  private renderExerciseList() {
    if (!this.exerciseListEl) return;
    this.exerciseListEl.empty();

    if (this.exercises.length === 0) {
      this.exerciseListEl.createEl("p", {
        text: 'No exercises added yet. Click "Add Exercise" to start.',
        cls: "gym-tracker-empty-state",
      });
      return;
    }

    this.exercises.forEach((entry, index) => {
      const exerciseContainer = this.exerciseListEl!.createDiv({
        cls: "gym-tracker-exercise-entry",
      });

      // Exercise header with name and remove button
      const header = exerciseContainer.createDiv({ cls: "gym-tracker-exercise-header" });
      header.createEl("strong", { text: entry.exercise.name });

      const removeBtn = header.createEl("button", { text: "x", cls: "gym-tracker-remove-btn" });
      removeBtn.onclick = () => {
        this.exercises.splice(index, 1);
        this.renderExerciseList();
      };

      // Sets and reps inputs
      const inputsContainer = exerciseContainer.createDiv({ cls: "gym-tracker-template-inputs" });

      // Sets input
      const setsLabel = inputsContainer.createEl("label");
      setsLabel.createSpan({ text: "Sets: " });
      const setsInput = setsLabel.createEl("input", {
        type: "number",
        cls: "gym-tracker-input",
        attr: { min: "1", max: "10" },
      });
      setsInput.value = entry.sets.toString();
      setsInput.onchange = () => {
        entry.sets = parseInt(setsInput.value) || 3;
      };

      // Reps input
      const repsLabel = inputsContainer.createEl("label");
      repsLabel.createSpan({ text: "Reps: " });
      const repsInput = repsLabel.createEl("input", {
        type: "text",
        cls: "gym-tracker-input",
        attr: { placeholder: "8-12" },
      });
      repsInput.value = entry.reps;
      repsInput.onchange = () => {
        entry.reps = repsInput.value || "8-12";
      };

      // Move up/down buttons
      const moveContainer = exerciseContainer.createDiv({ cls: "gym-tracker-move-buttons" });

      if (index > 0) {
        const upBtn = moveContainer.createEl("button", { text: "Up", cls: "gym-tracker-move-btn" });
        upBtn.onclick = () => {
          [this.exercises[index - 1], this.exercises[index]] = [
            this.exercises[index]!,
            this.exercises[index - 1]!,
          ];
          this.renderExerciseList();
        };
      }

      if (index < this.exercises.length - 1) {
        const downBtn = moveContainer.createEl("button", {
          text: "Down",
          cls: "gym-tracker-move-btn",
        });
        downBtn.onclick = () => {
          [this.exercises[index], this.exercises[index + 1]] = [
            this.exercises[index + 1]!,
            this.exercises[index]!,
          ];
          this.renderExerciseList();
        };
      }
    });
  }

  private openExercisePicker() {
    const exercises = this.exerciseLibrary.getAll();

    if (exercises.length === 0) {
      new Notice("No exercises in library. Add some exercises first.");
      return;
    }

    const picker = new ExercisePickerModal(this.app, exercises, (exercise) => {
      this.exercises.push({
        exercise,
        sets: 3,
        reps: "8-12",
      });
      this.renderExerciseList();
    });
    picker.open();
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async saveTemplate() {
    // Validation
    if (!this.name.trim()) {
      new Notice("Template name is required.");
      return;
    }
    if (!this.id.trim()) {
      new Notice("Template ID is required.");
      return;
    }
    if (this.exercises.length === 0) {
      new Notice("Add at least one exercise.");
      return;
    }

    // Check for duplicate ID
    const existing = this.templateLibrary.getById(this.id);
    if (existing) {
      new Notice(`Template with ID "${this.id}" already exists.`);
      return;
    }

    const templateExercises: TemplateExercise[] = this.exercises.map((e) => ({
      exerciseId: e.exercise.id,
      sets: e.sets,
      reps: e.reps,
    }));

    const template: WorkoutTemplate = {
      id: this.id,
      name: this.name,
      type: this.workoutType,
      exercises: templateExercises,
    };

    try {
      await this.templateLibrary.createTemplate(template);
      new Notice(`Template "${this.name}" created.`);
      this.onSave();
      this.close();
    } catch (e) {
      console.error("Failed to create template", e);
      new Notice("Failed to create template. Check console for details.");
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// Fuzzy search modal for picking exercises
class ExercisePickerModal extends FuzzySuggestModal<Exercise> {
  private exercises: Exercise[];
  private onSelect: (exercise: Exercise) => void;

  constructor(app: App, exercises: Exercise[], onSelect: (exercise: Exercise) => void) {
    super(app);
    this.exercises = exercises;
    this.onSelect = onSelect;
    this.setPlaceholder("Search exercises...");
  }

  getItems(): Exercise[] {
    return this.exercises;
  }

  getItemText(exercise: Exercise): string {
    return `${exercise.name} (${exercise.muscles.primary.join(", ")})`;
  }

  onChooseItem(exercise: Exercise): void {
    this.onSelect(exercise);
  }
}
