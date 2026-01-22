// Exercise definition stored in exercise library
export interface Exercise {
  id: string;
  name: string;
  muscles: {
    primary: string[];
    secondary: string[];
  };
  type: "compound" | "isolation";
  equipment: string;
  alternatives: string[]; // IDs of alternative exercises
  description?: string;
  cues?: string[];
}

// A single set within a workout
export interface WorkoutSet {
  weight: number;
  reps: number;
  rpe?: number;
}

// An exercise entry within a workout
export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

// A complete workout session
export interface Workout {
  date: string; // YYYY-MM-DD
  type: string; // push, pull, legs, etc.
  duration?: number; // minutes
  exercises: WorkoutExercise[];
  notes?: string;
}

// Plugin settings
export interface GymTrackerSettings {
  workoutsFolder: string;
  exercisesFolder: string;
  templatesFolder: string;
  workoutTypes: string[];
  weightUnit: "kg" | "lbs";
  showRPE: boolean;
  seeded: boolean; // whether exercise library has been seeded
}

export const DEFAULT_SETTINGS: GymTrackerSettings = {
  workoutsFolder: "Workouts",
  exercisesFolder: "Workouts/Exercises",
  templatesFolder: "Workouts/Templates",
  workoutTypes: ["push", "pull", "legs", "upper", "lower", "full-body"],
  weightUnit: "lbs",
  showRPE: true,
  seeded: false,
};

// Muscle groups for categorization
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "traps",
  "lats",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// Equipment types
export const EQUIPMENT_TYPES = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "kettlebell",
  "bands",
  "ez-bar",
  "smith-machine",
  "other",
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

// Program exercise definition (from program table)
export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string; // e.g., "6-8", "10-12", "AMRAP"
  progression?: string; // e.g., "+5lbs at 4×8"
}

// A workout template within a program
export interface ProgramWorkout {
  type: string; // push, pull, legs, etc.
  exercises: ProgramExercise[];
}

// A training program
export interface Program {
  name: string;
  split: string[]; // rotation order, e.g., ["push", "pull", "legs"]
  started?: string; // YYYY-MM-DD
  workouts: ProgramWorkout[];
}

// Generated workout suggestion with history context
export interface WorkoutSuggestion {
  date: string;
  type: string;
  programName: string;
  exercises: ExerciseSuggestion[];
}

export interface ExerciseSuggestion {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  suggestedWeight: number;
  lastPerformance?: {
    date: string;
    sets: WorkoutSet[];
  };
  progression?: string;
}

// Workout template exercise definition
export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string; // e.g., "6-8", "10-12", "AMRAP"
}

// A workout template (e.g., Pull-A, Push-B, Legs)
export interface WorkoutTemplate {
  id: string; // kebab-case filename
  name: string; // display name
  type: string; // workout type (push, pull, legs, etc.)
  exercises: TemplateExercise[];
}
