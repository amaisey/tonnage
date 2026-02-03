export const defaultFolders = [
  { id: 'root', name: 'Root', parentId: null },
  { id: 'strength', name: 'Strength', parentId: 'root' },
  { id: 'ppl', name: 'Push/Pull/Legs', parentId: 'strength' },
  { id: 'cardio-folder', name: 'Cardio', parentId: 'root' },
];

export const sampleTemplates = [
  {
    id: 1, name: 'Push Day', folderId: 'ppl',
    exercises: [
      { name: 'Bench Press', bodyPart: 'Chest', category: 'barbell', sets: [{ weight: 135, reps: 10 }, { weight: 155, reps: 8 }, { weight: 175, reps: 6 }] },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', category: 'dumbbell', sets: [{ weight: 50, reps: 10 }, { weight: 55, reps: 10 }] },
      { name: 'Overhead Press', bodyPart: 'Shoulders', category: 'barbell', sets: [{ weight: 95, reps: 8 }, { weight: 105, reps: 6 }] },
      { name: 'Tricep Pushdown', bodyPart: 'Arms', category: 'machine', sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 10 }] },
    ],
  },
  {
    id: 2, name: 'Pull Day', folderId: 'ppl',
    exercises: [
      { name: 'Deadlift', bodyPart: 'Back', category: 'barbell', sets: [{ weight: 225, reps: 5 }, { weight: 275, reps: 3 }] },
      { name: 'Pull Ups', bodyPart: 'Back', category: 'weighted_bodyweight', sets: [{ weight: 0, reps: 8 }, { weight: 0, reps: 6 }] },
      { name: 'Barbell Row', bodyPart: 'Back', category: 'barbell', sets: [{ weight: 135, reps: 8 }, { weight: 155, reps: 6 }] },
      { name: 'Barbell Curl', bodyPart: 'Arms', category: 'barbell', sets: [{ weight: 65, reps: 10 }, { weight: 75, reps: 8 }] },
    ],
  },
  {
    id: 3, name: 'Leg Day', folderId: 'ppl',
    exercises: [
      { name: 'Squat', bodyPart: 'Legs', category: 'barbell', sets: [{ weight: 185, reps: 8 }, { weight: 225, reps: 6 }, { weight: 245, reps: 4 }] },
      { name: 'Leg Press', bodyPart: 'Legs', category: 'machine', sets: [{ weight: 360, reps: 10 }, { weight: 400, reps: 8 }] },
      { name: 'Romanian Deadlift', bodyPart: 'Legs', category: 'barbell', sets: [{ weight: 135, reps: 10 }, { weight: 155, reps: 8 }] },
      { name: 'Plank', bodyPart: 'Core', category: 'duration', sets: [{ duration: 60 }, { duration: 60 }] },
    ],
  },
  {
    id: 4, name: '30 Min Cardio', folderId: 'cardio-folder',
    exercises: [
      { name: 'Running', bodyPart: 'Cardio', category: 'cardio', sets: [{ distance: 3, duration: 1800 }] },
    ],
  },
];
