import { describe, it, expect } from "vitest";
import { SEED_EXERCISES } from "../src/data/seedExercises";

// Test the seed exercise data integrity
describe("Seed Exercise Library", () => {
  describe("data integrity", () => {
    it("has a reasonable number of exercises", () => {
      expect(SEED_EXERCISES.length).toBeGreaterThanOrEqual(70);
      expect(SEED_EXERCISES.length).toBeLessThan(200);
    });

    it("all exercises have required fields", () => {
      for (const exercise of SEED_EXERCISES) {
        expect(exercise.id, `Exercise missing id`).toBeDefined();
        expect(exercise.name, `${exercise.id} missing name`).toBeDefined();
        expect(exercise.muscles, `${exercise.id} missing muscles`).toBeDefined();
        expect(exercise.muscles.primary, `${exercise.id} missing primary muscles`).toBeDefined();
        expect(
          exercise.muscles.primary.length,
          `${exercise.id} has no primary muscles`,
        ).toBeGreaterThan(0);
        expect(exercise.type, `${exercise.id} missing type`).toBeDefined();
        expect(exercise.equipment, `${exercise.id} missing equipment`).toBeDefined();
      }
    });

    it("all exercise IDs are unique", () => {
      const ids = SEED_EXERCISES.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("all exercise IDs are kebab-case", () => {
      const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      for (const exercise of SEED_EXERCISES) {
        expect(exercise.id, `${exercise.id} is not kebab-case`).toMatch(kebabCaseRegex);
      }
    });

    it("all exercise types are valid", () => {
      const validTypes = ["compound", "isolation"];
      for (const exercise of SEED_EXERCISES) {
        expect(validTypes, `${exercise.id} has invalid type: ${exercise.type}`).toContain(
          exercise.type,
        );
      }
    });

    it("all muscle groups are valid", () => {
      const validMuscles = [
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
        "front delts", // Allow this as secondary
      ];

      for (const exercise of SEED_EXERCISES) {
        for (const muscle of exercise.muscles.primary) {
          expect(validMuscles, `${exercise.id} has invalid primary muscle: ${muscle}`).toContain(
            muscle,
          );
        }
        for (const muscle of exercise.muscles.secondary) {
          expect(validMuscles, `${exercise.id} has invalid secondary muscle: ${muscle}`).toContain(
            muscle,
          );
        }
      }
    });

    it("all equipment types are valid", () => {
      const validEquipment = [
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
      ];

      for (const exercise of SEED_EXERCISES) {
        expect(
          validEquipment,
          `${exercise.id} has invalid equipment: ${exercise.equipment}`,
        ).toContain(exercise.equipment);
      }
    });

    it("alternative references are valid exercise IDs", () => {
      const allIds = new Set(SEED_EXERCISES.map((e) => e.id));

      for (const exercise of SEED_EXERCISES) {
        for (const altId of exercise.alternatives) {
          expect(
            allIds.has(altId),
            `${exercise.id} references non-existent alternative: ${altId}`,
          ).toBe(true);
        }
      }
    });
  });

  describe("exercise coverage", () => {
    it("covers all major muscle groups", () => {
      const musclesCovered = new Set<string>();

      for (const exercise of SEED_EXERCISES) {
        for (const muscle of exercise.muscles.primary) {
          musclesCovered.add(muscle);
        }
      }

      const requiredMuscles = [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "abs",
      ];

      for (const muscle of requiredMuscles) {
        expect(musclesCovered.has(muscle), `No exercises for ${muscle}`).toBe(true);
      }
    });

    it("has exercises for common equipment types", () => {
      const equipmentUsed = new Set(SEED_EXERCISES.map((e) => e.equipment));

      const commonEquipment = ["barbell", "dumbbell", "cable", "machine", "bodyweight"];

      for (const eq of commonEquipment) {
        expect(equipmentUsed.has(eq), `No exercises for ${eq}`).toBe(true);
      }
    });

    it("has both compound and isolation exercises", () => {
      const compounds = SEED_EXERCISES.filter((e) => e.type === "compound");
      const isolations = SEED_EXERCISES.filter((e) => e.type === "isolation");

      expect(compounds.length).toBeGreaterThan(20);
      expect(isolations.length).toBeGreaterThan(15);
    });
  });

  describe("exercise content quality", () => {
    it("compound exercises have multiple muscles", () => {
      const compounds = SEED_EXERCISES.filter((e) => e.type === "compound");

      for (const exercise of compounds) {
        const totalMuscles = exercise.muscles.primary.length + exercise.muscles.secondary.length;
        expect(
          totalMuscles,
          `Compound ${exercise.id} should work multiple muscles`,
        ).toBeGreaterThan(1);
      }
    });

    it("exercises have descriptions", () => {
      const withDescriptions = SEED_EXERCISES.filter(
        (e) => e.description && e.description.length > 50,
      );

      // At least 80% should have descriptions
      const ratio = withDescriptions.length / SEED_EXERCISES.length;
      expect(ratio).toBeGreaterThan(0.8);
    });

    it('descriptions contain "How to Perform" section', () => {
      const withHowTo = SEED_EXERCISES.filter(
        (e) => e.description && e.description.includes("How to Perform"),
      );

      // At least 80% should have how-to sections
      const ratio = withHowTo.length / SEED_EXERCISES.length;
      expect(ratio).toBeGreaterThan(0.8);
    });
  });
});

// Test exercise search/filter logic
describe("Exercise filtering", () => {
  function filterByMuscle(exercises: typeof SEED_EXERCISES, muscle: string) {
    return exercises.filter(
      (e) => e.muscles.primary.includes(muscle) || e.muscles.secondary.includes(muscle),
    );
  }

  function search(exercises: typeof SEED_EXERCISES, query: string) {
    const lowerQuery = query.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.id.toLowerCase().includes(lowerQuery) ||
        e.muscles.primary.some((m) => m.toLowerCase().includes(lowerQuery)) ||
        e.equipment.toLowerCase().includes(lowerQuery),
    );
  }

  it("filters by muscle group", () => {
    const chestExercises = filterByMuscle(SEED_EXERCISES, "chest");
    expect(chestExercises.length).toBeGreaterThan(5);

    for (const ex of chestExercises) {
      const hasMuscle =
        ex.muscles.primary.includes("chest") || ex.muscles.secondary.includes("chest");
      expect(hasMuscle).toBe(true);
    }
  });

  it("searches by name", () => {
    const results = search(SEED_EXERCISES, "bench");
    expect(results.length).toBeGreaterThan(2);

    for (const ex of results) {
      expect(ex.name.toLowerCase()).toContain("bench");
    }
  });

  it("searches by equipment", () => {
    const results = search(SEED_EXERCISES, "cable");
    expect(results.length).toBeGreaterThan(3);
  });

  it("search is case insensitive", () => {
    const lower = search(SEED_EXERCISES, "deadlift");
    const upper = search(SEED_EXERCISES, "DEADLIFT");
    const mixed = search(SEED_EXERCISES, "DeadLift");

    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(mixed.length);
  });
});
