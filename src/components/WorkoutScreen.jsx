import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { CATEGORIES, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { NumberPad, SetInputRow, ExerciseSearchModal, RestTimerBanner } from './SharedComponents';

const WorkoutScreen = ({ activeWorkout, setActiveWorkout, onFinish, onCancel, exercises, history }) => {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [restTimer, setRestTimer] = useState({ active: false, time: 0, totalTime: 0, exerciseName: '' });
  const [editingRestTime, setEditingRestTime] = useState(null); // exercise index
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [numpadState, setNumpadState] = useState(null); // { exIndex, setIndex, field, fieldIndex }
  const intervalRef = useRef(null);

  // Get previous workout data for a specific exercise
  const getPreviousExerciseData = (exerciseName) => {
    if (!history || history.length === 0) return null;
    for (const workout of history) {
      const prevExercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (prevExercise && prevExercise.sets.some(s => s.completed)) {
        return prevExercise.sets.filter(s => s.completed);
      }
    }
    return null;
  };

  useEffect(() => {
    if (restTimer.active && restTimer.time > 0) {
      intervalRef.current = setInterval(() => setRestTimer(prev => ({ ...prev, time: prev.time - 1 })), 1000);
    } else if (restTimer.time === 0 && restTimer.active) setRestTimer(prev => ({ ...prev, active: false }));
    return () => clearInterval(intervalRef.current);
  }, [restTimer.active, restTimer.time]);

  const startRestTimer = (exerciseName, restTime) => {
    const time = restTime || 90;
    setRestTimer({ active: true, time, totalTime: time, exerciseName });
  };

  // Add exercises (individually or as superset) - pre-fill with previous workout data
  const addExercises = (selectedExercises, asSuperset) => {
    const updated = { ...activeWorkout };
    if (asSuperset && selectedExercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      selectedExercises.forEach(ex => {
        const prevData = getPreviousExerciseData(ex.name);
        const sets = prevData && prevData.length > 0
          ? prevData.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        updated.exercises.push({ ...ex, supersetId, restTime: 90, sets, previousSets: prevData });
      });
    } else {
      selectedExercises.forEach(ex => {
        const prevData = getPreviousExerciseData(ex.name);
        const sets = prevData && prevData.length > 0
          ? prevData.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        updated.exercises.push({ ...ex, restTime: 90, sets, previousSets: prevData });
      });
    }
    setActiveWorkout(updated);
    setShowExerciseModal(false);
  };

  const addSingleExercise = (exercise) => {
    addExercises([exercise], false);
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    const updated = { ...activeWorkout };
    updated.exercises[exIndex].sets[setIndex][field] = value;
    setActiveWorkout(updated);
  };

  // Numpad handlers
  const openNumpad = (exIndex, setIndex, field, fieldIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    setNumpadState({ exIndex, setIndex, field, fieldIndex, category: exercise.category });
  };

  const closeNumpad = () => setNumpadState(null);

  const handleNumpadChange = (value) => {
    if (!numpadState) return;
    updateSet(numpadState.exIndex, numpadState.setIndex, numpadState.field, value);
  };

  const handleNumpadNext = () => {
    if (!numpadState) return;
    const exercise = activeWorkout.exercises[numpadState.exIndex];
    const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];
    const nextFieldIndex = numpadState.fieldIndex + 1;

    if (nextFieldIndex < fields.length) {
      // Move to next field in same set
      setNumpadState({ ...numpadState, field: fields[nextFieldIndex], fieldIndex: nextFieldIndex });
    } else if (numpadState.setIndex + 1 < exercise.sets.length) {
      // Move to first field of next set
      setNumpadState({ ...numpadState, setIndex: numpadState.setIndex + 1, field: fields[0], fieldIndex: 0 });
    } else {
      // Done with all sets
      closeNumpad();
    }
  };

  const handleRPEChange = (rpe) => {
    if (!numpadState) return;
    const updated = { ...activeWorkout };
    updated.exercises[numpadState.exIndex].sets[numpadState.setIndex].rpe = rpe;
    setActiveWorkout(updated);
  };

  const updateExerciseRestTime = (exIndex, restTime) => {
    const updated = { ...activeWorkout };
    updated.exercises[exIndex].restTime = restTime;
    setActiveWorkout(updated);
    setEditingRestTime(null);
  };

  const toggleSetComplete = (exIndex, setIndex) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const set = exercise.sets[setIndex];
    set.completed = !set.completed;
    if (set.completed) {
      set.completedAt = Date.now();
      startRestTimer(exercise.name, exercise.restTime || 90);
    }
    setActiveWorkout(updated);
  };

  const addSet = (exIndex) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const lastSet = exercise.sets.slice(-1)[0];
    const newSet = getDefaultSetForCategory(exercise.category);
    Object.keys(newSet).forEach(key => {
      if (lastSet[key] !== undefined && key !== 'completed' && key !== 'completedAt') newSet[key] = lastSet[key];
    });
    exercise.sets.push(newSet);
    setActiveWorkout(updated);
  };

  const removeExercise = (index) => {
    const updated = { ...activeWorkout };
    updated.exercises.splice(index, 1);
    setActiveWorkout(updated);
  };

  const unlinkSuperset = (exIndex) => {
    const updated = { ...activeWorkout };
    delete updated.exercises[exIndex].supersetId;
    setActiveWorkout(updated);
  };

  // Group exercises by superset
  const getGroupedExercises = () => {
    const groups = [];
    const used = new Set();

    activeWorkout.exercises.forEach((ex, idx) => {
      if (used.has(idx)) return;

      if (ex.supersetId) {
        const supersetExercises = [];
        activeWorkout.exercises.forEach((e, i) => {
          if (e.supersetId === ex.supersetId) {
            supersetExercises.push({ exercise: e, index: i });
            used.add(i);
          }
        });
        groups.push({ type: 'superset', exercises: supersetExercises, supersetId: ex.supersetId });
      } else {
        groups.push({ type: 'single', exercise: ex, index: idx });
        used.add(idx);
      }
    });
    return groups;
  };

  if (!activeWorkout) {
    return (
      <div className="relative flex flex-col items-center justify-center flex-1 min-h-0 bg-black p-6 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-rose-900/50 via-gray-950 to-teal-950/30"></div>
        <div className="absolute top-10 right-0 w-64 h-64 bg-rose-700/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-teal-600/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-600/15 rounded-full blur-xl"></div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="text-xl font-bold text-white mb-2">Ready to Train?</h2>
          <p className="text-gray-400 text-center mb-6 text-sm">Start a new workout or select a template</p>
          <button onClick={() => setActiveWorkout({ name: 'New Workout', exercises: [], startTime: Date.now() })}
            className="bg-rose-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-800 flex items-center gap-2 shadow-lg">
            <Icons.Plus /> Start Empty Workout
          </button>
        </div>
      </div>
    );
  }

  const restTimePresets = [30, 60, 90, 120, 180, 300];

  const renderExerciseCard = (exercise, exIndex, isSuperset = false, isFirst = true, isLast = true) => {
    const exerciseRestTime = exercise.restTime || 90;
    const typeInfo = exercise.exerciseType ? EXERCISE_TYPES[exercise.exerciseType] : null;

    return (
      <div key={exIndex} className={`${exercise.highlight ? 'ring-2 ring-rose-500' : ''} bg-gray-900 p-4 ${isSuperset ? (isFirst ? 'rounded-t-2xl' : isLast ? 'rounded-b-2xl' : '') : 'rounded-2xl mb-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isSuperset && (
              <div className="w-1 h-8 bg-teal-500 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{exercise.name}</span>
                {typeInfo && (
                  <span className={`${typeInfo.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                )}
                {exercise.highlight && <span className="text-rose-400">⭐</span>}
              </div>
              <div className="text-xs text-gray-400">{exercise.bodyPart} • {CATEGORIES[exercise.category]?.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Rest time button */}
            <button onClick={() => setEditingRestTime(editingRestTime === exIndex ? null : exIndex)}
              className="text-cyan-400 hover:text-cyan-300 px-2 py-1 text-xs flex items-center gap-1 rounded bg-gray-800">
              <Icons.TimerSmall /> {formatDuration(exerciseRestTime)}
            </button>
            {isSuperset && (
              <button onClick={() => unlinkSuperset(exIndex)} className="text-teal-400 hover:text-teal-300 p-2" title="Unlink from superset">
                <Icons.Link />
              </button>
            )}
            <button onClick={() => removeExercise(exIndex)} className="text-red-400 hover:text-red-300 p-2"><Icons.Trash /></button>
          </div>
        </div>

        {/* Rest time editor */}
        {editingRestTime === exIndex && (
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="text-xs text-gray-400 mb-2">Rest time between sets</div>
            <div className="flex flex-wrap gap-2">
              {restTimePresets.map(t => (
                <button key={t} onClick={() => updateExerciseRestTime(exIndex, t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${exerciseRestTime === t ? 'bg-rose-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {formatDuration(t)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise notes */}
        {exercise.notes && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-2 mb-3">
            <div className="text-xs text-amber-400 flex items-center gap-1">
              <span>📝</span> {exercise.notes}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-2 text-xs text-gray-400 px-2">
          <div className="w-7">SET</div>
          <div className="w-16 text-center">PREV</div>
          {CATEGORIES[exercise.category]?.fields.map(f => (
            <div key={f} className="flex-1 text-center uppercase">{f === 'assistedWeight' ? '-LBS' : f === 'duration' ? 'SEC' : f === 'distance' ? 'KM' : f === 'bandColor' ? 'BAND' : f}</div>
          ))}
          <div className="w-16"></div>
        </div>
        {exercise.sets.map((set, setIndex) => (
          <SetInputRow key={setIndex} set={set} setIndex={setIndex} category={exercise.category}
            previousSet={setIndex > 0 ? exercise.sets[setIndex - 1] : null}
            previousWorkoutSet={exercise.previousSets?.[setIndex] || null}
            restTime={exerciseRestTime}
            onUpdate={(field, value) => updateSet(exIndex, setIndex, field, value)}
            onComplete={() => toggleSetComplete(exIndex, setIndex)}
            onOpenNumpad={(sIdx, field, fIdx) => openNumpad(exIndex, sIdx, field, fIdx)} />
        ))}
        <button onClick={() => addSet(exIndex)}
          className="w-full mt-2 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-teal-400 font-medium flex items-center justify-center gap-1 text-sm">
          <Icons.Plus /> Add Set ({formatDuration(exerciseRestTime)})
        </button>
      </div>
    );
  };

  const groups = getGroupedExercises();

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-1.jpg" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
      <RestTimerBanner isActive={restTimer.active} timeRemaining={restTimer.time} totalTime={restTimer.totalTime}
        exerciseName={restTimer.exerciseName} onSkip={() => setRestTimer({ active: false, time: 0, totalTime: 0, exerciseName: '' })}
        onAddTime={() => setRestTimer(prev => ({ ...prev, time: prev.time + 30, totalTime: prev.totalTime + 30 }))} />

      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <input type="text" value={activeWorkout.name} onChange={e => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="text-xl font-bold text-white bg-transparent border-none focus:outline-none" />
            <div className="text-sm text-gray-400">{Math.floor((Date.now() - activeWorkout.startTime) / 60000)} min elapsed</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCancelConfirm(true)} className="text-red-400 hover:text-red-300 px-3 py-2 text-sm">Cancel</button>
            <button onClick={onFinish} className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600">Finish</button>
          </div>
        </div>
        {activeWorkout.notes && (
          <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
            <div className="text-sm text-amber-400 flex items-start gap-2">
              <span>📋</span> <span>{activeWorkout.notes}</span>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${restTimer.active ? 'pt-24' : ''} ${numpadState ? 'pb-72' : ''}`}>
        {groups.map((group, groupIdx) => {
          if (group.type === 'superset') {
            return (
              <div key={group.supersetId} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Link />
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">Superset</span>
                </div>
                <div className="border-l-4 border-teal-500 rounded-2xl overflow-hidden">
                  {group.exercises.map(({ exercise, index }, i) =>
                    renderExerciseCard(exercise, index, true, i === 0, i === group.exercises.length - 1)
                  )}
                </div>
              </div>
            );
          } else {
            return renderExerciseCard(group.exercise, group.index, false);
          }
        })}
        <button onClick={() => setShowExerciseModal(true)}
          className="w-full bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl p-6 text-gray-400 hover:border-teal-600 hover:text-teal-400 flex items-center justify-center gap-2">
          <Icons.Plus /> Add Exercise
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">Your workout progress will be lost. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700">
                Keep Going
              </button>
              <button onClick={() => { setShowCancelConfirm(false); onCancel(); }} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600">
                Cancel Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <ExerciseSearchModal
          exercises={exercises}
          onSelect={addSingleExercise}
          onSelectMultiple={addExercises}
          onClose={() => setShowExerciseModal(false)}
        />
      )}

      {/* Number Pad */}
      {numpadState && activeWorkout && (
        <NumberPad
          value={String(activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.[numpadState.field] || '')}
          onChange={handleNumpadChange}
          onClose={closeNumpad}
          onNext={handleNumpadNext}
          showRPE={numpadState.field === 'reps'}
          rpeValue={activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.rpe}
          onRPEChange={handleRPEChange}
          fieldLabel={numpadState.field === 'weight' ? 'Weight (lbs)' : numpadState.field === 'reps' ? 'Reps' : numpadState.field === 'duration' ? 'Duration (sec)' : numpadState.field === 'distance' ? 'Distance (km)' : numpadState.field}
        />
      )}
      </div>
    </div>
  );
};


export { WorkoutScreen };
