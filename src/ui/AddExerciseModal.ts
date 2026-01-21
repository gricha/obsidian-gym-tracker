import { App, Modal, Setting, Notice } from 'obsidian';
import { Exercise, MUSCLE_GROUPS, EQUIPMENT_TYPES, GymTrackerSettings } from '../types';
import { ExerciseLibrary } from '../data/exerciseLibrary';

export class AddExerciseModal extends Modal {
  private settings: GymTrackerSettings;
  private exerciseLibrary: ExerciseLibrary;
  private onSave: () => void;

  private name: string = '';
  private id: string = '';
  private primaryMuscles: string[] = [];
  private secondaryMuscles: string[] = [];
  private type: 'compound' | 'isolation' = 'isolation';
  private equipment: string = 'barbell';
  private description: string = '';

  constructor(
    app: App,
    settings: GymTrackerSettings,
    exerciseLibrary: ExerciseLibrary,
    onSave: () => void
  ) {
    super(app);
    this.settings = settings;
    this.exerciseLibrary = exerciseLibrary;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('gym-tracker-modal');

    contentEl.createEl('h2', { text: 'Add Exercise' });

    // Name
    new Setting(contentEl)
      .setName('Exercise Name')
      .setDesc('Display name for the exercise')
      .addText((text) => {
        text.setPlaceholder('e.g., Bench Press');
        text.onChange((value) => {
          this.name = value;
          // Auto-generate ID from name if ID is empty or was auto-generated
          if (!this.id || this.id === this.toKebabCase(this.name.slice(0, -1))) {
            this.id = this.toKebabCase(value);
            // Update ID input if it exists
            const idInput = contentEl.querySelector('.gym-tracker-id-input') as HTMLInputElement;
            if (idInput) {
              idInput.value = this.id;
            }
          }
        });
      });

    // ID
    new Setting(contentEl)
      .setName('Exercise ID')
      .setDesc('Unique identifier (kebab-case). Used for linking.')
      .addText((text) => {
        text.inputEl.addClass('gym-tracker-id-input');
        text.setPlaceholder('e.g., bench-press');
        text.onChange((value) => {
          this.id = this.toKebabCase(value);
        });
      });

    // Primary Muscles
    new Setting(contentEl)
      .setName('Primary Muscles')
      .setDesc('Main muscles targeted');

    const primaryContainer = contentEl.createDiv({ cls: 'gym-tracker-muscle-chips' });
    MUSCLE_GROUPS.forEach((muscle) => {
      const chip = primaryContainer.createEl('button', {
        text: muscle,
        cls: 'gym-tracker-chip',
      });
      chip.onclick = () => {
        if (this.primaryMuscles.includes(muscle)) {
          this.primaryMuscles = this.primaryMuscles.filter((m) => m !== muscle);
          chip.removeClass('gym-tracker-chip-selected');
        } else {
          this.primaryMuscles.push(muscle);
          chip.addClass('gym-tracker-chip-selected');
        }
      };
    });

    // Secondary Muscles
    new Setting(contentEl)
      .setName('Secondary Muscles')
      .setDesc('Supporting muscles');

    const secondaryContainer = contentEl.createDiv({ cls: 'gym-tracker-muscle-chips' });
    MUSCLE_GROUPS.forEach((muscle) => {
      const chip = secondaryContainer.createEl('button', {
        text: muscle,
        cls: 'gym-tracker-chip',
      });
      chip.onclick = () => {
        if (this.secondaryMuscles.includes(muscle)) {
          this.secondaryMuscles = this.secondaryMuscles.filter((m) => m !== muscle);
          chip.removeClass('gym-tracker-chip-selected');
        } else {
          this.secondaryMuscles.push(muscle);
          chip.addClass('gym-tracker-chip-selected');
        }
      };
    });

    // Type
    new Setting(contentEl)
      .setName('Exercise Type')
      .addDropdown((dropdown) => {
        dropdown.addOption('compound', 'Compound');
        dropdown.addOption('isolation', 'Isolation');
        dropdown.setValue(this.type);
        dropdown.onChange((value) => {
          this.type = value as 'compound' | 'isolation';
        });
      });

    // Equipment
    new Setting(contentEl)
      .setName('Equipment')
      .addDropdown((dropdown) => {
        EQUIPMENT_TYPES.forEach((eq) => {
          dropdown.addOption(eq, eq.charAt(0).toUpperCase() + eq.slice(1).replace('-', ' '));
        });
        dropdown.setValue(this.equipment);
        dropdown.onChange((value) => {
          this.equipment = value;
        });
      });

    // Description
    new Setting(contentEl)
      .setName('Description')
      .setDesc('How to perform the exercise (optional)');

    const descTextarea = contentEl.createEl('textarea', {
      cls: 'gym-tracker-textarea',
      attr: { rows: '6', placeholder: 'Instructions, cues, tips...' },
    });
    descTextarea.onchange = () => {
      this.description = descTextarea.value;
    };

    // Buttons
    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText('Cancel').onClick(() => {
          this.close();
        });
      })
      .addButton((btn) => {
        btn.setButtonText('Create Exercise')
          .setCta()
          .onClick(() => {
            this.createExercise();
          });
      });
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async createExercise() {
    // Validation
    if (!this.name.trim()) {
      new Notice('Exercise name is required.');
      return;
    }
    if (!this.id.trim()) {
      new Notice('Exercise ID is required.');
      return;
    }
    if (this.primaryMuscles.length === 0) {
      new Notice('Select at least one primary muscle.');
      return;
    }

    // Check for duplicate ID
    const existing = this.exerciseLibrary.getById(this.id);
    if (existing) {
      new Notice(`Exercise with ID "${this.id}" already exists.`);
      return;
    }

    const exercise: Exercise = {
      id: this.id,
      name: this.name,
      muscles: {
        primary: this.primaryMuscles,
        secondary: this.secondaryMuscles,
      },
      type: this.type,
      equipment: this.equipment,
      alternatives: [],
      description: this.description || undefined,
    };

    try {
      await this.exerciseLibrary.createExercise(exercise);
      new Notice(`Exercise "${this.name}" created.`);
      this.onSave();
      this.close();
    } catch (e) {
      console.error('Failed to create exercise', e);
      new Notice('Failed to create exercise. Check console for details.');
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
