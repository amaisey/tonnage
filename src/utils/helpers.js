export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
  return `${secs}s`;
};

export const formatDistance = (km) => km ? `${km} km` : '-';

export const getDefaultSetForCategory = (category) => {
  switch (category) {
    case 'cardio': return { distance: '', duration: '', completed: false };
    case 'duration': return { duration: '', completed: false };
    case 'reps_only': return { reps: '', completed: false };
    case 'assisted_bodyweight': return { assistedWeight: '', reps: '', completed: false };
    case 'band': return { bandColor: 'green', reps: '', completed: false };
    default: return { weight: '', reps: '', completed: false };
  }
};

export const generateStravaDescription = (workout) => {
  const duration = Math.round(workout.duration / 60000);
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  let description = `💪 ${workout.name}\n⏱️ ${duration} min | ${totalSets} sets\n\n`;
  workout.exercises.forEach(ex => {
    const completedSets = ex.sets.filter(s => s.completed);
    if (completedSets.length > 0) {
      description += `${ex.name}: `;
      description += completedSets.map(s => {
        if (s.weight !== undefined) return `${s.weight}lb×${s.reps}`;
        if (s.reps !== undefined) return `${s.reps} reps`;
        if (s.duration !== undefined) return formatDuration(s.duration);
        return '';
      }).join(', ');
      description += '\n';
    }
  });
  return description;
};

// Bug #16: Export a template as import-compatible JSON (for sharing / AI adjustment)
export const exportTemplateJSON = (template) => {
  const clean = {
    name: template.name,
  };
  if (template.estimatedTime) clean.estimatedTime = template.estimatedTime;
  if (template.notes) clean.notes = template.notes;
  clean.exercises = template.exercises.map(ex => {
    const exercise = {
      name: ex.name,
      bodyPart: ex.bodyPart,
      category: ex.category,
    };
    if (ex.phase && ex.phase !== 'workout') exercise.phase = ex.phase;
    if (ex.restTime !== undefined) exercise.restTime = ex.restTime;
    if (ex.supersetId) exercise.supersetId = ex.supersetId;
    if (ex.highlight) exercise.highlight = true;
    if (ex.notes) exercise.notes = ex.notes;
    exercise.sets = ex.sets.map(s => {
      const set = {};
      if (s.weight !== undefined && s.weight !== '') set.weight = s.weight;
      if (s.reps !== undefined && s.reps !== '') set.reps = s.reps;
      if (s.duration !== undefined && s.duration !== '') set.duration = s.duration;
      if (s.distance !== undefined && s.distance !== '') set.distance = s.distance;
      if (s.bandColor) set.bandColor = s.bandColor;
      if (s.assistedWeight !== undefined && s.assistedWeight !== '') set.assistedWeight = s.assistedWeight;
      return set;
    });
    return exercise;
  });
  return JSON.stringify(clean, null, 2);
};

export const exportWorkoutJSON = (workout) => {
  return JSON.stringify({
    name: workout.name,
    date: new Date(workout.date || workout.startTime).toISOString(),
    duration: workout.duration,
    exercises: workout.exercises.map(ex => ({
      name: ex.name,
      bodyPart: ex.bodyPart,
      category: ex.category,
      sets: ex.sets.filter(s => s.completed).map(s => {
        const set = {};
        if (s.weight !== undefined) set.weight = s.weight;
        if (s.reps !== undefined) set.reps = s.reps;
        if (s.duration !== undefined) set.duration = s.duration;
        if (s.distance !== undefined) set.distance = s.distance;
        if (s.rpe !== undefined) set.rpe = s.rpe;
        return set;
      })
    }))
  }, null, 2);
};
