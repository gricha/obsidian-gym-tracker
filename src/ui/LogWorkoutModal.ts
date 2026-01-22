import { App, Modal, Setting, Notice, FuzzySuggestModal } from "obsidian";
import { Exercise, Workout, WorkoutSet, WorkoutTemplate, GymTrackerSettings } from "../types";
import { ExerciseLibrary } from "../data/exerciseLibrary";
import { WorkoutParser } from "../data/workoutParser";
import { TemplateLibrary } from "../data/templateLibrary";
import { TemplatePickerModal } from "./TemplatePickerModal";

interface LastSessionData {
  date: string;
  sets: WorkoutSet[];
}

interface WorkoutExerciseEntry {
  exercise: Exercise;
  sets: WorkoutSet[];
  lastSession?: LastSessionData | null; // null = no history, undefined = not yet loaded
}

export class LogWorkoutModal extends Modal {
  private settings: GymTrackerSettings;
  private exerciseLibrary: ExerciseLibrary;
  private workoutParser: WorkoutParser;
  private templateLibrary: TemplateLibrary | null;

  private date: string;
  private workoutType: string;
  private exercises: WorkoutExerciseEntry[] = [];

  private exerciseListEl: HTMLElement | null = null;

  constructor(
    app: App,
    settings: GymTrackerSettings,
    exerciseLibrary: ExerciseLibrary,
    workoutParser: WorkoutParser,
    templateLibrary?: TemplateLibrary,
  ) {
    super(app);
    this.settings = settings;
    this.exerciseLibrary = exerciseLibrary;
    this.workoutParser = workoutParser;
    this.templateLibrary = templateLibrary ?? null;

    // Default to today and first workout type
    this.date = new Date().toISOString().split("T")[0] ?? "";
    this.workoutType = settings.workoutTypes[0] ?? "push";
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("gym-tracker-modal");

    contentEl.createEl("h2", { text: "Log Workout" });

    // Date picker
    new Setting(contentEl).setName("Date").addText((text) => {
      text.inputEl.type = "date";
      text.setValue(this.date);
      text.onChange((value) => {
        this.date = value;
      });
    });

    // Workout type dropdown
    new Setting(contentEl).setName("Workout Type").addDropdown((dropdown) => {
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

    // Template and exercise buttons
    const buttonsSetting = new Setting(contentEl);

    // Use Template button (only if templateLibrary is available)
    if (this.templateLibrary) {
      buttonsSetting.addButton((btn) => {
        btn.setButtonText("Use Template").onClick(() => {
          this.openTemplatePicker();
        });
      });
    }

    // Add exercise button
    buttonsSetting.addButton((btn) => {
      btn
        .setButtonText("+ Add Exercise")
        .setCta()
        .onClick(() => {
          this.openExercisePicker();
        });
    });

    // Save button
    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText("Cancel").onClick(() => {
          this.close();
        });
      })
      .addButton((btn) => {
        btn
          .setButtonText("Save Workout")
          .setCta()
          .onClick(() => {
            this.saveWorkout();
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

    this.exercises.forEach((entry, exerciseIndex) => {
      const exerciseContainer = this.exerciseListEl!.createDiv({
        cls: "gym-tracker-exercise-entry",
      });

      // Exercise header with name and remove button
      const header = exerciseContainer.createDiv({ cls: "gym-tracker-exercise-header" });
      header.createEl("strong", { text: entry.exercise.name });

      const removeBtn = header.createEl("button", { text: "×", cls: "gym-tracker-remove-btn" });
      removeBtn.onclick = () => {
        this.exercises.splice(exerciseIndex, 1);
        this.renderExerciseList();
      };

      // Last session info
      this.renderLastSession(exerciseContainer, entry);

      // Sets table
      const table = exerciseContainer.createEl("table", { cls: "gym-tracker-sets-table" });
      const thead = table.createEl("thead");
      const headerRow = thead.createEl("tr");
      headerRow.createEl("th", { text: "Set" });
      headerRow.createEl("th", { text: `Weight (${this.settings.weightUnit})` });
      headerRow.createEl("th", { text: "Reps" });
      if (this.settings.showRIR) {
        headerRow.createEl("th", { text: "RIR" });
      }
      headerRow.createEl("th", { text: "" }); // Actions

      const tbody = table.createEl("tbody");

      entry.sets.forEach((set, setIndex) => {
        const row = tbody.createEl("tr");
        row.createEl("td", { text: (setIndex + 1).toString() });

        // Weight input
        const weightCell = row.createEl("td");
        const weightInput = weightCell.createEl("input", {
          type: "number",
          cls: "gym-tracker-input",
        });
        weightInput.value = set.weight.toString();
        weightInput.onchange = () => {
          set.weight = parseFloat(weightInput.value) || 0;
        };

        // Reps input
        const repsCell = row.createEl("td");
        const repsInput = repsCell.createEl("input", {
          type: "number",
          cls: "gym-tracker-input",
        });
        repsInput.value = set.reps.toString();
        repsInput.onchange = () => {
          set.reps = parseInt(repsInput.value) || 0;
        };

        // RIR input (optional)
        if (this.settings.showRIR) {
          const rirCell = row.createEl("td");
          const rirInput = rirCell.createEl("input", {
            type: "number",
            cls: "gym-tracker-input",
            attr: { step: "0.5", min: "0", max: "10" },
          });
          rirInput.value = set.rir?.toString() || "";
          rirInput.onchange = () => {
            const val = parseFloat(rirInput.value);
            set.rir = isNaN(val) ? undefined : val;
          };
        }

        // Remove set button
        const actionCell = row.createEl("td");
        const removeSetBtn = actionCell.createEl("button", {
          text: "−",
          cls: "gym-tracker-remove-set-btn",
        });
        removeSetBtn.onclick = () => {
          entry.sets.splice(setIndex, 1);
          this.renderExerciseList();
        };
      });

      // Add set button
      const addSetBtn = exerciseContainer.createEl("button", {
        text: "+ Add Set",
        cls: "gym-tracker-add-set-btn",
      });
      addSetBtn.onclick = () => {
        // Copy weight from last set if available
        const lastSet = entry.sets[entry.sets.length - 1];
        entry.sets.push({
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 0,
        });
        this.renderExerciseList();
      };
    });
  }

  private renderLastSession(container: HTMLElement, entry: WorkoutExerciseEntry) {
    const lastSessionEl = container.createDiv({ cls: "gym-tracker-last-session" });

    if (entry.lastSession === undefined) {
      // Still loading
      lastSessionEl.createEl("span", {
        text: "Loading history...",
        cls: "gym-tracker-last-session-loading",
      });
      return;
    }

    if (entry.lastSession === null) {
      lastSessionEl.createEl("span", {
        text: "First time logging this exercise",
        cls: "gym-tracker-last-session-first",
      });
      return;
    }

    // Show last session data (up to 3 sets)
    const { date, sets } = entry.lastSession;
    const displaySets = sets.slice(0, 3);

    lastSessionEl.createEl("span", {
      text: `Last: ${date}`,
      cls: "gym-tracker-last-session-date",
    });

    const setsContainer = lastSessionEl.createEl("span", { cls: "gym-tracker-last-session-sets" });
    displaySets.forEach((set, i) => {
      const rirText = set.rir !== undefined ? ` RIR${set.rir}` : "";
      const separator = i < displaySets.length - 1 ? " | " : "";
      setsContainer.createEl("span", {
        text: `${set.weight}×${set.reps}${rirText}${separator}`,
      });
    });

    if (sets.length > 3) {
      setsContainer.createEl("span", {
        text: ` (+${sets.length - 3} more)`,
        cls: "gym-tracker-last-session-more",
      });
    }
  }

  private openExercisePicker() {
    const exercises = this.exerciseLibrary.getAll();

    if (exercises.length === 0) {
      new Notice("No exercises in library. Add some exercises first.");
      return;
    }

    const picker = new ExercisePickerModal(this.app, exercises, async (exercise) => {
      const entryIndex = this.exercises.length;
      this.exercises.push({
        exercise,
        sets: [{ weight: 0, reps: 0 }], // Start with one empty set
        lastSession: undefined, // Will be loaded async
      });
      this.renderExerciseList();

      // Fetch last session data
      const lastSession = await this.workoutParser.getLastSession(exercise.id);
      if (this.exercises[entryIndex]) {
        this.exercises[entryIndex].lastSession = lastSession;
        this.renderExerciseList();
      }
    });
    picker.open();
  }

  private openTemplatePicker() {
    if (!this.templateLibrary) return;

    const templates = this.templateLibrary.getAll();

    if (templates.length === 0) {
      new Notice("No templates available. Create a template first.");
      return;
    }

    const picker = new TemplatePickerModal(this.app, templates, (template) => {
      this.applyTemplate(template);
    });
    picker.open();
  }

  private async applyTemplate(template: WorkoutTemplate) {
    // Set the workout type from template
    this.workoutType = template.type;

    // Clear existing exercises and populate from template
    this.exercises = [];

    const exerciseEntries: { exercise: Exercise; sets: WorkoutSet[] }[] = [];

    for (const templateExercise of template.exercises) {
      const exercise = this.exerciseLibrary.getById(templateExercise.exerciseId);
      if (!exercise) {
        new Notice(`Exercise not found: ${templateExercise.exerciseId}`);
        continue;
      }

      // Create empty sets based on template set count
      const sets: WorkoutSet[] = [];
      for (let i = 0; i < templateExercise.sets; i++) {
        sets.push({ weight: 0, reps: 0 });
      }

      exerciseEntries.push({ exercise, sets });
    }

    // Add exercises with undefined lastSession (loading state)
    this.exercises = exerciseEntries.map((entry) => ({
      ...entry,
      lastSession: undefined,
    }));

    // Re-render the exercise list
    this.renderExerciseList();

    // Fetch last session data for all exercises in parallel
    const lastSessions = await Promise.all(
      exerciseEntries.map((entry) => this.workoutParser.getLastSession(entry.exercise.id)),
    );

    // Update exercises with fetched data
    lastSessions.forEach((lastSession, index) => {
      if (this.exercises[index]) {
        this.exercises[index].lastSession = lastSession;
      }
    });

    this.renderExerciseList();

    // Update the workout type dropdown if it exists
    const dropdown = this.contentEl.querySelector("select");
    if (dropdown) {
      (dropdown as HTMLSelectElement).value = template.type;
    }

    new Notice(`Applied template: ${template.name}`);
  }

  private async saveWorkout() {
    if (this.exercises.length === 0) {
      new Notice("Add at least one exercise before saving.");
      return;
    }

    // Validate that at least some sets have data
    const hasData = this.exercises.some((e) => e.sets.some((s) => s.weight > 0 || s.reps > 0));

    if (!hasData) {
      new Notice("Add weight/reps to at least one set.");
      return;
    }

    const workout: Workout = {
      date: this.date,
      type: this.workoutType,
      exercises: this.exercises.map((e) => ({
        exerciseId: e.exercise.id,
        sets: e.sets.filter((s) => s.weight > 0 || s.reps > 0), // Filter empty sets
      })),
    };

    try {
      const file = await this.workoutParser.saveWorkout(workout);
      new Notice(`Workout saved: ${file.basename}`);
      this.close();

      // Open the created file
      this.app.workspace.openLinkText(file.path, "", false);
    } catch (e) {
      console.error("Failed to save workout", e);
      new Notice("Failed to save workout. Check console for details.");
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
