#!/usr/bin/env node
/**
 * Process imported workout history and add phase inference
 * Run: node processHistoryWithPhases.js
 *
 * This reads importedHistory.js and outputs importedHistoryWithPhases.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Phase inference keywords (copied from inferPhases.js)
const WARMUP_KEYWORDS = [
  'warm up', 'warmup', 'warm-up',
  'dynamic', 'activation', 'mobilit',
  'band pull', 'face pull',
  'arm circle', 'leg swing',
  'jumping jack', 'jump rope',
  'light jog', 'walking',
  'sauna', 'steam'
];

const COOLDOWN_KEYWORDS = [
  'stretch', 'foam roll', 'foam roller',
  'cool down', 'cooldown', 'cool-down',
  'static', 'yoga', 'child pose', "child's pose",
  'pigeon', 'hip flexor', 'hamstring stretch',
  'quad stretch', 'calf stretch', 'chest stretch',
  'lat stretch', 'shoulder stretch', 'back stretch'
];

const MAIN_WORKOUT_KEYWORDS = [
  'squat', 'deadlift', 'bench press', 'press',
  'row', 'pull up', 'pullup', 'chin up', 'chinup',
  'curl', 'extension', 'fly', 'raise',
  'lunge', 'leg press', 'hack squat',
  'dip', 'pushup', 'push up', 'push-up',
  'shrug', 'lat pulldown', 'cable', 'machine'
];

function inferPhase(exercise, exerciseIndex, totalExercises) {
  const nameLower = exercise.name.toLowerCase();
  const isNearStart = exerciseIndex < 3;
  const isNearEnd = exerciseIndex >= totalExercises - 2;

  // Check for explicit warmup keywords
  if (WARMUP_KEYWORDS.some(kw => nameLower.includes(kw))) {
    // But not if it's a main workout exercise (e.g., "Warm up sets" of bench)
    if (!MAIN_WORKOUT_KEYWORDS.some(kw => nameLower.includes(kw))) {
      return 'warmup';
    }
  }

  // Check for explicit cooldown keywords
  if (COOLDOWN_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return 'cooldown';
  }

  // Position-based inference for cardio
  if (isNearStart) {
    // Short cardio at start is usually warmup
    if (exercise.category === 'cardio' || exercise.bodyPart === 'Cardio') {
      const totalDuration = exercise.sets?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
      if (totalDuration < 1200) { // Less than 20 minutes
        return 'warmup';
      }
    }
  }

  if (isNearEnd) {
    // Short cardio at end might be cooldown
    if (exercise.category === 'cardio' || exercise.bodyPart === 'Cardio') {
      const totalDuration = exercise.sets?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
      if (totalDuration < 600) { // Less than 10 minutes
        return 'cooldown';
      }
    }

    // Duration-only exercises at end (like stretches) are often cooldown
    if (exercise.category === 'duration') {
      return 'cooldown';
    }
  }

  // Default to workout
  return 'workout';
}

function processHistory(history) {
  let warmupCount = 0;
  let workoutCount = 0;
  let cooldownCount = 0;

  const processed = history.map(workout => {
    const totalExercises = workout.exercises.length;
    const processedExercises = workout.exercises.map((ex, idx) => {
      const phase = inferPhase(ex, idx, totalExercises);

      if (phase === 'warmup') warmupCount++;
      else if (phase === 'cooldown') cooldownCount++;
      else workoutCount++;

      return {
        ...ex,
        phase
      };
    });

    return {
      ...workout,
      exercises: processedExercises
    };
  });

  console.log('\nPhase inference results:');
  console.log(`  Warmup exercises: ${warmupCount}`);
  console.log(`  Workout exercises: ${workoutCount}`);
  console.log(`  Cooldown exercises: ${cooldownCount}`);
  console.log(`  Total exercises: ${warmupCount + workoutCount + cooldownCount}`);

  return processed;
}

// Main execution
const inputPath = path.join(__dirname, '../../importedHistory.js');
const outputPath = path.join(__dirname, '../src/data/importedHistoryWithPhases.js');

console.log('Reading imported history...');

// Read the file content
let fileContent = fs.readFileSync(inputPath, 'utf-8');

// Extract the array from the export statement (handles comment line at start)
let history;
const match = fileContent.match(/export const importedHistory = (\[[\s\S]*\]);?\s*$/);
if (match) {
  history = JSON.parse(match[1]);
} else {
  // Try alternative: extract everything after the export statement
  const startIdx = fileContent.indexOf('export const importedHistory = [');
  if (startIdx === -1) {
    console.error('Could not parse importedHistory.js - no export found');
    process.exit(1);
  }
  const jsonStart = fileContent.indexOf('[', startIdx);
  const jsonContent = fileContent.slice(jsonStart).replace(/;\s*$/, '');
  try {
    history = JSON.parse(jsonContent);
  } catch (e) {
    console.error('Could not parse JSON:', e.message);
    process.exit(1);
  }
}
console.log(`Found ${history.length} workouts`);

// Process with phase inference
const processedHistory = processHistory(history);

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write output
const output = `// Workout history with inferred phases (generated ${new Date().toISOString()})
// Original: ${history.length} workouts from Strong app export
export const importedHistoryWithPhases = ${JSON.stringify(processedHistory, null, 2)};
`;

fs.writeFileSync(outputPath, output);
console.log(`\nWritten to: ${outputPath}`);

// Also create a version that can be directly loaded into IndexedDB
const dbLoaderPath = path.join(__dirname, '../src/data/loadHistoryIntoDb.js');
const dbLoaderContent = `// Script to load processed history into IndexedDB
// Usage: Import this in your app and call loadHistoryIntoDb()

import { importedHistoryWithPhases } from './importedHistoryWithPhases';
import { workoutDb } from '../db/workoutDb';

export async function loadHistoryIntoDb() {
  const existing = await workoutDb.getAll();

  if (existing.length > 0) {
    console.log(\`Database already has \${existing.length} workouts. Skipping import.\`);
    return { imported: 0, existing: existing.length };
  }

  console.log(\`Importing \${importedHistoryWithPhases.length} workouts...\`);

  let imported = 0;
  for (const workout of importedHistoryWithPhases) {
    try {
      await workoutDb.add(workout);
      imported++;
    } catch (err) {
      console.warn(\`Failed to import workout: \${workout.name}\`, err);
    }
  }

  console.log(\`Successfully imported \${imported} workouts\`);
  return { imported, existing: 0 };
}

export async function clearAndReloadHistory() {
  console.log('Clearing existing history...');
  const existing = await workoutDb.getAll();
  for (const workout of existing) {
    await workoutDb.delete(workout.id);
  }

  console.log(\`Importing \${importedHistoryWithPhases.length} workouts...\`);
  let imported = 0;
  for (const workout of importedHistoryWithPhases) {
    try {
      await workoutDb.add(workout);
      imported++;
    } catch (err) {
      console.warn(\`Failed to import workout: \${workout.name}\`, err);
    }
  }

  console.log(\`Successfully imported \${imported} workouts\`);
  return { imported };
}
`;

fs.writeFileSync(dbLoaderPath, dbLoaderContent);
console.log(`Written DB loader to: ${dbLoaderPath}`);
