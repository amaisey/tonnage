/**
 * Script to infer exercise phases (warmup/workout/cooldown) from workout history
 * Run this in browser console or as a Node.js script
 *
 * Rules for phase inference:
 * 1. WARMUP exercises (typically at start):
 *    - Contains "warm up", "warmup", "stretch", "dynamic", "mobility", "foam roll" (at start)
 *    - Cardio exercises at start of workout (first 3 exercises)
 *    - Low weight/high rep exercises at start
 *
 * 2. COOLDOWN exercises (typically at end):
 *    - Contains "stretch", "foam roll", "cool down", "cooldown", "mobility" (at end)
 *    - Static holds at end of workout
 *    - Light cardio at end
 *
 * 3. WORKOUT exercises (everything else)
 */

// Keywords that indicate warmup exercises
const WARMUP_KEYWORDS = [
  'warm up', 'warmup', 'warm-up',
  'dynamic', 'activation', 'mobilit',
  'band pull', 'face pull',
  'arm circle', 'leg swing',
  'jumping jack', 'jump rope',
  'light jog', 'walking'
];

// Keywords that indicate cooldown exercises
const COOLDOWN_KEYWORDS = [
  'stretch', 'foam roll', 'foam roller',
  'cool down', 'cooldown', 'cool-down',
  'static', 'yoga', 'child pose', "child's pose",
  'pigeon', 'hip flexor', 'hamstring stretch',
  'quad stretch', 'calf stretch', 'chest stretch'
];

// Keywords that indicate main workout (override if in typical warmup/cooldown position)
const MAIN_WORKOUT_KEYWORDS = [
  'squat', 'deadlift', 'bench press', 'press',
  'row', 'pull up', 'pullup', 'chin up', 'chinup',
  'curl', 'extension', 'fly', 'raise',
  'lunge', 'leg press', 'hack squat',
  'dip', 'pushup', 'push up'
];

function inferPhase(exercise, exerciseIndex, totalExercises, exerciseName) {
  const nameLower = exerciseName.toLowerCase();
  const isNearStart = exerciseIndex < 3;
  const isNearEnd = exerciseIndex >= totalExercises - 2;

  // Check for explicit warmup keywords
  if (WARMUP_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return 'warmup';
  }

  // Check for explicit cooldown keywords
  if (COOLDOWN_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return 'cooldown';
  }

  // Check position-based inference
  if (isNearStart) {
    // Cardio at start is usually warmup
    if (exercise.category === 'cardio' || exercise.category === 'duration') {
      // But only if it's short duration (< 20 min)
      const totalDuration = exercise.sets?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
      if (totalDuration < 1200) { // Less than 20 minutes
        return 'warmup';
      }
    }

    // Sauna/steam at start
    if (nameLower.includes('sauna') || nameLower.includes('steam')) {
      return 'warmup';
    }
  }

  if (isNearEnd) {
    // Cardio at end might be cooldown
    if (exercise.category === 'cardio' || exercise.category === 'duration') {
      const totalDuration = exercise.sets?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
      if (totalDuration < 900) { // Less than 15 minutes
        return 'cooldown';
      }
    }

    // Duration-only exercises at end are often cooldown
    if (exercise.category === 'duration') {
      return 'cooldown';
    }
  }

  // Default to workout
  return 'workout';
}

function processHistory(history) {
  return history.map(workout => {
    const processedExercises = workout.exercises.map((ex, idx) => ({
      ...ex,
      phase: inferPhase(ex, idx, workout.exercises.length, ex.name)
    }));

    return {
      ...workout,
      exercises: processedExercises
    };
  });
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { inferPhase, processHistory };
}

// Usage example:
// const processedHistory = processHistory(importedHistory);
// Then save to IndexedDB using workoutDb.addAll(processedHistory);
