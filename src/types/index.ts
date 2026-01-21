// Exercise definition stored in exercise library
export interface Exercise {
  id: string;
  name: string;
  muscles: {
    primary: string[];
    secondary: string[];
  };
  type: 'compound' | 'isolation';
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
  workoutTypes: string[];
  weightUnit: 'kg' | 'lbs';
  showRPE: boolean;
  seeded: boolean; // whether exercise library has been seeded
}

export const DEFAULT_SETTINGS: GymTrackerSettings = {
  workoutsFolder: 'Workouts',
  exercisesFolder: 'Workouts/Exercises',
  workoutTypes: ['push', 'pull', 'legs', 'upper', 'lower', 'full-body'],
  weightUnit: 'lbs',
  showRPE: true,
  seeded: false,
};

// Muscle groups for categorization
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'traps',
  'lats',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

// Equipment types
export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'bands',
  'ez-bar',
  'smith-machine',
  'other',
] as const;

export type EquipmentType = typeof EQUIPMENT_TYPES[number];
