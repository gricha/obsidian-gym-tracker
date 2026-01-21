import { App, Modal, Setting, Notice, FuzzySuggestModal } from 'obsidian';
import { Exercise, Workout, WorkoutExercise, WorkoutSet, GymTrackerSettings } from '../types';
import { ExerciseLibrary } from '../data/exerciseLibrary';
import { WorkoutParser } from '../data/workoutParser';

interface WorkoutExerciseEntry {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export class LogWorkoutModal extends Modal {
  private settings: GymTrackerSettings;
  private exerciseLibrary: ExerciseLibrary;
  private workoutParser: WorkoutParser;
  
  private date: string;
  private workoutType: string;
  private exercises: WorkoutExerciseEntry[] = [];
  
  private exerciseListEl: HTMLElement | null = null;

  constructor(
    app: App,
    settings: GymTrackerSettings,
    exerciseLibrary: ExerciseLibrary,
    workoutParser: WorkoutParser
  ) {
    super(app);
    this.settings = settings;
    this.exerciseLibrary = exerciseLibrary;
    this.workoutParser = workoutParser;
    
    // Default to today and first workout type
    this.date = new Date().toISOString().split('T')[0];
    this.workoutType = settings.workoutTypes[0] || 'push';
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('gym-tracker-modal');

    contentEl.createEl('h2', { text: 'Log Workout' });

    // Date picker
    new Setting(contentEl)
      .setName('Date')
      .addText((text) => {
        text.inputEl.type = 'date';
        text.setValue(this.date);
        text.onChange((value) => {
          this.date = value;
        });
      });

    // Workout type dropdown
    new Setting(contentEl)
      .setName('Workout Type')
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
    contentEl.createEl('h3', { text: 'Exercises' });
    this.exerciseListEl = contentEl.createDiv({ cls: 'gym-tracker-exercise-list' });
    
    // Add exercise button
    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText('+ Add Exercise')
          .setCta()
          .onClick(() => {
            this.openExercisePicker();
          });
      });

    // Save button
    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText('Cancel')
          .onClick(() => {
            this.close();
          });
      })
      .addButton((btn) => {
        btn.setButtonText('Save Workout')
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
      this.exerciseListEl.createEl('p', { 
        text: 'No exercises added yet. Click "Add Exercise" to start.',
        cls: 'gym-tracker-empty-state'
      });
      return;
    }

    this.exercises.forEach((entry, exerciseIndex) => {
      const exerciseContainer = this.exerciseListEl!.createDiv({ cls: 'gym-tracker-exercise-entry' });
      
      // Exercise header with name and remove button
      const header = exerciseContainer.createDiv({ cls: 'gym-tracker-exercise-header' });
      header.createEl('strong', { text: entry.exercise.name });
      
      const removeBtn = header.createEl('button', { text: '×', cls: 'gym-tracker-remove-btn' });
      removeBtn.onclick = () => {
        this.exercises.splice(exerciseIndex, 1);
        this.renderExerciseList();
      };

      // Sets table
      const table = exerciseContainer.createEl('table', { cls: 'gym-tracker-sets-table' });
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      headerRow.createEl('th', { text: 'Set' });
      headerRow.createEl('th', { text: `Weight (${this.settings.weightUnit})` });
      headerRow.createEl('th', { text: 'Reps' });
      if (this.settings.showRPE) {
        headerRow.createEl('th', { text: 'RPE' });
      }
      headerRow.createEl('th', { text: '' }); // Actions

      const tbody = table.createEl('tbody');
      
      entry.sets.forEach((set, setIndex) => {
        const row = tbody.createEl('tr');
        row.createEl('td', { text: (setIndex + 1).toString() });
        
        // Weight input
        const weightCell = row.createEl('td');
        const weightInput = weightCell.createEl('input', { 
          type: 'number',
          cls: 'gym-tracker-input'
        });
        weightInput.value = set.weight.toString();
        weightInput.onchange = () => {
          set.weight = parseFloat(weightInput.value) || 0;
        };

        // Reps input
        const repsCell = row.createEl('td');
        const repsInput = repsCell.createEl('input', { 
          type: 'number',
          cls: 'gym-tracker-input'
        });
        repsInput.value = set.reps.toString();
        repsInput.onchange = () => {
          set.reps = parseInt(repsInput.value) || 0;
        };

        // RPE input (optional)
        if (this.settings.showRPE) {
          const rpeCell = row.createEl('td');
          const rpeInput = rpeCell.createEl('input', { 
            type: 'number',
            cls: 'gym-tracker-input',
            attr: { step: '0.5', min: '1', max: '10' }
          });
          rpeInput.value = set.rpe?.toString() || '';
          rpeInput.onchange = () => {
            const val = parseFloat(rpeInput.value);
            set.rpe = isNaN(val) ? undefined : val;
          };
        }

        // Remove set button
        const actionCell = row.createEl('td');
        const removeSetBtn = actionCell.createEl('button', { text: '−', cls: 'gym-tracker-remove-set-btn' });
        removeSetBtn.onclick = () => {
          entry.sets.splice(setIndex, 1);
          this.renderExerciseList();
        };
      });

      // Add set button
      const addSetBtn = exerciseContainer.createEl('button', { 
        text: '+ Add Set',
        cls: 'gym-tracker-add-set-btn'
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

  private openExercisePicker() {
    const exercises = this.exerciseLibrary.getAll();
    
    if (exercises.length === 0) {
      new Notice('No exercises in library. Add some exercises first.');
      return;
    }

    const picker = new ExercisePickerModal(this.app, exercises, (exercise) => {
      this.exercises.push({
        exercise,
        sets: [{ weight: 0, reps: 0 }], // Start with one empty set
      });
      this.renderExerciseList();
    });
    picker.open();
  }

  private async saveWorkout() {
    if (this.exercises.length === 0) {
      new Notice('Add at least one exercise before saving.');
      return;
    }

    // Validate that at least some sets have data
    const hasData = this.exercises.some((e) => 
      e.sets.some((s) => s.weight > 0 || s.reps > 0)
    );
    
    if (!hasData) {
      new Notice('Add weight/reps to at least one set.');
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
      this.app.workspace.openLinkText(file.path, '', false);
    } catch (e) {
      console.error('Failed to save workout', e);
      new Notice('Failed to save workout. Check console for details.');
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
    this.setPlaceholder('Search exercises...');
  }

  getItems(): Exercise[] {
    return this.exercises;
  }

  getItemText(exercise: Exercise): string {
    return `${exercise.name} (${exercise.muscles.primary.join(', ')})`;
  }

  onChooseItem(exercise: Exercise): void {
    this.onSelect(exercise);
  }
}
