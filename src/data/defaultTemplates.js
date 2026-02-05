// Hybrid Athlete 3.0 - Full 12-Week Program + Correcting Course Templates

export const defaultFolders = [
  // Hybrid Athlete 3.0 - 12 Week Program
  { id: 'hybrid-3.0', name: 'Hybrid Athlete 3.0', parentId: 'root' },
  { id: 'hybrid-3.0-week-1', name: 'Week 1', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-2', name: 'Week 2', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-3', name: 'Week 3', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-4', name: 'Week 4', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-5', name: 'Week 5', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-6', name: 'Week 6', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-7', name: 'Week 7', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-8', name: 'Week 8', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-9', name: 'Week 9', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-10', name: 'Week 10', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-11', name: 'Week 11', parentId: 'hybrid-3.0' },
  { id: 'hybrid-3.0-week-12', name: 'Week 12', parentId: 'hybrid-3.0' },
  // Correcting Course
  { id: 'correcting-course', name: 'Correcting Course', parentId: 'root' },
  { id: 'cc-phase1', name: 'Phase 1', parentId: 'correcting-course' },
  { id: 'cc-p1-w1', name: 'Week 1', parentId: 'cc-phase1' },
  { id: 'cc-p1-w2', name: 'Week 2', parentId: 'cc-phase1' },
];

// Helper to convert meters to display
const metersToMiles = (m) => (m / 1609.34).toFixed(1);

export const sampleTemplates = [
  // ==========================================
  // HYBRID ATHLETE 3.0 - WEEK 1
  // ==========================================
  {
    id: 'hybrid-3.0-w1-d1', name: 'Day 1: Push (Chest) + Run', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }], phase: 'workout' },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', restTime: 90, sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }], phase: 'workout' },
      { name: 'Cable Fly', bodyPart: 'Chest', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 30 }, { reps: 12, weight: 30 }], phase: 'workout' },
      { name: 'Tricep Pushdown', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }, { reps: 12, weight: 40 }], phase: 'workout' },
      { name: 'Overhead Tricep Extension', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 30 }, { reps: 12, weight: 30 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w1-d2', name: 'Day 2: Pull (Back) + Run', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 9656, distanceUnit: 'm' }], notes: '6 miles', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'weighted_bodyweight', restTime: 90, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }], phase: 'workout' },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }], phase: 'workout' },
      { name: 'Lat Pulldown', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 100 }, { reps: 12, weight: 100 }, { reps: 12, weight: 100 }], phase: 'workout' },
      { name: 'Seated Cable Row', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 100 }, { reps: 12, weight: 100 }, { reps: 12, weight: 100 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 50 }, { reps: 12, weight: 50 }], phase: 'workout' },
      { name: 'Hammer Curl', bodyPart: 'Arms', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 25 }, { reps: 12, weight: 25 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w1-d3', name: 'Day 3: Run + Bodyweight', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Push-ups', bodyPart: 'Chest', category: 'reps_only', restTime: 60, sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }], notes: '150 total', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'reps_only', restTime: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }], notes: '60 total', phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w1-d4', name: 'Day 4: Legs', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Back Squat', bodyPart: 'Legs', category: 'barbell', restTime: 120, sets: [{ reps: 10, weight: 185 }, { reps: 10, weight: 185 }, { reps: 10, weight: 185 }, { reps: 10, weight: 185 }], phase: 'workout' },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }], phase: 'workout' },
      { name: 'Walking Lunges', bodyPart: 'Legs', category: 'dumbbell', restTime: 60, sets: [{ reps: 20, weight: 50 }, { reps: 20, weight: 50 }, { reps: 20, weight: 50 }], phase: 'workout' },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', restTime: 90, sets: [{ reps: 12, weight: 270 }, { reps: 12, weight: 270 }, { reps: 12, weight: 270 }], phase: 'workout' },
      { name: 'Leg Curl', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 12, weight: 80 }, { reps: 12, weight: 80 }, { reps: 12, weight: 80 }], phase: 'workout' },
      { name: 'Calf Raise', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 15, weight: 135 }, { reps: 15, weight: 135 }, { reps: 15, weight: 135 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w1-d5', name: 'Day 5: Arms/Shoulders + Run', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 95 }, { reps: 10, weight: 95 }, { reps: 10, weight: 95 }, { reps: 10, weight: 95 }], phase: 'workout' },
      { name: 'Lateral Raise', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 45, sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }], phase: 'workout' },
      { name: 'Face Pull', bodyPart: 'Shoulders', category: 'cable', restTime: 45, sets: [{ reps: 15, weight: 40 }, { reps: 15, weight: 40 }, { reps: 15, weight: 40 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 50 }, { reps: 12, weight: 50 }], phase: 'workout' },
      { name: 'Tricep Dip', bodyPart: 'Arms', category: 'weighted_bodyweight', restTime: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w1-d6', name: 'Day 6: Long Run', folderId: 'hybrid-3.0-week-1',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 16093, distanceUnit: 'm' }], notes: '10 miles - Easy pace', phase: 'workout' },
    ],
  },

  // ==========================================
  // HYBRID ATHLETE 3.0 - WEEK 2
  // ==========================================
  {
    id: 'hybrid-3.0-w2-d1', name: 'Day 1: Push (Chest) + Run', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }], phase: 'workout' },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', restTime: 90, sets: [{ reps: 10, weight: 55 }, { reps: 10, weight: 55 }, { reps: 10, weight: 55 }, { reps: 10, weight: 55 }], phase: 'workout' },
      { name: 'Cable Fly', bodyPart: 'Chest', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
      { name: 'Tricep Pushdown', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 45 }, { reps: 12, weight: 45 }], phase: 'workout' },
      { name: 'Overhead Tricep Extension', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w2-d2', name: 'Day 2: Pull (Back) + Run', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 9656, distanceUnit: 'm' }], notes: '6 miles', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'weighted_bodyweight', restTime: 90, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }], phase: 'workout' },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }], phase: 'workout' },
      { name: 'Lat Pulldown', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 110 }, { reps: 12, weight: 110 }, { reps: 12, weight: 110 }], phase: 'workout' },
      { name: 'Seated Cable Row', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 110 }, { reps: 12, weight: 110 }, { reps: 12, weight: 110 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 55 }, { reps: 12, weight: 55 }, { reps: 12, weight: 55 }], phase: 'workout' },
      { name: 'Hammer Curl', bodyPart: 'Arms', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 27.5 }, { reps: 12, weight: 27.5 }, { reps: 12, weight: 27.5 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w2-d3', name: 'Day 3: Run + Bodyweight', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Push-ups', bodyPart: 'Chest', category: 'reps_only', restTime: 60, sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }], notes: '150 total', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'reps_only', restTime: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }], notes: '60 total', phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w2-d4', name: 'Day 4: Legs', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Back Squat', bodyPart: 'Legs', category: 'barbell', restTime: 120, sets: [{ reps: 10, weight: 195 }, { reps: 10, weight: 195 }, { reps: 10, weight: 195 }, { reps: 10, weight: 195 }], phase: 'workout' },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }, { reps: 10, weight: 145 }], phase: 'workout' },
      { name: 'Walking Lunges', bodyPart: 'Legs', category: 'dumbbell', restTime: 60, sets: [{ reps: 20, weight: 55 }, { reps: 20, weight: 55 }, { reps: 20, weight: 55 }], phase: 'workout' },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', restTime: 90, sets: [{ reps: 12, weight: 290 }, { reps: 12, weight: 290 }, { reps: 12, weight: 290 }], phase: 'workout' },
      { name: 'Leg Curl', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 12, weight: 85 }, { reps: 12, weight: 85 }, { reps: 12, weight: 85 }], phase: 'workout' },
      { name: 'Calf Raise', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 15, weight: 145 }, { reps: 15, weight: 145 }, { reps: 15, weight: 145 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w2-d5', name: 'Day 5: Arms/Shoulders + Run', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 100 }, { reps: 10, weight: 100 }, { reps: 10, weight: 100 }, { reps: 10, weight: 100 }], phase: 'workout' },
      { name: 'Lateral Raise', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 45, sets: [{ reps: 12, weight: 22.5 }, { reps: 12, weight: 22.5 }, { reps: 12, weight: 22.5 }], phase: 'workout' },
      { name: 'Face Pull', bodyPart: 'Shoulders', category: 'cable', restTime: 45, sets: [{ reps: 15, weight: 45 }, { reps: 15, weight: 45 }, { reps: 15, weight: 45 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 55 }, { reps: 12, weight: 55 }, { reps: 12, weight: 55 }], phase: 'workout' },
      { name: 'Tricep Dip', bodyPart: 'Arms', category: 'weighted_bodyweight', restTime: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w2-d6', name: 'Day 6: Long Run', folderId: 'hybrid-3.0-week-2',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 17703, distanceUnit: 'm' }], notes: '11 miles - Easy pace', phase: 'workout' },
    ],
  },

  // ==========================================
  // HYBRID ATHLETE 3.0 - WEEK 3
  // ==========================================
  {
    id: 'hybrid-3.0-w3-d1', name: 'Day 1: Push (Chest) + Run', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }], phase: 'workout' },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', restTime: 90, sets: [{ reps: 10, weight: 60 }, { reps: 10, weight: 60 }, { reps: 10, weight: 60 }, { reps: 10, weight: 60 }], phase: 'workout' },
      { name: 'Cable Fly', bodyPart: 'Chest', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
      { name: 'Tricep Pushdown', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 50 }, { reps: 12, weight: 50 }], phase: 'workout' },
      { name: 'Overhead Tricep Extension', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w3-d2', name: 'Day 2: Pull (Back) + Run', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 11265, distanceUnit: 'm' }], notes: '7 miles', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'weighted_bodyweight', restTime: 90, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }], phase: 'workout' },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }], phase: 'workout' },
      { name: 'Lat Pulldown', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 115 }, { reps: 12, weight: 115 }, { reps: 12, weight: 115 }], phase: 'workout' },
      { name: 'Seated Cable Row', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 115 }, { reps: 12, weight: 115 }, { reps: 12, weight: 115 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 60 }, { reps: 12, weight: 60 }, { reps: 12, weight: 60 }], phase: 'workout' },
      { name: 'Hammer Curl', bodyPart: 'Arms', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 30 }, { reps: 12, weight: 30 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w3-d3', name: 'Day 3: Run + Bodyweight', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 9656, distanceUnit: 'm' }], notes: '6 miles', phase: 'workout' },
      { name: 'Push-ups', bodyPart: 'Chest', category: 'reps_only', restTime: 60, sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }, { reps: 30 }], notes: '150 total', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'reps_only', restTime: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }, { reps: 12 }], notes: '60 total', phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w3-d4', name: 'Day 4: Legs', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Back Squat', bodyPart: 'Legs', category: 'barbell', restTime: 120, sets: [{ reps: 8, weight: 205 }, { reps: 8, weight: 205 }, { reps: 8, weight: 205 }, { reps: 8, weight: 205 }], phase: 'workout' },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 155 }, { reps: 10, weight: 155 }, { reps: 10, weight: 155 }, { reps: 10, weight: 155 }], phase: 'workout' },
      { name: 'Walking Lunges', bodyPart: 'Legs', category: 'dumbbell', restTime: 60, sets: [{ reps: 20, weight: 60 }, { reps: 20, weight: 60 }, { reps: 20, weight: 60 }], phase: 'workout' },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', restTime: 90, sets: [{ reps: 12, weight: 310 }, { reps: 12, weight: 310 }, { reps: 12, weight: 310 }], phase: 'workout' },
      { name: 'Leg Curl', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 12, weight: 90 }, { reps: 12, weight: 90 }, { reps: 12, weight: 90 }], phase: 'workout' },
      { name: 'Calf Raise', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 15, weight: 155 }, { reps: 15, weight: 155 }, { reps: 15, weight: 155 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w3-d5', name: 'Day 5: Arms/Shoulders + Run', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles', phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 105 }, { reps: 8, weight: 105 }, { reps: 8, weight: 105 }, { reps: 8, weight: 105 }], phase: 'workout' },
      { name: 'Lateral Raise', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 45, sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 25 }, { reps: 12, weight: 25 }], phase: 'workout' },
      { name: 'Face Pull', bodyPart: 'Shoulders', category: 'cable', restTime: 45, sets: [{ reps: 15, weight: 50 }, { reps: 15, weight: 50 }, { reps: 15, weight: 50 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 60 }, { reps: 12, weight: 60 }, { reps: 12, weight: 60 }], phase: 'workout' },
      { name: 'Tricep Dip', bodyPart: 'Arms', category: 'weighted_bodyweight', restTime: 60, sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w3-d6', name: 'Day 6: Long Run', folderId: 'hybrid-3.0-week-3',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 19312, distanceUnit: 'm' }], notes: '12 miles - Easy pace', phase: 'workout' },
    ],
  },

  // ==========================================
  // HYBRID ATHLETE 3.0 - WEEK 4 (DELOAD)
  // ==========================================
  {
    id: 'hybrid-3.0-w4-d1', name: 'Day 1: Push (Chest) + Run', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 6437, distanceUnit: 'm' }], notes: '4 miles (deload)', phase: 'workout' },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }], notes: 'Deload week', phase: 'workout' },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', restTime: 90, sets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 45 }, { reps: 10, weight: 45 }], phase: 'workout' },
      { name: 'Cable Fly', bodyPart: 'Chest', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 25 }, { reps: 12, weight: 25 }], phase: 'workout' },
      { name: 'Tricep Pushdown', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w4-d2', name: 'Day 2: Pull (Back) + Run', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 8047, distanceUnit: 'm' }], notes: '5 miles (deload)', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'weighted_bodyweight', restTime: 90, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }], phase: 'workout' },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 115 }, { reps: 10, weight: 115 }, { reps: 10, weight: 115 }], phase: 'workout' },
      { name: 'Lat Pulldown', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 90 }, { reps: 12, weight: 90 }, { reps: 12, weight: 90 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 45 }, { reps: 12, weight: 45 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w4-d3', name: 'Day 3: Run + Bodyweight', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 6437, distanceUnit: 'm' }], notes: '4 miles (deload)', phase: 'workout' },
      { name: 'Push-ups', bodyPart: 'Chest', category: 'reps_only', restTime: 60, sets: [{ reps: 25 }, { reps: 25 }, { reps: 25 }, { reps: 25 }], notes: '100 total (deload)', phase: 'workout' },
      { name: 'Pull-ups', bodyPart: 'Back', category: 'reps_only', restTime: 60, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }], notes: '40 total (deload)', phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w4-d4', name: 'Day 4: Legs', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Back Squat', bodyPart: 'Legs', category: 'barbell', restTime: 120, sets: [{ reps: 10, weight: 155 }, { reps: 10, weight: 155 }, { reps: 10, weight: 155 }], notes: 'Deload week', phase: 'workout' },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 115 }, { reps: 10, weight: 115 }, { reps: 10, weight: 115 }], phase: 'workout' },
      { name: 'Walking Lunges', bodyPart: 'Legs', category: 'dumbbell', restTime: 60, sets: [{ reps: 16, weight: 40 }, { reps: 16, weight: 40 }, { reps: 16, weight: 40 }], phase: 'workout' },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', restTime: 90, sets: [{ reps: 12, weight: 230 }, { reps: 12, weight: 230 }, { reps: 12, weight: 230 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w4-d5', name: 'Day 5: Arms/Shoulders + Run', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 6437, distanceUnit: 'm' }], notes: '4 miles (deload)', phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 10, weight: 75 }, { reps: 10, weight: 75 }, { reps: 10, weight: 75 }], phase: 'workout' },
      { name: 'Lateral Raise', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 45, sets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 15 }, { reps: 12, weight: 15 }], phase: 'workout' },
      { name: 'Face Pull', bodyPart: 'Shoulders', category: 'cable', restTime: 45, sets: [{ reps: 15, weight: 35 }, { reps: 15, weight: 35 }, { reps: 15, weight: 35 }], phase: 'workout' },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 45 }, { reps: 12, weight: 45 }], phase: 'workout' },
    ],
  },
  {
    id: 'hybrid-3.0-w4-d6', name: 'Day 6: Long Run', folderId: 'hybrid-3.0-week-4',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 12875, distanceUnit: 'm' }], notes: '8 miles - Recovery (deload)', phase: 'workout' },
    ],
  },

  // ==========================================
  // CORRECTING COURSE - Phase 1, Week 1
  // (Keeping existing templates - abbreviated for space)
  // ==========================================
  {
    id: 200, name: 'P1/W1/D1 - Push', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 60, phase: 'warmup', sets: [{ reps: 10, weight: 45 }] },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 150, sets: [{ reps: 5, weight: 220 }, { reps: 5, weight: 220 }, { reps: 5, weight: 220 }], phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 100 }, { reps: 8, weight: 100 }, { reps: 8, weight: 100 }], phase: 'workout' },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', restTime: 75, sets: [{ reps: 10, weight: 55 }, { reps: 10, weight: 55 }], phase: 'workout' },
      { name: 'Cable Fly', bodyPart: 'Chest', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
      { name: 'Triceps Pushdown', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 45 }], phase: 'workout' },
    ],
  },
  {
    id: 201, name: 'P1/W1/D2 - Legs (Quad)', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Squat', bodyPart: 'Legs', category: 'barbell', restTime: 180, sets: [{ reps: 5, weight: 250 }, { reps: 5, weight: 250 }, { reps: 5, weight: 250 }, { reps: 5, weight: 250 }, { reps: 5, weight: 250 }], phase: 'workout' },
      { name: 'Front Squat', bodyPart: 'Legs', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 115 }, { reps: 8, weight: 115 }, { reps: 8, weight: 115 }], phase: 'workout' },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', restTime: 75, sets: [{ reps: 12, weight: 230 }, { reps: 12, weight: 230 }, { reps: 12, weight: 230 }], phase: 'workout' },
      { name: 'Standing Calf Raise', bodyPart: 'Legs', category: 'machine', restTime: 60, sets: [{ reps: 15, weight: 80 }, { reps: 15, weight: 80 }, { reps: 15, weight: 80 }, { reps: 15, weight: 80 }], phase: 'workout' },
    ],
  },
  {
    id: 202, name: 'P1/W1/D3 - Pull', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Pull-Up', bodyPart: 'Back', category: 'weighted_bodyweight', restTime: 120, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }], phase: 'workout' },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 8, weight: 155 }], phase: 'workout' },
      { name: 'Seated Cable Row', bodyPart: 'Back', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 100 }, { reps: 12, weight: 100 }, { reps: 12, weight: 100 }], phase: 'workout' },
      { name: 'Hammer Curl', bodyPart: 'Arms', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 30 }, { reps: 12, weight: 30 }], phase: 'workout' },
    ],
  },
  {
    id: 203, name: 'P1/W1/D4 - Legs (Hinge)', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Deadlift', bodyPart: 'Back', category: 'barbell', restTime: 180, sets: [{ reps: 5, weight: 235 }, { reps: 5, weight: 235 }, { reps: 5, weight: 235 }, { reps: 5, weight: 235 }], phase: 'workout' },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'dumbbell', restTime: 90, sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }], phase: 'workout' },
      { name: 'Hip Thrust', bodyPart: 'Legs', category: 'barbell', restTime: 75, sets: [{ reps: 10, weight: 165 }, { reps: 10, weight: 165 }, { reps: 10, weight: 165 }, { reps: 10, weight: 165 }], phase: 'workout' },
      { name: 'Cable Pull Through', bodyPart: 'Legs', category: 'cable', restTime: 60, sets: [{ reps: 15, weight: 80 }, { reps: 15, weight: 80 }, { reps: 15, weight: 80 }], phase: 'workout' },
    ],
  },
  {
    id: 204, name: 'P1/W1/D5 - Arms/Shoulders', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Arnold Press', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 12, weight: 35 }], phase: 'workout' },
      { name: 'Lateral Raise', bodyPart: 'Shoulders', category: 'dumbbell', restTime: 45, sets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 15 }, { reps: 12, weight: 15 }, { reps: 12, weight: 15 }], phase: 'workout' },
      { name: 'Preacher Curl', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 45 }, { reps: 10, weight: 45 }], phase: 'workout' },
      { name: 'Skullcrusher', bodyPart: 'Arms', category: 'barbell', restTime: 60, sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }], phase: 'workout' },
    ],
  },
  {
    id: 205, name: 'P1/W1/D6 - Run', folderId: 'cc-p1-w1',
    exercises: [
      { name: 'Outdoor Run', bodyPart: 'Cardio', category: 'cardio', restTime: 0, sets: [{ duration: 1800, distance: 4.8 }], phase: 'workout' },
    ],
  },
  {
    id: 210, name: 'P1/W2/D1 - Push', folderId: 'cc-p1-w2',
    exercises: [
      { name: 'Treadmill Run', bodyPart: 'Cardio', category: 'cardio', restTime: 60, phase: 'warmup', sets: [{ duration: 480, distance: 1.6 }] },
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', restTime: 150, sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 225 }, { reps: 5, weight: 225 }], phase: 'workout' },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', restTime: 90, sets: [{ reps: 8, weight: 105 }, { reps: 8, weight: 105 }, { reps: 8, weight: 105 }], phase: 'workout' },
      { name: 'Incline Cable Press', bodyPart: 'Chest', category: 'cable', restTime: 75, sets: [{ reps: 10, weight: 55 }, { reps: 10, weight: 55 }], phase: 'workout' },
      { name: 'Dumbbell Fly', bodyPart: 'Chest', category: 'dumbbell', restTime: 60, sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 30 }], phase: 'workout' },
      { name: 'Overhead Triceps Extension', bodyPart: 'Arms', category: 'cable', restTime: 60, sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }], phase: 'workout' },
    ],
  },
];
