import { App, FuzzySuggestModal } from "obsidian";
import { WorkoutTemplate } from "../types";

export class TemplatePickerModal extends FuzzySuggestModal<WorkoutTemplate> {
  private templates: WorkoutTemplate[];
  private onSelect: (template: WorkoutTemplate) => void;

  constructor(app: App, templates: WorkoutTemplate[], onSelect: (template: WorkoutTemplate) => void) {
    super(app);
    this.templates = templates;
    this.onSelect = onSelect;
    this.setPlaceholder("Search templates...");
  }

  getItems(): WorkoutTemplate[] {
    return this.templates;
  }

  getItemText(template: WorkoutTemplate): string {
    const exerciseCount = template.exercises.length;
    const typeLabel = template.type.charAt(0).toUpperCase() + template.type.slice(1);
    return `${template.name} (${typeLabel}, ${exerciseCount} exercises)`;
  }

  onChooseItem(template: WorkoutTemplate): void {
    this.onSelect(template);
  }
}
